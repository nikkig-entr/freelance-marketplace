from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ParseTZRequest(BaseModel):
    tz_text: str = Field(min_length=50, description="Technical requirements text")
    project_id: Optional[int] = None


class ParseTZResponse(BaseModel):
    structured_plan: Dict[str, Any] = Field(description="Structured project plan")
    estimated_hours: Optional[int] = None
    estimated_budget_min: Optional[int] = None
    estimated_budget_max: Optional[int] = None
    risks: List[str] = Field(default_factory=list)
    recommended_skills: List[str] = Field(default_factory=list)
    timeline_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    confidence_score: float = Field(ge=0, le=1)


class FreelancerMatch(BaseModel):
    user_id: int
    full_name: Optional[str]
    avatar_url: Optional[str]
    rating: float
    reviews_count: int
    completed_projects: int
    skills: List[str]
    match_score: float = Field(ge=0, le=100)
    match_reasons: List[str] = Field(default_factory=list)
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None


class MatchFreelancersRequest(BaseModel):
    project_id: int
    limit: int = Field(default=5, ge=1, le=20)


class MatchFreelancersResponse(BaseModel):
    matches: List[FreelancerMatch]
    total_candidates: int


class GenerateContractRequest(BaseModel):
    project_id: int
    bid_id: int
    template: Optional[str] = "standard"
    custom_terms: Optional[str] = None


class GenerateContractResponse(BaseModel):
    contract_url: str
    contract_text: str
    format: str  # "docx" or "pdf"
    expires_at: Optional[str] = None