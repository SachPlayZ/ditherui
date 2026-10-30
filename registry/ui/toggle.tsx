"use client";

import { useState, type ComponentProps } from "react";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { useColorScheme, useDitherTokens, useReducedMotion } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type ToggleProps = Omit<ComponentProps<"input">, "type" | "size" | keyof DitherTokens> &
  Partial<Omit<DitherTokens, "mode" | "glyphs">> & {
    /** Track height in CSS pixels; the width is twice that. */
    size?: number;
  };

export function Toggle({
  size = 24,
  pattern, cell, palette, speed, contrast, threshold,
  checked, defaultChecked, onChange, onFocus, onBlur,
  disabled, className, style, ...props
}: ToggleProps) {
  const tokens = { pattern, cell, palette, speed, contrast, threshold };
  const [own, setOwn] = useState(!!defaultChecked);
  const [focus, setFocus] = useState(false);
  const on = checked ?? own;
  const reduced = useReducedMotion();
  const { scheme } = useColorScheme();
  const colors = paletteColors(useDitherTokens({ ...tokens, mode: "dither" }).palette, scheme);
  const [bg, fg] = [colors[0], colors[colors.length - 1]];
  const thumb = size - 6;
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size * 2,
        height: size,
        border: `1px solid ${fg}`,
        background: bg,
        opacity: disabled ? 0.5 : undefined,
        outline: focus ? `2px solid ${fg}` : undefined,
        outlineOffset: 2,
        ...style,
      }}
    >
      <Quantize
        source={{ kind: "field", field: "progress", params: { value: on ? 1.3 : -0.3, softness: 0.3 } }}
        ease
        {...tokens}
        mode="dither"
        style={{ position: "absolute", inset: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: on ? size * 2 - thumb - 4 : 2,
          width: thumb,
          height: thumb,
          background: on ? bg : fg,
          transition: reduced ? undefined : "left 150ms ease-out",
        }}
      />
      {/* The real control: invisible but covering the track, so clicks, keyboard and forms are native. */}
      <input
        type="checkbox"
        role="switch"
        {...props}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(e) => (setOwn(e.target.checked), onChange?.(e))}
        onFocus={(e) => (setFocus(e.target.matches(":focus-visible")), onFocus?.(e))}
        onBlur={(e) => (setFocus(false), onBlur?.(e))}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </span>
  );
}
