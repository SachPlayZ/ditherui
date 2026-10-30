"use client";

import type { CSSProperties, Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type SkeletonProps = Partial<Omit<DitherTokens, "mode" | "glyphs">> & {
  /** Size it with className or style, like any block. */
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

/** A placeholder block with a dithered shimmer. Hidden from assistive tech; mark the loading region `aria-busy` instead. */
export function Skeleton({ className, style, ref, ...tokens }: SkeletonProps) {
  return (
    <div ref={ref} aria-hidden="true" className={className} style={{ position: "relative", height: 16, ...style }}>
      <Quantize source={{ kind: "field", field: "shimmer" }} {...tokens} mode="dither" style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
