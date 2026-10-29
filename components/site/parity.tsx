"use client";

import { useEffect, useRef } from "react";
import { draw, drawGlyphs } from "@/lib/dotgrain/context";
import { GLYPH_ASPECT } from "@/lib/dotgrain/glyphs";
import { render } from "@/lib/dotgrain/cpu";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { DEFAULT_TOKENS } from "@/lib/dotgrain/provider";
import type { FieldName, Frame, GlyphRampName, PaletteName, Pattern } from "@/lib/dotgrain/types";

const PATTERNS: Pattern[] = ["bayer2", "bayer4", "bayer8", "blueNoise"];
const PALETTES: PaletteName[] = ["ink", "gameboy", "cga"];
const FIELDS: FieldName[] = ["noise", "radial", "linear", "progress"];
const RAMPS: GlyphRampName[] = ["standard", "blocks"];

export interface ParityResult {
  fixture: string;
  mismatch: number;
}

function pixels(canvas: HTMLCanvasElement): Uint8ClampedArray {
  return canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
}

// Dither must match exactly; ASCII glyph edges blend in the shader vs Canvas2D, so allow rounding.
function compare(frame: Frame): number {
  const canvas = document.createElement("canvas");
  draw(canvas, frame);
  const gpu = pixels(canvas);
  let cpu: Uint8ClampedArray;
  if (frame.tokens.mode === "ascii") {
    const twin = document.createElement("canvas");
    twin.width = canvas.width;
    twin.height = canvas.height;
    drawGlyphs(twin.getContext("2d")!, frame, Math.round(frame.tokens.cell * GLYPH_ASPECT), frame.tokens.cell);
    cpu = pixels(twin);
  } else cpu = render(frame);
  // A blank GPU frame would trivially match a blank CPU one.
  if (gpu.every((v, i) => v === gpu[i % 4])) return 1;
  const tolerance = frame.tokens.mode === "ascii" ? 2 : 0;
  let differing = 0;
  for (let i = 0; i < cpu.length; i += 4)
    if ([0, 1, 2].some((c) => Math.abs(cpu[i + c] - gpu[i + c]) > tolerance)) differing++;
  return differing / (cpu.length / 4);
}

export function Parity() {
  const pre = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const out: ParityResult[] = [];
    for (const field of FIELDS) {
      for (const pattern of PATTERNS) {
        for (const palette of PALETTES) {
          for (const time of [0, 7.3]) {
            const tokens = { ...DEFAULT_TOKENS, pattern, palette: paletteColors(palette) };
            const frame: Frame = { source: { kind: "field", field }, tokens, width: 97, height: 61, time, cursor: [0.3, 0.6, 1, 0.25] };
            out.push({ fixture: `${field}/${pattern}/${palette}/t${time}`, mismatch: compare(frame) });
          }
        }
      }
    }
    for (const field of FIELDS) {
      for (const glyphs of RAMPS) {
        for (const palette of PALETTES) {
          for (const time of [0, 7.3]) {
            const tokens = { ...DEFAULT_TOKENS, mode: "ascii" as const, cell: 12, glyphs, palette: paletteColors(palette) };
            const frame: Frame = { source: { kind: "field", field }, tokens, width: 40, height: 20, time, cursor: [0.3, 0.6, 1, 0.25] };
            out.push({ fixture: `ascii/${field}/${glyphs}/${palette}/t${time}`, mismatch: compare(frame) });
          }
        }
      }
    }
    pre.current!.textContent = JSON.stringify(out, null, 2);
  }, []);
  return (
    <pre id="parity" ref={pre}>
      running
    </pre>
  );
}
