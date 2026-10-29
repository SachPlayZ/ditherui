type Tick = (seconds: number) => void;

const views = new Set<Tick>();
let raf = 0;

function loop(now: number) {
  for (const tick of views) tick(now / 1000);
  raf = views.size ? requestAnimationFrame(loop) : 0;
}

/** Add a view to the single shared rAF loop; returns an unsubscribe. */
export function subscribe(tick: Tick): () => void {
  views.add(tick);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    views.delete(tick);
  };
}
