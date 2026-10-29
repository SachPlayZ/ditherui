"use client";

import type { CSSProperties, Ref } from "react";
import { rampGlyphs } from "@/lib/dotgrain/glyphs";
import { useDitherTokens } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type DitherProgressProps = Partial<DitherTokens> & {
  /** Progress from 0 to 100. */
  value: number;
  /** Width of the dithered edge as a fraction of the bar (0–1). */
  softness?: number;
  /** Accessible name, e.g. "Uploading". */
  label?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function DitherProgress({ value, softness = 0.05, label, className, style, ref, ...tokens }: DitherProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const { mode, glyphs } = useDitherTokens(tokens);
  const ramp = rampGlyphs(glyphs);
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={className}
      style={{ position: "relative", height: 16, ...style }}
    >
      <Quantize
        source={{ kind: "field", field: "progress", params: { value: clamped / 100, softness } }}
        ease
        {...tokens}
        // ASCII draws only the ramp's extremes: full cells up to the value, empty after.
        glyphs={mode === "ascii" ? ramp[0] + ramp[ramp.length - 1] : tokens.glyphs}
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
