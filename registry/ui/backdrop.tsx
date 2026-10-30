"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens, FieldName } from "@/lib/dotgrain/types";

export type BackdropProps = Partial<Omit<DitherTokens, "mode" | "glyphs">> & {
  field?: Exclude<FieldName, "progress" | "frame">;
  /** Field parameters, e.g. `{ scale: 3 }` for noise. */
  params?: Record<string, number>;
  /** Cover the viewport behind everything instead of this element's box. */
  fixed?: boolean;
  /** Announces the texture as one image; omit when decorative. */
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function Backdrop({ field = "noise", params, fixed, label, children, className, style, ref, ...tokens }: BackdropProps) {
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      {/* Absolute or fixed, so the texture never takes part in layout. */}
      <Quantize
        source={{ kind: "field", field, params }}
        label={label}
        {...tokens}
        mode="dither"
        style={fixed ? { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" } : { position: "absolute", inset: 0 }}
      />
      {children !== undefined && <div style={{ position: "relative" }}>{children}</div>}
    </div>
  );
}
