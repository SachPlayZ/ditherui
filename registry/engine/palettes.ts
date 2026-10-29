import type { PaletteName } from "./types";

export type RGB = [number, number, number];

// Ordered background → foreground.
export const PALETTES: Record<PaletteName, string[]> = {
  ink: ["#0a0a0a", "#f2f0e9"],
  gameboy: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  amber: ["#140b00", "#ffb000"],
  phosphor: ["#001408", "#33ff66"],
  cga: ["#000000", "#55ffff", "#ff55ff", "#ffffff"],
  riso: ["#f2efe6", "#ff48b0", "#0078bf", "#1a1a1a"],
};

function parseHex(color: string): RGB {
  const h = color.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function resolvePalette(palette: PaletteName | string[]): RGB[] {
  return (typeof palette === "string" ? PALETTES[palette] : palette).map(parseHex);
}
