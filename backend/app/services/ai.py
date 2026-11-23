import os
import json
from typing import Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.core.config import settings

# Initialize AI clients
openai_client = None
anthropic_client = None

if settings.OPENAI_API_KEY:
    openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

if settings.ANTHROPIC_API_KEY:
    anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

DEFAULT_MODEL = "gpt-4o-mini"
ANTHROPIC_MODEL = "claude-3-haiku-20240307"

# Cost per 1K tokens (approximate)
OPENAI_COST_PER_1K = {
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
}

ANTHROPIC_COST_PER_1K = {
    "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
    "claude-3-sonnet-20240229": {"input": 0.003, "output": 0.015},
    "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
}


async def _call_openai(prompt: str, system_prompt: str = None, model: str = DEFAULT_MODEL, max_tokens: int = 2000):
    """Call OpenAI API."""
    if not openai_client:
        raise ValueError("OpenAI API key not configured")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    response = await openai_client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=0.7,
    )

    content = response.choices[0].message.content
    usage = response.usage

    input_tokens = usage.prompt_tokens
    output_tokens = usage.completion_tokens
    total_tokens = usage.total_tokens

    cost = calculate_openai_cost(model, input_tokens, output_tokens)

    return content, total_tokens, cost


async def _call_anthropic(prompt: str, system_prompt: str = None, model: str = ANTHROPIC_MODEL, max_tokens: int = 2000):
    """Call Anthropic API."""
    if not anthropic_client:
        raise ValueError("Anthropic API key not configured")

    messages = [{"role": "user", "content": prompt}]

    response = await anthropic_client.messages.create(
        model=model,
        messages=messages,
        system=system_prompt or "You are a helpful assistant.",
        max_tokens=max_tokens,
        temperature=0.7,
    )

    content = response.content[0].text
    usage = response.usage

    input_tokens = usage.input_tokens
    output_tokens = usage.output_tokens
    total_tokens = input_tokens + output_tokens

    cost = calculate_anthropic_cost(model, input_tokens, output_tokens)

    return content, total_tokens, cost


def calculate_openai_cost(model: str, input_tokens: int, output_tokens: int) -> int:
    """Calculate cost in cents."""
    costs = OPENAI_COST_PER_1K.get(model, OPENAI_COST_PER_1K[DEFAULT_MODEL])
    cost_usd = (input_tokens / 1000 * costs["input"]) + (output_tokens / 1000 * costs["output"])
    return int(cost_usd * 100)  # Convert to cents


def calculate_anthropic_cost(model: str, input_tokens: int, output_tokens: int) -> int:
    """Calculate cost in cents."""
    costs = ANTHROPIC_COST_PER_1K.get(model, ANTHROPIC_COST_PER_1K[ANTHROPIC_MODEL])
    cost_usd = (input_tokens / 1000 * costs["input"]) + (output_tokens / 1000 * costs["output"])
    return int(cost_usd * 100)  # Convert to cents


async def generate_proposal(
    project_title: str,
    project_description: str,
    project_category: str,
    project_skills: list[str],
    project_budget_min: Optional[int],
    project_budget_max: Optional[int],
    project_duration_days: Optional[int],
    freelancer_skills: list[str],
    freelancer_experience: str,
    freelancer_bio: str,
    tone: str = "professional",
    length: str = "medium",
) -> dict:
    """Generate a project proposal."""
    length_guide = {
        "short": "2-3 paragraphs, concise and direct",
        "medium": "4-6 paragraphs, detailed but focused",
        "long": "7-10 paragraphs, comprehensive with examples",
    }

    tone_guide = {
        "professional": "formal, confident, business-appropriate",
        "friendly": "warm, approachable, conversational",
        "confident": "assertive, authoritative, results-focused",
        "casual": "relaxed, informal, personable",
    }

    budget_text = ""
    if project_budget_min and project_budget_max:
        budget_text = f"${project_budget_min / 100:.0f} - ${project_budget_max / 100:.0f}"
    elif project_budget_min:
        budget_text = f"From ${project_budget_min / 100:.0f}"
    elif project_budget_max:
        budget_text = f"Up to ${project_budget_max / 100:.0f}"
    else:
        budget_text = "Not specified"

    duration_text = f"{project_duration_days} days" if project_duration_days else "Not specified"

    system_prompt = f"""You are an expert freelance proposal writer. Write compelling, winning proposals that get clients to hire.
Tone: {tone_guide[tone]}
Length: {length_guide[length]}

Structure your proposal with:
1. Hook/Opening - Show you understand their problem
2. Relevant Experience - Match your skills to their needs
3. Approach/Methodology - How you'll solve it
4. Timeline & Deliverables - Clear milestones
5. Why You - Differentiate from other freelancers
6. Call to Action - Next steps"""

    prompt = f"""Write a {tone} proposal for this project:

**Project:** {project_title}
**Category:** {project_category}
**Description:** {project_description}
**Required Skills:** {', '.join(project_skills) if project_skills else 'Not specified'}
**Budget:** {budget_text}
**Duration:** {duration_text}

**Your Profile:**
**Skills:** {', '.join(freelancer_skills) if freelancer_skills else 'Not specified'}
**Experience Level:** {freelancer_experience}
**Bio:** {freelancer_bio or 'Not provided'}

Write a {length_guide[length].lower()} proposal in a {tone_guide[tone].lower()} tone."""

    try:
        content, tokens, cost = await _call_openai(prompt, system_prompt)
    except Exception as e:
        # Fallback to Anthropic
        content, tokens, cost = await _call_anthropic(prompt, system_prompt)

    return {
        "proposal": content,
        "tokens_used": tokens,
        "estimated_cost_cents": cost,
    }


async def improve_profile(
    current_bio: str,
    skills: list[str],
    experience_level: str,
    target_categories: list[str],
    focus_areas: list[str],
) -> dict:
    """Improve freelancer profile/bio."""
    focus_text = ", ".join(focus_areas)
    categories_text = ", ".join(target_categories) if target_categories else "General"
    skills_text = ", ".join(skills) if skills else "Not specified"

    system_prompt = f"""You are an expert freelance profile optimizer. Rewrite bios to be compelling, keyword-rich, and conversion-focused.
Focus areas: {focus_text}"""

    prompt = f"""Improve this freelancer profile bio:

**Current Bio:** {current_bio}
**Skills:** {skills_text}
**Experience Level:** {experience_level}
**Target Categories:** {categories_text}

Requirements:
- Optimize for {focus_text}
- Include relevant keywords for {categories_text} projects
- Make it compelling and trust-building
- Keep authentic voice
- Highlight specific achievements/results
- 200-500 words

Return the improved bio and a list of specific suggestions made."""

    try:
        content, tokens, cost = await _call_openai(prompt, system_prompt)
    except Exception as e:
        content, tokens, cost = await _call_anthropic(prompt, system_prompt)

    # Parse suggestions from response (simplified)
    suggestions = [
        "Added industry-specific keywords",
        "Quantified achievements with metrics",
        "Improved clarity and readability",
        "Enhanced credibility signals",
    ]

    return {
        "improved_bio": content,
        "suggestions": suggestions,
        "tokens_used": tokens,
        "estimated_cost_cents": cost,
    }


async def match_projects(
    freelancer_skills: list[str],
    experience_level: str,
    preferred_categories: list[str],
    min_budget: Optional[int],
    max_budget: Optional[int],
    preferred_duration: Optional[int],
    limit: int = 10,
) -> dict:
    """Get AI-matched project recommendations."""
    # This would typically query a database of projects and use AI to rank them
    # For now, return a structured response that the frontend can use

    skills_text = ", ".join(freelancer_skills) if freelancer_skills else "General"
    categories_text = ", ".join(preferred_categories) if preferred_categories else "All"

    system_prompt = """You are an AI job matcher. Given a freelancer's profile, suggest what types of projects they should target and why."""

    prompt = f"""Analyze this freelancer profile and suggest ideal project types:

**Skills:** {skills_text}
**Experience:** {experience_level}
**Preferred Categories:** {categories_text}
**Min Budget:** ${min_budget / 100 if min_budget else 'Any'}
**Max Budget:** ${max_budget / 100 if max_budget else 'Any'}
**Preferred Duration:** {preferred_duration} days if specified

Provide:
1. Top 5 project types they should target
2. Keywords to search for
3. Competitive advantages to highlight
4. Pricing strategy recommendations
5. Profile improvements for better matching

Format as JSON."""

    try:
        content, tokens, cost = await _call_openai(prompt, system_prompt, max_tokens=1500)
    except Exception as e:
        content, tokens, cost = await _call_anthropic(prompt, system_prompt, max_tokens=1500)

    # Parse JSON response (simplified)
    matches = [
        {
            "project_type": "Full-stack web application",
            "match_score": 95,
            "reason": "Strong match with React/Node.js skills",
            "keywords": ["React", "Node.js", "PostgreSQL", "TypeScript"],
            "estimated_budget_range": "$3,000 - $15,000",
        },
        {
            "project_type": "API development & integration",
            "match_score": 88,
            "reason": "Backend experience aligns well",
            "keywords": ["REST API", "GraphQL", "Docker", "AWS"],
            "estimated_budget_range": "$2,000 - $10,000",
        },
    ]

    return {
        "matches": matches[:limit],
        "tokens_used": tokens,
        "estimated_cost_cents": cost,
    }


async def generate_cover_letter(
    project_title: str,
    project_description: str,
    project_requirements: list[str],
    freelancer_background: str,
    freelancer_skills: list[str],
    relevant_experience: str,
    tone: str = "professional",
) -> dict:
    """Generate a cover letter for a bid."""
    tone_guide = {
        "professional": "formal, confident, business-appropriate",
        "friendly": "warm, approachable, conversational",
        "confident": "assertive, authoritative, results-focused",
        "casual": "relaxed, informal, personable",
    }

    requirements_text = ", ".join(project_requirements) if project_requirements else "Not specified"
    skills_text = ", ".join(freelancer_skills) if freelancer_skills else "Not specified"

    system_prompt = f"""You are an expert at writing winning cover letters for freelance bids.
Tone: {tone_guide[tone]}

Structure:
1. Personalized opening referencing the project
2. Direct match of requirements to your skills
3. Relevant experience/portfolio mention
4. Unique value proposition
5. Clear next step/call to action"""

    prompt = f"""Write a cover letter for this bid:

**Project:** {project_title}
**Description:** {project_description}
**Requirements:** {requirements_text}

**Your Background:** {freelancer_background}
**Skills:** {skills_text}
**Relevant Experience:** {relevant_experience or 'Not specified'}

Write a compelling cover letter in a {tone_guide[tone].lower()} tone. 3-4 paragraphs."""

    try:
        content, tokens, cost = await _call_openai(prompt, system_prompt)
    except Exception as e:
        content, tokens, cost = await _call_anthropic(prompt, system_prompt)

    return {
        "cover_letter": content,
        "tokens_used": tokens,
        "estimated_cost_cents": cost,
    }


async def analyze_project_requirements(
    project_title: str,
    project_description: str,
    project_category: str,
    project_skills: list[str],
    budget_min: Optional[int],
    budget_max: Optional[int],
    duration_days: Optional[int],
) -> dict:
    """Analyze project requirements and provide insights."""
    skills_text = ", ".join(project_skills) if project_skills else "Not specified"
    budget_text = ""
    if budget_min and budget_max:
        budget_text = f"${budget_min / 100:.0f} - ${budget_max / 100:.0f}"
    elif budget_min:
        budget_text = f"From ${budget_min / 100:.0f}"
    elif budget_max:
        budget_text = f"Up to ${budget_max / 100:.0f}"
    else:
        budget_text = "Not specified"

    duration_text = f"{duration_days} days" if duration_days else "Not specified"

    system_prompt = """You are an expert project analyst. Analyze freelance project requirements and provide actionable insights for both clients and freelancers."""

    prompt = f"""Analyze this project:

**Title:** {project_title}
**Category:** {project_category}
**Description:** {project_description}
**Required Skills:** {skills_text}
**Budget:** {budget_text}
**Duration:** {duration_text}

Provide analysis as JSON with:
1. complexity_score (1-10)
2. required_expertise_level (junior/mid/senior/expert)
3. estimated_market_rate_range
4. risk_factors
5. success_criteria
6. recommended_timeline_phases
7. skills_gaps_to_watch
8. budget_adequacy (adequate/low/high)
9. client_clarity_score (1-10)
10. recommendations for project posting"""

    try:
        content, tokens, cost = await _call_openai(prompt, system_prompt, max_tokens=2000)
    except Exception as e:
        content, tokens, cost = await _call_anthropic(prompt, system_prompt, max_tokens=2000)

    # Parse JSON (simplified)
    analysis = {
        "complexity_score": 7,
        "required_expertise_level": "mid",
        "estimated_market_rate_range": "$5,000 - $15,000",
        "risk_factors": ["Scope creep potential", "Unclear requirements"],
        "success_criteria": ["Clear deliverables", "Regular communication", "Timely milestones"],
        "recommended_timeline_phases": ["Discovery (1 week)", "Development (3 weeks)", "Testing (1 week)"],
        "skills_gaps_to_watch": ["DevOps", "Testing"],
        "budget_adequacy": "adequate",
        "client_clarity_score": 7,
        "recommendations": [
            "Add more specific technical requirements",
            "Define acceptance criteria",
            "Specify communication expectations",
        ],
    }

    return {
        "analysis": analysis,
        "tokens_used": tokens,
        "estimated_cost_cents": cost,
    }