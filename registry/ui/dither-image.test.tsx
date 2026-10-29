// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DitherImage } from "./dither-image";

let created = 0;

beforeEach(() => {
  created = 0;
  // Images "load" immediately; observers report every element on screen at 300×200.
  vi.stubGlobal(
    "Image",
    class {
      naturalWidth = 600;
      naturalHeight = 400;
      crossOrigin = "";
      onload: (() => void) | null = null;
      constructor() {
        created++;
      }
      set src(_: string) {
        setTimeout(() => this.onload?.());
      }
    },
  );
  const observer = (entry: (el: Element) => object) =>
    class {
      constructor(private cb: (entries: object[]) => void) {}
      observe(el: Element) {
        this.cb([{ target: el, ...entry(el) }]);
      }
      unobserve() {}
      disconnect() {}
    };
  vi.stubGlobal("IntersectionObserver", observer(() => ({ isIntersecting: true })));
  vi.stubGlobal("ResizeObserver", observer(() => ({ contentRect: { width: 300, height: 200 } })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DitherImage", () => {
  it("keeps the real image in the DOM, visually hidden, with a decorative canvas", () => {
    const { container } = render(<DitherImage src="/a.png" alt="A cat" width={600} height={400} />);
    const img = screen.getByRole("img", { name: "A cat" });
    expect(img.tagName).toBe("IMG");
    expect(img.style.position).toBe("absolute");
    expect(img.style.width).toBe("1px");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("reserves the aspect ratio from width and height", () => {
    const { container } = render(<DitherImage src="/a.png" alt="" width={600} height={400} />);
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe("600 / 400");
  });

  it("shows the plain image when its pixels can't be read (CORS)", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage() {},
      getImageData() {
        throw new DOMException("tainted", "SecurityError");
      },
    } as unknown as CanvasRenderingContext2D);
    const { container } = render(<DitherImage src="https://other.example/cors.png" alt="Remote" width={600} height={400} />);
    await waitFor(() => expect(container.querySelector("canvas")).toBeNull());
    const img = screen.getByRole("img", { name: "Remote" });
    expect(img.style.width).toBe("100%");
  });

  it("re-renders on token changes without reloading the image", async () => {
    const { rerender } = render(<DitherImage src="/same.png" alt="" palette="amber" />);
    rerender(<DitherImage src="/same.png" alt="" palette="cga" pattern="bayer8" />);
    await new Promise((r) => setTimeout(r, 20));
    expect(created).toBeLessThanOrEqual(1);
  });
});
