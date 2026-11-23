from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    status: str  # "healthy", "degraded", "unhealthy"
    version: str = "0.1.0"
    environment: str
    timestamp: str
    checks: Dict[str, Any]


class ReadinessResponse(BaseModel):
    ready: bool
    checks: Dict[str, bool]