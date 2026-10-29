"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref } from "react";
import { draw } from "./context";
import { useDitherTokens } from "./provider";
import { subscribe } from "./scheduler";
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
  const tokens = useDitherTokens(overrides);
  const latest = useRef({ source, tokens });
  useImperativeHandle(ref, () => canvas.current!, []);
  useEffect(() => {
    latest.current = { source, tokens };
  });

  useEffect(() => {
    const el = canvas.current!;
    let size = { width: 0, height: 0 };
    const observer = new ResizeObserver(([entry]) => (size = entry.contentRect));
    observer.observe(el);
    const unsubscribe = subscribe((seconds) => {
      const { source, tokens } = latest.current;
      const width = Math.round(size.width / tokens.cell);
      const height = Math.round(size.height / tokens.cell);
      if (width > 0 && height > 0) draw(el, { source, tokens, width, height, time: seconds * tokens.speed });
    });
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", ...style }}
    />
  );
}
