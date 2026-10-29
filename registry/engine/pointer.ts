export interface PointerTracker {
  /** Still easing toward the pointer, so the view needs more frames. */
  settling(): boolean;
  /** Advance the easing; returns uv position and strength 0–1. */
  step(seconds: number): [number, number, number];
  dispose(): void;
}

/** Tracks the pointer (mouse, pen or touch) relative to an element and eases a soft spot toward it. */
export function trackPointer(element: Element, onChange: () => void): PointerTracker {
  let x = 0.5, y = 0.5, tx = 0.5, ty = 0.5, strength = 0, target = 0, last = 0;
  // Listen on window so content layered above the canvas doesn't swallow the events.
  const move = (e: PointerEvent) => {
    const r = element.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = (e.clientY - r.top) / r.height;
    const inside = tx >= 0 && tx <= 1 && ty >= 0 && ty <= 1;
    if (!target && inside) [x, y] = [tx, ty];
    target = inside ? 1 : 0;
    onChange();
  };
  const leave = () => {
    target = 0;
    onChange();
  };
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return {
    settling: () => Math.abs(strength - target) > 0.005 || Math.abs(x - tx) + Math.abs(y - ty) > 0.002,
    step(seconds) {
      // Frame-rate independent exponential ease; large gaps (tab switch) snap instead of lurching.
      const k = 1 - Math.exp(-Math.min(Math.max(seconds - last, 0), 0.1) * 10);
      last = seconds;
      x += (tx - x) * k;
      y += (ty - y) * k;
      strength += (target - strength) * k;
      return [x, y, strength];
    },
    dispose() {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    },
  };
}
