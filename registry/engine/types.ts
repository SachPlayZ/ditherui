import type { PlotType } from "./plot";
import type { Reveal } from "./text";

export type Mode = "dither" | "ascii";
export type Pattern = "bayer2" | "bayer4" | "bayer8" | "blueNoise" | "atkinson" | "floyd";
export type PaletteName = "ink" | "gameboy" | "amber" | "phosphor" | "cga" | "riso";
export type GlyphRampName = "standard" | "blocks" | "binary" | "katakana";
export type FieldName = "noise" | "radial" | "linear" | "progress" | "rain" | "spin" | "shimmer" | "frame";

export interface DitherTokens {
  mode: Mode;
  pattern: Pattern;
  /** Mark size in CSS pixels. */
  cell: number;
  /** 2–4 colours, background → foreground. */
  palette: PaletteName | string[];
  /** Glyph ramp, background → foreground. */
  glyphs: GlyphRampName | string;
  /** Animation speed; 0 freezes. */
  speed: number;
  contrast: number;
  threshold: number;
}

export type Source =
  | { kind: "field"; field: FieldName; params?: Record<string, number> }
  | { kind: "image"; src: string; crossOrigin?: "anonymous" }
  /** Keep the element rendered (e.g. visually hidden), not `display: none`: browsers may not decode a hidden paused video's frames. */
  | { kind: "video"; element: HTMLVideoElement }
  /** The element's text as laid out in the DOM; the canvas should cover the element's box exactly. */
  | {
      kind: "text";
      element: HTMLElement;
      /** 0–1: re-randomise lit marks every tick, for a scramble. */
      scramble?: number;
      /** Dither the text in (or out) over a timed run. */
      reveal?: Reveal;
    }
  /** A data series drawn as bars or a line across the box. */
  | { kind: "plot"; series: readonly number[]; type: PlotType };

/** One render request: quantized size in marks, time in seconds. */
export interface Frame {
  source: Source;
  tokens: DitherTokens;
  width: number;
  height: number;
  time: number;
  /** Image sources: luminance 0–1 per mark, row-major, already fitted to width × height. */
  values?: Float32Array;
  /** Palette index per mark, already quantized (error diffusion); drawn as-is. */
  indices?: Uint8Array;
  /** Device pixel ratio (ASCII glyphs render at device resolution). */
  dpr?: number;
  /** Font family for ASCII glyphs. */
  font?: string;
  /** Soft bright spot: x, y in 0–1 uv, strength 0–1, radius as a fraction of height. */
  cursor?: [number, number, number, number];
}
