import { expect, test } from "@playwright/test";

test("the installed app shell can reload without network access", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hop & Learn" })).toBeVisible();
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForLoadState("networkidle");
  await page.reload();
  await page.waitForLoadState("networkidle");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Hop & Learn" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Number Line", exact: true })).toBeVisible();
});

test("the built app makes no cross-origin network requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => {
    const origin = new URL(request.url()).origin;
    if (origin !== "http://localhost:4318") requests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hop & Learn" })).toBeVisible();
  expect(requests).toEqual([]);
});
