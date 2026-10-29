import type { PaletteName } from "./types";

export type RGB = [number, number, number];
export type Scheme = "light" | "dark";

const PAPER = "#f2f0e9";
const INK = "#0a0a0a";

// Ordered background → foreground. `ink` flips with the colour scheme.
export const INK_PALETTES: Record<Scheme, string[]> = { light: [PAPER, INK], dark: [INK, PAPER] };

export const PALETTES: Record<PaletteName, string[]> = {
  ink: INK_PALETTES.dark,
  gameboy: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  amber: ["#140b00", "#ffb000"],
  phosphor: ["#001408", "#33ff66"],
  cga: ["#000000", "#55ffff", "#ff55ff", "#ffffff"],
  riso: ["#f2efe6", "#ff48b0", "#0078bf", "#1a1a1a"],
};

let probe: CanvasRenderingContext2D | null | undefined;

// shortcut: hex and rgb() parse anywhere; other CSS colours go through canvas normalization,
// which only works in a browser and only when it yields hex/rgb (not oklch); extend if users hit it.
function parseColor(color: string): RGB | null {
  const c = color.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(c)?.[1];
  if (hex) {
    const full = hex.length <= 4 ? hex.replace(/./g, "$&$&") : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB;
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(c);
  if (rgb) return [1, 2, 3].map((i) => Math.round(Math.min(255, Number(rgb[i])))) as RGB;
  if (probe === undefined) probe = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  if (!probe) return null;
  probe.fillStyle = "#010203";
  probe.fillStyle = c;
  const normalized = probe.fillStyle;
  return normalized === "#010203" && c !== "#010203" ? null : /^(#|rgb)/.test(normalized) ? parseColor(normalized) : null;
}

/** Palette as CSS colours for a scheme; throws a clear error for invalid custom palettes. */
export function paletteColors(palette: PaletteName | string[], scheme: Scheme = "dark"): string[] {
  if (palette === "ink") return INK_PALETTES[scheme];
  if (typeof palette === "string") {
    if (!(palette in PALETTES)) throw new Error(`dithercn: unknown palette "${palette}"`);
    return PALETTES[palette];
  }
  if (palette.length < 2 || palette.length > 4) {
    throw new Error(`dithercn: palettes need 2–4 colours, got ${palette.length}`);
  }
  const bad = palette.find((c) => !parseColor(c));
  if (bad !== undefined) throw new Error(`dithercn: can't parse palette colour "${bad}"; use hex or rgb()`);
  return palette;
}

export function resolvePalette(palette: PaletteName | string[], scheme: Scheme = "dark"): RGB[] {
  return paletteColors(palette, scheme).map((c) => parseColor(c)!);
}
