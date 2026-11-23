from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import (
    get_db, get_current_user, require_roles, require_plan,
    check_bid_limit, check_project_access
)
from app.models.user import User, UserRole, UserPlan
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.models.message import Message
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse,
    ProjectDetailResponse, ProjectPublish, ProjectClose
)
from app.services.notifications import create_notification
from app.tasks.meilisearch_sync import sync_projects_to_meilisearch as sync_project_to_meilisearch

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project (clients only)."""
    print(f"DEBUG create_project: current_user={current_user}, project_data={project_data}")
    project = Project(
        client_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        category="general",  # Default category
        subcategory=None,
        tags=project_data.skills or [],
        budget_min=project_data.budget_min,
        budget_max=project_data.budget_max,
        is_fixed_price=project_data.is_fixed_price,
        estimated_duration_days=project_data.deadline_days,
        required_skills=project_data.skills or [],
        experience_level="any",
        english_level="any",
        is_urgent=False,
        is_featured=False,
        status=ProjectStatus.DRAFT,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Load relationships for response
    await db.refresh(project, attribute_names=['client'])
    print(f"DEBUG create_project: created project id={project.id}, uuid={project.uuid}, client_id={project.client_id}, status={project.status}")
    return project


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    experience_level: Optional[str] = None,
    status: Optional[ProjectStatus] = None,
    is_fixed_price: Optional[bool] = None,
    is_urgent: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    min_budget: Optional[int] = None,
    max_budget: Optional[int] = None,
    required_skills: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|budget|deadline|bids_count|views_count)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List projects with filtering and pagination."""
    query = select(Project).options(selectinload(Project.client))

    # Build filters
    filters = []

    # Only show published projects to non-owners/admins
    if not current_user:
        filters.append(Project.status == ProjectStatus.OPEN)
    elif current_user.role == UserRole.ADMIN:
        pass  # Admins see all projects
    elif current_user.role == UserRole.CLIENT:
        # Clients can see their own drafts too
        filters.append(or_(Project.status == ProjectStatus.OPEN, Project.client_id == current_user.id))
    else:
        # Freelancers only see open projects
        filters.append(Project.status == ProjectStatus.OPEN)

    if category:
        filters.append(Project.category == category)
    if subcategory:
        filters.append(Project.subcategory == subcategory)
    if experience_level:
        filters.append(Project.experience_level == experience_level)
    if status and current_user and current_user.role == UserRole.ADMIN:
        filters.append(Project.status == status)
    if is_fixed_price is not None:
        filters.append(Project.is_fixed_price == is_fixed_price)
    if is_urgent is not None:
        filters.append(Project.is_urgent == is_urgent)
    if is_featured is not None:
        filters.append(Project.is_featured == is_featured)
    if min_budget is not None:
        filters.append(or_(Project.budget_max >= min_budget, Project.budget_min >= min_budget))
    if max_budget is not None:
        filters.append(or_(Project.budget_min <= max_budget, Project.budget_max <= max_budget))
    if required_skills:
        skills_list = [s.strip() for s in required_skills.split(",")]
        for skill in skills_list:
            filters.append(Project.required_skills.contains([skill]))
    if search:
        search_filter = or_(
            Project.title.ilike(f"%{search}%"),
            Project.description.ilike(f"%{search}%"),
            Project.tags.contains([search]),
        )
        filters.append(search_filter)

    if filters:
        query = query.where(and_(*filters))

    # Sorting
    sort_column = getattr(Project, sort_by, Project.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    projects = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    print(f"DEBUG list_projects: current_user={current_user}, role={current_user.role if current_user else None}, total={total}, projects_found={len(projects)}")
    for p in projects:
        print(f"  Project: id={p.id}, title={p.title}, status={p.status}, client_id={p.client_id}")

    return ProjectListResponse(
        projects=projects,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/my", response_model=ProjectListResponse)
async def list_my_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ProjectStatus] = None,
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
    db: AsyncSession = Depends(get_db),
):
    """List current user's projects (clients only)."""
    query = select(Project).where(Project.client_id == current_user.id).options(selectinload(Project.client))

    if status:
        query = query.where(Project.status == status)

    query = query.order_by(Project.created_at.desc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    projects = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return ProjectListResponse(
        projects=projects,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{project_uuid}", response_model=ProjectDetailResponse)
async def get_project(
    project_uuid: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get project by UUID."""
    query = select(Project).where(Project.uuid == project_uuid).options(
        selectinload(Project.client),
        selectinload(Project.bids).selectinload(Bid.freelancer),
        selectinload(Project.messages).selectinload(Message.sender),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check access for non-public projects
    if project.status != ProjectStatus.OPEN:
        if not current_user:
            raise HTTPException(status_code=404, detail="Project not found")
        if current_user.role != UserRole.ADMIN and project.client_id != current_user.id:
            # Check if user has a bid on this project
            bid_query = select(Bid).where(
                Bid.project_id == project.id,
                Bid.freelancer_id == current_user.id
            )
            bid_result = await db.execute(bid_query)
            bid = bid_result.scalar_one_or_none()
            if not bid:
                raise HTTPException(status_code=404, detail="Project not found")

    # Increment views
    if not current_user or project.client_id != current_user.id:
        project.views_count += 1
        await db.commit()

    # Load bids if user is client or admin
    bids = []
    if current_user and (current_user.role == UserRole.ADMIN or project.client_id == current_user.id):
        bids_query = select(Bid).where(Bid.project_id == project.id).options(
            selectinload(Bid.freelancer)
        ).order_by(Bid.created_at.desc())
        bids_result = await db.execute(bids_query)
        bids = bids_result.scalars().all()

    # Load recent messages
    messages_query = select(Message).where(Message.project_id == project.id).options(
        selectinload(Message.sender)
    ).order_by(Message.created_at.desc()).limit(50)
    messages_result = await db.execute(messages_query)
    messages = messages_result.scalars().all()

    # Create a dict with project fields excluding relationships
    project_dict = {c.key: getattr(project, c.key) for c in project.__table__.columns}
    project_dict['client'] = project.client
    project_dict['freelancer'] = project.selected_freelancer

    return ProjectDetailResponse(
        **project_dict,
        bids=bids,
        messages=list(reversed(messages)),
    )


@router.patch("/{project_uuid}", response_model=ProjectResponse)
async def update_project(
    project_uuid: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a project (owner or admin only)."""
    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role != UserRole.ADMIN and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")

    # Only allow updates if project is in draft or open status
    if project.status not in [ProjectStatus.DRAFT, ProjectStatus.OPEN]:
        raise HTTPException(status_code=400, detail="Cannot update project in current status")

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project, attribute_names=['client'])
    return project


@router.post("/{project_uuid}/publish", response_model=ProjectResponse)
async def publish_project(
    project_uuid: str,
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
    db: AsyncSession = Depends(get_db),
):
    """Publish a draft project (client only)."""
    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to publish this project")

    if project.status != ProjectStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft projects can be published")

    # Validate required fields for publishing
    if not project.title or not project.description or not project.category:
        raise HTTPException(status_code=400, detail="Project must have title, description, and category to publish")

    if project.is_fixed_price and (not project.budget_min or not project.budget_max):
        raise HTTPException(status_code=400, detail="Fixed price projects must have budget range")

    project.status = ProjectStatus.OPEN
    project.published_at = func.now()

    await db.commit()
    await db.refresh(project, attribute_names=['client'])

    # Sync to Meilisearch for search
    await sync_project_to_meilisearch()

    # Notify relevant freelancers (could be implemented with matching algorithm)
    # For now, just return the project
    return project


@router.post("/{project_uuid}/close", response_model=ProjectResponse)
async def close_project(
    project_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Close a project (client or admin only)."""
    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role != UserRole.ADMIN and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to close this project")

    if project.status not in [ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS]:
        raise HTTPException(status_code=400, detail="Project cannot be closed in current status")

    project.status = ProjectStatus.CLOSED
    project.completed_at = func.now()

    await db.commit()
    await db.refresh(project, attribute_names=['client'])
    return project


@router.delete("/{project_uuid}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_uuid: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a project (owner or admin only). Only allowed for draft projects."""
    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role != UserRole.ADMIN and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")

    if project.status != ProjectStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only draft projects can be deleted")

    await db.delete(project)
    await db.commit()


@router.post("/{project_uuid}/view", status_code=status.HTTP_204_NO_CONTENT)
async def increment_project_view(
    project_uuid: str,
    db: AsyncSession = Depends(get_db),
):
    """Increment project view count."""
    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.views_count += 1
    await db.commit()