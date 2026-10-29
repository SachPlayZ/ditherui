export interface Easer {
  /** True while any eased value is still short of its target. */
  settling(target: Record<string, number>): boolean;
  /** Advance toward the target; snaps on the first frame and when `snap` (reduced motion). */
  step(target: Record<string, number>, seconds: number, snap: boolean): Record<string, number>;
}

/** Frame-rate independent exponential ease for numeric params, e.g. a progress value. */
export function createEaser(rate = 10): Easer {
  let current: Record<string, number> | undefined;
  let last: number | undefined;
  const far = (target: Record<string, number>) =>
    !!current && Object.keys(target).some((k) => Math.abs((current![k] ?? target[k]) - target[k]) > 1e-3);
  return {
    settling: far,
    step(target, seconds, snap) {
      if (!current || snap || !far(target)) {
        current = { ...target };
        last = undefined;
        return current;
      }
      // After idle, the gap since the last eased frame is meaningless: take one nominal 60 Hz step.
      const dt = last === undefined ? 1 / 60 : Math.min(Math.max(seconds - last, 0), 0.1);
      const k = 1 - Math.exp(-dt * rate);
      const from = current;
      current = Object.fromEntries(Object.entries(target).map(([key, v]) => [key, (from[key] ?? v) + (v - (from[key] ?? v)) * k]));
      last = seconds;
      return current;
    },
  };
}
