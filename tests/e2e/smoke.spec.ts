import { expect, test } from "@playwright/test";

test.setTimeout(90_000);

test("core RPG product routes load", async ({ page }) => {
  for (const path of ["/", "/demo", "/onboarding", "/paths", "/boss-battles", "/arena", "/shop", "/map", "/vr"]) {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.locator("body")).toContainText(/Gencode|Arena|Path|Boss|Immersive|Academy/i);
  }
});

test("challenge detail exposes run and submit controls", async ({ page }) => {
  await page.goto("/challenges/security-hard-ssrf-url-filter", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(page.getByRole("heading", { name: /SSRF URL filter/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Run/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit/i })).toBeVisible();
});

test("arena run can be started and scored without login", async ({ page }) => {
  await page.goto("/arena", { waitUntil: "domcontentloaded", timeout: 45_000 });
  const startArena = page.getByRole("button", { name: /Start Arena/i });
  await expect(startArena).toBeEnabled();
  await startArena.click();
  await expect(page.getByText(/Arena clock armed/i)).toBeVisible({ timeout: 10_000 });
  const finishButton = page.getByRole("button", { name: /Finish Practice Run/i });
  await expect(finishButton).toBeEnabled();
  await finishButton.click();
  await expect(page.getByText(/Arena score/i)).toBeVisible();
});

test("boss page exposes persistent run control", async ({ page }) => {
  await page.goto("/boss-battles/api-debugging-boss", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(page.getByRole("heading", { name: /API Debugging Boss/i })).toBeVisible();
  await expect(page.getByText(/Boss Run Control/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Start Stage/i })).toBeVisible();
});

test("immersive challenge room renders fallback 3D controls and can run checks", async ({ page }) => {
  await page.goto("/vr/sql-easy-duplicate-transactions", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(page.getByRole("heading", { name: /Duplicate/i })).toBeVisible();
  await expect(page.getByText("Browser immersive active").or(page.getByText("Headset ready")).first()).toBeVisible();
  await expect(page.getByTestId("immersive-scene")).toBeVisible();

  await page.getByLabel("Immersive answer stream").fill("SELECT customer_id, COUNT(*) FROM payments GROUP BY customer_id ORDER BY customer_id;");
  await page.getByRole("button", { name: /^Run Tests$/i }).click();
  await expect(page.getByText(/Latest Checks/i)).toBeVisible();
  await expect(page.getByText(/Clear\. You passed|Score \d+%/i).first()).toBeVisible({ timeout: 15_000 });
});

test("immersive 3D scene is nonblank on desktop and mobile viewports", async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 820 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/vr/linux-easy-permissions-audit", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await expect(page.getByText(/Booting immersive renderer/i)).toBeHidden({ timeout: 45_000 });
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 45_000 });
    await page.waitForTimeout(700);
    const nonBlankPixels = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
      if (!canvas || !gl) return 0;
      const width = Math.max(1, canvas.width);
      const height = Math.max(1, canvas.height);
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] > 8 || pixels[index + 1] > 8 || pixels[index + 2] > 8) count += 1;
      }
      return count;
    });
    expect(nonBlankPixels).toBeGreaterThan(12);
  }
});
