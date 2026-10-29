import { sample } from "./images";

const cache = new WeakMap<HTMLElement, { key: string; values: Float32Array }>();
let raster: CanvasRenderingContext2D | null | undefined;
let fonts = 0;
let watching = false;

function transform(text: string, style: CSSStyleDeclaration): string {
  if (style.textTransform === "uppercase") return text.toUpperCase();
  if (style.textTransform === "lowercase") return text.toLowerCase();
  return text;
}

/**
 * Mask of the element's text as the browser laid it out (1 = glyph), fitted to cols × rows marks over the
 * element's box. Each word is drawn where a Range reports it, so wrapping, alignment and inline styles match the DOM.
 */
export function textValues(element: HTMLElement, cols: number, rows: number): Float32Array | "loading" {
  const box = element.getBoundingClientRect();
  const w = Math.ceil(box.width), h = Math.ceil(box.height);
  if (!w || !h) return "loading";
  if (!watching) {
    // Text laid out in a fallback font moves once the web font arrives.
    document.fonts?.addEventListener("loadingdone", () => fonts++);
    watching = true;
  }
  const root = getComputedStyle(element);
  const key = `${element.textContent}|${root.font}|${root.fontSize}|${root.letterSpacing}|${w}x${h}|${cols}x${rows}|${fonts}`;
  const hit = cache.get(element);
  if (hit?.key === key) return hit.values;

  raster ??= document.createElement("canvas").getContext("2d");
  if (!raster) return "loading";
  const ctx = raster;
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  const range = document.createRange();
  const draw = (text: string, rect: DOMRect) => ctx.fillText(text, rect.left - box.left, (rect.top + rect.bottom) / 2 - box.top);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const style = getComputedStyle(node.parentElement ?? element);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    const text = transform(node.data, style);
    for (const word of node.data.matchAll(/\S+/g)) {
      range.setStart(node, word.index);
      range.setEnd(node, word.index + word[0].length);
      const rects = range.getClientRects();
      if (rects.length === 1) draw(text.slice(word.index, word.index + word[0].length), rects[0]);
      else {
        // The word breaks across lines: place each character on its own.
        for (let i = word.index; i < word.index + word[0].length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getClientRects()[0];
          if (rect) draw(text[i], rect);
        }
      }
    }
  }
  const values = sample(ctx.canvas, w, h, cols, rows, w / h, false);
  cache.set(element, { key, values });
  return values;
}

/** Stateless hash of (mark, tick) to [0, 1). */
function hash(i: number, tick: number): number {
  let h = Math.imul(i ^ Math.imul(tick + 1, 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Scramble a mask's lit marks: each gets a fresh random level per tick, `amount` 0 (as is) to 1 (fully random). Empty marks stay empty. */
export function scrambled(mask: Float32Array, amount: number, tick: number): Float32Array {
  return mask.map((v, i) => (v > 0.02 ? v * (1 - amount * hash(i, tick)) : v));
}
