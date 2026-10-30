"use client";

import { useEffect, useRef, useState } from "react";
import { convert } from "@/lib/convert";
import { GLYPH_ASPECT, RAMPS } from "@/lib/dotgrain/glyphs";
import { sample } from "@/lib/dotgrain/images";
import { PALETTES, paletteColors } from "@/lib/dotgrain/palettes";
import { DEFAULT_TOKENS, useColorScheme } from "@/lib/dotgrain/provider";
import type { DitherTokens, GlyphRampName, Mode, PaletteName, Pattern } from "@/lib/dotgrain/types";
import { DitherImage } from "@/registry/ui/dither-image";

const PATTERNS: Pattern[] = ["bayer2", "bayer4", "bayer8", "blueNoise", "atkinson", "floyd"];
const field = "flex flex-col gap-1 text-sm";
const control = "rounded-md border bg-fd-background px-2 py-1";
const button = "rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-fd-accent disabled:opacity-50";

function save(data: BlobPart, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Converts an image in the browser: the file is read locally and never uploaded. */
export function Converter() {
  const [file, setFile] = useState<{ url: string; name: string; bitmap: ImageBitmap } | null>(null);
  const [mode, setMode] = useState<Mode>("dither");
  const [pattern, setPattern] = useState<Pattern>("bayer4");
  const [palette, setPalette] = useState<PaletteName>("ink");
  const [glyphs, setGlyphs] = useState<GlyphRampName>("standard");
  const [cell, setCell] = useState(4);
  const [copied, setCopied] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const { scheme } = useColorScheme();
  useEffect(() => () => file?.bitmap.close(), [file]);

  const tokens: DitherTokens = { ...DEFAULT_TOKENS, mode, pattern, palette, glyphs, cell };
  const base = file?.name.replace(/\.[^.]+$/, "") ?? "dotgrain";
  const code = `<DitherImage src="/${file?.name ?? "image.png"}" alt="" mode="${mode}" ${mode === "dither" ? `pattern="${pattern}"` : `glyphs="${glyphs}"`} palette="${palette}" cell={${cell}} />`;

  async function download() {
    if (!file) return;
    const { bitmap } = file;
    const cols = Math.max(1, Math.round(bitmap.width / (mode === "ascii" ? cell * GLYPH_ASPECT : cell)));
    const rows = Math.max(1, Math.round(bitmap.height / cell));
    const values = sample(bitmap, bitmap.width, bitmap.height, cols, rows, bitmap.width / bitmap.height, false);
    const { png, text } = await convert({ values, width: cols, height: rows }, { ...tokens, palette: paletteColors(palette, scheme) });
    if (png) save(png as BlobPart, "image/png", `${base}-dither.png`);
    if (text) save(text, "text/plain", `${base}-ascii.txt`);
  }

  function downloadAsciiPng() {
    preview.current?.querySelector("canvas")?.toBlob((blob) => blob && save(blob, "image/png", `${base}-ascii.png`));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className={field}>
          Image
          <input
            type="file"
            accept="image/*"
            className={control}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile({ url: URL.createObjectURL(f), name: f.name, bitmap: await createImageBitmap(f) });
            }}
          />
        </label>
        <label className={field}>
          Mode
          <select className={control} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="dither">dither</option>
            <option value="ascii">ascii</option>
          </select>
        </label>
        {mode === "dither" ? (
          <label className={field}>
            Pattern
            <select className={control} value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)}>
              {PATTERNS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        ) : (
          <label className={field}>
            Glyphs
            <select className={control} value={glyphs} onChange={(e) => setGlyphs(e.target.value as GlyphRampName)}>
              {Object.keys(RAMPS).map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
        )}
        <label className={field}>
          Palette
          <select className={control} value={palette} onChange={(e) => setPalette(e.target.value as PaletteName)}>
            {Object.keys(PALETTES).map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className={field}>
          Cell: {cell}px
          <input type="range" min={1} max={24} value={cell} onChange={(e) => setCell(Number(e.target.value))} />
        </label>
      </div>

      {file ? (
        <div ref={preview} className="overflow-hidden rounded-xl border">
          <DitherImage src={file.url} alt={file.name} width={file.bitmap.width} height={file.bitmap.height} {...tokens} style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed p-8 text-center text-fd-muted-foreground">Choose an image. It stays in your browser; nothing is uploaded.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!file} onClick={download}>
          {mode === "dither" ? "Download PNG" : "Download TXT"}
        </button>
        {mode === "ascii" && (
          <button type="button" className={button} disabled={!file} onClick={downloadAsciiPng}>
            Download PNG
          </button>
        )}
        <button
          type="button"
          className={button}
          onClick={() => navigator.clipboard.writeText(code).then(() => (setCopied(true), setTimeout(() => setCopied(false), 1500)))}
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-xl border p-4 font-mono text-sm">{code}</pre>
    </div>
  );
}
