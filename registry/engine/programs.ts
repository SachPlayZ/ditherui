import { FIELD_GLSL } from "./fields";

// Full-screen triangle from gl_VertexID; no vertex buffers needed.
export const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Mirrors cpu.ts: px is the top-left-origin mark coordinate, so the CPU and GPU
// index the threshold map identically.
export const DITHER = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uSize;
uniform float uTime;
uniform vec4 uParams;
uniform float uContrast;
uniform float uThreshold;
uniform vec3 uPalette[4];
uniform int uLevels;
uniform highp sampler2D uPattern;
out vec4 outColor;
${FIELD_GLSL}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  float v = field(px / uSize, uSize.x / uSize.y, uTime, uParams);
  float t = texelFetch(uPattern, ivec2(px) % textureSize(uPattern, 0), 0).r;
  float s = clamp((v - 0.5) * uContrast + 1.0 - uThreshold, 0.0, 1.0) * float(uLevels - 1);
  float b = floor(s);
  int i = min(uLevels - 1, int(b) + (s - b > t ? 1 : 0));
  outColor = vec4(uPalette[i] / 255.0, 1.0);
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
