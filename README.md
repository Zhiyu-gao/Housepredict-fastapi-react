# House Price Platform

A full-stack house price system with three services:
- `frontend`: React + Vite + Ant Design
- `backend`: FastAPI + SQLAlchemy + MySQL + ML inference
- `ai_service`: FastAPI + multi-provider LLM analysis + LangGraph chat intent routing

The project supports user authentication, house data management, model-based price prediction, and AI-generated analysis.

## Project Overview

### Core capabilities
- JWT-based authentication (`register`, `login`, current-user APIs)
- House dataset CRUD for model samples
- Price prediction API based on trained `model.pkl`
- Crawled house metadata browsing + annotation flow
- AI analysis endpoint for Kimi / Qwen / DeepSeek
- AI chat endpoint (normal and streaming)

### Architecture

```text
Frontend (React, :5173 / :80)
  |- calls Backend API (:8000)
  |- calls AI Service (:8080)

Backend (FastAPI)
  |- MySQL (users, houses, crawled houses)
  |- local model.pkl for /predict

AI Service (FastAPI)
  |- provider adapters (Kimi/Qwen/DeepSeek)
  |- LangGraph intent workflow
```

## Repository Structure

```text
.
├── frontend/      # React app
├── backend/       # Business API + DB + model training + crawler scripts
├── ai_service/    # AI analysis and chat service
├── docker-compose.yml
└── README.md
```

## Installation

### Prerequisites
- Python 3.13+
- Node.js 18+
- MySQL 8+
- `uv` (recommended for Python dependency management)
- Docker + Docker Compose (optional but recommended)

### Option A: Docker Compose (recommended)

```bash
docker compose up -d --build
```

The compose file is self-contained and can start without creating local `.env` files.
Default DB credentials (for local demo):
- host: `localhost`
- port: `3306`
- user: `root`
- password: `123456`
- database: `house_price_db`

Notes:
- `backend` and `ai_service` share the same JWT `SECRET_KEY` in `docker-compose.yml`.
- AI provider keys use placeholder values by default; replace them in `docker-compose.yml` for real provider calls.

Exposed ports:
- Frontend: `http://localhost` (port `80`)
- Backend docs: `http://localhost:8000/docs`
- AI service docs: `http://localhost:8080/docs`
- MySQL: `localhost:3306`

### Option B: Local development

1. Start MySQL and create environment files.
2. Start backend:

```bash
cd backend
uv sync
uv run python create_database.py
uv run alembic upgrade head
uv run python -m app.train
uv run uvicorn app.main:app --reload --port 8000
```

3. Start AI service:

```bash
cd ai_service
uv sync
uv run uvicorn app.main:app --reload --port 8080
```

4. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## Usage Examples

### 1) Register and login

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","full_name":"Demo","password":"123456"}'

curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@example.com&password=123456"
```

### 2) Predict house price

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"area_sqm":80,"bedrooms":3,"age_years":5}'
```

### 3) AI price analysis

```bash
curl -X POST http://localhost:8080/price-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "provider":"qwen",
    "features":{"area_sqm":80,"bedrooms":3,"age_years":5},
    "predicted_price":450000
  }'
```

## Configuration Guidelines

### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=house_price_db
SECRET_KEY=replace_with_strong_secret
ALGORITHM=HS256
DB_ECHO=0
```

### AI service (`ai_service/.env`)

```env
SECRET_KEY=must_match_backend_secret
ALGORITHM=HS256

QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_API_KEY=your_qwen_key
QWEN_MODEL=qwen-plus

KIMI_BASE_URL=...
KIMI_API_KEY=...
KIMI_MODEL=...

DEEPSEEK_BASE_URL=...
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=...
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_AI_BASE_URL=http://localhost:8080
```

## Development Quality Checks

```bash
# frontend lint + build
cd frontend
npm run lint
npm run build

# python syntax check
cd ..
python3 -m compileall backend/app ai_service/app
```

## Contribution Guidelines

1. Fork and create a feature branch.
2. Keep changes scoped and consistent with existing module boundaries.
3. Run `npm run lint`, `npm run build`, and Python compile checks before PR.
4. Update API/docs/README when behavior changes.
5. Prefer explicit error handling and avoid debug `print` in production paths.

## Troubleshooting

### `SECRET_KEY not set` (backend)
Set `SECRET_KEY` in backend environment before startup.

### `/predict` returns model not found
Run training first:

```bash
cd backend
uv run python -m app.train
```

### Database connection errors
- Ensure MySQL is reachable and credentials are correct.
- Re-run:

```bash
cd backend
uv run python create_database.py
uv run alembic upgrade head
```

### Frontend cannot call APIs
Verify `frontend/.env` has correct `VITE_API_BASE_URL` and `VITE_AI_BASE_URL`, then restart Vite.

### AI chat/analysis fails with 401
`ai_service` and `backend` must share the same `SECRET_KEY` and `ALGORITHM`.
