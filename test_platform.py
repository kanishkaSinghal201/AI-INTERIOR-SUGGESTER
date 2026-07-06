import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Capture console messages
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("Navigating to localhost:8000...")
        await page.goto("http://localhost:8000/", wait_until="networkidle")
        print("Page title:", await page.title())

        print("Testing Phase 1 (Auth)...")
        await page.click("button#loginSubmit")
        await page.wait_for_timeout(100)
        await page.fill("input#loginEmail", "test@user.com")
        await page.fill("input#loginPassword", "password123")
        await page.click("button#loginSubmit")
        await page.wait_for_timeout(2000)

        print("Testing Phase 2 (CAD)...")
        await page.click("button#tab-2")
        await page.wait_for_timeout(100)
        # Simulate click on canvas
        await page.click("canvas#cadCanvas", position={"x": 50, "y": 50})
        await page.wait_for_timeout(100)

        print("Testing Phase 3 (Prompt Interpreter)...")
        await page.click("button#tab-3")
        await page.wait_for_timeout(100)
        await page.click("button.prompt-chip:first-child") # Click sample prompt
        await page.click("button#interpretBtn")
        await page.wait_for_timeout(2500)

        print("Testing Phase 4 (Floor Plan)...")
        await page.click("button#tab-4")
        await page.wait_for_timeout(100)
        await page.click("button#generateFloorPlan")
        await page.wait_for_timeout(2500)

        print("Testing Phase 5 (Vastu)...")
        await page.click("button#tab-5")
        await page.wait_for_timeout(100)
        await page.click("button#vastuValidate")
        await page.wait_for_timeout(2500)

        print("Testing Phase 6 (Materials)...")
        await page.click("button#tab-6")
        await page.wait_for_timeout(100)
        await page.click("button#getMaterials")
        await page.wait_for_timeout(2000)

        print("Testing Phase 7 (Furniture)...")
        await page.click("button#tab-7")
        await page.wait_for_timeout(100)
        await page.click("button#placeFurniture")
        await page.wait_for_timeout(2500)

        print("Testing Phase 8 (3D Scene)...")
        await page.click("button#tab-8")
        await page.wait_for_timeout(100)
        await page.click("button#generate3D")
        await page.wait_for_timeout(3000)

        print("Testing Phase 9 (Camera & Lighting)...")
        await page.click("button#tab-9")
        await page.wait_for_timeout(100)
        await page.click("button#autoCamera")
        await page.wait_for_timeout(2000)

        print("Testing Phase 10 (Render)...")
        await page.click("button#tab-10")
        await page.wait_for_timeout(100)
        await page.click("button#startRender")
        await page.wait_for_timeout(6000) # Wait for render

        print("Testing Phase 11 (Budget)...")
        await page.click("button#tab-11")
        await page.wait_for_timeout(100)
        await page.click("button#generateBudget")
        await page.wait_for_timeout(2500)

        print("Testing Phase 12 (Workflow)...")
        await page.click("button#tab-12")
        await page.wait_for_timeout(100)
        await page.click("button#runFullWorkflow")
        await page.wait_for_timeout(15000) # Wait for long workflow

        print("Done. Checking for errors...")
        if errors:
            print("ERRORS FOUND:")
            for e in errors:
                print(e)
        else:
            print("NO ERRORS FOUND. Everything works beautifully.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
