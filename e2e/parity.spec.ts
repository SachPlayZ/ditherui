import { expect, test } from "@playwright/test";

test("GPU and CPU renders match within tolerance", async ({ page }) => {
  await page.goto("/visual/parity");
  const pre = page.locator("#parity");
  // 192 GPU + CPU renders under SwiftShader; slow when the suite runs in parallel.
  await expect(pre).not.toHaveText("running", { timeout: 30_000 });
  const results: Array<{ fixture: string; mismatch: number }> = JSON.parse(await pre.innerText());
  expect(results.length).toBeGreaterThan(0);
  // Float precision differs between GLSL and JS, so marks sitting exactly on a threshold may flip.
  for (const { fixture, mismatch } of results) expect(mismatch, fixture).toBeLessThan(0.01);
});
