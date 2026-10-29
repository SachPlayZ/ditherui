"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Scheme } from "./palettes";
import type { DitherTokens } from "./types";

export type ColorScheme = Scheme | "system";

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

interface ProviderValue {
  tokens: Partial<DitherTokens>;
  colorScheme: ColorScheme;
  font?: string;
}

const DitherContext = createContext<ProviderValue>({ tokens: {}, colorScheme: "system" });

const defined = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;

export type DitherProviderProps = Partial<DitherTokens> & {
  /** Scheme `ink` follows; `system` reads `<html class="dark">` / `data-theme`, then the OS setting. */
  colorScheme?: ColorScheme;
  /** Font family for ASCII glyphs. */
  font?: string;
  children?: ReactNode;
};

/** Sets tokens for a subtree; nested providers inherit and override. */
export function DitherProvider({ colorScheme, font, children, ...tokens }: DitherProviderProps) {
  const parent = useContext(DitherContext);
  const value: ProviderValue = {
    tokens: { ...parent.tokens, ...defined(tokens) },
    colorScheme: colorScheme ?? parent.colorScheme,
    font: font ?? parent.font,
  };
  return <DitherContext.Provider value={value}>{children}</DitherContext.Provider>;
}

/** Merge defaults, then provider tokens, then props; undefined props fall through. */
export function useDitherTokens(overrides: Partial<DitherTokens>): DitherTokens {
  const { tokens: provided } = useContext(DitherContext);
  const tokens = { ...DEFAULT_TOKENS, ...provided, ...defined(overrides) };
  if (provided.cell === undefined && overrides.cell === undefined && tokens.mode === "ascii") tokens.cell = 10;
  return tokens;
}

function systemScheme(): Scheme {
  const html = document.documentElement;
  const theme = html.dataset.theme ?? (html.classList.contains("dark") ? "dark" : html.classList.contains("light") ? "light" : "");
  if (theme === "dark" || theme === "light") return theme;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeScheme(onChange: () => void): () => void {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(onChange);
  media.addEventListener("change", onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  return () => {
    media.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/** The provider's colour-scheme preference and the scheme it resolves to right now. */
export function useColorScheme(): { preference: ColorScheme; scheme: Scheme } {
  const { colorScheme } = useContext(DitherContext);
  const system = useSyncExternalStore(subscribeScheme, systemScheme, () => "light" as Scheme);
  return { preference: colorScheme, scheme: colorScheme === "system" ? system : colorScheme };
}
