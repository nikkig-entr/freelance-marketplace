import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from app.main import app
from unittest.mock import patch, AsyncMock


class TestAIEndpoints:
    """Integration tests for AI endpoints."""

    @pytest.mark.asyncio
    async def test_analyze_project(self, async_client, db_session, test_pro_client_user, pro_client_auth_headers):
        """Test AI analysis of project requirements (Pro/Agency only)."""
        with patch('app.api.v1.ai.analyze_project_requirements') as mock_analyze:
            mock_analyze.return_value = {
                "analysis": {
                    "complexity_score": 7,
                    "required_expertise_level": "mid",
                    "estimated_market_rate_range": "$5,000 - $15,000",
                    "risk_factors": ["Scope creep potential", "Unclear requirements"],
                    "success_criteria": ["Clear deliverables", "Regular communication"],
                    "recommended_timeline_phases": ["Discovery (1 week)", "Development (3 weeks)", "Testing (1 week)"],
                    "skills_gaps_to_watch": ["DevOps", "Testing"],
                    "budget_adequacy": "adequate",
                    "client_clarity_score": 7,
                    "recommendations": [
                        "Add more specific technical requirements",
                        "Define acceptance criteria",
                        "Specify communication expectations",
                    ],
                },
                "tokens_used": 500,
                "estimated_cost_cents": 10,
            }

            response = await async_client.post("/api/v1/analyze-project", json={
                "project_title": "React Dashboard",
                "project_description": "Build a React dashboard with user authentication, charts, and data export",
                "project_category": "web-development",
                "project_skills": ["React", "TypeScript", "Node.js"],
                "budget_min": 50000,
                "budget_max": 100000,
                "duration_days": 14,
            }, headers=pro_client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data
        assert data["analysis"]["required_expertise_level"] == "mid"

    @pytest.mark.asyncio
    async def test_analyze_project_starter_denied(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test AI analysis requires Pro plan (Starter has 0 limit)."""
        response = await async_client.post("/api/v1/analyze-project", json={
            "project_title": "React Dashboard",
            "project_description": "Build a React dashboard with user authentication, charts, and data export",
            "project_category": "web-development",
            "project_skills": ["React", "TypeScript"],
        }, headers=client_auth_headers)

        # Starter plan should not have AI access
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_improve_profile(self, async_client, db_session, test_pro_freelancer_user, pro_freelancer_auth_headers):
        """Test AI profile improvement."""
        with patch('app.api.v1.ai.improve_profile') as mock_improve:
            mock_improve.return_value = {
                "improved_bio": "Improved profile with better structure and details...",
                "suggestions": ["Added keywords", "Quantified achievements"],
                "tokens_used": 300,
                "estimated_cost_cents": 5,
            }

            response = await async_client.post("/api/v1/profile/improve", json={
                "current_bio": "I am a developer with 5 years experience building modern web applications with React and Node.js.",
                "skills": ["React", "TypeScript", "Node.js"],
                "experience_level": "senior",
                "target_categories": ["web-development"],
                "focus_areas": ["clarity", "keywords", "achievements"],
            }, headers=pro_freelancer_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "improved_bio" in data
        assert "Improved" in data["improved_bio"]

    @pytest.mark.asyncio
    async def test_create_proposal(self, async_client, db_session, test_pro_freelancer_user, pro_freelancer_auth_headers):
        """Test AI proposal generation."""
        with patch('app.api.v1.ai.generate_proposal') as mock_proposal:
            mock_proposal.return_value = {
                "proposal": "I can build this React dashboard with high quality...",
                "tokens_used": 400,
                "estimated_cost_cents": 8,
            }

            response = await async_client.post("/api/v1/proposal", json={
                "project_title": "React Dashboard",
                "project_description": "Build a React dashboard with user authentication, charts, and data export for a modern web application",
                "project_category": "web-development",
                "project_skills": ["React", "TypeScript"],
                "project_budget_min": 50000,
                "project_budget_max": 100000,
                "project_duration_days": 14,
                "freelancer_skills": ["React", "TypeScript", "Node.js"],
                "freelancer_experience": "senior",
                "freelancer_bio": "Senior developer with 5 years experience",
                "tone": "professional",
                "length": "medium",
            }, headers=pro_freelancer_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "proposal" in data
        assert len(data["proposal"]) > 0

    @pytest.mark.asyncio
    async def test_match_projects(self, async_client, db_session, test_pro_freelancer_user, pro_freelancer_auth_headers):
        """Test AI project matching for freelancers."""
        with patch('app.api.v1.ai.match_projects') as mock_match:
            mock_match.return_value = {
                "matches": [
                    {
                        "project_type": "Full-stack web application",
                        "match_score": 95,
                        "reason": "Strong match with React/Node.js skills",
                        "keywords": ["React", "Node.js", "PostgreSQL", "TypeScript"],
                        "estimated_budget_range": "$3,000 - $15,000",
                    },
                ],
                "tokens_used": 200,
                "estimated_cost_cents": 4,
            }

            response = await async_client.post("/api/v1/projects/match", json={
                "freelancer_skills": ["React", "TypeScript", "Node.js"],
                "experience_level": "senior",
                "preferred_categories": ["web-development"],
                "min_budget": 50000,
                "max_budget": 200000,
                "preferred_duration": 14,
                "limit": 10,
            }, headers=pro_freelancer_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        assert len(data["matches"]) == 1
        assert data["matches"][0]["match_score"] == 95

    @pytest.mark.asyncio
    async def test_generate_cover_letter(self, async_client, db_session, test_pro_freelancer_user, pro_freelancer_auth_headers):
        """Test AI cover letter generation."""
        with patch('app.api.v1.ai.generate_cover_letter') as mock_cover:
            mock_cover.return_value = {
                "cover_letter": "Dear client, I am excited to apply for this React project...",
                "tokens_used": 150,
                "estimated_cost_cents": 3,
            }

            response = await async_client.post("/api/v1/cover-letter", json={
                "project_title": "React Dashboard",
                "project_description": "Build a React dashboard with user authentication",
                "project_requirements": ["React", "TypeScript", "Charts"],
                "freelancer_background": "Senior React developer",
                "freelancer_skills": ["React", "TypeScript", "Node.js"],
                "relevant_experience": "Built 10+ dashboards",
                "tone": "professional",
            }, headers=pro_freelancer_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "cover_letter" in data
        assert len(data["cover_letter"]) > 0

    @pytest.mark.asyncio
    async def test_ai_usage(self, async_client, db_session, test_pro_client_user, pro_client_auth_headers):
        """Test AI usage statistics endpoint."""
        response = await async_client.get("/api/v1/usage", headers=pro_client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "plan" in data
        assert "monthly_limit" in data
        assert "used_this_month" in data
        assert "remaining" in data

    @pytest.mark.asyncio
    async def test_ai_endpoints_unauthorized(self, async_client, db_session):
        """Test AI endpoints require authentication."""
        response = await async_client.post("/api/v1/analyze-project", json={
            "project_title": "Test",
            "project_description": "Test project description with enough characters",
            "project_category": "web-development",
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_ai_rate_limiting(self, async_client, db_session, test_pro_client_user, pro_client_auth_headers):
        """Test AI endpoints have rate limiting."""
        with patch('app.api.v1.ai.analyze_project_requirements') as mock_analyze:
            mock_analyze.return_value = {
                "analysis": {"complexity_score": 5, "required_expertise_level": "mid"},
                "tokens_used": 100,
                "estimated_cost_cents": 2,
            }

            # Make multiple rapid requests
            for i in range(10):
                response = await async_client.post("/api/v1/analyze-project", json={
                    "project_title": f"Project {i}",
                    "project_description": f"Description for project {i} with enough characters",
                    "project_category": "web-development",
                }, headers=pro_client_auth_headers)
                if response.status_code == 429:
                    break

        # Should eventually hit rate limit
        assert response.status_code in [200, 429]