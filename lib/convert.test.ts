import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { DEFAULT_TOKENS } from "@/lib/dotgrain/provider";
import { convert } from "./convert";

// A 4×2 left-to-right ramp.
const image = { values: Float32Array.from([0, 0.33, 0.66, 1, 0, 0.33, 0.66, 1]), width: 4, height: 2 };

function decode(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset);
  const [width, height] = [view.getUint32(16), view.getUint32(20)];
  const idatLength = view.getUint32(33);
  const raw = inflateSync(png.subarray(41, 41 + idatLength));
  const pixel = (x: number, y: number) => [...raw.subarray(y * (width * 4 + 1) + 1 + x * 4, y * (width * 4 + 1) + 1 + x * 4 + 4)];
  return { width, height, pixel };
}

describe("convert", () => {
  it("dithers to a valid PNG with marks scaled up by cell, in palette colours", async () => {
    const { png, text } = await convert(image, { ...DEFAULT_TOKENS, mode: "dither", palette: ["#000000", "#ffffff"], pattern: "bayer2", cell: 3 });
    expect(text).toBeUndefined();
    expect([...png!.subarray(1, 4)].map((c) => String.fromCharCode(c)).join("")).toBe("PNG");
    const { width, height, pixel } = decode(png!);
    expect([width, height]).toEqual([12, 6]);
    expect(pixel(0, 0)).toEqual([0, 0, 0, 255]);
    expect(pixel(11, 5)).toEqual([255, 255, 255, 255]);
    // Each mark is a solid cell × cell block.
    expect(pixel(2, 2)).toEqual(pixel(0, 0));
  });

  it("gives ASCII as text, one line per row, darkest to densest glyph", async () => {
    const { png, text } = await convert(image, { ...DEFAULT_TOKENS, mode: "ascii", glyphs: " .:@" });
    expect(png).toBeUndefined();
    const lines = text!.trimEnd().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(4);
    expect(lines[0][0]).toBe(" ");
    expect(lines[0][3]).toBe("@");
  });

  it("supports error diffusion", async () => {
    const { png } = await convert(image, { ...DEFAULT_TOKENS, mode: "dither", pattern: "floyd", cell: 1 });
    expect(decode(png!).width).toBe(4);
  });
});
