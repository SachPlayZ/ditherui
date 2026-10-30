"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties, type Ref } from "react";
import { GLYPH_ASPECT } from "@/lib/dotgrain/glyphs";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { useColorScheme, useDitherFont, useDitherTokens, useReducedMotion } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type TerminalProps = Partial<Omit<DitherTokens, "mode" | "pattern">> & {
  /** One string per line, shown as real DOM text. */
  lines: string[];
  /** Type the lines out on mount; the full text is in the DOM throughout. */
  typing?: boolean;
  /** Characters per second at speed 1. */
  rate?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

const subscribe = () => () => {};

export function Terminal({ lines, typing = false, rate = 40, className, style, ref, ...tokens }: TerminalProps) {
  const { cell, speed, palette } = useDitherTokens({ ...tokens, mode: "ascii" });
  const colors = paletteColors(palette, useColorScheme().scheme);
  const font = useDitherFont() ?? "ui-monospace, monospace";
  const reduced = useReducedMotion();
  // False on the server and during hydration, so server HTML always shows every line.
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const total = lines.join("").length;
  const animate = typing && hydrated && !reduced && speed > 0;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let n = 0;
    const id = setInterval(() => {
      setShown((n = Math.min(total, n + 1)));
      if (n >= total) clearInterval(id);
    }, 1000 / (rate * speed));
    return () => clearInterval(id);
  }, [animate, total, rate, speed]);

  const budget = animate ? shown : total;
  const pad = `${cell * 2}px ${Math.round(cell * GLYPH_ASPECT * 3)}px`;
  return (
    <div ref={ref} className={className} style={{ position: "relative", padding: pad, fontFamily: font, whiteSpace: "pre-wrap", color: colors[colors.length - 1], ...style }}>
      <Quantize source={{ kind: "field", field: "frame", params: { border: 1 } }} {...tokens} mode="ascii" style={{ position: "absolute", inset: 0 }} />
      {lines.map((line, i) => {
        const typed = line.slice(0, Math.max(0, budget - lines.slice(0, i).join("").length));
        return (
          // Untyped characters stay in the DOM, only transparent, so screen readers and layout get the full text.
          <div key={i} style={{ position: "relative", minHeight: "1lh" }}>
            {typed}
            {typed.length < line.length && <span style={{ color: "transparent" }}>{line.slice(typed.length)}</span>}
          </div>
        );
      })}
    </div>
  );
}
