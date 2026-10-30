import { expect, test, type Page } from "@playwright/test";

// The first frame waits on a cold dev-server compile, slow when the whole suite runs in parallel.
const LOAD = { timeout: 20_000 };
const canvas = (page: Page) => page.locator("#visual canvas");
const snapshot = (page: Page) => canvas(page).evaluate((c: HTMLCanvasElement) => c.toDataURL());
const height = (page: Page) => canvas(page).evaluate((c: HTMLCanvasElement) => c.height);

/** Share of lit (foreground) canvas pixels inside the first word's DOM box and in the empty area after the last word. */
const coverage = async (page: Page) => {
  await canvas(page).waitFor();
  return page.evaluate(() => {
    const c = document.querySelector("#visual canvas") as HTMLCanvasElement;
    const p = document.querySelector("#text")!;
    const box = p.getBoundingClientRect();
    const sx = c.width / box.width, sy = c.height / box.height;
    const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const lit = (r: { left: number; top: number; right: number; bottom: number }) => {
      let on = 0, all = 0;
      for (let y = Math.floor((r.top - box.top) * sy); y < Math.ceil((r.bottom - box.top) * sy); y++)
        for (let x = Math.floor((r.left - box.left) * sx); x < Math.ceil((r.right - box.left) * sx); x++, all++)
          if (data[(y * c.width + x) * 4] > 128) on++;
      return on / Math.max(1, all);
    };
    const text = p.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, text.data.indexOf(" "));
    const first = range.getBoundingClientRect();
    range.setStart(text, text.data.trimEnd().length - 1);
    range.setEnd(text, text.data.trimEnd().length);
    const last = range.getBoundingClientRect();
    return { word: lit(first), empty: lit({ left: last.right + 4, top: last.top, right: box.right, bottom: last.bottom }) };
  });
};

// ASCII glyphs are thin strokes, so a word's box is only partly lit; empty space stays dark in both modes.
const WORD = 0.05;

for (const mode of ["dither", "ascii"]) {
  for (const cpu of [false, true]) {
    test(`text source · ${mode}${cpu ? " · cpu" : ""}: mask sits on the DOM text`, async ({ page }) => {
      await page.goto(`/visual/text?mode=${mode}&width=420${cpu ? "&cpu=1" : ""}`);
      await expect.poll(() => coverage(page).then((c) => c.word), LOAD).toBeGreaterThan(WORD);
      expect((await coverage(page)).empty).toBeLessThan(0.01);
    });
  }
}

test("text source re-renders on width, font size and text changes", async ({ page }) => {
  await page.goto("/visual/text?width=640");
  await expect.poll(() => coverage(page).then((c) => c.word), LOAD).toBeGreaterThan(WORD);

  const wide = { snap: await snapshot(page), height: await height(page) };
  await page.evaluate(() => ((document.querySelector("#visual") as HTMLElement).style.width = "320px"));
  // Narrower box wraps to more lines: taller canvas, mask still on the words.
  await expect.poll(() => height(page)).toBeGreaterThan(wide.height);
  await expect.poll(() => coverage(page).then((c) => c.word), LOAD).toBeGreaterThan(WORD);

  const before = await snapshot(page);
  await page.evaluate(() => ((document.querySelector("#text") as HTMLElement).style.fontSize = "24px"));
  await expect.poll(() => snapshot(page)).not.toBe(before);
  await expect.poll(() => coverage(page).then((c) => c.word), LOAD).toBeGreaterThan(WORD);

  const sized = await snapshot(page);
  await page.evaluate(() => (document.querySelector("#text")!.firstChild!.textContent = "Changed words wrap differently now"));
  await expect.poll(() => snapshot(page)).not.toBe(sized);
  await expect.poll(() => coverage(page).then((c) => c.word), LOAD).toBeGreaterThan(WORD);
  expect(wide.snap).not.toBe(await snapshot(page));
});
