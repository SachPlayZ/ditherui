import { expect, test } from "@playwright/test";
import { PALETTES } from "../registry/engine/palettes";
import { examples } from "../registry/examples";
import { components } from "../registry/meta";

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

// Every component's main demo on the Canvas2D path and with animation frozen; each still renders a full frame.
for (const { name, modes } of components) {
  const example = `${name}-demo`;
  for (const mode of modes) {
    for (const variant of ["cpu", "reduced-motion"]) {
      test(`${example} · ${mode} · ${variant}`, async ({ page }) => {
        if (variant === "reduced-motion") await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`/visual/${example}?palette=ink&mode=${mode}${variant === "cpu" ? "&cpu=1" : ""}`);
        await page.waitForFunction(() =>
          [...document.querySelectorAll("canvas")].every((c) => c.width !== 300 || c.height !== 150),
        );
        await page.evaluate(() => document.fonts.ready);
        // CPU ASCII blits one glyph per cell; slow under emulated amd64.
        await expect(page.locator("#visual")).toHaveScreenshot(`${example}-${mode}-${variant}.png`, { timeout: 20_000 });
      });
    }
  }
}
