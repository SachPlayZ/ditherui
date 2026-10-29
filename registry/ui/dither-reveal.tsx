"use client";

import { useImperativeHandle, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type Ref } from "react";
import { useDitherTokens, useReducedMotion } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import { useTrigger, type Trigger } from "@/lib/dotgrain/trigger";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type DitherRevealProps = Partial<Omit<DitherTokens, "mode" | "glyphs">> & {
  /** The real text: always in the DOM and selectable. */
  children: ReactNode;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** When to run: the first time it scrolls into view, on mount, or on pointer hover. */
  trigger?: Trigger;
  /** Dither the text in (appear) or out (disappear). */
  direction?: "in" | "out";
  /** Run length in milliseconds. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
};

const subscribe = () => () => {};

export function DitherReveal({
  children,
  as: Tag = "span",
  trigger = "inView",
  direction = "in",
  duration = 1200,
  className,
  style,
  ref,
  ...tokens
}: DitherRevealProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  // False on the server and during hydration: the text is never hidden before JavaScript can reveal it.
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const reduced = useReducedMotion();
  const { speed } = useDitherTokens({ ...tokens, mode: "dither" });
  const enabled = !reduced && speed > 0;
  const { start, fired, onMouseEnter } = useTrigger(element, trigger, duration, enabled);
  useImperativeHandle(ref, () => element!, [element]);

  // "in" hides the text while running, and before its first run unless it waits for a hover;
  // "out" hides it once its run starts. Reduced motion keeps it as is.
  const hidden = enabled && hydrated && (direction === "in" ? start !== null || (!fired && trigger !== "hover") : fired);
  return (
    <Tag
      ref={setElement}
      className={className}
      onMouseEnter={onMouseEnter}
      style={{
        position: "relative",
        display: Tag === "span" ? "inline-block" : undefined,
        ...style,
        // Hidden only visually; screen readers and selection still get the text.
        color: hidden ? "transparent" : style?.color,
      }}
    >
      {children}
      {start !== null && element && (
        <Quantize
          source={{ kind: "text", element, reveal: { start, duration, out: direction === "out" } }}
          {...tokens}
          mode="dither"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
      )}
    </Tag>
  );
}
