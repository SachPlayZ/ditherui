import { expect, test } from "@playwright/test";
import { PALETTES } from "../registry/engine/palettes";
import { examples } from "../registry/examples";

for (const example of Object.keys(examples)) {
  for (const palette of Object.keys(PALETTES)) {
    test(`${example} · ${palette}`, async ({ page }) => {
      await page.goto(`/visual/${example}?palette=${palette}`);
      // Every canvas has drawn a frame once it is no longer the default 300×150 surface.
      await page.waitForFunction(() =>
        [...document.querySelectorAll("canvas")].every((c) => c.width !== 300 || c.height !== 150),
      );
      await expect(page.locator("#visual")).toHaveScreenshot(`${example}-${palette}.png`);
    });
  }
}
