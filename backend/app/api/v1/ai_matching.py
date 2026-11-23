from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import get_settings
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.schemas.ai import (
    ParseTZRequest,
    ParseTZResponse,
    MatchFreelancersRequest,
    MatchFreelancersResponse,
    GenerateContractRequest,
    GenerateContractResponse,
)
from app.dependencies import get_current_user, check_ai_access, check_ai_wizard_access
from app.services.ai_service import get_ai_service

router = APIRouter()
settings = get_settings()


@router.post("/parse-tz", response_model=ParseTZResponse)
async def parse_tz(
    data: ParseTZRequest,
    current_user: User = Depends(check_ai_wizard_access),
    db: AsyncSession = Depends(get_db),
):
    """Parse technical requirements into structured plan (AI Wizard)."""
    ai_service = get_ai_service()
    result = await ai_service.parse_tz(data.tz_text, data.project_id)
    return ParseTZResponse(**result)


@router.post("/match-freelancers", response_model=MatchFreelancersResponse)
async def match_freelancers(
    data: MatchFreelancersRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Find best matching freelancers for a project (AI Matching)."""
    project = await db.get(Project, data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check access - only project client or admin
    if project.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not project owner")

    # Get available freelancers
    # Filter: active, freelancer role, has relevant skills
    result = await db.execute(
        select(User).where(
            User.role == UserRole.FREELANCER,
            User.is_active == True,
            User.is_banned == False,
        ).limit(100)  # Limit for AI processing
    )
    freelancers = result.scalars().all()

    # Filter freelancers with matching skills
    project_skills = set(project.skills)
    matched_freelancers = []
    for f in freelancers:
        freelancer_skills = set((f.profile or {}).get("skills", []))
        if project_skills & freelancer_skills:
            matched_freelancers.append(f)

    if not matched_freelancers:
        return MatchFreelancersResponse(matches=[], total_candidates=0)

    ai_service = get_ai_service()
    matches = await ai_service.match_freelancers(project, matched_freelancers, data.limit)

    return MatchFreelancersResponse(
        matches=matches,
        total_candidates=len(matched_freelancers),
    )


@router.post("/generate-contract", response_model=GenerateContractResponse)
async def generate_contract(
    data: GenerateContractRequest,
    current_user: User = Depends(check_ai_wizard_access),
    db: AsyncSession = Depends(get_db),
):
    """Generate contract document (AI Wizard)."""
    project = await db.get(Project, data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    bid = await db.get(Bid, data.bid_id)
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    if bid.project_id != project.id:
        raise HTTPException(status_code=400, detail="Bid does not belong to project")

    if bid.status != BidStatus.ACCEPTED:
        raise HTTPException(status_code=400, detail="Bid not accepted")

    # Check access - only project client or admin
    if project.client_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not project owner")

    client = await db.get(User, project.client_id)
    freelancer = await db.get(User, project.freelancer_id)

    if not client or not freelancer:
        raise HTTPException(status_code=404, detail="Client or freelancer not found")

    ai_service = get_ai_service()
    result = await ai_service.generate_contract(
        project=project,
        freelancer=freelancer,
        client=client,
        bid_price=bid.price_cents,
        bid_delivery_days=bid.delivery_days,
        template=data.template,
        custom_terms=data.custom_terms,
    )

    # TODO: Convert to DOCX/PDF and upload to MinIO
    # For now return text
    return GenerateContractResponse(
        contract_url="",  # Will be set after file upload
        contract_text=result["contract_text"],
        format="text",
    )