# Freelance Marketplace MVP

A complete freelance marketplace platform built with **FastAPI**, **React**, **PostgreSQL**, **Redis**, **Meilisearch**, **MinIO**, **Stripe Billing**, and **AI Matching**.

## 🚀 Features

### Core Platform
- **Authentication**: JWT (access 15min / refresh 7d), OAuth (Google, GitHub, Telegram), Email verification
- **Projects & Bids**: Full CRUD, status management, freelancer bidding system
- **Real-time Chat**: WebSocket-based chat with file uploads, system events, typing indicators
- **Freemium Tiers**: Starter (2 bids/week), Pro (unlimited + AI), Agency (team seats)

### Billing & Payments
- **Stripe Integration**: Checkout, Customer Portal, Webhooks
- **Internal Balance**: Escrow-like system, commission per plan (5%/3%/2%)
- **Withdrawals**: Request → Admin approval → Payout with commission deduction

### AI-Powered (Pro/Agency only)
- **Parse TZ**: Convert technical requirements → structured plan, estimates, risks
- **Match Freelancers**: Semantic search + skill matching → top 5 with match scores
- **Generate Contract**: Auto-generate DOCX/PDF contracts from project details

### Admin & Search
- **SQLAdmin Panel**: Users, Projects, Bids, Withdrawals, Statistics
- **Meilisearch**: Full-text search with filters (skills, budget, status)
- **MinIO**: S3-compatible file storage for avatars, attachments, contracts

### Infrastructure
- **Docker Compose**: PostgreSQL, Redis, Meilisearch, MinIO, Backend, Celery Worker/Beat, Frontend, Nginx
- **CI/CD**: GitHub Actions (lint, typecheck, test, build, deploy)
- **Monitoring**: Prometheus metrics, structured logging

## 🏗 Architecture

```
freelance-marketplace/
├── docker-compose.yml          # Full stack orchestration
├── .github/workflows/ci-cd.yml # CI/CD pipeline
├── .env.example                # Environment template
├── backend/                    # FastAPI (Python 3.12)
│   ├── app/
│   │   ├── api/v1/            # REST endpoints
│   │   ├── core/              # Config, Security, DB, Redis, WS, Meilisearch
│   │   ├── models/            # SQLAlchemy 2.0 models
│   │   ├── schemas/           # Pydantic v2 schemas
│   │   ├── services/          # Business logic
│   │   ├── dependencies/      # FastAPI dependencies
│   │   ├── tasks/             # Celery tasks
│   │   └── main.py            # FastAPI app
│   ├── tests/                 # Pytest suite
│   └── alembic/               # Migrations
├── frontend/                   # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── api/               # API client & queries
│   │   ├── store/             # Zustand stores
│   │   ├── utils/             # Helpers
│   │   └── styles/            # Tailwind + globals
│   └── ...
├── nginx/                      # Reverse proxy config
├── meilisearch/                # Meilisearch config
└── prometheus/                 # Metrics config
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic |
| Auth | JWT, OAuth2, bcrypt, python-jose |
| Database | PostgreSQL 16 (asyncpg) |
| Cache/Queue | Redis 7, Celery |
| Search | Meilisearch |
| Storage | MinIO (S3 API) |
| Payments | Stripe (Checkout, Portal, Webhooks) |
| AI | OpenAI / Anthropic SDK |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | TanStack Query, Zustand |
| Routing | React Router v6 |
| UI | Radix UI primitives |
| Real-time | WebSocket (native) |
| CI/CD | GitHub Actions, Docker, GHCR |

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### 1. Clone & Configure
```bash
git clone <repo-url>
cd freelance-marketplace

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env with your API keys (Stripe, OpenAI, OAuth, etc.)
```

### 2. Start with Docker Compose
```bash
# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 3. Access the Application
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Admin Panel | http://localhost:8000/admin |
| Meilisearch | http://localhost:7700 |
| MinIO Console | http://localhost:9001 |
| Nginx (production) | http://localhost |

### 4. Run Database Migrations
```bash
# Inside backend container
docker compose exec backend alembic upgrade head
```

## 🔧 Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements-dev.txt
cp .env.example .env
# Edit .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Run Tests
```bash
# Backend tests
cd backend
pytest -v --cov=app --cov-report=term-missing

# Frontend tests
cd frontend
npm run test
```

## 📚 API Documentation

### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login (OAuth2 form)
POST   /api/v1/auth/refresh           # Refresh access token
GET    /api/v1/auth/verify-email      # Verify email token
GET    /api/v1/auth/me                # Get current user
POST   /api/v1/auth/oauth/google      # Google OAuth
POST   /api/v1/auth/oauth/github      # GitHub OAuth
POST   /api/v1/auth/oauth/telegram    # Telegram OAuth
```

### Projects
```
GET    /api/v1/projects/              # List projects (with filters, search)
POST   /api/v1/projects/              # Create project
GET    /api/v1/projects/{id}          # Get project detail
PATCH  /api/v1/projects/{id}          # Update project
DELETE /api/v1/projects/{id}          # Delete project
POST   /api/v1/projects/{id}/publish  # Publish draft → open
GET    /api/v1/projects/my            # My projects (client/freelancer)
```

### Bids
```
POST   /api/v1/projects/{id}/bids     # Place bid (checks limits)
GET    /api/v1/projects/{id}/bids     # List bids on project
PATCH  /api/v1/bids/{id}              # Update bid
POST   /api/v1/bids/{id}/accept       # Accept bid (client only)
POST   /api/v1/bids/{id}/reject       # Reject bid
POST   /api/v1/bids/{id}/withdraw     # Withdraw bid (freelancer only)
GET    /api/v1/bids/my                # My bids
```

### Chat (WebSocket)
```
WS     /api/v1/chat/{project_id}      # Connect to project chat
```
Events: `message`, `typing`, `read`, `file`, `system_event`

### Balance & Withdrawals
```
GET    /api/v1/balance/               # Get balance & transactions
POST   /api/v1/balance/withdraw       # Request withdrawal
GET    /api/v1/balance/withdrawals    # List withdrawal requests
```

### AI (Pro/Agency only)
```
POST   /api/v1/ai/parse-tz            # Parse TZ → plan, estimate, risks
POST   /api/v1/ai/match-freelancers   # Find top 5 freelancers for project
POST   /api/v1/ai/generate-contract   # Generate DOCX/PDF contract
```

### Billing
```
POST   /api/v1/billing/checkout       # Create Stripe Checkout session
POST   /api/v1/billing/portal         # Create Stripe Portal session
GET    /api/v1/billing/subscription   # Get current subscription
POST   /api/v1/billing/webhook        # Stripe webhook endpoint
```

### Admin (requires admin role)
```
GET    /api/v1/admin/stats            # Platform statistics
GET    /api/v1/admin/users            # List users (SQLAdmin UI)
GET    /api/v1/admin/projects         # List projects
GET    /api/v1/admin/withdrawals      # List withdrawals
PATCH  /api/v1/admin/withdrawals/{id} # Approve/reject withdrawal
```

## 💳 Freemium Plans

| Feature | Starter (Free) | Pro ($29/mo) | Agency ($99/mo) |
|---------|----------------|--------------|-----------------|
| Bids/week | 2 | Unlimited | Unlimited |
| Active projects | 1 | Unlimited | Unlimited |
| Commission | 5% | 3% | 2% |
| AI Matching | ❌ | ✅ | ✅ |
| AI Wizard | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Team Seats | - | - | 5 |

## 🧪 Testing

```bash
# Backend unit/integration tests
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist
1. Set `DEBUG=false` in backend `.env`
2. Generate strong `SECRET_KEY` (32+ chars)
3. Configure production PostgreSQL, Redis, Meilisearch, MinIO
4. Set up Stripe webhook endpoint (production URL)
5. Configure OAuth redirect URIs for production domain
6. Set up SSL certificates for Nginx
7. Configure SMTP for transactional emails
8. Set up monitoring (Prometheus + Grafana)

### Deploy with Docker Compose (VPS)
```bash
# On server
git clone <repo>
cd freelance-marketplace
cp .env.example .env
# Edit .env with production values
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### CI/CD Pipeline
The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push:
1. **Lint**: Ruff (Python), ESLint (TypeScript)
2. **Typecheck**: mypy, tsc
3. **Test**: pytest, vitest
4. **Build**: Docker images → GHCR
5. **Deploy**: SSH to VPS, docker compose pull & up

## 📁 Project Structure Details

### Backend Key Files
```
backend/app/
├── main.py                    # FastAPI app, lifespan, middleware, routers
├── core/
│   ├── config.py             # Pydantic Settings, PLAN_LIMITS
│   ├── security.py           # JWT, bcrypt, OAuth2
│   ├── database.py           # SQLAlchemy async engine, session
│   ├── redis.py              # Redis pool, pub/sub
│   ├── websocket.py          # ConnectionManager
│   └── meilisearch.py        # Search client
├── models/                   # SQLAlchemy models
├── schemas/                  # Pydantic request/response
├── api/v1/                   # REST endpoints
├── services/                 # Business logic
├── dependencies/             # FastAPI deps (auth, limits, AI access)
└── tasks/                    # Celery tasks
```

### Frontend Key Files
```
frontend/src/
├── pages/                    # Route-level components
├── components/
│   ├── ui/                   # Radix UI wrappers
│   ├── layout/               # Header, Sidebar, Footer
│   ├── chat/                 # ChatWindow, MessageBubble
│   ├── forms/                # ProjectForm, BidForm, WithdrawalForm
│   ├── project/              # ProjectCard, ProjectFilters, BidCard
│   ├── billing/              # PlanCard, LimitModal, CommissionInfo
│   └── common/               # Button, Input, Modal, etc.
├── hooks/                    # useAuth, useWebSocket, useDebounce
├── api/                      # Axios client, endpoints, TanStack queries
├── store/                    # Zustand stores (auth, ui)
├── utils/                    # format, validation, stripe
└── styles/                   # Tailwind, globals
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI, SQLAlchemy, Pydantic teams
- React, Vite, Tailwind teams
- Meilisearch, MinIO, Stripe
- OpenAI, Anthropic for AI capabilities