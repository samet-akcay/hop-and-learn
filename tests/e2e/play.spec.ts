import { expect, test, type Page } from "@playwright/test";

async function quiet(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem("math-play-v2")) localStorage.setItem("math-play-v2", JSON.stringify({ settings: { speech: false, sound: false } }));
  });
}

async function hopAndAnswer(page: Page) {
  const hop = page.getByRole("button", { name: /^HOP/ });
  while (await hop.count()) { await hop.click(); }
  const landed = await page.locator(".work-control p").innerText();
  const answer = /We landed on (\d+)/.exec(landed)![1]!;
  await page.getByRole("button", { name: answer, exact: true }).click();
}

test("he picks a game from the menu, hops, answers and earns a star", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hop & Learn" })).toBeVisible();
  await page.getByRole("button", { name: "Number Line", exact: true }).click();
  await expect(page.locator(".numberline-svg")).toBeVisible();
  const frog = page.locator(".hop-traveler");
  const before = await frog.getAttribute("transform");
  await page.getByRole("button", { name: /^HOP/ }).click();
  await expect.poll(() => frog.getAttribute("transform")).not.toBe(before);
  await page.waitForTimeout(700);
  await hopAndAnswer(page);
  await expect(page.getByRole("heading", { name: /We (did|fixed) it!/ })).toBeVisible();
  await expect(page.locator(".star-pill")).toContainText("1");
  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByRole("button", { name: /^HOP/ })).toBeVisible();
});

test("stars, hero and settings survive a reload", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Robot" }).click();
  await page.getByRole("button", { name: "Number Line", exact: true }).click();
  await hopAndAnswer(page);
  await page.reload();
  await expect(page.locator(".star-pill")).toContainText("1");
  await expect(page.getByRole("button", { name: "Robot" })).toHaveAttribute("aria-pressed", "true");
});

test("the grown-up corner sets numbers up to 10 for the number line", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hop & Learn" })).toBeVisible();
  await page.keyboard.press("Control+Shift+G");
  const corner = page.getByRole("dialog", { name: "Grown-up corner" });
  await corner.getByRole("group", { name: "Numbers up to" }).getByRole("button", { name: "10", exact: true }).click();
  await corner.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Number Line", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    const numbers = (await page.locator(".play-question h1").innerText()).match(/\d+/g)!.map(Number);
    expect(Math.max(...numbers)).toBeLessThanOrEqual(10);
    await hopAndAnswer(page);
    await page.getByRole("button", { name: /Next|Keep playing/ }).first().click();
  }
});

test("every game on the menu opens and shows a question", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  const titles = await page.locator(".game-card b").allInnerTexts();
  expect(titles.length).toBe(31);
  for (const title of titles) {
    await page.locator(".game-card", { hasText: title }).first().click();
    await expect(page.locator(".play-question h1"), title).not.toBeEmpty();
    await page.getByRole("button", { name: "Back to games" }).click();
  }
});
