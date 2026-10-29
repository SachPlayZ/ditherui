import { describe, expect, it } from "vitest";
import { createEaser } from "./ease";

describe("createEaser", () => {
  it("snaps on the first frame, then eases toward a new target and settles", () => {
    const easer = createEaser();
    expect(easer.step({ value: 0.2 }, 0, false)).toEqual({ value: 0.2 });
    expect(easer.settling({ value: 0.2 })).toBe(false);

    expect(easer.settling({ value: 0.8 })).toBe(true);
    const first = easer.step({ value: 0.8 }, 1, false).value;
    expect(first).toBeGreaterThan(0.2);
    expect(first).toBeLessThan(0.3); // one nominal frame after idle, not a jump

    let v = first;
    for (let s = 1 + 1 / 60; s < 3; s += 1 / 60) {
      const next = easer.step({ value: 0.8 }, s, false).value;
      expect(next).toBeGreaterThanOrEqual(v);
      v = next;
    }
    expect(v).toBe(0.8);
    expect(easer.settling({ value: 0.8 })).toBe(false);
  });

  it("snaps under reduced motion", () => {
    const easer = createEaser();
    easer.step({ value: 0 }, 0, false);
    expect(easer.step({ value: 1 }, 1, true)).toEqual({ value: 1 });
    expect(easer.settling({ value: 1 })).toBe(false);
  });
});
