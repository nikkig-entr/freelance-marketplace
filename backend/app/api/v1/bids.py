from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import (
    get_db, get_current_user, require_roles, check_bid_limit,
    check_project_access
)
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.schemas.bid import (
    BidCreate, BidUpdate, BidResponse, BidListResponse,
    BidAccept, BidReject, BidWithdraw, BidShortlist
)
from app.services.notifications import create_notification
from app.tasks.notifications import send_bid_notification

router = APIRouter()


@router.post("/projects/{project_uuid}/bids", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
async def create_bid(
    project_uuid: str,
    bid_data: BidCreate,
    current_user: User = Depends(require_roles(UserRole.FREELANCER)),
    db: AsyncSession = Depends(get_db),
    _bid_limit: None = Depends(check_bid_limit),
):
    """Place a bid on a project (freelancers only)."""
    # Get project
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status != ProjectStatus.OPEN:
        raise HTTPException(status_code=400, detail="Project is not open for bids")

    if project.client_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot bid on your own project")

    # Validate bid amount is within project budget
    if project.budget_min is not None and bid_data.price_cents < project.budget_min:
        raise HTTPException(
            status_code=422,
            detail=f"Bid amount must be at least the project's minimum budget of {project.budget_min} cents"
        )
    if project.budget_max is not None and bid_data.price_cents > project.budget_max:
        raise HTTPException(
            status_code=422,
            detail=f"Bid amount cannot exceed the project's maximum budget of {project.budget_max} cents"
        )

    # Validate delivery days not exceeding project timeline
    max_delivery_days = project.estimated_duration_days or 365
    if bid_data.delivery_days > max_delivery_days:
        raise HTTPException(
            status_code=422,
            detail=f"Delivery days cannot exceed project timeline of {max_delivery_days} days"
        )

    # Check if user already bid
    existing_bid_query = select(Bid).where(
        Bid.project_id == project.id,
        Bid.freelancer_id == current_user.id
    )
    existing_bid_result = await db.execute(existing_bid_query)
    existing_bid = existing_bid_result.scalar_one_or_none()

    if existing_bid:
        raise HTTPException(status_code=400, detail="You have already placed a bid on this project")

    # Create bid
    bid = Bid(
        project_id=project.id,
        freelancer_id=current_user.id,
        price_cents=bid_data.price_cents,
        delivery_days=bid_data.delivery_days,
        cover_letter=bid_data.cover_letter,
        status=BidStatus.PENDING,
    )
    db.add(bid)

    # Increment project bids count
    project.bids_count += 1

    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])

    # Notify client
    await create_notification(
        db=db,
        user_id=project.client_id,
        type="new_bid",
        title="New bid received",
        message=f"{current_user.full_name} placed a bid on '{project.title}'",
        related_id=bid.id,
        related_type="bid",
    )

    # Send email notification (async via Celery)
    send_bid_notification.delay(bid.id)

    return bid


@router.get("/projects/{project_uuid}/bids", response_model=BidListResponse)
async def list_project_bids(
    project_uuid: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[BidStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List bids for a project (client, admin, or freelancer who bid on the project)."""
    # Get project
    project_query = select(Project).where(Project.uuid == project_uuid)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is admin or project client
    is_admin = current_user.role == UserRole.ADMIN
    is_client = project.client_id == current_user.id

    # Check if user is a freelancer who bid on this project
    is_freelancer_with_bid = False
    if current_user.role == UserRole.FREELANCER:
        bid_query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == current_user.id
        )
        bid_result = await db.execute(bid_query)
        bid = bid_result.scalar_one_or_none()
        is_freelancer_with_bid = bid is not None

    if not (is_admin or is_client or is_freelancer_with_bid):
        raise HTTPException(status_code=403, detail="Not authorized to view bids")

    # If freelancer, only show their own bid
    if is_freelancer_with_bid and not is_admin and not is_client:
        query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == current_user.id
        ).options(selectinload(Bid.freelancer))
    else:
        query = select(Bid).where(Bid.project_id == project.id).options(
            selectinload(Bid.freelancer)
        )

    if status:
        query = query.where(Bid.status == status)

    query = query.order_by(Bid.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    bids = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return BidListResponse(
        bids=bids,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/bids/my", response_model=BidListResponse)
async def list_my_bids(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[BidStatus] = None,
    current_user: User = Depends(require_roles(UserRole.FREELANCER)),
    db: AsyncSession = Depends(get_db),
):
    """List current user's bids (freelancers only)."""
    query = select(Bid).where(Bid.freelancer_id == current_user.id).options(
        selectinload(Bid.project).selectinload(Project.client)
    )

    if status:
        query = query.where(Bid.status == status)

    query = query.order_by(Bid.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    bids = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return BidListResponse(
        bids=bids,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/bids/{bid_id}", response_model=BidResponse)
async def get_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific bid."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project).selectinload(Project.client)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    # Check access
    if current_user.role != UserRole.ADMIN:
        if bid.freelancer_id != current_user.id and bid.project.client_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this bid")

    return bid


@router.patch("/bids/{bid_id}", response_model=BidResponse)
async def update_bid(
    bid_id: int,
    bid_data: BidUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a bid (freelancer only, only if pending)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this bid")

    if bid.status != BidStatus.PENDING:
        raise HTTPException(status_code=400, detail="Can only update pending bids")

    update_data = bid_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bid, field, value)

    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])
    return bid


@router.post("/bids/{bid_id}/accept", response_model=BidResponse)
async def accept_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accept a bid (project client only)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project).selectinload(Project.client)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can accept bids")

    if bid.status != BidStatus.PENDING:
        raise HTTPException(status_code=400, detail="Bid is not pending")

    if bid.project.status != ProjectStatus.OPEN:
        raise HTTPException(status_code=400, detail="Project is not open")

    # Accept the bid
    bid.status = BidStatus.ACCEPTED
    bid.accepted_at = datetime.now(timezone.utc)

    # Update project
    bid.project.status = ProjectStatus.IN_PROGRESS
    bid.project.selected_freelancer_id = bid.freelancer_id
    bid.project.started_at = func.now()

    # Reject other pending bids
    other_bids_query = select(Bid).where(
        Bid.project_id == bid.project_id,
        Bid.id != bid_id,
        Bid.status == BidStatus.PENDING
    )
    other_bids_result = await db.execute(other_bids_query)
    other_bids = other_bids_result.scalars().all()
    for other_bid in other_bids:
        other_bid.status = BidStatus.REJECTED

    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])

    # Notify freelancer
    await create_notification(
        db=db,
        user_id=bid.freelancer_id,
        type="bid_accepted",
        title="Bid accepted!",
        message=f"Your bid on '{bid.project.title}' was accepted",
        related_id=bid.id,
        related_type="bid",
    )

    return bid


@router.post("/bids/{bid_id}/reject", response_model=BidResponse)
async def reject_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reject a bid (project client only)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can reject bids")

    if bid.status != BidStatus.PENDING:
        raise HTTPException(status_code=400, detail="Bid is not pending")

    bid.status = BidStatus.REJECTED
    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])

    # Notify freelancer
    await create_notification(
        db=db,
        user_id=bid.freelancer_id,
        type="bid_rejected",
        title="Bid rejected",
        message=f"Your bid on '{bid.project.title}' was rejected",
        related_id=bid.id,
        related_type="bid",
    )

    return bid


@router.post("/bids/{bid_id}/withdraw", response_model=BidResponse)
async def withdraw_bid(
    bid_id: int,
    current_user: User = Depends(require_roles(UserRole.FREELANCER)),
    db: AsyncSession = Depends(get_db),
):
    """Withdraw a bid (freelancer only)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to withdraw this bid")

    if bid.status not in [BidStatus.PENDING, BidStatus.SHORTLISTED]:
        raise HTTPException(status_code=400, detail="Can only withdraw pending or shortlisted bids")

    bid.status = BidStatus.WITHDRAWN

    # Decrement project bids count
    bid.project.bids_count = max(0, bid.project.bids_count - 1)

    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])

    return bid


@router.post("/bids/{bid_id}/shortlist", response_model=BidResponse)
async def shortlist_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Shortlist/unsortlist a bid (project client only)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.freelancer),
        selectinload(Bid.project)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project client can shortlist bids")

    if bid.status == BidStatus.SHORTLISTED:
        bid.status = BidStatus.PENDING
    elif bid.status == BidStatus.PENDING:
        bid.status = BidStatus.SHORTLISTED
    else:
        raise HTTPException(status_code=400, detail="Can only shortlist pending bids")

    await db.commit()
    await db.refresh(bid, attribute_names=['freelancer', 'project'])

    # Notify freelancer
    if bid.status == BidStatus.SHORTLISTED:
        await create_notification(
            db=db,
            user_id=bid.freelancer_id,
            type="bid_shortlisted",
            title="Bid shortlisted!",
            message=f"Your bid on '{bid.project.title}' was shortlisted",
            related_id=bid.id,
            related_type="bid",
        )

    return bid


@router.delete("/bids/{bid_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bid(
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a bid (freelancer only, only if pending/withdrawn)."""
    query = select(Bid).where(Bid.id == bid_id).options(
        selectinload(Bid.project)
    )
    result = await db.execute(query)
    bid = result.scalar_one_or_none()

    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this bid")

    if bid.status not in [BidStatus.PENDING, BidStatus.WITHDRAWN, BidStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Can only delete pending, withdrawn, or rejected bids")

    # Decrement project bids count if pending
    if bid.status == BidStatus.PENDING:
        bid.project.bids_count = max(0, bid.project.bids_count - 1)

    await db.delete(bid)
    await db.commit()