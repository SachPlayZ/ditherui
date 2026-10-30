"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Backdrop } from "@/components/ui/backdrop";
import { Terminal } from "@/components/ui/terminal";
import { paletteColors } from "@/lib/dotgrain/palettes";
import { useColorScheme, useDitherTokens } from "@/lib/dotgrain/provider";
import type { PaletteName } from "@/lib/dotgrain/types";

export type HeroTerminalProps = {
  /** The headline, rendered as an h1. */
  title: ReactNode;
  description?: ReactNode;
  /** CTA slot, e.g. links or Buttons. */
  actions?: ReactNode;
  /** Terminal lines, typed out on mount. */
  lines: string[];
  palette?: PaletteName | string[];
  /** Backdrop contrast; keep it low behind text. */
  contrast?: number;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function HeroTerminal({ title, description, actions, lines, palette, contrast = 0.35, className, style, ref }: HeroTerminalProps) {
  const colors = paletteColors(useDitherTokens({ palette }).palette, useColorScheme().scheme);
  return (
    <Backdrop ref={ref} palette={palette} contrast={contrast} className={className} style={{ color: colors[colors.length - 1], ...style }}>
      {/* Two columns that wrap to one below ~700px, without media queries. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 32,
          alignItems: "center",
          padding: "clamp(24px, 6vw, 72px)",
        }}
      >
        <div style={{ display: "grid", gap: 16, padding: 16, background: colors[0] }}>
          <h1 style={{ margin: 0, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.05 }}>{title}</h1>
          {description && <p style={{ margin: 0, opacity: 0.8 }}>{description}</p>}
          {actions && <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{actions}</div>}
        </div>
        <Terminal lines={lines} typing palette={palette} style={{ minWidth: 0 }} />
      </div>
    </Backdrop>
  );
}
