"use client";

import { useState, type CSSProperties, type Ref } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type DitherImageProps = Partial<DitherTokens> & {
  src: string;
  /** Required: the real image stays in the DOM for screen readers and search engines. */
  alt: string;
  /** Intrinsic width; with `height` it reserves the aspect ratio so nothing shifts on load. */
  width?: number;
  height?: number;
  crossOrigin?: "anonymous";
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
};
const fill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

export function DitherImage({ src, alt, width, height, crossOrigin, className, style, ref, ...tokens }: DitherImageProps) {
  // If the pixels can't be read (CORS), show the plain image instead: content never disappears.
  const [failed, setFailed] = useState(false);
  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", aspectRatio: width && height ? `${width} / ${height}` : undefined, maxWidth: width, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- registry components can't assume next/image */}
      <img src={src} alt={alt} width={width} height={height} crossOrigin={crossOrigin} style={failed ? fill : visuallyHidden} />
      {!failed && (
        <Quantize
          source={{ kind: "image", src, crossOrigin }}
          onError={() => setFailed(true)}
          {...tokens}
          style={{ position: "absolute", inset: 0 }}
        />
      )}
    </div>
  );
}
