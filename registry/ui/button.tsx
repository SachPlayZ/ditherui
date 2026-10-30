"use client";

import { useState, type ComponentProps } from "react";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { useColorScheme, useDitherTokens } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type ButtonProps = Omit<ComponentProps<"button">, keyof DitherTokens> &
  Partial<DitherTokens> & {
    /** Solid: filled face, fuller on hover. Outline: empty face with a border, filling on hover. */
    variant?: "solid" | "outline";
    size?: "sm" | "md" | "lg";
  };

const SIZES = { sm: { padding: "4px 10px", fontSize: 13 }, md: { padding: "8px 16px", fontSize: 14 }, lg: { padding: "12px 24px", fontSize: 16 } };
// Fill reach (progress field value) at rest, hovered and pressed; a 0.5 softness dithers the leading edge.
const FILL = { solid: [0.8, 1.6, 1.1], outline: [-0.5, 0.6, 0.35] };

export function Button({
  variant = "solid",
  size = "md",
  mode, pattern, cell, palette, glyphs, speed, contrast, threshold,
  disabled,
  children,
  style,
  onPointerEnter, onPointerLeave, onPointerDown, onPointerUp,
  ...props
}: ButtonProps) {
  const tokens = { mode, pattern, cell, palette, glyphs, speed, contrast, threshold };
  const [state, setState] = useState(0);
  const { scheme } = useColorScheme();
  const colors = paletteColors(useDitherTokens(tokens).palette, scheme);
  const [bg, fg] = [colors[0], colors[colors.length - 1]];
  const solid = variant === "solid";
  const fill = FILL[variant][disabled ? 0 : state];
  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      onPointerEnter={(e) => (setState(1), onPointerEnter?.(e))}
      onPointerLeave={(e) => (setState(0), onPointerLeave?.(e))}
      onPointerDown={(e) => (setState(2), onPointerDown?.(e))}
      onPointerUp={(e) => (setState(1), onPointerUp?.(e))}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${fg}`,
        background: bg,
        font: "inherit",
        lineHeight: 1.2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : undefined,
        ...SIZES[size],
        ...style,
      }}
    >
      <Quantize
        source={{ kind: "field", field: "progress", params: { value: fill, softness: 0.5 } }}
        ease
        {...tokens}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      {/* The label sits on a solid chip so it stays legible over any fill. */}
      <span style={{ position: "relative", padding: "0 0.25em", background: solid ? fg : bg, color: solid ? bg : fg }}>{children}</span>
    </button>
  );
}
