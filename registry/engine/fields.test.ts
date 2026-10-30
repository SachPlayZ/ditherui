import { describe, expect, it } from "vitest";
import { render } from "./cpu";
import { cursorBump, field, fieldParams } from "./fields";
import { DEFAULT_TOKENS } from "./provider";
import type { FieldName } from "./types";

const at = (name: FieldName, u: number, v: number, params: Record<string, number> = {}, aspect = 1) =>
  field(name, u, v, aspect, 0, fieldParams(name, params));

describe("fields", () => {
  it("every field stays within 0–1", () => {
    for (const name of ["noise", "radial", "linear", "progress", "rain", "spin", "shimmer"] as FieldName[]) {
      for (let i = 0; i <= 20; i++) {
        const v = at(name, i / 20, (i * 7 % 21) / 20, {}, 1.7);
        expect(v, name).toBeGreaterThanOrEqual(0);
        expect(v, name).toBeLessThanOrEqual(1);
      }
    }
  });

  it("radial is brightest at its centre and fades to 0 at its radius", () => {
    expect(at("radial", 0.5, 0.5)).toBe(1);
    expect(at("radial", 0.75, 0.5)).toBeCloseTo(0.5);
    expect(at("radial", 1, 0.5)).toBe(0);
    expect(at("radial", 0.2, 0.2, { x: 0.2, y: 0.2 })).toBe(1);
    expect(at("radial", 0.5, 0.5, {}, 2)).toBe(1);
  });

  it("linear ramps along its angle", () => {
    expect(at("linear", 0, 0.5)).toBe(0);
    expect(at("linear", 1, 0.5)).toBe(1);
    expect(at("linear", 0.3, 0.5)).toBeCloseTo(0.3);
    expect(at("linear", 0.5, 0, { angle: 90 })).toBe(0);
    expect(at("linear", 0.5, 1, { angle: 90 })).toBe(1);
  });

  it("progress fills left of value with a soft edge", () => {
    expect(at("progress", 0.2, 0.5, { value: 0.6 })).toBe(1);
    expect(at("progress", 0.9, 0.5, { value: 0.6 })).toBe(0);
    expect(at("progress", 0.6, 0.5, { value: 0.6 })).toBe(0.5);
    expect(at("progress", 0.62, 0.5, { value: 0.6, softness: 0.1 })).toBeGreaterThan(0);
    expect(at("progress", 0.61, 0.5, { value: 0.6, softness: 0 })).toBe(0);
  });

  it("rain falls over time and leaves some columns dry", () => {
    const params = fieldParams("rain", { columns: 10, density: 0.5 });
    const column = (c: number, t: number) => Array.from({ length: 40 }, (_, i) => field("rain", (c + 0.5) / 10, i / 40, 1, t, params));
    const dry = Array.from({ length: 10 }, (_, c) => column(c, 0).every((v) => v === 0));
    expect(dry.some(Boolean)).toBe(true);
    expect(dry.every(Boolean)).toBe(false);
    const wet = dry.indexOf(false);
    // The brightest mark (the head) moves down as time advances.
    const head = (t: number) => { const col = column(wet, t); return col.indexOf(Math.max(...col)); };
    expect(head(0.1)).not.toBe(head(0));
    expect(fieldParams("rain", {})).toEqual([0.7, 0.4, 1024, 0]);
  });

  it("spin draws a ring whose bright head turns with time", () => {
    expect(at("spin", 0.5, 0.5)).toBe(0);
    expect(at("spin", 0.95, 0.5)).toBe(0);
    const ring = (t: number) => [0.18, 0.82].map((v) => field("spin", 0.5, v, 1, t, fieldParams("spin")));
    expect(ring(0).some((v) => v > 0)).toBe(true);
    expect(ring(0.25)).not.toEqual(ring(0));
    expect(field("spin", 0.5, 0.18, 1, 1, fieldParams("spin"))).toBeCloseTo(ring(0)[0]);
  });

  it("shimmer sweeps a bright band over a flat base", () => {
    const row = (t: number) => Array.from({ length: 21 }, (_, i) => field("shimmer", i / 20, 0.5, 1, t, fieldParams("shimmer")));
    expect(Math.min(...row(0.8))).toBeCloseTo(0.3);
    expect(Math.max(...row(0.8))).toBeGreaterThan(0.9);
    const peak = (t: number) => row(t).indexOf(Math.max(...row(t)));
    expect(peak(1)).toBeGreaterThan(peak(0.8));
  });

  it("packs params into vec4 slots with defaults", () => {
    expect(fieldParams("radial", { radius: 0.3 })).toEqual([0.5, 0.5, 0.3, 0]);
    expect(fieldParams("progress", { value: 0.4 })).toEqual([0.4, 0.05, 0, 0]);
  });
});

describe("cursor bump", () => {
  it("peaks at the pointer and fades with distance", () => {
    const c = [0.5, 0.5, 1, 0.2];
    expect(cursorBump(0.5, 0.5, 1, c)).toBeCloseTo(0.6);
    expect(cursorBump(0.6, 0.5, 1, c)).toBeLessThan(0.6);
    expect(cursorBump(0.9, 0.9, 1, c)).toBeLessThan(0.01);
    expect(cursorBump(0.5, 0.5, 1, [0.5, 0.5, 0, 0.2])).toBe(0);
  });

  it("lights more marks near the pointer in a render", () => {
    const frame = {
      source: { kind: "field", field: "linear" } as const,
      tokens: DEFAULT_TOKENS,
      width: 32,
      height: 32,
      time: 0,
    };
    const lit = (data: Uint8ClampedArray) => {
      let n = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i] > 128) n++;
      return n;
    };
    expect(lit(render({ ...frame, cursor: [0.2, 0.5, 1, 0.3] }))).toBeGreaterThan(lit(render(frame)));
  });
});
