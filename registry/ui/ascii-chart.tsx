"use client";

import type { CSSProperties, Ref } from "react";
import { GLYPH_ASPECT } from "@/lib/dotgrain/glyphs";
import { useDitherTokens } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type AsciiChartProps = Partial<Omit<DitherTokens, "mode" | "pattern" | "speed">> & {
  /** The series, one number per point. */
  data: number[];
  /** Line or bars filling the box, or an inline one-row sparkline. */
  type?: "line" | "bar" | "sparkline";
  /** What the data is; captions the hidden table that screen readers get. */
  label: string;
  /** Row headers for the hidden table, e.g. dates; defaults to 1, 2, 3… */
  labels?: string[];
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

const hidden: CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" };

export function AsciiChart({ data, type = "line", label, labels, className, style, ref, ...tokens }: AsciiChartProps) {
  const { cell } = useDitherTokens({ ...tokens, mode: "ascii" });
  const spark = type === "sparkline";
  // A sparkline is one glyph per point in a single row; the blocks ramp draws its partial heights.
  const size: CSSProperties = spark ? { display: "inline-block", verticalAlign: "middle", width: data.length * cell * GLYPH_ASPECT, height: cell } : { height: 160 };
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...size, ...style }}>
      <Quantize
        source={{ kind: "plot", series: data, type: type === "line" ? "line" : "bar" }}
        {...tokens}
        glyphs={tokens.glyphs ?? (spark ? "blocks" : undefined)}
        mode="ascii"
        style={{ position: "absolute", inset: 0 }}
      />
      <table style={hidden}>
        <caption>{label}</caption>
        <tbody>
          {data.map((v, i) => (
            <tr key={i}>
              <th scope="row">{labels?.[i] ?? i + 1}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
