"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Quantize } from "@/lib/ditherui/quantize";
import type { DitherTokens, FieldName } from "@/lib/ditherui/types";

export type DitherFieldProps = Partial<DitherTokens> & {
  field?: FieldName;
  params?: Record<string, number>;
  /** Announces the background as one image; omit when decorative. */
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

export function DitherField({ field = "noise", params, label, children, className, style, ref, ...tokens }: DitherFieldProps) {
  return (
    <div ref={ref} className={className} style={{ position: "relative", ...style }}>
      <Quantize source={{ kind: "field", field, params }} label={label} {...tokens} style={{ position: "absolute", inset: 0 }} />
      {children !== undefined && <div style={{ position: "relative" }}>{children}</div>}
    </div>
  );
}
