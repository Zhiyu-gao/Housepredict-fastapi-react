# 🏠 House Price Prediction System

React + FastAPI + MySQL + SQLAlchemy + Alembic + Machine Learning

一个完整的全栈项目，包含后端 RESTful API、数据库 CRUD、机器学习训练与预测、以及前端交互页面。

---

## 🚀 功能特性

### 🔧 后端（FastAPI）

* 房源信息 CRUD（增删改查）
* 机器学习模型训练（LinearRegression）
* 房价预测 API `/predict`
* SQLAlchemy ORM 数据持久化
* Alembic 数据库迁移
* 已集成 CORS 中间件

### 🗄 数据库（MySQL）

* 使用 MySQL 存储房源数据
* Alembic 自动迁移维护 schema 演进
* 使用 pymysql 作为驱动程序

### 📊 机器学习（scikit-learn）

* 支持从 CSV 加载数据训练模型
* 特征包括：面积、房龄、卧室、距离地铁等
* 模型使用 joblib 持久化保存

### 💻 前端（React + Vite）

* 房价预测表单
* 输入特征 → 调用后端 API → 返回预测结果
* UI 简洁，可直接运行

---

## 🧱 项目结构

```
house-price/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI 入口
│   │   ├── models.py          # SQLAlchemy ORM
│   │   ├── schemas.py         # Pydantic 数据验证
│   │   ├── crud.py            # CRUD 封装
│   │   ├── database.py        # MySQL 连接管理
│   │   ├── ml_model.py        # 模型训练与加载
│   ├── data/
│   │   └── house_prices.csv   # Mock 数据
│   ├── migrations/            # Alembic 迁移文件
│   ├── create_database.py     # 自动创建数据库
│   ├── pyproject.toml         # uv 管理依赖
│
└── frontend/
    ├── src/
    │   ├── App.tsx            # 房价预测页面
    ├── package.json
    └── ...
```

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

# 🐍 后端安装与运行

进入 backend：

```bash
cd backend
```

## 1️⃣ 初始化 uv 虚拟环境（已自动创建）

项目已经通过：

```bash
uv init --app .
```

初始过，只需安装依赖：

```bash
uv sync
```

---

## 2️⃣ 创建 MySQL 数据库

如果你第一次运行，请执行：

```bash
uv run python create_database.py
```

默认会创建：

```
house_price_db
```

---

## 3️⃣ 执行 Alembic 迁移（建表）

```bash
uv run alembic upgrade head
```

如果是首次迁移，可先用 autogenerate 生成迁移文件：

```bash
# 生成自动迁移脚本（首次迁移）
uv run alembic revision --autogenerate -m "create houses and users tables"
```

---

## 4️⃣ 训练机器学习模型

```bash
uv run python -m app.train
```

完成后会生成：

```
backend/data/house_price_model.pkl
```

---

## 5️⃣ 启动 FastAPI

```bash
uv run uvicorn app.main:app --reload --port 8080
```

访问 docs：

👉 [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

---

# 💻 前端安装与运行

进入 frontend：

```bash
cd frontend
npm install
npm run dev
```

访问：

👉 [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

你可以输入面积/卧室/房龄等特征，点“预测房价”，后端会返回预测结果。

---

# 🧠 API 说明

全部 API 可在 Swagger UI 查看：[http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

| Method | Path           | Description |
| ------ | -------------- | ----------- |
| GET    | `/houses`      | 获取房源列表      |
| GET    | `/houses/{id}` | 获取单个房源      |
| POST   | `/houses`      | 创建房源        |
| PUT    | `/houses/{id}` | 更新房源        |
| DELETE | `/houses/{id}` | 删除房源        |
| POST   | `/predict`     | 根据特征预测价格    |

示例：

```json
POST /predict
{
  "area_sqm": 80,
  "bedrooms": 3,
  "age_years": 5,
  "distance_to_metro_km": 1.2
}
```

结果：

```json
{ "predicted_price": 450000 }
```

---

# 🛠 常见问题（FAQ）

### ❓运行 `uvicorn` 时提示「Could not import module main」

解决：必须使用正确路径：

```
uv run uvicorn app.main:app --reload
```

---

### ❓ MySQL 连接错误：Unknown database

你可能忘记创建数据库 → 运行：

```
uv run python create_database.py
```

---

### ❓ Alembic autogenerate 不生成迁移脚本

确认 `migrations/env.py` 中：

```python
from app.database import Base, SQLALCHEMY_DATABASE_URL
target_metadata = Base.metadata
```

---
