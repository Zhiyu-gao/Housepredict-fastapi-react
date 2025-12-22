# 🏠 House Price Prediction System

React + FastAPI + MySQL + SQLAlchemy + Alembic + Machine Learning + AI Agent

一个完整的全栈项目，包含：

- 后端 RESTful API（房源 CRUD + 传统 ML 预测 + 用户系统）
- 独立 AI 服务（Kimi / Qwen / DeepSeek 做房价分析）
- 前端多页面应用（预测 / 房源管理 / 个人信息 / 可视化）
- MySQL 持久化 + Alembic 迁移

---

## 🚀 功能特性

### 🔧 后端（FastAPI，端口 `8000`）

* 房源信息 CRUD（增删改查）
* 机器学习模型训练（LinearRegression）
* 房价预测 API：`POST /predict`
* 用户注册 / 登录 / 获取当前用户信息
* SQLAlchemy ORM 数据持久化
* Alembic 数据库迁移
* 已集成 CORS 中间件（允许本地前端访问）

### 🤖 AI Service（FastAPI，端口 `8080`）

* 独立的 AI 服务进程，解耦业务后端
* 支持多家大模型服务（通过 OpenAI 兼容协议）：
  * Kimi
  * Qwen
  * DeepSeek
* 统一房价分析接口：`POST /price-analysis`
  * 输入：房屋特征 + 传统模型预测价格 + provider（kimi/qwen/deepseek）
  * 输出：Markdown 格式的房产分析报告（买卖建议 / 风险提示等）
* Prompt 集中管理（`ai_service/app/prompts/`）
* 每个 AI 单独一个 client 文件（`providers/kimi_client.py` 等）

### 🗄 数据库（MySQL）

* 使用 MySQL 存储房源数据及用户信息
* Alembic 自动迁移维护 schema 演进
* 使用 `pymysql` 作为驱动

### 📊 机器学习（scikit-learn）

* 支持从 CSV 加载数据训练模型
* 特征包括：面积、房龄、卧室、距离地铁等
* 模型使用 `joblib` 持久化保存（如 `house_price_model.pkl`）

### 💻 前端（React + Vite + Ant Design）

* 登录 / 注册页面（JWT）
* 左侧固定导航栏，包含：
  * 房源管理（增删改查）
  * 房价预测（传统 ML）
  * AI 分析（选择 Kimi/Qwen/DeepSeek）
  * 我的账号信息（查看/修改昵称 & 密码）
  * 可视化页面（展示各特征之间关系）
* 深色主题适配，整体 UI 统一

---

## 🧱 项目结构

```text
house-price/
├── backend/                      # 业务后端：CRUD + /predict + 用户 + DB
│   ├── app/
│   │   ├── main.py              # FastAPI 入口（端口 8000）
│   │   ├── models.py            # SQLAlchemy ORM（User / House 等）
│   │   ├── schemas.py           # Pydantic 模型定义
│   │   ├── crud.py              # CRUD 封装
│   │   ├── db.py                # MySQL 连接管理（SessionLocal, Base 等）
│   │   ├── train.py             # 训练房价模型并保存为 .pkl
│   │   ├── routers/
│   │   │   ├── auth.py          # 注册 / 登录 / 获取当前用户
│   ├── data/
│   │   └── house_prices.csv     # 训练数据（示例）
│   ├── migrations/              # Alembic 迁移文件
│   ├── create_database.py       # 自动创建数据库
│   ├── pyproject.toml           # uv 管理依赖
│
├── ai_service/                   # 独立 AI 服务（端口 8080）
│   ├── app/
│   │   ├── main.py              # FastAPI 入口（/price-analysis）
│   │   ├── schemas.py           # 房价分析请求 / 响应模型
│   │   ├── config.py            # 各家模型的 base_url / api_key / model
│   │   ├── price_analysis_service.py  # 房价 AI 分析的核心逻辑
│   │   ├── prompts/
│   │   │   └── price_analysis.py # 房价分析的系统 Prompt & 构造 user prompt
│   │   ├── providers/
│   │   │   ├── kimi_client.py   # Kimi OpenAI 兼容调用
│   │   │   ├── qwen_client.py   # Qwen OpenAI 兼容调用
│   │   │   └── deepseek_client.py  # DeepSeek OpenAI 兼容调用
│   ├── pyproject.toml
│   └── .env                     # （可选）AI 相关环境变量
│
└── frontend/                     # React 前端（端口 5173）
    ├── src/
    │   ├── App.tsx              # 路由 + 布局（左侧导航 + 右侧内容）
    │   ├── main.tsx             # React 入口
    │   ├── api/
    │   │   ├── client.ts        # 后端通用 axios 实例（指向 8000）
    │   │   ├── ai.ts            # AI 服务 axios 实例（指向 8080）
    │   ├── auth/
    │   │   └── token.ts         # token 的读写封装
    │   ├── pages/
    │   │   ├── PredictPage.tsx  # 房价预测 + AI 分析
    │   │   ├── HousesPage.tsx   # 房源管理（CRUD）
    │   │   ├── ProfilePage.tsx  # 我的账号信息
    │   │   └── ChartsPage.tsx   # 可视化（特征关系图）
    ├── package.json
    └── ...
````

---

## 🔧 环境准备

### ⛓ 依赖要求

* Python ≥ 3.11（通过 uv 自动管理）
* Node.js ≥ 18
* MySQL ≥ 8.0
* uv（强烈推荐）
* npm / yarn / pnpm

### 📦 安装 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

# 🐍 后端（backend，端口 `8000`）

进入 `backend` 目录：

```bash
cd backend
```

## 1️⃣ 安装依赖

```bash
uv sync

playwright install chromium
```

（项目如果已经 `uv init --app .` 初始化过，这一步只会安装依赖）

---

## 2️⃣ 配置数据库 & 创建 MySQL 数据库

在 `backend/.env` 中配置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=house_price_db
```

首次运行时创建数据库：

```bash
uv run python create_database.py
```

默认会创建：

```text
house_price_db
```

---

## 3️⃣ 执行 Alembic 迁移（建表）

```bash
uv run alembic upgrade head
```

如果是**首次迁移**，可以先自动生成迁移文件：

```bash
uv run alembic revision --autogenerate -m "create houses and users tables"
uv run alembic upgrade head
```

---

## 4️⃣ 训练机器学习模型

```bash
uv run python -m app.train
```

完成后会生成一个模型文件，例如：

```text
backend/data/house_price_model.pkl
```

---

## 5️⃣ 启动后端 API（端口 `8000`）

```bash
uv run uvicorn app.main:app --reload --port 8000
```

访问 Swagger 文档：

👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

# 🤖 AI 服务（ai_service，端口 `8080`）

进入 `ai_service` 目录：

```bash
cd ai_service
```

## 1️⃣ 安装依赖

```bash
uv sync
```

## 2️⃣ 配置 AI 相关环境变量（可选但推荐）

在 `ai_service/.env` 中配置各家模型的 base_url / api_key / model。示例：

```env
KIMI_BASE_URL=https://your-kimi-openai-compatible-url/v1
KIMI_API_KEY=your_kimi_key
KIMI_MODEL=your-kimi-model-name

QWEN_BASE_URL=https://your-qwen-openai-compatible-url/v1
QWEN_API_KEY=your_qwen_key
QWEN_MODEL=your-qwen-model-name

DEEPSEEK_BASE_URL=https://your-deepseek-openai-compatible-url/v1
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_MODEL=your-deepseek-model-name
```

## 3️⃣ 启动 AI 服务（端口 `8080`）

```bash
uv run uvicorn app.main:app --port 8080
```

访问文档：

👉 [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

在里面可以看到：

* `POST /price-analysis`：AI 房价分析接口

---

# 💻 前端（frontend，端口 `5173`）

进入 `frontend` 目录：

```bash
cd frontend
npm install
```

## 1️⃣ 配置环境变量

在 `frontend/.env` 或 `frontend/.env.local` 中配置后端与 AI 服务地址：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_AI_BASE_URL=http://127.0.0.1:8080
```

对应：

* `VITE_API_BASE_URL`：后端业务 API（CRUD + /predict）
* `VITE_AI_BASE_URL`：AI 服务 `/price-analysis`（Kimi/Qwen/DeepSeek）

## 2️⃣ 启动前端

```bash
npm run dev
```

访问：

👉 [http://127.0.0.1:5173](http://127.0.0.1:5173)

在左侧导航中可以访问：

* 房价预测：调用 `POST /predict` + `POST /price-analysis`
* 房源管理：调用 `/houses` 系列接口
* 我的账号：调用 `/auth/me`、更新用户信息、修改密码
* 可视化页面：查看字段间关系的图表

---

# 🧠 API 说明（后端 8000）

所有后端 API 可以在 Swagger UI 查看：

👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 核心 REST API

| Method | Path             | Description   |
| ------ | ---------------- | ------------- |
| GET    | `/houses`        | 获取房源列表        |
| GET    | `/houses/{id}`   | 获取单个房源        |
| POST   | `/houses`        | 创建房源          |
| PUT    | `/houses/{id}`   | 更新房源          |
| DELETE | `/houses/{id}`   | 删除房源          |
| POST   | `/predict`       | 根据特征预测价格      |
| POST   | `/auth/register` | 用户注册          |
| POST   | `/auth/login`    | 用户登录，返回 token |
| GET    | `/auth/me`       | 获取当前登录用户信息    |

**`/predict` 示例：**

请求：

```json
POST /predict
{
  "area_sqm": 80,
  "bedrooms": 3,
  "age_years": 5,
  "distance_to_metro_km": 1.2
}
```

响应：

```json
{ "predicted_price": 450000 }
```

---

# 🤖 API 说明（AI Service 8080）

Swagger 文档：

👉 [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

### 房价 AI 分析接口

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| POST   | `/price-analysis` | 使用大模型进行房价分析 |

请求体示例：

```json
{
  "provider": "qwen",
  "features": {
    "area_sqm": 80,
    "bedrooms": 3,
    "age_years": 5,
    "distance_to_metro_km": 1.2
  },
  "predicted_price": 450000
}
```

响应示例（部分）：

```json
{
  "provider": "qwen",
  "predicted_price": 450000,
  "analysis_markdown": "## 1. 价格总体评价\n...\n"
}
```

前端会将 `analysis_markdown` 渲染出来，给出买卖建议和风险提示。

---

# 🛠 常见问题（FAQ）

### ❓运行 `uvicorn` 时提示「Could not import module main」

确保命令使用了**完整模块路径**：

```bash
# 后端
uv run uvicorn app.main:app --reload --port 8000

# AI 服务
uv run uvicorn app.main:app --reload --port 8080
```

---

### ❓ MySQL 报错 Unknown database

说明数据库还没创建。请在 `backend` 目录下执行：

```bash
uv run python create_database.py
```

---

### ❓ Alembic autogenerate 不生成迁移脚本

确认 `migrations/env.py` 中正确导入 Base，例如：

```python
from app.db import Base
target_metadata = Base.metadata
```

---

### ❓ 前端调用后端 / AI 服务 404 或 CORS 问题

请检查：

1. 后端是否分别在 `8000` / `8080` 端口启动；
2. `frontend/.env` 中的 `VITE_API_BASE_URL`、`VITE_AI_BASE_URL` 是否对应正确；
3. 后端与 AI 服务的 CORS 配置中是否包含：

```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/Users/zhiyu/chrome_lianjia
