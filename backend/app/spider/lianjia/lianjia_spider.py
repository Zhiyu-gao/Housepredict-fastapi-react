import json
import time
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright

BASE_URL = "https://sh.lianjia.com"
START_URL = "https://sh.lianjia.com/ershoufang/pudong/"
STORAGE_STATE = "lianjia_storage_state.json"

OUT_DIR = Path("./lianjia_ershoufang_json")
OUT_DIR.mkdir(exist_ok=True)

def safe_filename(text: str, max_len=80):
    return "".join(c for c in text if c.isalnum() or c in " _-").strip()[:max_len]

def parse_house(li):
    house_id = li.get_attribute("data-lj_action_housedel_id")
    title_el = li.query_selector(".title a")
    title = title_el.inner_text().strip()
    detail_url = title_el.get_attribute("href")

    community_el = li.query_selector(".positionInfo a")
    community_name = community_el.inner_text().strip()
    community_url = community_el.get_attribute("href")

    district = li.query_selector_all(".positionInfo a")[1].inner_text().strip()

    house_info = li.query_selector(".houseInfo").inner_text()
    parts = [p.strip() for p in house_info.split("|")]

    layout = parts[0]
    area_sqm = float(parts[1].replace("平米", ""))
    orientation = parts[2]
    decoration = parts[3]
    floor = parts[4]
    build_year = int(parts[5].replace("年", ""))
    building_type = parts[6]

    total_price = int(li.query_selector(".totalPrice span").inner_text())
    unit_price = int(
        li.query_selector(".unitPrice span")
        .inner_text()
        .replace("元/平", "")
        .replace(",", "")
    )

    follow_info = li.query_selector(".followInfo").inner_text()
    follow_count = int(follow_info.split("人关注")[0])

    tags = [t.inner_text() for t in li.query_selector_all(".tag span")]

    img = li.query_selector("img.lj-lazy")
    cover_image = img.get_attribute("data-original") or img.get_attribute("src")

    return {
        "house_id": house_id,
        "title": title,
        "detail_url": detail_url,
        "community_name": community_name,
        "community_url": community_url,
        "district": district,
        "layout": layout,
        "area_sqm": area_sqm,
        "orientation": orientation,
        "decoration": decoration,
        "floor": floor,
        "build_year": build_year,
        "building_type": building_type,
        "total_price_wan": total_price,
        "unit_price": unit_price,
        "follow_count": follow_count,
        "tags": tags,
        "cover_image": cover_image,
        "crawl_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state=STORAGE_STATE)
        page = context.new_page()

        page.goto(START_URL, timeout=60000)

        page_num = 1
        while True:
            print(f"📄 正在爬取第 {page_num} 页")

            page.wait_for_selector("li.clear.LOGCLICKDATA")

            items = page.query_selector_all("li.clear.LOGCLICKDATA")
            for li in items:
                data = parse_house(li)
                fname = f"{data['house_id']}_{safe_filename(data['title'])}.json"
                out_path = OUT_DIR / fname

                if out_path.exists():
                    continue

                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

            next_btn = page.query_selector('a:has-text("下一页")')
            if not next_btn:
                print("✅ 已到最后一页")
                break

            next_btn.click()
            page.wait_for_timeout(3000)
            page_num += 1

        browser.close()

if __name__ == "__main__":
    main()
