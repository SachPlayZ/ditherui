"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens, FieldName } from "@/lib/dotgrain/types";

export type DitherFieldProps = Partial<DitherTokens> & {
  field?: Exclude<FieldName, "progress" | "rain" | "spin" | "shimmer" | "frame">;
  /** Field parameters, e.g. `{ scale: 3 }` for noise or `{ angle: 90 }` for linear. */
  params?: Record<string, number>;
  /** Brighten a soft spot under the pointer (mouse and touch). Off under reduced motion. */
  interactive?: boolean;
  /** Radius of the pointer spot in CSS pixels. */
  cursorRadius?: number;
  /** Announces the background as one image; omit when decorative. */
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function DitherField({
  field = "noise",
  params,
  interactive = true,
  cursorRadius,
  label,
  children,
  className,
  style,
  ref,
  ...tokens
}: DitherFieldProps) {
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      <Quantize
        source={{ kind: "field", field, params }}
        label={label}
        interactive={interactive}
        cursorRadius={cursorRadius}
        {...tokens}
        style={{ position: "absolute", inset: 0 }}
      />
      {children !== undefined && <div style={{ position: "relative" }}>{children}</div>}
    </div>
  );
}
