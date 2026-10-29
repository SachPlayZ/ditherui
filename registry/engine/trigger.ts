"use client";

import { useEffect, useRef, useState } from "react";

export type Trigger = "mount" | "hover" | "inView";

export interface TriggerState {
  /** `performance.now()` when the current run started; null when not running. Same clock as frame times. */
  start: number | null;
  /** Fired at least once. */
  fired: boolean;
  /** The last run has finished. */
  done: boolean;
  /** Spread onto the element; set only for the hover trigger. */
  onMouseEnter?: () => void;
}

/**
 * A `duration` ms run fired on mount (again when `key` changes), on hover, or the first time the element
 * scrolls into view. Does nothing while `enabled` is false (reduced motion, speed 0).
 */
export function useTrigger(element: Element | null, trigger: Trigger, duration: number, enabled: boolean, key?: unknown): TriggerState {
  const [run, setRun] = useState<{ start: number; done: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fire = () => {
    if (!enabled) return;
    clearTimeout(timer.current);
    const start = performance.now();
    setRun({ start, done: false });
    timer.current = setTimeout(() => setRun({ start, done: true }), duration);
  };
  const latest = useRef(fire);
  useEffect(() => {
    latest.current = fire;
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!element || trigger === "hover") return;
    if (trigger === "mount") {
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
  }, [element, trigger, key]);

  return {
    start: run && !run.done ? run.start : null,
    fired: !!run,
    done: !!run?.done,
    onMouseEnter: trigger === "hover" ? fire : undefined,
  };
}
