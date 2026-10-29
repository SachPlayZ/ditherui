"use client";

import { DitherImage } from "@/registry/ui/dither-image";

export default function DitherImageDemo() {
  return <DitherImage src="/examples/landscape.svg" alt="A sun setting behind mountains over the sea" width={1200} height={800} cell={3} />;
}
