import { describe, expect, it } from "vitest";
import { glyphGrid } from "./cpu";
import { fieldParams, field } from "./fields";
import { glyphCell, RAMPS, rampGlyphs } from "./glyphs";
import { DEFAULT_TOKENS } from "./provider";
import type { Frame, GlyphRampName } from "./types";

const linear = (glyphs: string, palette: string[] = ["#000", "#fff"]): Frame => ({
  source: { kind: "field", field: "linear" },
  tokens: { ...DEFAULT_TOKENS, mode: "ascii", glyphs, palette },
  width: 20,
  height: 2,
  time: 0,
});

describe("ramps", () => {
  it("have the documented glyphs, background first", () => {
    expect(rampGlyphs("standard")).toEqual([..." .:-=+*#%@"]);
    expect(rampGlyphs("blocks")).toEqual([..." ░▒▓█"]);
    expect(rampGlyphs("binary")).toEqual(["0", "1"]);
    expect(rampGlyphs("katakana")).toHaveLength(32);
  });

  it("accepts custom strings, keeping surrogate pairs whole", () => {
    expect(rampGlyphs(" ox")).toEqual([" ", "o", "x"]);
    expect(rampGlyphs(" 🌑🌕")).toEqual([" ", "🌑", "🌕"]);
  });
});

describe("glyphGrid", () => {
  it("maps a left→right ramp across every glyph in order, for every named ramp", () => {
    for (const name of Object.keys(RAMPS) as GlyphRampName[]) {
      const n = rampGlyphs(name).length;
      const { glyphs } = glyphGrid({ ...linear(name), width: n * 4 });
      const row = Array.from(glyphs.slice(0, n * 4));
      expect(row[0], name).toBe(0);
      expect(row.at(-1), name).toBe(n - 1);
      expect(row.every((g, i) => i === 0 || g >= row[i - 1]), name).toBe(true);
      expect(new Set(row).size, name).toBe(n);
    }
  });

  it("matches glyphCell for each cell of a custom ramp", () => {
    const frame = linear("abc");
    const { glyphs } = glyphGrid(frame);
    const params = fieldParams("linear");
    for (let x = 0; x < 20; x++) {
      const v = field("linear", (x + 0.5) / 20, 0.25, 10, 0, params);
      expect(glyphs[x]).toBe(glyphCell(v, 1, 0.5, 3, 2).glyph);
    }
  });

  it("tints 3–4 colour palettes by luminance band and uses the last colour for 2", () => {
    expect(glyphCell(0.1, 1, 0.5, 10, 4).band).toBe(1);
    expect(glyphCell(0.5, 1, 0.5, 10, 4).band).toBe(2);
    expect(glyphCell(0.95, 1, 0.5, 10, 4).band).toBe(3);
    expect(glyphCell(0.1, 1, 0.5, 10, 2).band).toBe(1);
    const { bands } = glyphGrid(linear("ab", ["#000", "#333", "#999", "#fff"]));
    expect(new Set(bands.slice(0, 20))).toEqual(new Set([1, 2, 3]));
  });
});
