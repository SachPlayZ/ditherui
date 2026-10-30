// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Loader } from "./loader";

afterEach(cleanup);

describe("Loader", () => {
  it("is a status region named by its label, with a decorative canvas", () => {
    const { container } = render(<Loader />);
    expect(screen.getByRole("status").textContent).toBe("Loading");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    render(<Loader label="Saving draft" />);
    expect(screen.getByRole("status").textContent).toBe("Saving draft");
  });

  it("sizes itself and forwards ref, className and style", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Loader ref={ref} size={64} className="l" style={{ margin: 2 }} />);
    const root = screen.getByRole("status");
    expect(ref.current).toBe(root);
    expect(root.className).toBe("l");
    expect([root.style.width, root.style.height, root.style.margin]).toEqual(["64px", "64px", "2px"]);
  });
});
