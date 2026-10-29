import { expect, test } from "@playwright/test";

test("GPU and CPU renders match within tolerance", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/visual/parity");
  const pre = page.locator("#parity");
  // 192 GPU + CPU renders under SwiftShader; slow when the suite runs in parallel.
  await expect(pre).not.toHaveText("running", { timeout: 30_000 });
  const results: Array<{ fixture: string; mismatch: number }> = JSON.parse(await pre.innerText());
  // Sources that rasterise in the page must actually produce fixtures.
  for (const name of ["video/dither/t0", "video/ascii/t0", "text/dither", "text/ascii"]) expect(results.map((r) => r.fixture)).toContain(name);
  // Float precision differs between GLSL and JS, so marks sitting exactly on a threshold may flip.
  for (const { fixture, mismatch } of results) expect(mismatch, fixture).toBeLessThan(0.01);
});
