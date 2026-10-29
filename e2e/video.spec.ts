import { expect, test, type Page } from "@playwright/test";

// The first frame waits on a cold dev-server compile, slow when the whole suite runs in parallel.
const LOAD = { timeout: 20_000 };
const canvas = (page: Page) => page.locator("#visual canvas");
const snapshot = (page: Page) => canvas(page).evaluate((c: HTMLCanvasElement) => c.toDataURL());
const colors = (page: Page) =>
  canvas(page).evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set<number>();
    for (let i = 0; i < d.length; i += 4) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    return seen.size;
  });
const video = (page: Page, action: "play" | "pause") => page.locator("video").evaluate((v: HTMLVideoElement, a) => v[a](), action);

for (const mode of ["dither", "ascii"]) {
  for (const cpu of [false, true]) {
    test(`video source · ${mode}${cpu ? " · cpu" : ""}: still frame, plays, pauses`, async ({ page }) => {
      await page.goto(`/visual/video?mode=${mode}${cpu ? "&cpu=1" : ""}`);
      // The paused first frame draws once loaded.
      await expect.poll(() => colors(page), LOAD).toBeGreaterThan(1);

      await video(page, "play");
      const playing = await snapshot(page);
      await expect.poll(() => snapshot(page)).not.toBe(playing);

      await video(page, "pause");
      await page.waitForTimeout(300);
      const paused = await snapshot(page);
      await page.waitForTimeout(500);
      expect(await snapshot(page)).toBe(paused);
    });
  }
}

test("video source under reduced motion shows a static frame while playing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/visual/video");
  await expect.poll(() => colors(page), LOAD).toBeGreaterThan(1);
  await video(page, "play");
  await page.waitForTimeout(300);
  const first = await snapshot(page);
  await page.waitForTimeout(700);
  expect(await snapshot(page)).toBe(first);
});
