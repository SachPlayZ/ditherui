"use client";

import type { CSSProperties, Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type LoaderProps = Partial<DitherTokens> & {
  /** Announced to screen readers; not shown. */
  label?: string;
  /** Width and height in CSS pixels. */
  size?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function Loader({ label = "Loading", size = 48, className, style, ref, ...tokens }: LoaderProps) {
  return (
    <div ref={ref} role="status" className={className} style={{ position: "relative", display: "inline-block", width: size, height: size, ...style }}>
      <Quantize source={{ kind: "field", field: "spin" }} {...tokens} style={{ position: "absolute", inset: 0 }} />
      {/* Visually hidden, still read out. */}
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}
