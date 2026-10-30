// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AsciiChart } from "./ascii-chart";

afterEach(cleanup);

describe("AsciiChart", () => {
  it("mirrors the series in a hidden table captioned by the label", () => {
    const { container } = render(<AsciiChart label="Visits" data={[3, 5, 2]} labels={["Mon", "Tue", "Wed"]} />);
    const table = screen.getByRole("table", { name: "Visits" });
    const rows = within(table).getAllByRole("row").map((r) => r.textContent);
    expect(rows).toEqual(["Mon3", "Tue5", "Wed2"]);
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("numbers rows by default and sizes a sparkline to its points", () => {
    const { container } = render(<AsciiChart type="sparkline" label="Load" data={[1, 4, 2, 8]} cell={10} />);
    expect(within(screen.getByRole("table")).getAllByRole("rowheader").map((h) => h.textContent)).toEqual(["1", "2", "3", "4"]);
    const root = container.firstElementChild as HTMLElement;
    expect([root.style.display, root.style.height]).toEqual(["inline-block", "10px"]);
  });
});
