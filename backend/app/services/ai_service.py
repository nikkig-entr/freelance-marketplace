import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import get_settings
from app.models.user import User
from app.models.project import Project

settings = get_settings()


class AIService:
    """AI service for parsing TZ, matching freelancers, generating contracts."""

    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None

    def _get_client(self):
        """Get available AI client."""
        if self.openai_client:
            return self.openai_client, "openai"
        if self.anthropic_client:
            return self.anthropic_client, "anthropic"
        raise RuntimeError("No AI provider configured")

    async def parse_project_requirements(self, tz_text: str) -> Dict[str, Any]:
        """
        Parse technical requirements into structured plan (alias for parse_tz).
        """
        return await self.parse_tz(tz_text)

    async def parse_tz(self, tz_text: str, project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Parse technical requirements into structured plan.
        Tries OpenAI first, falls back to Anthropic.
        """
        prompt = f"""
        You are an expert project manager. Analyze the following technical requirements (TZ)
        and create a structured project plan.

        TZ Text:
        {tz_text}

        Return a JSON object with:
        {{
            "structured_plan": {{"phases": [...], "deliverables": [...], "milestones": [...]}},
            "estimated_hours": int,
            "estimated_budget_min": int (in cents),
            "estimated_budget_max": int (in cents),
            "risks": ["risk1", "risk2", ...],
            "recommended_skills": ["skill1", "skill2", ...],
            "timeline_breakdown": [{{"phase": "", "duration_days": int, "deliverables": []}}],
            "confidence_score": float (0-1)
        }}
        """

        # Try OpenAI first
        if self.openai_client:
            try:
                response = await self.openai_client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an expert project manager. Return only valid JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"},
                )
                return json.loads(response.choices[0].message.content)
            except Exception:
                pass  # Fall through to Anthropic

        # Try Anthropic
        if self.anthropic_client:
            try:
                response = await self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=4000,
                    temperature=0.3,
                    system="You are an expert project manager. Return only valid JSON.",
                    messages=[{"role": "user", "content": prompt}],
                )
                return json.loads(response.content[0].text)
            except Exception:
                pass  # Fall through to error response

        # Both failed
        return {
            "structured_plan": {"error": "All AI providers failed"},
            "estimated_hours": None,
            "estimated_budget_min": None,
            "estimated_budget_max": None,
            "risks": ["AI parsing failed"],
            "recommended_skills": [],
            "skills": [],
            "timeline_breakdown": [],
            "confidence_score": 0.0,
        }

    async def match_freelancers(
        self,
        project: Project,
        freelancers: List[User],
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Match freelancers to project using AI semantic matching.
        """
        if not freelancers:
            return []

        client, provider = self._get_client()

        # Prepare freelancer profiles
        freelancer_profiles = []
        for f in freelancers:
            profile = f.profile or {}
            freelancer_profiles.append({
                "id": f.id,
                "name": f.full_name,
                "rating": f.rating,
                "reviews_count": f.reviews_count,
                "completed_projects": f.completed_projects,
                "skills": profile.get("skills", []),
                "hourly_rate_min": profile.get("hourly_rate_min"),
                "hourly_rate_max": profile.get("hourly_rate_max"),
                "bio": profile.get("bio", ""),
            })

        budget_max_str = f"${project.budget_max/100:.0f}" if project.budget_max else "N/A"
        prompt = f"""
        Match the best freelancers for this project.

        Project:
        - Title: {project.title}
        - Description: {project.description}
        - Requirements: {project.requirements or 'N/A'}
        - Budget: ${project.budget_min/100:.0f} - {budget_max_str}
        - Skills: {', '.join(project.skills)}
        - Deadline: {project.deadline_days} days

        Freelancers:
        {json.dumps(freelancer_profiles, indent=2)}

        Return JSON array of top {limit} matches:
        [
            {{
                "user_id": int,
                "match_score": float (0-100),
                "match_reasons": ["reason1", "reason2"],
            }}
        ]
        """

        try:
            if provider == "openai":
                response = await client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an AI matching engine. Return only valid JSON array."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"},
                )
                result = json.loads(response.choices[0].message.content)
                matches = result.get("matches", result) if isinstance(result, dict) else result
            else:
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=3000,
                    temperature=0.2,
                    system="You are an AI matching engine. Return only valid JSON array.",
                    messages=[{"role": "user", "content": prompt}],
                )
                matches = json.loads(response.content[0].text)

            # Enrich with freelancer data
            enriched = []
            freelancer_map = {f.id: f for f in freelancers}

            for match in matches[:limit]:
                freelancer = freelancer_map.get(match["user_id"])
                if freelancer:
                    enriched.append({
                        "user_id": freelancer.id,
                        "full_name": freelancer.full_name,
                        "avatar_url": freelancer.avatar_url,
                        "rating": freelancer.rating,
                        "reviews_count": freelancer.reviews_count,
                        "completed_projects": freelancer.completed_projects,
                        "skills": (freelancer.profile or {}).get("skills", []),
                        "match_score": match["match_score"],
                        "match_reasons": match.get("match_reasons", []),
                        "hourly_rate_min": (freelancer.profile or {}).get("hourly_rate_min"),
                        "hourly_rate_max": (freelancer.profile or {}).get("hourly_rate_max"),
                    })

            return enriched

        except Exception:
            # Fallback: simple skill matching
            return self._fallback_match(project, freelancers, limit)

    def _fallback_match(
        self,
        project: Project,
        freelancers: List[User],
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Simple skill-based matching fallback."""
        project_skills = set(project.skills)
        matches = []

        for f in freelancers:
            freelancer_skills = set((f.profile or {}).get("skills", []))
            common_skills = project_skills & freelancer_skills
            score = len(common_skills) / max(len(project_skills), 1) * 100

            # Bonus for rating and completed projects
            score += min(f.rating * 5, 25)
            score += min(f.completed_projects * 2, 20)

            matches.append({
                "user_id": f.id,
                "full_name": f.full_name,
                "avatar_url": f.avatar_url,
                "rating": f.rating,
                "reviews_count": f.reviews_count,
                "completed_projects": f.completed_projects,
                "skills": list(freelancer_skills),
                "match_score": min(score, 100),
                "match_reasons": [f"Common skills: {', '.join(common_skills)}"] if common_skills else ["No direct skill match"],
                "hourly_rate_min": (f.profile or {}).get("hourly_rate_min"),
                "hourly_rate_max": (f.profile or {}).get("hourly_rate_max"),
            })

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:limit]

    async def generate_contract(
        self,
        project: Project,
        freelancer: User,
        client: User,
        bid_price: int,
        bid_delivery_days: int,
        template: str = "standard",
        custom_terms: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate contract document (returns text, can be converted to DOCX/PDF).
        """
        client_obj, provider = self._get_client()

        prompt = f"""
        Generate a professional freelance contract.

        Project: {project.title}
        Description: {project.description}
        Requirements: {project.requirements or 'N/A'}

        Client: {client.full_name or client.email} (ID: {client.id})
        Freelancer: {freelancer.full_name or freelancer.email} (ID: {freelancer.id})

        Agreed Price: ${bid_price/100:.2f}
        Delivery Time: {bid_delivery_days} days
        Skills: {', '.join(project.skills)}

        Custom Terms: {custom_terms or 'None'}

        Generate a complete contract with:
        1. Parties
        2. Scope of Work
        3. Deliverables & Timeline
        4. Payment Terms
        5. Intellectual Property
        6. Confidentiality
        7. Termination
        8. Dispute Resolution
        9. Signatures

        Return as plain text with clear sections.
        """

        try:
            if provider == "openai":
                response = await client_obj.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a legal contract writer. Generate professional contracts."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                )
                contract_text = response.choices[0].message.content
            else:
                response = await client_obj.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=4000,
                    temperature=0.3,
                    system="You are a legal contract writer. Generate professional contracts.",
                    messages=[{"role": "user", "content": prompt}],
                )
                contract_text = response.content[0].text

            return {
                "contract_text": contract_text,
                "format": "text",
            }

        except Exception as e:
            return {
                "contract_text": f"Error generating contract: {str(e)}",
                "format": "text",
            }

    async def match_freelancers_to_project(
        self,
        project: Dict[str, Any],
        freelancers: List[Dict[str, Any]],
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Match freelancers to project using AI semantic matching (test-compatible signature).
        """
        if not freelancers:
            return []

        client, provider = self._get_client()

        budget_max = project.get('budget_max', 0)
        budget_max_str = f"${budget_max/100:.0f}" if budget_max else "N/A"
        prompt = f"""
        Match the best freelancers for this project.

        Project:
        - Title: {project.get('title', '')}
        - Skills Required: {', '.join(project.get('skills_required', []))}
        - Budget: ${project.get('budget_min', 0)/100:.0f} - {budget_max_str}

        Freelancers:
        {json.dumps(freelancers, indent=2)}

        Return JSON array of top {limit} matches:
        [
            {{
                "freelancer_id": int,
                "score": float (0-1),
                "reason": "string"
            }}
        ]
        """

        try:
            if provider == "openai":
                response = await client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are an AI matching engine. Return only valid JSON array."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"},
                )
                result = json.loads(response.choices[0].message.content)
                matches = result.get("matches", result) if isinstance(result, dict) else result
            else:
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=3000,
                    temperature=0.2,
                    system="You are an AI matching engine. Return only valid JSON array.",
                    messages=[{"role": "user", "content": prompt}],
                )
                matches = json.loads(response.content[0].text)

            return matches[:limit]

        except Exception:
            # Fallback: simple skill matching
            return self._fallback_match_dict(project, freelancers, limit)

    def _fallback_match_dict(
        self,
        project: Dict[str, Any],
        freelancers: List[Dict[str, Any]],
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Simple skill-based matching fallback for dict inputs."""
        project_skills = set(project.get('skills_required', []))
        matches = []

        for f in freelancers:
            freelancer_skills = set(f.get('skills', []))
            common_skills = project_skills & freelancer_skills
            score = len(common_skills) / max(len(project_skills), 1)

            # Bonus for rating and completed projects
            score += min(f.get('rating', 0) * 0.05, 0.25)
            score += min(f.get('completed_projects', 0) * 0.02, 0.20)

            matches.append({
                "freelancer_id": f.get('id', 0),
                "score": min(score, 1.0),
                "reason": f"Common skills: {', '.join(common_skills)}" if common_skills else "No direct skill match",
            })

        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]

    async def improve_proposal(
        self,
        proposal: str,
        project: Dict[str, Any],
    ) -> str:
        """
        Improve a freelancer's proposal using AI.
        """
        client, provider = self._get_client()

        prompt = f"""
        Improve this freelancer's proposal for the given project.

        Project: {project.get('title', '')}
        Required Skills: {', '.join(project.get('skills_required', []))}

        Current Proposal:
        {proposal}

        Return an improved, more professional proposal that highlights relevant skills and experience.
        """

        try:
            if provider == "openai":
                response = await client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a professional proposal writer. Improve the proposal while keeping the freelancer's voice."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.5,
                )
                return response.choices[0].message.content
            else:
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=2000,
                    temperature=0.5,
                    system="You are a professional proposal writer. Improve the proposal while keeping the freelancer's voice.",
                    messages=[{"role": "user", "content": prompt}],
                )
                return response.content[0].text

        except Exception as e:
            return f"Error improving proposal: {str(e)}"

    async def analyze_project_risk(
        self,
        project: Dict[str, Any],
        freelancer: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Analyze project risk using AI.
        """
        client, provider = self._get_client()

        budget_max = project.get('budget_max', 0)
        budget_max_str = f"${budget_max/100:.0f}" if budget_max else "N/A"
        prompt = f"""
        Analyze the risk level of this project for the freelancer.

        Project:
        - Title: {project.get('title', '')}
        - Description: {project.get('description', '')}
        - Budget: ${project.get('budget_min', 0)/100:.0f} - {budget_max_str}

        Freelancer:
        - Rating: {freelancer.get('rating', 0)}
        - Completed Projects: {freelancer.get('completed_projects', 0)}

        Return JSON:
        {{
            "risk_level": "low|medium|high",
            "risks": ["risk1", "risk2"],
            "recommendations": ["rec1", "rec2"]
        }}
        """

        try:
            if provider == "openai":
                response = await client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a risk analyst. Return only valid JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"},
                )
                return json.loads(response.choices[0].message.content)
            else:
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=2000,
                    temperature=0.3,
                    system="You are a risk analyst. Return only valid JSON.",
                    messages=[{"role": "user", "content": prompt}],
                )
                return json.loads(response.content[0].text)

        except Exception as e:
            return {
                "risk_level": "medium",
                "risks": ["AI analysis failed"],
                "recommendations": ["Manual review recommended"],
            }

    async def suggest_project_milestones(
        self,
        project: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Suggest project milestones using AI.
        """
        client, provider = self._get_client()

        budget_max = project.get('budget_max', 0)
        budget_max_str = f"${budget_max/100:.0f}" if budget_max else "N/A"
        prompt = f"""
        Suggest milestones for this project.

        Project:
        - Title: {project.get('title', '')}
        - Budget: ${project.get('budget_min', 0)/100:.0f} - {budget_max_str}
        - Timeline: {project.get('timeline_days', 14)} days

        Return JSON array of milestones:
        [
            {{
                "title": "Milestone name",
                "description": "Description",
                "amount_cents": int
            }}
        ]
        """

        try:
            if provider == "openai":
                response = await client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a project manager. Return only valid JSON array."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"},
                )
                result = json.loads(response.choices[0].message.content)
                milestones = result.get("milestones", result) if isinstance(result, dict) else result
            else:
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=2000,
                    temperature=0.3,
                    system="You are a project manager. Return only valid JSON array.",
                    messages=[{"role": "user", "content": prompt}],
                )
                milestones = json.loads(response.content[0].text)

            return milestones

        except Exception as e:
            # Simple fallback: split budget into 3 equal milestones
            total = project.get('budget_max') or project.get('budget_min') or 0
            per_milestone = total // 3
            return [
                {"title": "Planning & Design", "description": "Requirements analysis and design", "amount_cents": per_milestone},
                {"title": "Development", "description": "Core development work", "amount_cents": per_milestone},
                {"title": "Testing & Delivery", "description": "QA, testing, and final delivery", "amount_cents": total - 2 * per_milestone},
            ]

    async def generate_contract(
        self,
        project: Dict[str, Any],
        client: Dict[str, Any],
        freelancer: Dict[str, Any],
    ) -> str:
        """
        Generate contract document (test-compatible signature).
        """
        # Use defaults for missing parameters
        bid_price = project.get('budget_min', 0)
        bid_delivery_days = project.get('timeline_days', 14)
        template = "standard"
        custom_terms = None

        # Call the full version and extract text
        result = await self._generate_contract_full(
            project_title=project.get('title', ''),
            project_description=project.get('description', ''),
            project_requirements=project.get('requirements', ''),
            client_name=client.get('full_name', client.get('email', '')),
            freelancer_name=freelancer.get('full_name', freelancer.get('email', '')),
            bid_price=bid_price,
            bid_delivery_days=bid_delivery_days,
            skills=project.get('skills_required', []),
            custom_terms=custom_terms,
        )
        return result.get("contract_text", "")

    async def _generate_contract_full(
        self,
        project_title: str,
        project_description: str,
        project_requirements: str,
        client_name: str,
        freelancer_name: str,
        bid_price: int,
        bid_delivery_days: int,
        skills: List[str],
        template: str = "standard",
        custom_terms: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Internal full contract generation.
        """
        client_obj, provider = self._get_client()

        prompt = f"""
        Generate a professional freelance contract.

        Project: {project_title}
        Description: {project_description}
        Requirements: {project_requirements or 'N/A'}

        Client: {client_name}
        Freelancer: {freelancer_name}

        Agreed Price: ${bid_price/100:.2f}
        Delivery Time: {bid_delivery_days} days
        Skills: {', '.join(skills)}

        Custom Terms: {custom_terms or 'None'}

        Generate a complete contract with:
        1. Parties
        2. Scope of Work
        3. Deliverables & Timeline
        4. Payment Terms
        5. Intellectual Property
        6. Confidentiality
        7. Termination
        8. Dispute Resolution
        9. Signatures

        Return as plain text with clear sections.
        """

        try:
            if provider == "openai":
                response = await client_obj.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a legal contract writer. Generate professional contracts."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.3,
                )
                contract_text = response.choices[0].message.content
            else:
                response = await client_obj.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=4000,
                    temperature=0.3,
                    system="You are a legal contract writer. Generate professional contracts.",
                    messages=[{"role": "user", "content": prompt}],
                )
                contract_text = response.content[0].text

            return {
                "contract_text": contract_text,
                "format": "text",
            }

        except Exception as e:
            return {
                "contract_text": f"Error generating contract: {str(e)}",
                "format": "text",
            }


# Global instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service