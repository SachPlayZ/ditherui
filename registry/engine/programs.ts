import { FIELD_GLSL } from "./fields";

// Full-screen triangle from gl_VertexID; no vertex buffers needed.
export const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Mirrors cpu.ts: px is the top-left-origin mark coordinate, so the CPU and GPU
// index the threshold map identically. uField < 0 reads per-mark image luminance from uValues.
export const DITHER = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uSize;
uniform float uTime;
uniform int uField;
uniform vec4 uParams;
uniform highp sampler2D uValues;
uniform vec4 uCursor;
uniform float uContrast;
uniform float uThreshold;
uniform vec3 uPalette[4];
uniform int uLevels;
uniform highp sampler2D uPattern;
out vec4 outColor;
${FIELD_GLSL}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  vec2 uv = px / uSize;
  float aspect = uSize.x / uSize.y;
  float v = (uField < 0 ? texelFetch(uValues, ivec2(px), 0).r : field(uField, uv, aspect, uTime, uParams)) + cursorBump(uv, aspect, uCursor);
  float t = texelFetch(uPattern, ivec2(px) % textureSize(uPattern, 0), 0).r;
  float s = clamp((v - 0.5) * uContrast + 1.0 - uThreshold, 0.0, 1.0) * float(uLevels - 1);
  float b = floor(s);
  int i = min(uLevels - 1, int(b) + (s - b > t ? 1 : 0));
  outColor = vec4(uPalette[i] / 255.0, 1.0);
}`;

// One cell per mark: sample the source at the cell centre, pick a glyph by value and
// mask the background → band colour with the glyph atlas. Mirrors glyphCell() in glyphs.ts.
export const ASCII = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uSize;
uniform vec2 uCell;
uniform float uAspect;
uniform float uTime;
uniform int uField;
uniform vec4 uParams;
uniform highp sampler2D uValues;
uniform vec4 uCursor;
uniform float uContrast;
uniform float uThreshold;
uniform vec3 uPalette[4];
uniform int uLevels;
uniform int uGlyphs;
uniform sampler2D uAtlas;
out vec4 outColor;
${FIELD_GLSL}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y * uCell.y - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  vec2 uv = (cell + 0.5) / uSize;
  float v = (uField < 0 ? texelFetch(uValues, ivec2(cell), 0).r : field(uField, uv, uAspect, uTime, uParams)) + cursorBump(uv, uAspect, uCursor);
  float s = clamp((v - 0.5) * uContrast + 1.0 - uThreshold, 0.0, 1.0);
  int glyph = min(uGlyphs - 1, int(floor(s * float(uGlyphs))));
  int band = min(uLevels - 1, 1 + int(floor(s * float(uLevels - 1))));
  vec2 local = (px - cell * uCell) / uCell;
  float mask = texture(uAtlas, vec2((float(glyph) + local.x) / float(uGlyphs), local.y)).a;
  outColor = vec4(mix(uPalette[0], uPalette[band], mask) / 255.0, 1.0);
}`;

export interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

const cache = new WeakMap<WebGL2RenderingContext, Map<string, Program>>();

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`ditherui: ${gl.getShaderInfoLog(shader)}`);
  return shader;
}

/** Compile (once per context) and return a program with its uniform locations. */
export function getProgram(gl: WebGL2RenderingContext, fragment: string, uniforms: string[]): Program {
  let programs = cache.get(gl);
  if (!programs) cache.set(gl, (programs = new Map()));
  let p = programs.get(fragment);
  if (!p) {
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`ditherui: ${gl.getProgramInfoLog(program)}`);
    p = { program, uniforms: Object.fromEntries(uniforms.map((u) => [u, gl.getUniformLocation(program, u)])) };
    programs.set(fragment, p);
  }
  return p;
}
