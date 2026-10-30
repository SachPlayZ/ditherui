import { glyphGrid, render } from "@/lib/dotgrain/cpu";
import { diffuse, isDiffusion } from "@/lib/dotgrain/diffusion";
import { rampGlyphs } from "@/lib/dotgrain/glyphs";
import { resolvePalette } from "@/lib/dotgrain/palettes";
import type { DitherTokens, Frame } from "@/lib/dotgrain/types";

/** An image already sampled to luminance (0–1), one value per mark (dither) or glyph cell (ASCII). */
export interface Luminance {
  values: Float32Array;
  width: number;
  height: number;
}

/**
 * Converts on the CPU, entirely in memory: dither mode gives a PNG with each mark scaled up to `cell` pixels,
 * ASCII mode gives the text, one line per row of cells.
 */
export async function convert(image: Luminance, tokens: DitherTokens): Promise<{ png?: Uint8Array; text?: string }> {
  const { values, width, height } = image;
  const frame: Frame = { source: { kind: "image", src: "" }, tokens, width, height, time: 0, values };
  if (tokens.mode === "ascii") {
    const ramp = rampGlyphs(tokens.glyphs);
    const { glyphs } = glyphGrid(frame);
    const rows = Array.from({ length: height }, (_, y) => Array.from(glyphs.subarray(y * width, (y + 1) * width), (g) => ramp[g]).join(""));
    return { text: rows.join("\n") + "\n" };
  }
  const n = resolvePalette(tokens.palette).length;
  const indices = isDiffusion(tokens.pattern) ? diffuse(values, width, height, tokens.pattern, tokens.contrast, tokens.threshold, n) : undefined;
  const marks = render({ ...frame, indices });
  const s = Math.max(1, Math.round(tokens.cell));
  const out = new Uint8Array(width * s * height * s * 4);
  for (let y = 0; y < height * s; y++) {
    for (let x = 0; x < width * s; x++) {
      const mark = (Math.floor(y / s) * width + Math.floor(x / s)) * 4;
      out.set(marks.subarray(mark, mark + 4), (y * width * s + x) * 4);
    }
  }
  return { png: await encodePng(out, width * s, height * s) };
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set([...type].map((c) => c.charCodeAt(0)), 4);
  out.set(data, 8);
  let crc = ~0;
  for (const b of out.subarray(4, 8 + data.length)) crc = CRC[(crc ^ b) & 255] ^ (crc >>> 8);
  view.setUint32(8 + data.length, ~crc >>> 0);
  return out;
}

/** Minimal RGBA PNG: unfiltered rows, zlib via the platform's CompressionStream. */
export async function encodePng(rgba: Uint8Array, width: number, height: number): Promise<Uint8Array> {
  const raw = new Uint8Array((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  const idat = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer());
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, width);
  new DataView(ihdr.buffer).setUint32(4, height);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array())];
  const png = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  parts.reduce((at, p) => (png.set(p, at), at + p.length), 0);
  return png;
}
