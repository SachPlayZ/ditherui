import { expect, test } from "@playwright/test";

test("converts an image locally: downloads and code, with no image data sent over the network", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => void ((window as unknown as { copied: string }).copied = text) } });
  });
  await page.goto("/convert");
  // A small gradient PNG made in the page, so the test needs no fixture file.
  const png = await page.evaluate(() => {
    const c = Object.assign(document.createElement("canvas"), { width: 64, height: 32 });
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, "#000");
    grad.addColorStop(1, "#fff");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 32);
    return c.toDataURL("image/png").split(",")[1];
  });

  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" || r.postData()) sent.push(`${r.method()} ${r.url()}`);
  });

  await page.getByLabel("Image").setInputFiles({ name: "ramp.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await expect(page.getByRole("img", { name: "ramp.png" })).toBeAttached({ timeout: 30_000 });

  const [pngDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PNG" }).click()]);
  expect(pngDownload.suggestedFilename()).toBe("ramp-dither.png");

  await page.getByLabel("Mode").selectOption("ascii");
  const [txt] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download TXT" }).click()]);
  expect(txt.suggestedFilename()).toBe("ramp-ascii.txt");
  const text = await (await import("node:fs/promises")).readFile((await txt.path())!, "utf8");
  expect(text.trim().split("\n").length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Copy code" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { copied?: string }).copied)).toContain('<DitherImage src="/ramp.png" alt="" mode="ascii"');

  expect(sent).toEqual([]);
});
