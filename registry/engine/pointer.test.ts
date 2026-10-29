// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackPointer } from "./pointer";

const element = document.createElement("div");
element.getBoundingClientRect = () => ({ left: 100, top: 100, width: 200, height: 100 }) as DOMRect;
const move = (clientX: number, clientY: number) => window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY }));

let dispose = () => {};
afterEach(() => dispose());

describe("trackPointer", () => {
  it("eases strength up while the pointer is inside and back down after it leaves", () => {
    const onChange = vi.fn();
    const tracker = trackPointer(element, onChange);
    dispose = tracker.dispose;
    move(150, 125);
    expect(onChange).toHaveBeenCalled();
    expect(tracker.settling()).toBe(true);
    let spot = tracker.step(0);
    for (let t = 0.016; t < 1; t += 0.016) spot = tracker.step(t);
    expect(spot[0]).toBeCloseTo(0.25);
    expect(spot[1]).toBeCloseTo(0.25);
    expect(spot[2]).toBeGreaterThan(0.99);
    expect(tracker.settling()).toBe(false);
    move(10, 10);
    for (let t = 1; t < 2; t += 0.016) spot = tracker.step(t);
    expect(spot[2]).toBeLessThan(0.01);
  });

  it("stops listening once disposed", () => {
    const onChange = vi.fn();
    trackPointer(element, onChange).dispose();
    move(150, 125);
    expect(onChange).not.toHaveBeenCalled();
  });
});
