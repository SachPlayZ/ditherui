import { expect, test } from "@playwright/test";

test("GPU and CPU renders match within tolerance", async ({ page }) => {
  await page.goto("/visual/parity");
  const pre = page.locator("#parity");
  await expect(pre).not.toHaveText("running");
  const results: Array<{ fixture: string; mismatch: number }> = JSON.parse(await pre.innerText());
  expect(results.length).toBeGreaterThan(0);
  // Float precision differs between GLSL and JS, so marks sitting exactly on a threshold may flip.
  for (const { fixture, mismatch } of results) expect(mismatch, fixture).toBeLessThan(0.01);
});
