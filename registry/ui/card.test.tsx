// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Backdrop } from "./backdrop";
import { Card } from "./card";

afterEach(cleanup);

describe("Card", () => {
  it("renders children as DOM above a decorative canvas and forwards ref, className and style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Card ref={ref} className="c" style={{ padding: 8 }}>
        <h3>Plan</h3>
      </Card>,
    );
    const root = container.firstElementChild as HTMLDivElement;
    expect(screen.getByRole("heading", { name: "Plan" })).toBeTruthy();
    expect(root.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    expect([ref.current, root.className, root.style.padding]).toEqual([root, "c", "8px"]);
  });
});

describe("Backdrop", () => {
  it("places the texture absolutely in its section, or fixed behind the viewport", () => {
    const { container } = render(<Backdrop>Section</Backdrop>);
    const canvasBox = (c: HTMLElement) => c.querySelector("canvas")!.style.position;
    expect(screen.getByText("Section")).toBeTruthy();
    expect(canvasBox(container)).toBe("absolute");
    cleanup();
    const fixed = render(<Backdrop fixed label="Grain" />);
    expect(screen.getByRole("img", { name: "Grain" })).toBeTruthy();
    expect(canvasBox(fixed.container)).toBe("fixed");
  });
});
