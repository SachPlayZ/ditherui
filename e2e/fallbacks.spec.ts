import { expect, test, type Page } from "@playwright/test";

const drawn = (page: Page) =>
  page.waitForFunction(() => [...document.querySelectorAll("canvas")].every((c) => c.width !== 300 || c.height !== 150));

// Count lit pixels so a blank (all background) canvas fails.
const distinctColors = (page: Page) =>
  page.evaluate(() => {
    const c = document.querySelector("#visual canvas") as HTMLCanvasElement;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const seen = new Set<number>();
    for (let i = 0; i < d.length; i += 4) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    return seen.size;
  });

for (const mode of ["dither", "ascii"]) {
  test(`?cpu=1 renders ${mode} without WebGL2`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === "webgl2") throw new Error("WebGL2 requested despite ?cpu=1");
        return (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof get;
    });
    await page.goto(`/visual/dither-field-demo?palette=ink&mode=${mode}&cpu=1`);
    await drawn(page);
    expect(await distinctColors(page)).toBeGreaterThan(1);
  });
}

test("context loss and restore redraws every view without remounting", async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      const ctx = (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
      if (type === "webgl2") (window as unknown as { __gl: WebGL2RenderingContext }).__gl = ctx as WebGL2RenderingContext;
      return ctx;
    } as typeof get;
  });
  await page.goto("/visual/dither-field-patterns-demo?palette=ink");
  await drawn(page);
  const snapshot = () => page.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => c.toDataURL()));
  const before = await snapshot();
  const painted = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("canvas")].every((c) =>
        c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0),
      ),
    );
  await page.evaluate(() => {
    const w = window as unknown as { __gl: WebGL2RenderingContext; __ext: WEBGL_lose_context };
    w.__ext = w.__gl.getExtension("WEBGL_lose_context")!;
    document.querySelectorAll("canvas").forEach((c) => {
      (c as unknown as { mark: boolean }).mark = true;
      c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    });
    w.__ext.loseContext();
  });
  // Views redraw on the CPU while the context is lost.
  await expect.poll(painted).toBe(true);
  await page.evaluate(() => {
    document.querySelectorAll("canvas").forEach((c) => c.getContext("2d")!.clearRect(0, 0, c.width, c.height));
    (window as unknown as { __ext: WEBGL_lose_context }).__ext.restoreContext();
  });
  await expect.poll(snapshot).toEqual(before);
  expect(await page.evaluate(() => [...document.querySelectorAll("canvas")].every((c) => (c as unknown as { mark?: boolean }).mark))).toBe(true);
});
