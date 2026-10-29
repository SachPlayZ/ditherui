"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref } from "react";
import { draw } from "./context";
import { INK_PALETTES, paletteColors } from "./palettes";
import { useColorScheme, useDitherTokens } from "./provider";
import { getScheduler, type ViewHandle } from "./scheduler";
import type { DitherTokens, Source } from "./types";

export type QuantizeProps = Partial<DitherTokens> & {
  source: Source;
  /** Announces the canvas as one image; without it the canvas is decorative. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLCanvasElement>;
};

export function Quantize({ source, label, className, style, ref, ...overrides }: QuantizeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const merged = useDitherTokens(overrides);
  const { preference, scheme } = useColorScheme();
  const colors = paletteColors(merged.palette, scheme);
  const tokens = { ...merged, palette: colors };
  // Painted before the first frame (and during SSR) so there is no flash; `ink` + system
  // follows the page's color-scheme via light-dark() because the server can't know it.
  const background =
    merged.palette === "ink" && preference === "system"
      ? `light-dark(${INK_PALETTES.light[0]}, ${INK_PALETTES.dark[0]})`
      : colors[0];
  const latest = useRef({ source, tokens });
  const view = useRef<ViewHandle>(null);
  useImperativeHandle(ref, () => canvas.current!, []);
  useEffect(() => {
    latest.current = { source, tokens };
    view.current?.invalidate();
  });

  useEffect(() => {
    const element = canvas.current!;
    const handle = getScheduler().add({
      element,
      animated: () => latest.current.tokens.speed > 0,
      render({ seconds, width, height }) {
        const { source, tokens } = latest.current;
        const w = Math.round(width / tokens.cell);
        const h = Math.round(height / tokens.cell);
        if (w > 0 && h > 0) draw(element, { source, tokens, width: w, height: h, time: seconds * tokens.speed });
      },
    });
    view.current = handle;
    return handle.remove;
  }, []);

  return (
    <canvas
      ref={canvas}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", background, ...style }}
    />
  );
}
