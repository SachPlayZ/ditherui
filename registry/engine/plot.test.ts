import { describe, expect, it } from "vitest";
import { plotValues } from "./plot";

const grid = (v: Float32Array, cols: number) => Array.from({ length: v.length / cols }, (_, r) => Array.from(v.slice(r * cols, r * cols + cols)));

describe("plotValues", () => {
  it("fills bars from the bottom with a fractional top mark", () => {
    const rows = grid(plotValues([1, 0.5, 0.25], "bar", 3, 4), 3);
    expect(rows.map((r) => r[0])).toEqual([1, 1, 1, 1]);
    expect(rows.map((r) => r[1])).toEqual([0, 0, 1, 1]);
    expect(rows.map((r) => r[2])).toEqual([0, 0, 0, 1]);
    expect(grid(plotValues([1, 0.6], "bar", 2, 1), 2)[0][1]).toBeCloseTo(0.6);
  });

  it("draws a continuous line between points", () => {
    const rows = grid(plotValues([0, 1], "line", 4, 4), 4);
    // Each column has at least one lit mark, rising left to right.
    const heights = [0, 1, 2, 3].map((x) => rows.findIndex((r) => r[x] === 1));
    expect(heights.every((h) => h >= 0)).toBe(true);
    expect(heights[3]).toBeLessThan(heights[0]);
  });

  it("keeps peaks that fall inside a column", () => {
    // 3 points over 4 columns: the peak at index 1 sits mid-column; the line must still reach the top row.
    expect(grid(plotValues([0, 1, 0], "line", 4, 4), 4)[0].some((v) => v === 1)).toBe(true);
  });

  it("caches by series and size", () => {
    const s = [1, 2, 3];
    expect(plotValues(s, "line", 5, 5)).toBe(plotValues(s, "line", 5, 5));
    expect(plotValues(s, "line", 6, 5)).not.toBe(plotValues(s, "line", 5, 5));
    expect(plotValues([], "bar", 3, 3).every((v) => v === 0)).toBe(true);
  });
});
