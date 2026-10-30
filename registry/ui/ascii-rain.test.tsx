// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { AsciiRain } from "./ascii-rain";

afterEach(cleanup);

describe("AsciiRain", () => {
  it("renders a decorative canvas and children as DOM without a provider", () => {
    const { container } = render(
      <AsciiRain density={0.4}>
        <h1>Hello</h1>
      </AsciiRain>,
    );
    expect(screen.getByRole("heading", { name: "Hello" })).toBeTruthy();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("announces one labelled image when given a label", () => {
    render(<AsciiRain label="Falling glyphs" />);
    expect(screen.getByRole("img", { name: "Falling glyphs" }).tagName).toBe("CANVAS");
  });

  it("forwards className, style and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<AsciiRain ref={ref} className="hero" style={{ height: 200 }} />);
    const root = container.firstElementChild as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.className).toBe("hero");
    expect(root.style.height).toBe("200px");
  });
});
