// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Terminal } from "./terminal";

const LINES = ["$ pnpm dlx shadcn add @dotgrain/terminal", "Done."];
const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (media: string) => ({ matches, media, addEventListener() {}, removeEventListener() {} }));
const transparent = (c: HTMLElement) => [...c.querySelectorAll("span")].filter((s) => s.style.color === "transparent").map((s) => s.textContent).join("");

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Terminal", () => {
  it("renders every line as DOM text in a decorative ASCII frame", () => {
    const { container } = render(<Terminal lines={LINES} />);
    for (const line of LINES) expect(screen.getByText(line)).toBeTruthy();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(renderToString(<Terminal lines={LINES} typing />)).not.toContain("transparent");
  });

  it("types lines out while keeping the full text in the DOM", () => {
    const { container } = render(<Terminal lines={LINES} typing rate={100} />);
    expect(container.textContent).toBe(LINES.join(""));
    expect(transparent(container)).toBe(LINES.join(""));
    act(() => void vi.advanceTimersByTime(100));
    expect(transparent(container)).toBe(LINES.join("").slice(10));
    expect(container.textContent).toBe(LINES.join(""));
    act(() => void vi.advanceTimersByTime(10_000));
    expect(transparent(container)).toBe("");
  });

  it("skips typing under reduced motion", () => {
    reducedMotion(true);
    const { container } = render(<Terminal lines={LINES} typing />);
    expect(transparent(container)).toBe("");
  });
});
