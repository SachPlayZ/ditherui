// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

afterEach(cleanup);

describe("Skeleton", () => {
  it("is hidden from assistive tech and sized by className or style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Skeleton ref={ref} className="line" style={{ width: 120, height: 20 }} />);
    const root = container.firstElementChild as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toBe("line");
    expect([root.style.width, root.style.height]).toEqual(["120px", "20px"]);
    expect(root.querySelector("canvas")).not.toBeNull();
  });
});
