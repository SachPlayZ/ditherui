"use client";

import { useState } from "react";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { Mode } from "@/lib/dotgrain/types";

/** A looping test clip through Quantize, for the video e2e spec. */
export function VideoCheck({ mode }: { mode?: Mode }) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  return (
    <div id="visual" style={{ width: 640, height: 360 }}>
      {/* Visually hidden, not display:none: Chromium doesn't decode a hidden paused video's first frame. */}
      <video
        ref={setVideo}
        src="/examples/clip.webm"
        muted
        loop
        playsInline
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {video && <Quantize source={{ kind: "video", element: video }} mode={mode} />}
    </div>
  );
}
