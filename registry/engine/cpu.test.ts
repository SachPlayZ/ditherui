import { describe, expect, it } from "vitest";
import { render } from "./cpu";
import { field, fieldParams } from "./fields";
import { bayer } from "./patterns";
import { DEFAULT_TOKENS } from "./provider";
import type { Frame } from "./types";

const frame = (over: Partial<Frame> = {}, tokens = {}): Frame => ({
  source: { kind: "field", field: "noise" },
  tokens: { ...DEFAULT_TOKENS, ...tokens },
  width: 16,
  height: 8,
  time: 0,
  ...over,
});

/** Palette index per mark, assuming a 2-colour palette (0 = background). */
const marks = (data: Uint8ClampedArray): number[] => Array.from({ length: data.length / 4 }, (_, i) => (data[i * 4] > 128 ? 1 : 0));

describe("bayer", () => {
  it("builds the standard 4×4 matrix", () => {
    expect(Array.from(bayer(4), (t) => t * 16 - 0.5)).toEqual([0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]);
  });

  it("covers every rank once for 2 and 8", () => {
    for (const n of [2, 8]) {
      expect(Array.from(bayer(n), (t) => t * n * n - 0.5).sort((a, b) => a - b)).toEqual([...Array(n * n).keys()]);
    }
  });
});

describe("noise field", () => {
  it("stays in 0–1, is deterministic and moves with time", () => {
    const p = fieldParams("noise");
    const at = (t: number) => Array.from({ length: 50 }, (_, i) => field("noise", i / 50, (i * 7) % 50 / 50, 2, t, p));
    const a = at(0);
    expect(a.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(at(0)).toEqual(a);
    expect(at(3)).not.toEqual(a);
  });

  it("uses params with defaults", () => {
    expect(fieldParams("noise")).toEqual([3, 0, 0, 0]);
    expect(fieldParams("noise", { scale: 8 })).toEqual([8, 0, 0, 0]);
  });
});

describe("render", () => {
  it("returns RGBA at quantized size using only palette colours", () => {
    const data = render(frame());
    expect(data.length).toBe(16 * 8 * 4);
    const colours = new Set<string>();
    for (let i = 0; i < data.length; i += 4) colours.add(`${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`);
    expect([...colours].sort()).toEqual(["10,10,10,255", "242,240,233,255"]);
  });

  it("is deterministic for a fixed time", () => {
    expect(render(frame({ time: 1.5 }))).toEqual(render(frame({ time: 1.5 })));
  });

  it("dithers a flat 0.5 value into the bayer4 half-tone", () => {
    // contrast 0 flattens every value to 0.5: marks whose threshold is below 0.5 turn on.
    const on = marks(render(frame({ width: 4, height: 4 }, { contrast: 0 })));
    expect(on).toEqual(Array.from(bayer(4), (t) => (t < 0.5 ? 1 : 0)));
  });

  it("quantizes to N levels for an N-colour palette", () => {
    const data = render(frame({ width: 32, height: 32 }, { palette: ["#000", "#555", "#aaa", "#fff"] }));
    const levels = new Set<number>();
    for (let i = 0; i < data.length; i += 4) levels.add(data[i]);
    expect([...levels].every((v) => [0, 0x55, 0xaa, 0xff].includes(v))).toBe(true);
  });

  it("contrast pushes values toward the extremes", () => {
    // Bayer thresholds sit in (0, 1), so heavy contrast saturates nearly every mark to 0 or 1
    // and the pattern stops depending on the threshold map: fewer isolated dither dots.
    const flips = (contrast: number) => {
      const m = marks(render(frame({ width: 32, height: 32 }, { contrast })));
      return m.filter((v, i) => i % 32 > 0 && v !== m[i - 1]).length;
    };
    expect(flips(8)).toBeLessThan(flips(1));
  });

  it("threshold shifts how many marks are lit", () => {
    const lit = (threshold: number) => marks(render(frame({}, { threshold }))).reduce((a, b) => a + b, 0);
    expect(lit(0.2)).toBeGreaterThan(lit(0.5));
    expect(lit(0.8)).toBeLessThan(lit(0.5));
  });
});
