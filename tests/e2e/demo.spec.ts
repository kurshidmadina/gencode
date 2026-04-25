import { expect, test } from "@playwright/test";

test.skip(process.env.RUN_DEMO_LOGIN_E2E !== "1", "Set RUN_DEMO_LOGIN_E2E=1 after running npm run db:seed:demo.");

test("seeded demo user can walk the core investor flow", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/demo", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Make Gencode land/i })).toBeVisible();
  await page.getByRole("button", { name: /^Enter User Demo$/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await expect(page.getByText(/Daily Quests/i)).toBeVisible();

  await page.goto("/challenges/sql-easy-duplicate-transactions", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /duplicate/i })).toBeVisible();
  await page.getByRole("button", { name: /Run/i }).click();
  await expect(page.getByText(/PASSED|PARTIAL|FAILED|Score \d+%/i).first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/vr/sql-easy-duplicate-transactions", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Browser immersive active|Headset ready/i).first()).toBeVisible();

  await page.goto("/leaderboard?scope=weekly", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Leaderboards/i })).toBeVisible();
  await expect(page.getByText(/nova_cli|kernel_arya|queryforge/i).first()).toBeVisible();

  await page.goto("/profile/nova_cli", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /@nova_cli/i })).toBeVisible();
});

test("seeded admin can open the admin command center", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/demo", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^Enter Admin Demo$/i }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Admin Command Center/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Manage Challenges/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Submissions/i })).toBeVisible();

  for (const path of ["/admin/paths", "/admin/boss-battles", "/admin/quests", "/admin/billing", "/admin/sales-leads"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
  }
});
