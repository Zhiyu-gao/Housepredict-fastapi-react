# create_database.py
import pymysql
import os
from pathlib import Path
from dotenv import load_dotenv

# 仅在没有 DB_HOST 的情况下加载 .env
if not os.getenv("DB_HOST"):
    BASE_DIR = Path(__file__).resolve().parent
    ENV_PATH = BASE_DIR / ".env"
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "house_price_db")

def create_database():
    print(f"📦 尝试连接 MySQL: {DB_USER}@{DB_HOST}:{DB_PORT}")

    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            charset="utf8mb4",
            autocommit=True,
        )
        print("✅ 已连接到 MySQL。")
    except Exception as e:
        print("❌ 无法连接到 MySQL。")
        print(e)
        raise  # 🔴 让 Docker 知道这里失败了

    cursor = conn.cursor()
    try:
        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            f"DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        )
        print(f"🎉 数据库 `{DB_NAME}` 已创建或已存在。")
    finally:
        cursor.close()
        conn.close()

    print("✨ create_database 完成。")

if __name__ == "__main__":
    create_database()
