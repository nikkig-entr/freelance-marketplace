import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ai_service import AIService


class TestAIService:
    """Tests for the AIService class."""

    @pytest.fixture
    def mock_openai(self):
        """Mock OpenAI client."""
        mock = MagicMock()
        mock.chat.completions.create = AsyncMock()
        return mock

    @pytest.fixture
    def mock_anthropic(self):
        """Mock Anthropic client."""
        mock = MagicMock()
        mock.messages.create = AsyncMock()
        return mock

    @pytest.fixture
    def ai_service(self, mock_openai, mock_anthropic):
        """Create AIService with mocked clients."""
        with patch('app.services.ai_service.AsyncOpenAI', return_value=mock_openai), \
             patch('app.services.ai_service.AsyncAnthropic', return_value=mock_anthropic):
            service = AIService()
            service.openai_client = mock_openai
            service.anthropic_client = mock_anthropic
            return service

    @pytest.mark.asyncio
    async def test_parse_project_requirements(self, ai_service, mock_openai):
        """Test parsing project requirements with AI."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='{"skills": ["React", "TypeScript"], "complexity": "medium", "estimated_hours": 40, "suggested_budget_min": 50000, "suggested_budget_max": 100000}'))]
        )

        result = await ai_service.parse_project_requirements("Build a React dashboard with charts")

        assert "skills" in result
        assert "React" in result["skills"]
        assert "TypeScript" in result["skills"]
        assert result["complexity"] == "medium"
        assert result["estimated_hours"] == 40

    @pytest.mark.asyncio
    async def test_parse_project_requirements_fallback(self, ai_service, mock_openai, mock_anthropic):
        """Test parsing falls back to Anthropic when OpenAI fails."""
        mock_openai.chat.completions.create.side_effect = Exception("OpenAI error")
        mock_anthropic.messages.create.return_value = MagicMock(
            content=[MagicMock(text='{"skills": ["Python", "Django"], "complexity": "high", "estimated_hours": 80, "suggested_budget_min": 100000, "suggested_budget_max": 200000}')]
        )

        result = await ai_service.parse_project_requirements("Build a Django API")

        assert "skills" in result
        assert "Python" in result["skills"]

    @pytest.mark.asyncio
    async def test_match_freelancers_to_project(self, ai_service, mock_openai):
        """Test matching freelancers to a project."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='[{"freelancer_id": 1, "score": 0.95, "reason": "Perfect match"}, {"freelancer_id": 2, "score": 0.80, "reason": "Good match"}]'))]
        )

        freelancers = [
            {"id": 1, "skills": ["React", "TypeScript"], "rating": 4.8, "hourly_rate": 75},
            {"id": 2, "skills": ["React", "Vue"], "rating": 4.5, "hourly_rate": 60},
            {"id": 3, "skills": ["Python", "Django"], "rating": 4.7, "hourly_rate": 80},
        ]
        project = {
            "title": "React Dashboard",
            "skills_required": ["React", "TypeScript"],
            "budget_min": 50000,
            "budget_max": 100000,
        }

        matches = await ai_service.match_freelancers_to_project(project, freelancers)

        assert len(matches) == 2
        assert matches[0]["freelancer_id"] == 1
        assert matches[0]["score"] == 0.95
        assert matches[1]["freelancer_id"] == 2
        assert matches[1]["score"] == 0.80

    @pytest.mark.asyncio
    async def test_generate_contract(self, ai_service, mock_openai):
        """Test generating a contract."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="CONTRACT\n\nThis agreement is between Client and Freelancer..."))]
        )

        project = {
            "title": "Build a React Dashboard",
            "description": "Modern dashboard with charts",
            "budget_min": 50000,
            "budget_max": 100000,
        }
        client = {"full_name": "John Client", "email": "client@example.com"}
        freelancer = {"full_name": "Jane Freelancer", "email": "freelancer@example.com"}

        contract = await ai_service.generate_contract(project, client, freelancer)

        assert "CONTRACT" in contract
        assert "Client" in contract
        assert "Freelancer" in contract

    @pytest.mark.asyncio
    async def test_improve_proposal(self, ai_service, mock_openai):
        """Test improving a freelancer's proposal."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Improved proposal with better structure..."))]
        )

        proposal = "I can do this project."
        project = {"title": "React Dashboard", "skills_required": ["React"]}

        improved = await ai_service.improve_proposal(proposal, project)

        assert "Improved proposal" in improved
        assert len(improved) > len(proposal)

    @pytest.mark.asyncio
    async def test_analyze_project_risk(self, ai_service, mock_openai):
        """Test analyzing project risk."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='{"risk_level": "low", "risks": [], "recommendations": ["Clear requirements"]}'))]
        )

        project = {"title": "Simple website", "description": "Basic landing page", "budget_min": 10000, "budget_max": 20000}
        freelancer = {"rating": 4.8, "completed_projects": 50}

        analysis = await ai_service.analyze_project_risk(project, freelancer)

        assert "risk_level" in analysis
        assert analysis["risk_level"] == "low"
        assert "risks" in analysis
        assert "recommendations" in analysis

    @pytest.mark.asyncio
    async def test_suggest_project_milestones(self, ai_service, mock_openai):
        """Test suggesting project milestones."""
        mock_openai.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content='[{"title": "Design", "description": "UI/UX Design", "amount_cents": 25000}, {"title": "Development", "description": "Frontend Development", "amount_cents": 50000}, {"title": "Testing", "description": "QA & Testing", "amount_cents": 25000}]'))]
        )

        project = {"title": "React Dashboard", "budget_min": 50000, "budget_max": 100000, "timeline_days": 14}

        milestones = await ai_service.suggest_project_milestones(project)

        assert len(milestones) == 3
        assert milestones[0]["title"] == "Design"
        assert milestones[1]["title"] == "Development"
        assert milestones[2]["title"] == "Testing"

    @pytest.mark.asyncio
    async def test_empty_freelancers_list(self, ai_service):
        """Test matching with empty freelancers list."""
        matches = await ai_service.match_freelancers_to_project({"skills_required": ["React"]}, [])
        assert matches == []

    @pytest.mark.asyncio
    async def test_ai_service_unavailable(self, ai_service, mock_openai, mock_anthropic):
        """Test handling when both AI services are unavailable."""
        mock_openai.chat.completions.create.side_effect = Exception("OpenAI down")
        mock_anthropic.messages.create.side_effect = Exception("Anthropic down")

        result = await ai_service.parse_project_requirements("Build something")

        # Should return fallback/default result
        assert "skills" in result
        assert isinstance(result["skills"], list)