import { glyphGrid, render } from "./cpu";
import { FIELD_IDS, fieldParams } from "./fields";
import { clearGlyphAtlases, DEFAULT_FONT, GLYPH_ASPECT, glyphAtlas, rampGlyphs } from "./glyphs";
import { resolvePalette, type RGB } from "./palettes";
import { thresholdMap } from "./patterns";
import { ASCII, clearPrograms, DITHER, getProgram } from "./programs";
import { getScheduler } from "./scheduler";
import type { Frame } from "./types";

const SHARED = ["uSize", "uTime", "uField", "uParams", "uValues", "uCursor", "uContrast", "uThreshold", "uPalette", "uLevels"];
const DITHER_UNIFORMS = [...SHARED, "uPattern"];
const ASCII_UNIFORMS = [...SHARED, "uCell", "uAspect", "uGlyphs", "uAtlas"];

let gl: WebGL2RenderingContext | null | undefined;
let glCanvas: HTMLCanvasElement;
let textures = new WeakMap<object, WebGLTexture>();
const LIVE = {};

// One WebGL2 context per page, shared by every view (browsers cap live contexts at ~16).
function getGL(): WebGL2RenderingContext | null {
  if (gl === undefined) {
    glCanvas = document.createElement("canvas");
    // Dev-only escape hatch to see the Canvas2D path: `?cpu=1`.
    const forceCPU = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("cpu");
    gl = forceCPU ? null : glCanvas.getContext("webgl2", { antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
    // While lost, views draw on the CPU; on restore, rebuild programs and textures lazily and redraw everything.
    glCanvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      getScheduler().invalidateAll();
    });
    glCanvas.addEventListener("webglcontextrestored", () => {
      if (gl) clearPrograms(gl);
      textures = new WeakMap();
      getScheduler().invalidateAll();
    });
    // Atlases drawn with a fallback font are stale once a web font arrives.
    document.fonts?.addEventListener("loadingdone", () => {
      clearGlyphAtlases();
      getScheduler().invalidateAll();
    });
  }
  return gl;
}

/** Upload a texture once per source object (threshold map or glyph atlas). */
function texture(gl: WebGL2RenderingContext, key: object, upload: () => void): WebGLTexture {
  let tex = textures.get(key);
  if (!tex) {
    tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    upload();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    textures.set(key, tex);
  }
  return tex;
}

/**
 * Render a frame into the view's own 2D canvas. Dither renders one pixel per mark (CSS upscales it);
 * ASCII renders each cell at device resolution so glyphs stay sharp.
 */
export function draw(canvas: HTMLCanvasElement, frame: Frame): void {
  const { width: cols, height: rows, source, tokens } = frame;
  const ascii = tokens.mode === "ascii";
  const cellH = ascii ? Math.max(1, Math.round(tokens.cell * (frame.dpr ?? 1))) : 1;
  const cellW = ascii ? Math.max(1, Math.round(cellH * GLYPH_ASPECT)) : 1;
  const w = cols * cellW, h = rows * cellH;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const g = getGL();
  if (source.kind !== "field" && !frame.values) return;
  // Diffused frames are already quantized on the CPU, so they skip the GPU.
  if (!g || g.isContextLost() || frame.indices) {
    if (ascii) drawGlyphs(ctx, frame, cellW, cellH);
    else ctx.putImageData(new ImageData(render(frame), cols, rows), 0, 0);
    return;
  }
  if (glCanvas.width < w) glCanvas.width = w;
  if (glCanvas.height < h) glCanvas.height = h;

  const { program, uniforms: u } = getProgram(g, ascii ? ASCII : DITHER, ascii ? ASCII_UNIFORMS : DITHER_UNIFORMS);
  const palette = resolvePalette(tokens.palette);
  g.useProgram(program);
  g.viewport(0, 0, w, h);
  g.uniform2f(u.uSize, cols, rows);
  g.uniform1f(u.uTime, frame.time);
  if (source.kind === "field") {
    g.uniform1i(u.uField, FIELD_IDS[source.field]);
    g.uniform4fv(u.uParams, fieldParams(source.field, source.params));
  } else {
    const values = frame.values!;
    const upload = () => g.texImage2D(g.TEXTURE_2D, 0, g.R32F, cols, rows, 0, g.RED, g.FLOAT, values);
    g.uniform1i(u.uField, -1);
    g.activeTexture(g.TEXTURE1);
    // Image and text values are cached per size; video frames, scrambles and reveals change every draw, so they share one texture re-uploaded each time.
    const live = source.kind === "video" || (source.kind === "text" && !!(source.scramble || source.reveal));
    g.bindTexture(g.TEXTURE_2D, texture(g, live ? LIVE : values, upload));
    if (live) upload();
  }
  g.uniform1i(u.uValues, 1);
  g.uniform4fv(u.uCursor, frame.cursor ?? [0, 0, 0, 0]);
  g.uniform1f(u.uContrast, tokens.contrast);
  g.uniform1f(u.uThreshold, tokens.threshold);
  g.uniform3fv(u.uPalette, [0, 1, 2, 3].flatMap((i) => palette[Math.min(i, palette.length - 1)]));
  g.uniform1i(u.uLevels, palette.length);
  g.activeTexture(g.TEXTURE0);
  if (ascii) {
    const glyphs = rampGlyphs(tokens.glyphs);
    const atlas = glyphAtlas(glyphs, cellW, cellH, frame.font ?? DEFAULT_FONT);
    g.bindTexture(g.TEXTURE_2D, texture(g, atlas, () => g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, atlas)));
    g.uniform2f(u.uCell, cellW, cellH);
    g.uniform1f(u.uAspect, (cols * GLYPH_ASPECT) / rows);
    g.uniform1i(u.uGlyphs, glyphs.length);
    g.uniform1i(u.uAtlas, 0);
  } else {
    const map = thresholdMap(tokens.pattern);
    g.bindTexture(g.TEXTURE_2D, texture(g, map, () => g.texImage2D(g.TEXTURE_2D, 0, g.R32F, map.size, map.size, 0, g.RED, g.FLOAT, map.data)));
    g.uniform1i(u.uPattern, 0);
  }
  g.drawArrays(g.TRIANGLES, 0, 3);
  // The viewport sits at the bottom-left of the shared canvas.
  ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h);
}

const tints = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>();

/** The atlas recoloured to one palette colour (cached), so the CPU path blits glyphs like the shader. */
function tinted(atlas: HTMLCanvasElement, [r, g, b]: RGB): HTMLCanvasElement {
  let byColor = tints.get(atlas);
  if (!byColor) tints.set(atlas, (byColor = new Map()));
  const fill = `rgb(${r},${g},${b})`;
  let tint = byColor.get(fill);
  if (!tint) {
    tint = document.createElement("canvas");
    tint.width = atlas.width;
    tint.height = atlas.height;
    const t = tint.getContext("2d")!;
    t.drawImage(atlas, 0, 0);
    t.globalCompositeOperation = "source-in";
    t.fillStyle = fill;
    t.fillRect(0, 0, tint.width, tint.height);
    byColor.set(fill, tint);
  }
  return tint;
}

/** Canvas2D twin of the ASCII shader: background fill, then one tinted glyph per cell. */
export function drawGlyphs(ctx: CanvasRenderingContext2D, frame: Frame, cellW: number, cellH: number): void {
  const { width: cols, height: rows, tokens } = frame;
  const palette = resolvePalette(tokens.palette);
  const atlas = glyphAtlas(rampGlyphs(tokens.glyphs), cellW, cellH, frame.font ?? DEFAULT_FONT);
  const tints = palette.map((c) => tinted(atlas, c));
  const { glyphs, bands } = glyphGrid(frame);
  const [r, g, b] = palette[0];
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, cols * cellW, rows * cellH);
  for (let i = 0; i < glyphs.length; i++) {
    const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
    ctx.drawImage(tints[bands[i]], glyphs[i] * cellW, 0, cellW, cellH, x, y, cellW, cellH);
  }
}
