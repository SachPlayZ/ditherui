export type ImageStatus = "loading" | "ready" | "error";

interface Entry {
  image: HTMLImageElement;
  status: ImageStatus;
  listeners: Set<() => void>;
  values: Map<string, Float32Array>;
}

const images = new Map<string, Entry>();

/** Rec. 709 luma of RGBA bytes, 0–1 per pixel. */
export function luminance(rgba: Uint8ClampedArray): Float32Array {
  const out = new Float32Array(rgba.length / 4);
  for (let i = 0; i < out.length; i++) {
    out[i] = (0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]) / 255;
  }
  return out;
}

function entry(src: string, crossOrigin?: "anonymous"): Entry {
  const key = `${crossOrigin ?? ""}|${src}`;
  let e = images.get(key);
  if (!e) {
    const image = new Image();
    const created: Entry = { image, status: "loading", listeners: new Set(), values: new Map() };
    const settle = (status: ImageStatus) => {
      created.status = status;
      created.listeners.forEach((cb) => cb());
    };
    image.onload = () => settle("ready");
    image.onerror = () => settle("error");
    if (crossOrigin) image.crossOrigin = crossOrigin;
    image.src = src;
    images.set(key, (e = created));
  }
  return e;
}

/** Load (once per src) and call back when its status changes; returns an unsubscribe. */
export function watchImage(src: string, crossOrigin: "anonymous" | undefined, onChange: () => void): () => void {
  const e = entry(src, crossOrigin);
  e.listeners.add(onChange);
  return () => e.listeners.delete(onChange);
}

/**
 * Luminance of the image cover-fitted to cols × rows marks, or the image's status while it can't be read.
 * Cached per size, so token changes never reload or re-sample it.
 */
export function imageValues(src: string, crossOrigin: "anonymous" | undefined, cols: number, rows: number, aspect: number): Float32Array | ImageStatus {
  const e = entry(src, crossOrigin);
  if (e.status !== "ready") return e.status;
  const key = `${cols}x${rows}x${aspect.toFixed(4)}`;
  let values = e.values.get(key);
  if (!values) {
    try {
      values = sample(e.image, e.image.naturalWidth, e.image.naturalHeight, cols, rows, aspect, false);
    } catch {
      // Tainted canvas (cross-origin image without CORS headers) or no 2D context: pixels can't be read.
      e.status = "error";
      e.listeners.forEach((cb) => cb());
      return "error";
    }
    e.values.set(key, values);
  }
  return values;
}

/** Luminance of the video's current frame cover-fitted to cols × rows marks, or its status while it has no frame. */
export function videoValues(video: HTMLVideoElement, cols: number, rows: number, aspect: number): Float32Array | ImageStatus {
  if (video.error) return "error";
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return "loading";
  try {
    return sample(video, video.videoWidth, video.videoHeight, cols, rows, aspect, true);
  } catch {
    return "error";
  }
}

// Video reads back every frame, so it gets a CPU-backed canvas; images keep the default (GPU) resampling.
const scratches = new Map<boolean, CanvasRenderingContext2D | null>();

/** Cover-fit a drawable into cols × rows: crop its longer side to the element's aspect. Throws if pixels can't be read. */
function sample(source: CanvasImageSource, iw: number, ih: number, cols: number, rows: number, aspect: number, frequent: boolean): Float32Array {
  if (!scratches.has(frequent)) scratches.set(frequent, document.createElement("canvas").getContext("2d", { willReadFrequently: frequent }));
  const scratch = scratches.get(frequent);
  if (!scratch) throw new Error("no 2D context");
  scratch.canvas.width = cols;
  scratch.canvas.height = rows;
  const sw = Math.min(iw, ih * aspect), sh = sw / aspect;
  scratch.imageSmoothingQuality = "high";
  scratch.drawImage(source, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, cols, rows);
  return luminance(scratch.getImageData(0, 0, cols, rows).data);
}
