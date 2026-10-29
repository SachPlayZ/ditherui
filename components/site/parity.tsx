"use client";

import { useEffect, useRef } from "react";
import { draw } from "@/lib/ditherui/context";
import { render } from "@/lib/ditherui/cpu";
import { paletteColors } from "@/lib/ditherui/palettes";
import { DEFAULT_TOKENS } from "@/lib/ditherui/provider";
import type { Frame, PaletteName, Pattern } from "@/lib/ditherui/types";

const PATTERNS: Pattern[] = ["bayer2", "bayer4", "bayer8", "blueNoise"];
const PALETTES: PaletteName[] = ["ink", "gameboy", "cga"];

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
    for (const pattern of PATTERNS) {
      for (const palette of PALETTES) {
        for (const time of [0, 7.3]) {
          const tokens = { ...DEFAULT_TOKENS, pattern, palette: paletteColors(palette) };
          out.push({ fixture: `${pattern}/${palette}/t${time}`, mismatch: compare({ source: { kind: "field", field: "noise" }, tokens, width: 97, height: 61, time }) });
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
