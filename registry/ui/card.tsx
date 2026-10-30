"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { useColorScheme, useDitherTokens } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type CardProps = Partial<DitherTokens> & {
  /** Border width in marks (whole glyph cells in ASCII). */
  border?: number;
  /** Level inside the border, 0–1; keep it low so text stays legible. */
  fill?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function Card({ border = 3, fill = 0, children, className, style, ref, ...tokens }: CardProps) {
  // Text takes the palette's foreground so it reads on the palette's background in any page theme.
  const colors = paletteColors(useDitherTokens(tokens).palette, useColorScheme().scheme);
  return (
    <div ref={ref} className={className} style={{ position: "relative", padding: 24, color: colors[colors.length - 1], ...style }}>
      <Quantize source={{ kind: "field", field: "frame", params: { border, fill } }} {...tokens} style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
