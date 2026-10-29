export type Mode = "dither" | "ascii";
export type Pattern = "bayer2" | "bayer4" | "bayer8" | "blueNoise" | "atkinson" | "floyd";
export type PaletteName = "ink" | "gameboy" | "amber" | "phosphor" | "cga" | "riso";
export type GlyphRampName = "standard" | "blocks" | "binary" | "katakana";
export type FieldName = "noise";

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
  | { kind: "video"; element: HTMLVideoElement };

/** One render request: quantized size in marks, time in seconds. */
export interface Frame {
  source: Source;
  tokens: DitherTokens;
  width: number;
  height: number;
  time: number;
}
