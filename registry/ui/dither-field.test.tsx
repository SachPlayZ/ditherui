// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DitherField } from "./dither-field";

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);

describe("DitherField", () => {
  it("renders a decorative canvas and children as DOM without a provider", () => {
    const { container } = render(
      <DitherField>
        <h1>Hello</h1>
      </DitherField>,
    );
    expect(screen.getByRole("heading", { name: "Hello" })).toBeTruthy();
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("announces one labelled image when given a label", () => {
    render(<DitherField label="Moving noise" />);
    expect(screen.getByRole("img", { name: "Moving noise" }).tagName).toBe("CANVAS");
  });

  it("forwards className, style and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DitherField ref={ref} className="hero" style={{ height: 200 }} />);
    const root = container.firstElementChild as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.className).toBe("hero");
    expect(root.style.height).toBe("200px");
  });
});
