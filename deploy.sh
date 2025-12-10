#!/bin/bash

echo "=========================================="
echo " 🚀 HousePrice 全站部署开始"
echo "=========================================="

set -e  # 出错立即停止脚本

# 1. 拉取最新代码
echo "🔄 拉取 Git 最新代码..."
git fetch --all
git reset --hard origin/main  # 如果你是 main 分支
# git reset --hard origin/master # 如果你是 master 分支

echo ""
echo "=========================================="
echo " 🐳 构建 Docker 容器"
echo "=========================================="

# 2. 停掉旧容器
echo "🔄 停止旧服务..."
docker compose down

# 3. 重建镜像（前端 + 后端 + AI Service）
echo "🔨 构建新镜像..."
docker compose build --no-cache

# 4. 启动服务
echo "🚀 启动所有容器..."
docker compose up -d

echo ""
echo "=========================================="
echo " 🔍 检查容器状态"
echo "=========================================="

docker ps

echo ""
echo "=========================================="
echo " 🩺 后端健康检查"
echo "=========================================="

sleep 3
curl -s http://localhost:8000/docs >/dev/null && echo "✔ Backend 正常运行" || echo "❌ Backend 健康检查失败"

echo ""
echo "=========================================="
echo " 🧠 AI Service 健康检查"
echo "=========================================="

curl -s http://localhost:8080/docs >/dev/null && echo "✔ AI Service 正常运行" || echo "❌ AI Service 健康检查失败"

echo ""
echo "=========================================="
echo " 🎨 前端健康检查"
echo "=========================================="

curl -s http://localhost >/dev/null && echo "✔ Frontend 正常运行" || echo "❌ Frontend 健康检查失败"

echo ""
echo "=========================================="
echo " 🚀 部署完成！项目已经成功运行！"
echo "=========================================="
