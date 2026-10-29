import { beforeEach, describe, expect, it } from "vitest";
import { createScheduler, type RenderInfo, type SchedulerEnv } from "./scheduler";

function fakeEnv() {
  let frames: Array<(ms: number) => void> = [];
  const visibility = new Map<Element, (v: boolean) => void>();
  const size = new Map<Element, (w: number, h: number) => void>();
  const listeners = { hidden: [] as Array<() => void>, motion: [] as Array<() => void> };
  const state = { hidden: false, reduced: false, dpr: 1, now: 0, requests: 0 };
  const env: SchedulerEnv = {
    requestFrame: (cb) => {
      state.requests++;
      frames.push(cb);
    },
    isHidden: () => state.hidden,
    onVisibilityChange: (cb) => void listeners.hidden.push(cb),
    reducedMotion: () => state.reduced,
    onReducedMotionChange: (cb) => void listeners.motion.push(cb),
    observeVisibility: (el, cb) => (visibility.set(el, cb), () => visibility.delete(el)),
    observeSize: (el, cb) => (size.set(el, cb), () => size.delete(el)),
    devicePixelRatio: () => state.dpr,
  };
  return {
    env,
    state,
    /** Run every queued frame once, 16 ms apart. */
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        const queued = frames;
        frames = [];
        state.now += 16;
        queued.forEach((cb) => cb(state.now));
      }
    },
    show: (el: Element, visible = true) => visibility.get(el)?.(visible),
    resize: (el: Element, w: number, h: number) => size.get(el)?.(w, h),
    setHidden(hidden: boolean) {
      state.hidden = hidden;
      listeners.hidden.forEach((cb) => cb());
    },
    setReduced(reduced: boolean) {
      state.reduced = reduced;
      listeners.motion.forEach((cb) => cb());
    },
  };
}

let fake: ReturnType<typeof fakeEnv>;
let scheduler: ReturnType<typeof createScheduler>;

beforeEach(() => {
  fake = fakeEnv();
  scheduler = createScheduler(fake.env);
});

function view(opts: { animated?: boolean } = {}) {
  const element = {} as Element;
  const renders: RenderInfo[] = [];
  const handle = scheduler.add({ element, animated: () => opts.animated ?? true, render: (info) => renders.push(info) });
  fake.resize(element, 100, 50);
  fake.show(element);
  return { element, renders, handle, opts };
}

describe("scheduler", () => {
  it("renders visible animated views every frame with size and time", () => {
    const v = view();
    fake.tick(3);
    expect(v.renders).toHaveLength(3);
    expect(v.renders[2]).toMatchObject({ width: 100, height: 50, seconds: 0.048, dpr: 1 });
  });

  it("skips offscreen views and resumes when they scroll back", () => {
    const v = view();
    fake.show(v.element, false);
    fake.tick(3);
    expect(v.renders).toHaveLength(0);
    fake.show(v.element, true);
    fake.tick(2);
    expect(v.renders).toHaveLength(2);
  });

  it("renders nothing in a hidden tab and resumes when visible", () => {
    const v = view();
    fake.setHidden(true);
    fake.tick(3);
    expect(v.renders).toHaveLength(0);
    fake.setHidden(false);
    fake.tick(2);
    expect(v.renders).toHaveLength(2);
  });

  it("under reduced motion renders once, then only when invalidated or resized", () => {
    fake.state.reduced = true;
    const v = view();
    fake.tick(5);
    expect(v.renders).toHaveLength(1);
    v.handle.invalidate();
    fake.tick(3);
    expect(v.renders).toHaveLength(2);
    fake.resize(v.element, 200, 100);
    fake.tick(3);
    expect(v.renders).toHaveLength(3);
    expect(v.renders[2]).toMatchObject({ width: 200, height: 100 });
  });

  it("applies reduced-motion changes live", () => {
    const v = view();
    fake.tick(2);
    fake.setReduced(true);
    fake.tick(4);
    expect(v.renders).toHaveLength(3); // 2 animated + 1 static frame after the change
    fake.setReduced(false);
    fake.tick(2);
    expect(v.renders).toHaveLength(5);
  });

  it("treats non-animated views (speed 0) like reduced motion", () => {
    const v = view({ animated: false });
    fake.tick(4);
    expect(v.renders).toHaveLength(1);
    v.handle.invalidate();
    fake.tick(2);
    expect(v.renders).toHaveLength(2);
  });

  it("caps the device pixel ratio at 2", () => {
    fake.state.dpr = 3;
    const v = view();
    fake.tick();
    expect(v.renders[0].dpr).toBe(2);
  });

  it("stops rendering removed views and idles with no work", () => {
    const v = view();
    fake.tick();
    v.handle.remove();
    fake.tick(3);
    expect(v.renders).toHaveLength(1);
  });

  it("runs one frame loop for many views", () => {
    const views = [view(), view(), view()];
    fake.state.requests = 0;
    fake.tick(2);
    expect(views.map((v) => v.renders.length)).toEqual([2, 2, 2]);
    expect(fake.state.requests).toBe(2);
  });
});
