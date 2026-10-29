"use client";

import { createContext, type ReactNode, use, useState } from "react";
import { DitherProvider } from "@/lib/dotgrain/provider";
import { PALETTES } from "@/lib/dotgrain/palettes";
import type { DitherTokens } from "@/lib/dotgrain/types";

type StyleTokens = Partial<Pick<DitherTokens, "mode" | "pattern" | "palette" | "cell">>;

const StyleContext = createContext<{ tokens: StyleTokens; setTokens: (tokens: StyleTokens) => void }>({
  tokens: {},
  setTokens: () => {},
});

/** Wraps the site in a DitherProvider driven by the style bar, so every preview restyles at once. */
export function SiteStyle({ font, children }: { font: string; children: ReactNode }) {
  const [tokens, setTokens] = useState<StyleTokens>({});
  return (
    <StyleContext value={{ tokens, setTokens }}>
      <DitherProvider {...tokens} font={font}>
        {children}
      </DitherProvider>
    </StyleContext>
  );
}

const PATTERNS = ["bayer2", "bayer4", "bayer8", "blueNoise"] as const;

/** Site-wide tokens: mode, pattern, palette and cell for every preview. */
export function StyleBar() {
  const { tokens, setTokens } = use(StyleContext);
  const mode = tokens.mode ?? "dither";
  const cell = tokens.cell ?? (mode === "ascii" ? 10 : 3);
  const set = (next: StyleTokens) => setTokens({ ...tokens, ...next });
  const select = "w-full rounded-md border bg-fd-background px-1.5 py-1";
  return (
    <fieldset className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 rounded-lg border p-2 text-xs">
      <legend className="px-1 font-medium">Style</legend>
      <label htmlFor="style-mode">mode</label>
      <select id="style-mode" className={select} value={mode} onChange={(e) => set({ mode: e.target.value as DitherTokens["mode"] })}>
        <option>dither</option>
        <option>ascii</option>
      </select>
      <label htmlFor="style-pattern">pattern</label>
      <select
        id="style-pattern"
        className={select}
        value={tokens.pattern ?? "bayer4"}
        onChange={(e) => set({ pattern: e.target.value as DitherTokens["pattern"] })}
      >
        {PATTERNS.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <label htmlFor="style-palette">palette</label>
      <select id="style-palette" className={select} value={(tokens.palette as string) ?? "ink"} onChange={(e) => set({ palette: e.target.value as keyof typeof PALETTES })}>
        {Object.keys(PALETTES).map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <label htmlFor="style-cell">cell</label>
      <span className="flex items-center gap-2">
        <input id="style-cell" className="min-w-0 flex-1" type="range" min={1} max={24} value={cell} onChange={(e) => set({ cell: Number(e.target.value) })} />
        <output className="w-5 text-right tabular-nums">{cell}</output>
      </span>
      <button type="button" className="col-span-2 justify-self-start text-fd-muted-foreground hover:text-fd-foreground" onClick={() => setTokens({})}>
        Reset
      </button>
    </fieldset>
  );
}
