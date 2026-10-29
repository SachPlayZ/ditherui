"use client";

import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from "react";
import { useDitherTokens, useReducedMotion } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type ScrambleTextProps = Partial<Omit<DitherTokens, "mode">> & {
  /** The real text: in the DOM, readable and selectable from the first frame. */
  children: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** When to scramble: on mount, on pointer hover, or the first time it scrolls into view. */
  trigger?: "mount" | "hover" | "inView";
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
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduced = useReducedMotion();
  const { speed } = useDitherTokens({ ...tokens, mode: "ascii" });
  const still = reduced || speed <= 0;
  useImperativeHandle(ref, () => element!, [element]);

  const start = () => {
    if (still) return;
    clearTimeout(timer.current);
    setActive(true);
    timer.current = setTimeout(() => setActive(false), duration);
  };
  const latest = useRef(start);
  useEffect(() => {
    latest.current = start;
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!element || trigger === "hover") return;
    if (trigger === "mount") {
      // Re-scrambles when the text changes.
      const frame = requestAnimationFrame(() => latest.current());
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      latest.current();
      observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, trigger, children]);

  return (
    <Tag
      ref={setElement}
      className={className}
      onMouseEnter={trigger === "hover" ? start : undefined}
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
