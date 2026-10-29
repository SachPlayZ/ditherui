"use client";

import { useEffect, useRef } from "react";
import { draw } from "@/lib/dithercn/context";
import { render } from "@/lib/dithercn/cpu";
import { paletteColors } from "@/lib/dithercn/palettes";
import { DEFAULT_TOKENS } from "@/lib/dithercn/provider";
import type { FieldName, Frame, PaletteName, Pattern } from "@/lib/dithercn/types";

const PATTERNS: Pattern[] = ["bayer2", "bayer4", "bayer8", "blueNoise"];
const PALETTES: PaletteName[] = ["ink", "gameboy", "cga"];
const FIELDS: FieldName[] = ["noise", "radial", "linear", "progress"];

export interface ParityResult {
  fixture: string;
  mismatch: number;
}

function compare(frame: Frame): number {
  const canvas = document.createElement("canvas");
  draw(canvas, frame);
  const gpu = canvas.getContext("2d")!.getImageData(0, 0, frame.width, frame.height).data;
  const cpu = render(frame);
  let differing = 0;
  for (let i = 0; i < cpu.length; i += 4) if (cpu[i] !== gpu[i] || cpu[i + 1] !== gpu[i + 1] || cpu[i + 2] !== gpu[i + 2]) differing++;
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
    pre.current!.textContent = JSON.stringify(out, null, 2);
  }, []);
  return (
    <pre id="parity" ref={pre}>
      running
    </pre>
  );
}
