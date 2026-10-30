import { expect, test } from "@playwright/test";
import { addCommand } from "../lib/install";
import { components } from "../registry/meta";

// First dev-server compile of a docs page can take most of the default 30 s under a parallel run.
test.describe.configure({ timeout: 60_000 });

for (const meta of components) {
  test(`docs page · ${meta.name}`, async ({ page }) => {
    // Capture what Copy prompt writes; clipboard permissions vary across headless runs.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: async (text: string) => void ((window as unknown as { copied: string }).copied = text) },
      });
    });
    await page.goto(`/docs/components/${meta.name}`);
    // Blocks render their own h1 in the preview; the page title comes first.
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(meta.title);

    await page.getByRole("button", { name: "Copy prompt" }).click();
    const copied = () => page.evaluate(() => (window as unknown as { copied?: string }).copied);
    await expect.poll(copied).toContain(addCommand(`@dotgrain/${meta.name}`));

    // Type table rows are buttons named `name?`; their text also holds the type, hidden on narrow screens.
    await expect(page.getByRole("button", { name: /^\w+\?$/ })).toHaveText(meta.props.map((p) => `${p.name}?${p.type}`));
  });
}

test("gallery links every component; landing shows the hero and a live tile per component", async ({ page }) => {
  await page.goto("/gallery");
  for (const meta of components) await expect(page.locator(`main a[href="/docs/components/${meta.name}"]`)).toContainText(meta.title);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grain for the web");
  await expect(page.locator("[inert]")).toHaveCount(components.length);
});

test("⌘K opens a terminal search that finds components by category, keyboard only", async ({ page }) => {
  test.setTimeout(120_000);
  // The dev server builds the search index on first request; warm it so the dialog's download isn't the one that waits.
  expect((await page.request.get("/api/search", { timeout: 90_000 })).ok()).toBe(true);
  await page.goto("/docs");
  await expect(page.getByText("↑↓ move")).toBeHidden();
  const input = page.getByPlaceholder("grep components and docs…");
  // The hotkey only works once the page has hydrated, so retry it.
  await expect(async () => {
    if (!(await input.isVisible())) await page.keyboard.press("ControlOrMeta+k");
    await expect(input).toBeFocused({ timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await input.fill("feedback");
  await expect(page.getByRole("option").first()).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/components\/(loader|skeleton|dither-progress)/);
});
