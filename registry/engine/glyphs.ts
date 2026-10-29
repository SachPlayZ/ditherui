import type { GlyphRampName } from "./types";

export const DEFAULT_FONT = '"JetBrains Mono", ui-monospace, monospace';

/** ASCII cell width ÷ height: the advance of a monospace glyph, so `█` tiles solid. `cell` is the height. */
export const GLYPH_ASPECT = 0.6;

// Ordered background → foreground (sparse → dense), like palettes.
// shortcut: katakana is the half-width block U+FF66–U+FF85 in code-point order, not sorted by ink coverage;
// sort by measured coverage if it reads too noisy.
export const RAMPS: Record<GlyphRampName, string> = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: "01",
  katakana: Array.from({ length: 32 }, (_, i) => String.fromCharCode(0xff66 + i)).join(""),
};

/** Ramp characters, splitting by code point so surrogate pairs stay whole. */
export function rampGlyphs(glyphs: GlyphRampName | string): string[] {
  return [...(glyphs in RAMPS ? RAMPS[glyphs as GlyphRampName] : glyphs)];
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * One ASCII cell: glyph index into the ramp and palette band (1…n-1) for the foreground.
 * JS twin of the ASCII shader's cell logic.
 */
export function glyphCell(v: number, contrast: number, threshold: number, glyphs: number, colors: number) {
  const s = clamp01((v - 0.5) * contrast + 1 - threshold);
  return {
    glyph: Math.min(glyphs - 1, Math.floor(s * glyphs)),
    band: Math.min(colors - 1, 1 + Math.floor(s * (colors - 1))),
  };
}

const atlases = new Map<string, HTMLCanvasElement>();

/** White-on-transparent strip of glyphs, one cellW × cellH box each; cached by font, cell size and ramp. */
export function glyphAtlas(glyphs: string[], cellW: number, cellH: number, font: string): HTMLCanvasElement {
  const key = `${font}|${cellW}x${cellH}|${glyphs.join("")}`;
  let atlas = atlases.get(key);
  if (!atlas) {
    atlas = document.createElement("canvas");
    atlas.width = glyphs.length * cellW;
    atlas.height = cellH;
    const ctx = atlas.getContext("2d")!;
    ctx.font = `${cellH}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    glyphs.forEach((g, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(i * cellW, 0, cellW, cellH);
      ctx.clip();
      ctx.fillText(g, (i + 0.5) * cellW, cellH / 2);
      ctx.restore();
    });
    atlases.set(key, atlas);
  }
  return atlas;
}

/** Drop cached atlases (e.g. once a web font finishes loading). */
export function clearGlyphAtlases(): void {
  atlases.clear();
}
