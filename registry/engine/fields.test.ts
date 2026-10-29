import { describe, expect, it } from "vitest";
import { render } from "./cpu";
import { cursorBump, field, fieldParams } from "./fields";
import { DEFAULT_TOKENS } from "./provider";
import type { FieldName } from "./types";

const at = (name: FieldName, u: number, v: number, params: Record<string, number> = {}, aspect = 1) =>
  field(name, u, v, aspect, 0, fieldParams(name, params));

describe("fields", () => {
  it("every field stays within 0–1", () => {
    for (const name of ["noise", "radial", "linear", "progress"] as FieldName[]) {
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
