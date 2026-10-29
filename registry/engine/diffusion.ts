import type { Pattern } from "./types";

export type DiffusionPattern = "atkinson" | "floyd";

export const isDiffusion = (pattern: Pattern): pattern is DiffusionPattern => pattern === "atkinson" || pattern === "floyd";

/**
 * Error-diffuse luminance into palette indices (n levels), row by row, left to right.
 * Self-contained (no imports or closures): its source is stringified into the Worker.
 */
export function diffuse(
  values: Float32Array,
  width: number,
  height: number,
  pattern: DiffusionPattern,
  contrast: number,
  threshold: number,
  n: number,
): Uint8Array {
  // [dx, dy, weight]: Floyd–Steinberg spreads all of the error; Atkinson spreads 6/8 for crisper highlights.
  const kernel =
    pattern === "floyd"
      ? [1, 0, 7 / 16, -1, 1, 3 / 16, 0, 1, 5 / 16, 1, 1, 1 / 16]
      : [1, 0, 1 / 8, 2, 0, 1 / 8, -1, 1, 1 / 8, 0, 1, 1 / 8, 1, 1, 1 / 8, 0, 2, 1 / 8];
  const s = new Float32Array(values.length);
  // Same tone mapping as ordered dither, so contrast and threshold behave identically.
  for (let i = 0; i < s.length; i++) s[i] = Math.min(1, Math.max(0, (values[i] - 0.5) * contrast + 1 - threshold)) * (n - 1);
  const out = new Uint8Array(values.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const q = Math.min(n - 1, Math.max(0, Math.round(s[i])));
      out[i] = q;
      const err = s[i] - q;
      for (let k = 0; k < kernel.length; k += 3) {
        const nx = x + kernel[k], ny = y + kernel[k + 1];
        if (nx >= 0 && nx < width && ny < height) s[ny * width + nx] += err * kernel[k + 2];
      }
    }
  }
  return out;
}

const WORKER_PIXELS = 512 * 512;
let worker: Worker | null | undefined;
let nextId = 0;
type Args = Parameters<typeof diffuse>;
const pending = new Map<number, { args: Args; done: (indices: Uint8Array) => void }>();

// Built from diffuse's own source at runtime, so installs need no bundler config for a worker file.
function getWorker(): Worker | null {
  if (worker === undefined) {
    try {
      const source = `const diffuse = (${diffuse.toString()});
onmessage = (e) => { const out = diffuse(...e.data.args); postMessage({ id: e.data.id, out }, [out.buffer]); };`;
      worker = new Worker(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));
      worker.onmessage = (e: MessageEvent<{ id: number; out: Uint8Array }>) => {
        pending.get(e.data.id)?.done(e.data.out);
        pending.delete(e.data.id);
      };
      // e.g. a CSP that blocks blob: workers: finish queued work here and stay on the main thread.
      worker.onerror = () => {
        worker = null;
        pending.forEach(({ args, done }) => done(diffuse(...args)));
        pending.clear();
      };
    } catch {
      worker = null;
    }
  }
  return worker;
}

const results = new WeakMap<Float32Array, Map<string, Uint8Array | "pending">>();

/**
 * Diffused indices for an image's values, cached per tone settings. Images over 512×512 diffuse in a
 * Worker when one is available: undefined is returned until then, and `onReady` fires once it lands.
 */
export function diffused(
  values: Float32Array,
  width: number,
  height: number,
  pattern: DiffusionPattern,
  contrast: number,
  threshold: number,
  n: number,
  onReady: () => void,
): Uint8Array | undefined {
  let byKey = results.get(values);
  if (!byKey) results.set(values, (byKey = new Map()));
  const key = `${pattern}|${contrast}|${threshold}|${n}`;
  const hit = byKey.get(key);
  if (hit) return hit === "pending" ? undefined : hit;
  const args: Args = [values, width, height, pattern, contrast, threshold, n];
  const w = width * height > WORKER_PIXELS && typeof Worker !== "undefined" ? getWorker() : null;
  if (!w) {
    const indices = diffuse(...args);
    byKey.set(key, indices);
    return indices;
  }
  const id = nextId++;
  byKey.set(key, "pending");
  pending.set(id, {
    args,
    done: (indices) => {
      byKey.set(key, indices);
      onReady();
    },
  });
  w.postMessage({ id, args });
  return undefined;
}
