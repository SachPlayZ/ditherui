// Browser APIs jsdom lacks; tests that care install their own fakes.
if (typeof window !== "undefined") {
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
  globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
  globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof matchMedia;
}
