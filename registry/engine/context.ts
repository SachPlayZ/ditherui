import { render } from "./cpu";
import { FIELD_IDS, fieldParams } from "./fields";
import { resolvePalette } from "./palettes";
import { thresholdMap, type ThresholdMap } from "./patterns";
import { DITHER, getProgram } from "./programs";
import type { Frame } from "./types";

const UNIFORMS = ["uSize", "uTime", "uField", "uParams", "uCursor", "uContrast", "uThreshold", "uPalette", "uLevels", "uPattern"];

let gl: WebGL2RenderingContext | null | undefined;
let glCanvas: HTMLCanvasElement;
const textures = new WeakMap<ThresholdMap, WebGLTexture>();

// One WebGL2 context per page, shared by every view (browsers cap live contexts at ~16).
function getGL(): WebGL2RenderingContext | null {
  if (gl === undefined) {
    glCanvas = document.createElement("canvas");
    gl = glCanvas.getContext("webgl2", { antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
  }
  return gl;
}

function patternTexture(gl: WebGL2RenderingContext, map: ThresholdMap): WebGLTexture {
  let tex = textures.get(map);
  if (!tex) {
    tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, map.size, map.size, 0, gl.RED, gl.FLOAT, map.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    textures.set(map, tex);
  }
  return tex;
}

/** Render a frame into the view's own 2D canvas at quantized resolution (CSS upscales it). */
export function draw(canvas: HTMLCanvasElement, frame: Frame): void {
  const { width: w, height: h, source, tokens } = frame;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const g = getGL();
  if (!g || source.kind !== "field") {
    ctx.putImageData(new ImageData(render(frame), w, h), 0, 0);
    return;
  }
  if (glCanvas.width < w) glCanvas.width = w;
  if (glCanvas.height < h) glCanvas.height = h;

  const { program, uniforms: u } = getProgram(g, DITHER, UNIFORMS);
  const palette = resolvePalette(tokens.palette);
  g.useProgram(program);
  g.viewport(0, 0, w, h);
  g.uniform2f(u.uSize, w, h);
  g.uniform1f(u.uTime, frame.time);
  g.uniform1i(u.uField, FIELD_IDS[source.field]);
  g.uniform4fv(u.uParams, fieldParams(source.field, source.params));
  g.uniform4fv(u.uCursor, frame.cursor ?? [0, 0, 0, 0]);
  g.uniform1f(u.uContrast, tokens.contrast);
  g.uniform1f(u.uThreshold, tokens.threshold);
  g.uniform3fv(u.uPalette, [0, 1, 2, 3].flatMap((i) => palette[Math.min(i, palette.length - 1)]));
  g.uniform1i(u.uLevels, palette.length);
  g.activeTexture(g.TEXTURE0);
  g.bindTexture(g.TEXTURE_2D, patternTexture(g, thresholdMap(tokens.pattern)));
  g.uniform1i(u.uPattern, 0);
  g.drawArrays(g.TRIANGLES, 0, 3);
  // The viewport sits at the bottom-left of the shared canvas.
  ctx.drawImage(glCanvas, 0, glCanvas.height - h, w, h, 0, 0, w, h);
}
