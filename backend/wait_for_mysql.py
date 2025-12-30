# wait_for_mysql.py
import os
import time
import pymysql

DB_HOST = os.getenv("DB_HOST", "mysql")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

print(f"⏳ Waiting for MySQL at {DB_HOST}:{DB_PORT}...")

for i in range(30):
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
        )
        conn.close()
        print("✅ MySQL is ready.")
        break
    except Exception:
        print(f"⏳ MySQL not ready yet ({i+1}/30)")
        time.sleep(2)
else:
    raise RuntimeError("❌ MySQL not ready after waiting.")
