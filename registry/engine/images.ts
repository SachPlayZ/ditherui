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
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    const { naturalWidth: iw, naturalHeight: ih } = e.image;
    // Cover: crop the image's longer side so it fills the element's aspect.
    const sw = Math.min(iw, ih * aspect), sh = sw / aspect;
    try {
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(e.image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, cols, rows);
      values = luminance(ctx!.getImageData(0, 0, cols, rows).data);
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
