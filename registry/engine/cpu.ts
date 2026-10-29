import { field, fieldParams } from "./fields";
import { resolvePalette } from "./palettes";
import { level, thresholdMap } from "./patterns";
import type { Frame } from "./types";

/** Deterministic CPU render of a frame: RGBA bytes, width × height marks. */
export function render({ source, tokens, width, height, time }: Frame): Uint8ClampedArray<ArrayBuffer> {
  if (source.kind !== "field") throw new Error(`ditherui: "${source.kind}" sources are not supported yet`);
  const palette = resolvePalette(tokens.palette);
  const { size, data: thresholds } = thresholdMap(tokens.pattern);
  const params = fieldParams(source.field, source.params);
  const aspect = width / height;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = field(source.field, (x + 0.5) / width, (y + 0.5) / height, aspect, time, params);
      const t = thresholds[(y % size) * size + (x % size)];
      const [r, g, b] = palette[level(v, tokens.contrast, tokens.threshold, t, palette.length)];
      const i = (y * width + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}
