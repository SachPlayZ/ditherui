"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type AsciiRainProps = Partial<Omit<DitherTokens, "mode" | "pattern">> & {
  /** Share of columns raining, 0–1. */
  density?: number;
  /** Tail length as a share of the height, 0–1. */
  length?: number;
  /** Announces the background as one image; omit when decorative. */
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function AsciiRain({ density, length, label, children, className, style, ref, ...tokens }: AsciiRainProps) {
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      <Quantize
        source={{ kind: "field", field: "rain", params: { ...(density !== undefined && { density }), ...(length !== undefined && { length }) } }}
        label={label}
        {...tokens}
        mode="ascii"
        style={{ position: "absolute", inset: 0 }}
      />
      {children !== undefined && <div style={{ position: "relative" }}>{children}</div>}
    </div>
  );
}
