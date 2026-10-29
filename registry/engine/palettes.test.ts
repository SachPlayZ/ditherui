import { describe, expect, it } from "vitest";
import { PALETTES, paletteColors, resolvePalette } from "./palettes";
import type { PaletteName } from "./types";

describe("palettes", () => {
  it("resolves every named palette to 2–4 RGB colours", () => {
    for (const name of Object.keys(PALETTES) as PaletteName[]) {
      const rgb = resolvePalette(name);
      expect(rgb.length).toBeGreaterThanOrEqual(2);
      expect(rgb.length).toBeLessThanOrEqual(4);
      expect(rgb.flat().every((v) => Number.isInteger(v) && v >= 0 && v <= 255)).toBe(true);
    }
  });

  it("parses custom hex and rgb() palettes of 2, 3 and 4 colours", () => {
    expect(resolvePalette(["#000", "#fff"])).toEqual([[0, 0, 0], [255, 255, 255]]);
    expect(resolvePalette(["#102030", "rgb(1, 2, 3)", "rgb(4 5 6)"])).toEqual([[16, 32, 48], [1, 2, 3], [4, 5, 6]]);
    expect(resolvePalette(["#000", "#111", "#222", "#333"])).toHaveLength(4);
  });

  it("raises a clear error for invalid custom palettes", () => {
    expect(() => paletteColors(["#000"])).toThrow(/2–4 colours, got 1/);
    expect(() => paletteColors(["#000", "#111", "#222", "#333", "#444"])).toThrow(/got 5/);
    expect(() => paletteColors(["#000", "nope"])).toThrow(/"nope"/);
    expect(() => paletteColors("neon" as PaletteName)).toThrow(/unknown palette "neon"/);
  });

  it("flips ink with the scheme so palette[0] is always the background", () => {
    expect(paletteColors("ink", "light")).toEqual(paletteColors("ink", "dark").toReversed());
    expect(resolvePalette("ink", "light")[0][0]).toBeGreaterThan(200);
    expect(resolvePalette("ink", "dark")[0][0]).toBeLessThan(50);
  });
});
