import { expect, test } from "@playwright/test";
import { addCommand } from "../lib/install";
import { components } from "../registry/meta";

for (const meta of components) {
  test(`docs page · ${meta.name}`, async ({ page }) => {
    // Capture what Copy prompt writes; clipboard permissions vary across headless runs.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: async (text: string) => void ((window as unknown as { copied: string }).copied = text) },
      });
    });
    await page.goto(`/docs/components/${meta.name}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(meta.title);

    await page.getByRole("button", { name: "Copy prompt" }).click();
    const copied = () => page.evaluate(() => (window as unknown as { copied?: string }).copied);
    await expect.poll(copied).toContain(addCommand(`@dotgrain/${meta.name}`));

    // Type table rows are buttons named `name?`; their text also holds the type, hidden on narrow screens.
    await expect(page.getByRole("button", { name: /^\w+\?$/ })).toHaveText(meta.props.map((p) => `${p.name}?${p.type}`));
  });
}
