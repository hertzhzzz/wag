from playwright.sync_api import sync_playwright
import os

BASE_URL = "https://www.winningadventure.com.au"
OUTPUT_DIR = "/Users/mark/Projects/wag-frontend/screenshots"

def capture(url, filename, viewport_width=1920, viewport_height=1080):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': viewport_height})
        page.goto(url, wait_until='networkidle', timeout=30000)
        page.screenshot(path=filepath, full_page=False)
        browser.close()
        print(f"Captured: {filename}")

with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1. Homepage - Desktop
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(BASE_URL, wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/homepage-desktop.png", full_page=False)
    print("Captured: homepage-desktop.png")

    # 2. Homepage - Mobile
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto(BASE_URL, wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/homepage-mobile.png", full_page=False)
    print("Captured: homepage-mobile.png")

    # 3. Services page - Desktop
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(f"{BASE_URL}/services", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/services-desktop.png", full_page=False)
    print("Captured: services-desktop.png")

    # 4. Services page - Mobile
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto(f"{BASE_URL}/services", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/services-mobile.png", full_page=False)
    print("Captured: services-mobile.png")

    # 5. About page - Desktop
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(f"{BASE_URL}/about", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/about-desktop.png", full_page=False)
    print("Captured: about-desktop.png")

    # 6. About page - Mobile
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto(f"{BASE_URL}/about", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/about-mobile.png", full_page=False)
    print("Captured: about-mobile.png")

    # 7. Enquiry page - Desktop
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto(f"{BASE_URL}/enquiry", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/enquiry-desktop.png", full_page=False)
    print("Captured: enquiry-desktop.png")

    # 8. Enquiry page - Mobile
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto(f"{BASE_URL}/enquiry", wait_until='networkidle', timeout=30000)
    page.screenshot(path=f"{OUTPUT_DIR}/enquiry-mobile.png", full_page=False)
    print("Captured: enquiry-mobile.png")

    # List all open pages
    contexts = browser.contexts
    for ctx in contexts:
        pages = ctx.pages
        print(f"\nOpen pages in context: {len(pages)}")
        for pg in pages:
            print(f"  - {pg.url}")

    browser.close()

print("\nAll screenshots captured successfully!")