"use client";

import { useImperativeHandle, useState, type CSSProperties, type Ref } from "react";
import { useDitherTokens, useReducedMotion } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import { useTrigger, type Trigger } from "@/lib/dotgrain/trigger";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type ScrambleTextProps = Partial<Omit<DitherTokens, "mode">> & {
  /** The real text: in the DOM, readable and selectable from the first frame. */
  children: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** When to scramble: on mount, on pointer hover, or the first time it scrolls into view. */
  trigger?: Trigger;
  /** Scramble length in milliseconds. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
};

export function ScrambleText({
  children,
  as: Tag = "span",
  trigger = "mount",
  duration = 900,
  className,
  style,
  ref,
  ...tokens
}: ScrambleTextProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { speed } = useDitherTokens({ ...tokens, mode: "ascii" });
  // Re-scrambles on mount when the text changes.
  const { start, onMouseEnter } = useTrigger(element, trigger, duration, !reduced && speed > 0, children);
  const active = start !== null;
  useImperativeHandle(ref, () => element!, [element]);

  return (
    <Tag
      ref={setElement}
      className={className}
      onMouseEnter={onMouseEnter}
      style={{
        position: "relative",
        display: Tag === "span" ? "inline-block" : undefined,
        transition: "color 150ms",
        ...style,
        // Hidden only visually while the overlay scrambles; screen readers and selection still get the text.
        color: active ? "transparent" : style?.color,
      }}
    >
      {children}
      {active && element && (
        <Quantize
          source={{ kind: "text", element, scramble: 1 }}
          {...tokens}
          mode="ascii"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />
      )}
    </Tag>
  );
}
