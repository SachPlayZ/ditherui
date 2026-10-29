"use client";

import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref } from "react";
import { draw } from "./context";
import { diffused, isDiffusion } from "./diffusion";
import { createEaser, type Easer } from "./ease";
import { INK_PALETTES, paletteColors } from "./palettes";
import { GLYPH_ASPECT } from "./glyphs";
import { imageValues, videoValues, watchImage } from "./images";
import { trackPointer, type PointerTracker } from "./pointer";
import { useColorScheme, useDitherFont, useDitherTokens } from "./provider";
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
  /** Ease changes to the field's numeric params (e.g. a progress value) instead of jumping; snaps under reduced motion. */
  ease?: boolean;
  /** Called when an image or video source can't be loaded or read (e.g. cross-origin media without CORS). */
  onError?: () => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLCanvasElement>;
};

export function Quantize({
  source,
  label,
  interactive = false,
  cursorRadius = 120,
  ease = false,
  onError,
  className,
  style,
  ref,
  ...overrides
}: QuantizeProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const merged = useDitherTokens(overrides);
  const { preference, scheme } = useColorScheme();
  const colors = paletteColors(merged.palette, scheme);
  const tokens = { ...merged, palette: colors };
  const font = useDitherFont();
  // Painted before the first frame (and during SSR) so there is no flash; `ink` + system
  // follows the page's color-scheme via light-dark() because the server can't know it.
  const background =
    merged.palette === "ink" && preference === "system"
      ? `light-dark(${INK_PALETTES.light[0]}, ${INK_PALETTES.dark[0]})`
      : colors[0];
  const latest = useRef({ source, tokens, cursorRadius, font, onError, ease });
  const easer = useRef<Easer>(null);
  const view = useRef<ViewHandle>(null);
  const pointer = useRef<PointerTracker>(null);
  useImperativeHandle(ref, () => canvas.current!, []);
  useEffect(() => {
    latest.current = { source, tokens, cursorRadius, font, onError, ease };
    view.current?.invalidate();
  });

  const image = source.kind === "image" ? source : undefined;
  useEffect(() => {
    if (image) return watchImage(image.src, image.crossOrigin, () => view.current?.invalidate());
  }, [image?.src, image?.crossOrigin]); // eslint-disable-line react-hooks/exhaustive-deps

  const video = source.kind === "video" ? source.element : undefined;
  useEffect(() => {
    if (!video) return;
    // Paused videos draw on demand: a new frame, seek, play (restarts the loop) or pause.
    const events = ["loadeddata", "seeked", "play", "pause", "error"];
    const wake = () => view.current?.invalidate();
    events.forEach((e) => video.addEventListener(e, wake));
    return () => events.forEach((e) => video.removeEventListener(e, wake));
  }, [video]);

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
      animated: () => {
        const { source, tokens, ease } = latest.current;
        if (source.kind === "video" && !source.element.paused && !source.element.ended) return true;
        if (source.kind !== "field") return !!pointer.current?.settling();
        // Only noise changes with time; other fields redraw on change, pointer movement or easing.
        return (
          (tokens.speed > 0 && source.field === "noise") ||
          !!pointer.current?.settling() ||
          (ease && !!source.params && !!easer.current?.settling(source.params))
        );
      },
      render({ seconds, width, height, dpr, still }) {
        const { tokens, cursorRadius, font, onError, ease } = latest.current;
        let { source } = latest.current;
        if (ease && source.kind === "field" && source.params) {
          source = { ...source, params: (easer.current ??= createEaser()).step(source.params, seconds, still) };
        }
        const w = Math.round(width / (tokens.mode === "ascii" ? tokens.cell * GLYPH_ASPECT : tokens.cell));
        const h = Math.round(height / tokens.cell);
        const spot = pointer.current && !still ? pointer.current.step(seconds) : undefined;
        const cursor = spot && ([...spot, cursorRadius / height] as [number, number, number, number]);
        if (w <= 0 || h <= 0) return;
        let values: Float32Array | undefined;
        let indices: Uint8Array | undefined;
        if (source.kind !== "field") {
          const result =
            source.kind === "image"
              ? imageValues(source.src, source.crossOrigin, w, h, width / height)
              : videoValues(source.element, w, h, width / height);
          if (result === "error") onError?.();
          if (typeof result === "string") return;
          values = result;
          // Error diffusion is for still images; video falls back to an ordered pattern.
          if (source.kind === "image" && tokens.mode === "dither" && isDiffusion(tokens.pattern)) {
            const { pattern, contrast, threshold, palette } = tokens;
            indices = diffused(values, w, h, pattern, contrast, threshold, palette.length, () => view.current?.invalidate());
            if (!indices) return;
          }
        }
        draw(element, { source, tokens, width: w, height: h, time: seconds * tokens.speed, cursor, dpr, font, values, indices });
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
