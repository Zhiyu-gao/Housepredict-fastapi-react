# lianjia_login_save_state.py
from playwright.sync_api import sync_playwright
from pathlib import Path

STORAGE_STATE = Path("lianjia_storage_state.json")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )

        context = browser.new_context()
        page = context.new_page()

        page.goto("https://sh.lianjia.com", timeout=60000)

        print("⚠️ 请在打开的浏览器中完成链家登录（扫码 / 短信）")
        input("👉 登录完成后，回到终端按回车保存 Cookie...")

        # 可选但强烈推荐：确认登录成功（避免误保存）
        try:
            page.wait_for_selector("a:has-text('我的链家')", timeout=5000)
        except:
            print("❌ 未检测到登录成功标志（未看到“我的链家”）")
            print("❌ 请确认已登录后重新运行")
            browser.close()
            return

        context.storage_state(path=STORAGE_STATE)
        print(f"✅ 登录状态已保存到 {STORAGE_STATE.resolve()}")

        browser.close()

if __name__ == "__main__":
    main()
