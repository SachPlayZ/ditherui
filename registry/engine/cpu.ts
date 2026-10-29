import { cursorBump, field, fieldParams } from "./fields";
import { GLYPH_ASPECT, glyphCell, rampGlyphs } from "./glyphs";
import { resolvePalette } from "./palettes";
import { level, thresholdMap } from "./patterns";
import type { Frame } from "./types";

/** Calls back with the source value (0–1 plus cursor) at every mark's centre. */
function eachValue(frame: Frame, aspect: number, callback: (x: number, y: number, v: number) => void): void {
  const { source, width, height, time, cursor = [0, 0, 0, 0], values } = frame;
  if (source.kind !== "field" && !values) throw new Error(`dotgrain: ${source.kind} frames need \`values\``);
  const params = source.kind === "field" ? fieldParams(source.field, source.params) : [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width, w = (y + 0.5) / height;
      const v = source.kind === "field" ? field(source.field, u, w, aspect, time, params) : values![y * width + x];
      callback(x, y, v + cursorBump(u, w, aspect, cursor));
    }
  }
}

/** Deterministic CPU dither render of a frame: RGBA bytes, width × height marks. */
export function render(frame: Frame): Uint8ClampedArray<ArrayBuffer> {
  const { tokens, width, height, indices } = frame;
  const palette = resolvePalette(tokens.palette);
  const out = new Uint8ClampedArray(width * height * 4);
  if (indices) {
    indices.forEach((i, p) => out.set([...palette[i], 255], p * 4));
    return out;
  }
  const { size, data: thresholds } = thresholdMap(tokens.pattern);
  eachValue(frame, width / height, (x, y, v) => {
    const t = thresholds[(y % size) * size + (x % size)];
    const [r, g, b] = palette[level(v, tokens.contrast, tokens.threshold, t, palette.length)];
    out.set([r, g, b, 255], (y * width + x) * 4);
  });
  return out;
}

/** Deterministic CPU ASCII render: glyph index per cell and palette band for its colour. */
export function glyphGrid(frame: Frame): { glyphs: Uint16Array; bands: Uint8Array } {
  const { tokens, width, height } = frame;
  const ramp = rampGlyphs(tokens.glyphs).length;
  const colors = resolvePalette(tokens.palette).length;
  const glyphs = new Uint16Array(width * height);
  const bands = new Uint8Array(width * height);
  eachValue(frame, (width * GLYPH_ASPECT) / height, (x, y, v) => {
    const cell = glyphCell(v, tokens.contrast, tokens.threshold, ramp, colors);
    glyphs[y * width + x] = cell.glyph;
    bands[y * width + x] = cell.band;
  });
  return { glyphs, bands };
}
