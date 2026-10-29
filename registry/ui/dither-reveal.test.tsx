// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DitherReveal } from "./dither-reveal";

let report: (entries: { isIntersecting: boolean }[]) => void = () => {};
const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (media: string) => ({ matches, media, addEventListener() {}, removeEventListener() {} }));
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const canvas = (container: HTMLElement) => container.querySelector("canvas");

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion(false);
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
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("DitherReveal", () => {
  it("never hides the text in server HTML", () => {
    const html = renderToString(<DitherReveal as="h2">Server text</DitherReveal>);
    expect(html).toContain("Server text");
    expect(html).not.toContain("transparent");
  });

  it("dithers in when scrolled into view, then shows the real text", () => {
    const { container } = render(<DitherReveal duration={600}>Appear</DitherReveal>);
    const text = screen.getByText("Appear");
    expect(text.style.color).toBe("transparent");
    expect(canvas(container)).toBeNull();
    act(() => report([{ isIntersecting: true }]));
    expect(canvas(container)?.getAttribute("aria-hidden")).toBe("true");
    tick(600);
    expect(canvas(container)).toBeNull();
    expect(text.style.color).toBe("");
    expect(text.textContent).toBe("Appear");
  });

  it("dithers out on mount and stays hidden but in the DOM", () => {
    const { container } = render(
      <DitherReveal trigger="mount" direction="out" duration={400}>
        Vanish
      </DitherReveal>,
    );
    const text = screen.getByText("Vanish");
    tick(20);
    expect(canvas(container)).not.toBeNull();
    expect(text.style.color).toBe("transparent");
    tick(400);
    expect(canvas(container)).toBeNull();
    expect(text.style.color).toBe("transparent");
  });

  it("does nothing under reduced motion or at speed 0", () => {
    reducedMotion(true);
    const calm = render(<DitherReveal trigger="mount">Calm</DitherReveal>);
    tick(20);
    expect(screen.getByText("Calm").style.color).toBe("");
    expect(canvas(calm.container)).toBeNull();
    cleanup();
    reducedMotion(false);
    const still = render(<DitherReveal trigger="mount" speed={0}>Still</DitherReveal>);
    tick(20);
    expect(screen.getByText("Still").style.color).toBe("");
    expect(canvas(still.container)).toBeNull();
  });

  it("re-dithers in on hover, visible otherwise", () => {
    const { container } = render(<DitherReveal trigger="hover" duration={300}>Hover</DitherReveal>);
    const text = screen.getByText("Hover");
    // Visible while waiting for a hover, hidden only during the run.
    expect(text.style.color).toBe("");
    expect(canvas(container)).toBeNull();
    fireEvent.mouseEnter(text);
    expect(canvas(container)).not.toBeNull();
    expect(text.style.color).toBe("transparent");
    tick(300);
    expect(text.style.color).toBe("");
  });
});
