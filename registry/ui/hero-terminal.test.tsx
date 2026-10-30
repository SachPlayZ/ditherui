// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroTerminal } from "./hero-terminal";

afterEach(cleanup);

describe("HeroTerminal", () => {
  it("renders the headline, description, actions and terminal lines as DOM", () => {
    const { container } = render(
      <HeroTerminal title="Grain for the web" description="Dither and ASCII components." actions={<a href="#start">Docs</a>} lines={["$ npx shadcn add", "Done."]} />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Grain for the web" })).toBeTruthy();
    expect(screen.getByText("Dither and ASCII components.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Docs" })).toBeTruthy();
    expect(container.textContent).toContain("$ npx shadcn addDone.");
    expect([...container.querySelectorAll("canvas")].every((c) => c.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});
