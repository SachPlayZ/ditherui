"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref } from "react";
import { draw } from "./context";
import { INK_PALETTES, paletteColors } from "./palettes";
import { trackPointer, type PointerTracker } from "./pointer";
import { useColorScheme, useDitherTokens } from "./provider";
import { getScheduler, type ViewHandle } from "./scheduler";
import type { DitherTokens, Source } from "./types";

export type QuantizeProps = Partial<DitherTokens> & {
  source: Source;
  /** Announces the canvas as one image; without it the canvas is decorative. */
  label?: string;
  /** Brighten a soft spot under the pointer. Off under reduced motion. */
  interactive?: boolean;
  /** Radius of the pointer spot in CSS pixels. */
  cursorRadius?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLCanvasElement>;
};

export function Quantize({ source, label, interactive = false, cursorRadius = 120, className, style, ref, ...overrides }: QuantizeProps) {
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
  const latest = useRef({ source, tokens, cursorRadius });
  const view = useRef<ViewHandle>(null);
  const pointer = useRef<PointerTracker>(null);
  useImperativeHandle(ref, () => canvas.current!, []);
  useEffect(() => {
    latest.current = { source, tokens, cursorRadius };
    view.current?.invalidate();
  });

  useEffect(() => {
    if (!interactive) return;
    const tracker = (pointer.current = trackPointer(canvas.current!, () => view.current?.invalidate()));
    return () => {
      tracker.dispose();
      pointer.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const element = canvas.current!;
    const handle = getScheduler().add({
      element,
      animated: () => latest.current.tokens.speed > 0 || !!pointer.current?.settling(),
      render({ seconds, width, height, still }) {
        const { source, tokens, cursorRadius } = latest.current;
        const w = Math.round(width / tokens.cell);
        const h = Math.round(height / tokens.cell);
        const spot = pointer.current && !still ? pointer.current.step(seconds) : undefined;
        const cursor = spot && ([...spot, cursorRadius / height] as [number, number, number, number]);
        if (w > 0 && h > 0) draw(element, { source, tokens, width: w, height: h, time: seconds * tokens.speed, cursor });
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
