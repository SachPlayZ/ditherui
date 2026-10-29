"use client";

import type { DitherTokens } from "./types";

export const DEFAULT_TOKENS: DitherTokens = {
  mode: "dither",
  pattern: "bayer4",
  cell: 3,
  palette: "ink",
  glyphs: "standard",
  speed: 1,
  contrast: 1,
  threshold: 0.5,
};

/** Merge defaults with per-component overrides; undefined props fall through. */
export function useDitherTokens(overrides: Partial<DitherTokens>): DitherTokens {
  const tokens = { ...DEFAULT_TOKENS };
  for (const [k, v] of Object.entries(overrides)) if (v !== undefined) Object.assign(tokens, { [k]: v });
  if (overrides.cell === undefined && tokens.mode === "ascii") tokens.cell = 10;
  return tokens;
}
