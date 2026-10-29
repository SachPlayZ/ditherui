/** Browser primitives the scheduler depends on; injectable so tests can drive fakes. */
export interface SchedulerEnv {
  requestFrame(callback: (ms: number) => void): void;
  isHidden(): boolean;
  onVisibilityChange(callback: () => void): void;
  reducedMotion(): boolean;
  onReducedMotionChange(callback: () => void): void;
  /** Calls back with whether the element is on screen; returns a disposer. */
  observeVisibility(element: Element, callback: (visible: boolean) => void): () => void;
  /** Calls back with the element's CSS size; returns a disposer. */
  observeSize(element: Element, callback: (width: number, height: number) => void): () => void;
  devicePixelRatio(): number;
}

export interface RenderInfo {
  seconds: number;
  width: number;
  height: number;
  /** Device pixel ratio, capped at 2. */
  dpr: number;
  /** Reduced motion is on: draw a static frame, no motion effects. */
  still: boolean;
}

export interface View {
  element: Element;
  /** Whether the view wants continuous frames (e.g. speed > 0). */
  animated(): boolean;
  render(info: RenderInfo): void;
}

export interface ViewHandle {
  /** Re-render on the next frame (tokens, source or anything else changed). */
  invalidate(): void;
  remove(): void;
}

interface Entry {
  view: View;
  visible: boolean;
  dirty: boolean;
  width: number;
  height: number;
}

export function createScheduler(env: SchedulerEnv) {
  const entries = new Set<Entry>();
  let pending = false;

  const wake = () => {
    if (pending || env.isHidden()) return;
    pending = true;
    env.requestFrame(frame);
  };

  const invalidateAll = () => {
    for (const e of entries) e.dirty = true;
    wake();
  };

  function frame(ms: number) {
    pending = false;
    if (env.isHidden()) return;
    const still = env.reducedMotion();
    const dpr = Math.min(2, env.devicePixelRatio());
    let again = false;
    for (const e of entries) {
      if (!e.visible || !e.width || !e.height) continue;
      const animate = !still && e.view.animated();
      if (animate || e.dirty) {
        e.dirty = false;
        e.view.render({ seconds: ms / 1000, width: e.width, height: e.height, dpr, still });
      }
      again ||= animate;
    }
    if (again) wake();
  }

  env.onVisibilityChange(wake);
  env.onReducedMotionChange(invalidateAll);

  return {
    /** Re-render every view on the next frame (e.g. fonts finished loading). */
    invalidateAll,
    add(view: View): ViewHandle {
      const e: Entry = { view, visible: false, dirty: true, width: 0, height: 0 };
      entries.add(e);
      const stopVisibility = env.observeVisibility(view.element, (visible) => {
        e.visible = visible;
        wake();
      });
      const stopSize = env.observeSize(view.element, (width, height) => {
        Object.assign(e, { width, height, dirty: true });
        wake();
      });
      return {
        invalidate() {
          e.dirty = true;
          wake();
        },
        remove() {
          entries.delete(e);
          stopVisibility();
          stopSize();
        },
      };
    },
  };
}

export type Scheduler = ReturnType<typeof createScheduler>;

function observerPool<O extends IntersectionObserver | ResizeObserver, A>(
  create: (cb: (entries: Array<{ target: Element } & A>) => void) => O,
) {
  const callbacks = new Map<Element, (entry: A) => void>();
  let observer: O | undefined;
  return (element: Element, callback: (entry: A) => void) => {
    observer ??= create((list) => list.forEach((entry) => callbacks.get(entry.target)?.(entry)));
    callbacks.set(element, callback);
    observer.observe(element);
    return () => {
      callbacks.delete(element);
      observer?.unobserve(element);
    };
  };
}

export function browserEnv(): SchedulerEnv {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const intersect = observerPool<IntersectionObserver, IntersectionObserverEntry>((cb) => new IntersectionObserver(cb));
  const resize = observerPool<ResizeObserver, ResizeObserverEntry>((cb) => new ResizeObserver(cb));
  return {
    requestFrame: (cb) => void requestAnimationFrame(cb),
    isHidden: () => document.hidden,
    onVisibilityChange: (cb) => document.addEventListener("visibilitychange", cb),
    reducedMotion: () => motion.matches,
    onReducedMotionChange: (cb) => motion.addEventListener("change", cb),
    observeVisibility: (el, cb) => intersect(el, (entry) => cb(entry.isIntersecting)),
    observeSize: (el, cb) => resize(el, (entry) => cb(entry.contentRect.width, entry.contentRect.height)),
    devicePixelRatio: () => window.devicePixelRatio || 1,
  };
}

let shared: Scheduler | undefined;

/** The page's single scheduler (one rAF loop for every view). */
export function getScheduler(): Scheduler {
  return (shared ??= createScheduler(browserEnv()));
}
