// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrambleText } from "./scramble-text";

const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (media: string) => ({ matches, media, addEventListener() {}, removeEventListener() {} }));
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ScrambleText", () => {
  it("has the real text in the DOM from the first render", () => {
    const { container } = render(<ScrambleText as="h2">Hello world</ScrambleText>);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Hello world");
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("scrambles on mount with a decorative overlay, then settles", () => {
    const { container } = render(<ScrambleText duration={500}>Hello</ScrambleText>);
    tick(20);
    const text = screen.getByText("Hello");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(text.style.color).toBe("transparent");
    expect(text.textContent).toBe("Hello");
    tick(500);
    expect(container.querySelector("canvas")).toBeNull();
    expect(text.style.color).toBe("");
  });

  it("never scrambles under reduced motion or at speed 0", () => {
    reducedMotion(true);
    const { container } = render(<ScrambleText>Calm</ScrambleText>);
    tick(20);
    expect(container.querySelector("canvas")).toBeNull();
    cleanup();
    reducedMotion(false);
    const still = render(<ScrambleText speed={0}>Still</ScrambleText>);
    tick(20);
    expect(still.container.querySelector("canvas")).toBeNull();
  });

  it("scrambles on hover only when triggered by hover", () => {
    const { container } = render(<ScrambleText trigger="hover">Hover me</ScrambleText>);
    tick(20);
    expect(container.querySelector("canvas")).toBeNull();
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("scrambles the first time it scrolls into view", () => {
    let report: (entries: { isIntersecting: boolean }[]) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof report) {
          report = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const { container } = render(<ScrambleText trigger="inView">Below the fold</ScrambleText>);
    tick(20);
    expect(container.querySelector("canvas")).toBeNull();
    act(() => report([{ isIntersecting: true }]));
    expect(container.querySelector("canvas")).not.toBeNull();
  });
});
