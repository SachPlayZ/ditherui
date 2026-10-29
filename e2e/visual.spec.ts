import { expect, test } from "@playwright/test";
import { PALETTES } from "../registry/engine/palettes";
import { examples } from "../registry/examples";

for (const example of Object.keys(examples)) {
  for (const palette of Object.keys(PALETTES)) {
    for (const mode of ["dither", "ascii"]) {
      test(`${example} · ${palette} · ${mode}`, async ({ page }) => {
        await page.goto(`/visual/${example}?palette=${palette}&mode=${mode}`);
        // Every canvas has drawn a frame once it is no longer the default 300×150 surface.
        await page.waitForFunction(() =>
          [...document.querySelectorAll("canvas")].every((c) => c.width !== 300 || c.height !== 150),
        );
        // Glyph atlases depend on fonts; wait so the first frame isn't drawn with a fallback.
        await page.evaluate(() => document.fonts.ready);
        const name = mode === "dither" ? `${example}-${palette}` : `${example}-${palette}-ascii`;
        await expect(page.locator("#visual")).toHaveScreenshot(`${name}.png`);
      });
    }
  }
}
