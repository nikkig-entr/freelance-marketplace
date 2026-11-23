from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, check_ai_access
from app.models.user import User, UserPlan
from app.services.ai import (
    generate_proposal,
    improve_profile,
    match_projects,
    analyze_project_requirements,
    generate_cover_letter,
)

router = APIRouter()


# Request/Response models
class ProposalRequest(BaseModel):
    project_title: str = Field(..., min_length=10, max_length=200)
    project_description: str = Field(..., min_length=50, max_length=10000)
    project_category: str
    project_skills: list[str] = []
    project_budget_min: Optional[int] = None
    project_budget_max: Optional[int] = None
    project_duration_days: Optional[int] = None
    freelancer_skills: list[str] = []
    freelancer_experience: str = "any"
    freelancer_bio: str = ""
    tone: str = Field(default="professional", pattern="^(professional|friendly|confident|casual)$")
    length: str = Field(default="medium", pattern="^(short|medium|long)$")


class ProposalResponse(BaseModel):
    proposal: str
    tokens_used: int
    estimated_cost_cents: int


class ProfileImproveRequest(BaseModel):
    current_bio: str = Field(..., min_length=50, max_length=5000)
    skills: list[str] = []
    experience_level: str = "any"
    target_categories: list[str] = []
    focus_areas: list[str] = Field(default=["clarity", "keywords", "achievements"])


class ProfileImproveResponse(BaseModel):
    improved_bio: str
    suggestions: list[str]
    tokens_used: int
    estimated_cost_cents: int


class ProjectMatchRequest(BaseModel):
    freelancer_skills: list[str] = []
    experience_level: str = "any"
    preferred_categories: list[str] = []
    min_budget: Optional[int] = None
    max_budget: Optional[int] = None
    preferred_duration: Optional[int] = None
    limit: int = Field(default=10, ge=1, le=50)


class ProjectMatchResponse(BaseModel):
    matches: list[dict]
    tokens_used: int
    estimated_cost_cents: int


class CoverLetterRequest(BaseModel):
    project_title: str
    project_description: str
    project_requirements: list[str] = []
    freelancer_background: str
    freelancer_skills: list[str] = []
    relevant_experience: str = ""
    tone: str = Field(default="professional", pattern="^(professional|friendly|confident|casual)$")


class CoverLetterResponse(BaseModel):
    cover_letter: str
    tokens_used: int
    estimated_cost_cents: int


class AnalyzeProjectRequest(BaseModel):
    project_title: str
    project_description: str
    project_category: str
    project_skills: list[str] = []
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    duration_days: Optional[int] = None


class AnalyzeProjectResponse(BaseModel):
    analysis: dict
    tokens_used: int
    estimated_cost_cents: int


@router.post("/proposal", response_model=ProposalResponse)
async def create_proposal(
    request: ProposalRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Generate a project proposal (Pro/Agency only)."""
    result = await generate_proposal(
        project_title=request.project_title,
        project_description=request.project_description,
        project_category=request.project_category,
        project_skills=request.project_skills,
        project_budget_min=request.project_budget_min,
        project_budget_max=request.project_budget_max,
        project_duration_days=request.project_duration_days,
        freelancer_skills=request.freelancer_skills,
        freelancer_experience=request.freelancer_experience,
        freelancer_bio=request.freelancer_bio,
        tone=request.tone,
        length=request.length,
    )
    return result


@router.post("/profile/improve", response_model=ProfileImproveResponse)
async def improve_profile_endpoint(
    request: ProfileImproveRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Improve freelancer profile/bio (Pro/Agency only)."""
    result = await improve_profile(
        current_bio=request.current_bio,
        skills=request.skills,
        experience_level=request.experience_level,
        target_categories=request.target_categories,
        focus_areas=request.focus_areas,
    )
    return result


@router.post("/projects/match", response_model=ProjectMatchResponse)
async def match_projects_endpoint(
    request: ProjectMatchRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-matched project recommendations (Pro/Agency only)."""
    result = await match_projects(
        freelancer_skills=request.freelancer_skills,
        experience_level=request.experience_level,
        preferred_categories=request.preferred_categories,
        min_budget=request.min_budget,
        max_budget=request.max_budget,
        preferred_duration=request.preferred_duration,
        limit=request.limit,
    )
    return result


@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter_endpoint(
    request: CoverLetterRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Generate a cover letter for a bid (Pro/Agency only)."""
    result = await generate_cover_letter(
        project_title=request.project_title,
        project_description=request.project_description,
        project_requirements=request.project_requirements,
        freelancer_background=request.freelancer_background,
        freelancer_skills=request.freelancer_skills,
        relevant_experience=request.relevant_experience,
        tone=request.tone,
    )
    return result


@router.post("/analyze-project", response_model=AnalyzeProjectResponse)
async def analyze_project_endpoint(
    request: AnalyzeProjectRequest,
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Analyze project requirements and provide insights (Pro/Agency only)."""
    result = await analyze_project_requirements(
        project_title=request.project_title,
        project_description=request.project_description,
        project_category=request.project_category,
        project_skills=request.project_skills,
        budget_min=request.budget_min,
        budget_max=request.budget_max,
        duration_days=request.duration_days,
    )
    return result


@router.get("/usage")
async def get_ai_usage(
    current_user: User = Depends(check_ai_access),
    db: AsyncSession = Depends(get_db),
):
    """Get AI usage statistics for current user."""
    # This would track usage in a separate table in production
    return {
        "plan": current_user.plan,
        "monthly_limit": {
            "starter": 0,
            "pro": 50,
            "agency": 200,
        }.get(current_user.plan, 0),
        "used_this_month": 0,  # Would be tracked in DB
        "remaining": {
            "starter": 0,
            "pro": 50,
            "agency": 200,
        }.get(current_user.plan, 0),
    }