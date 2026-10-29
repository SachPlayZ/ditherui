"use client";

import { AsciiVideo } from "@/registry/ui/ascii-video";

export default function AsciiVideoDemo() {
  return <AsciiVideo src="/examples/clip.webm" label="A looping test pattern" width={320} height={180} />;
}
