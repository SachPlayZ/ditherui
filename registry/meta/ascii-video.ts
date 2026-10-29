import type { ComponentMeta } from "./types.ts";

export default {
  name: "ascii-video",
  title: "ASCII Video",
  description: "Plays a video file or the viewer's webcam as live ASCII, with a pause button and an accessible label.",
  category: "media",
  modes: ["ascii"],
  tier: "free",
  files: ["registry/ui/ascii-video.tsx"],
  props: [
    { name: "src", type: "string", description: "Video file or URL. Cross-origin videos need CORS headers and `crossOrigin`." },
    { name: "label", type: "string", description: "Required description of the video, announced in place of the canvas." },
    { name: "webcam", type: "boolean", default: "false", description: "Show a Start camera button; the webcam starts only when it is clicked." },
    { name: "width", type: "number", description: "Intrinsic width; with `height` it reserves the aspect ratio (default 16:9)." },
    { name: "height", type: "number", description: "Intrinsic height; with `width` it reserves the aspect ratio." },
    { name: "crossOrigin", type: '"anonymous"', description: "Request the video with CORS so its frames can be read." },
    { name: "speed", type: "number", default: "1", description: "Playback rate; 0 holds the first frame until the viewer presses Play." },
  ],
  example: { props: { src: "/examples/clip.webm", label: "A looping test pattern", width: 320, height: 180 } },
  knobs: ["palette", "glyphs", "cell", "contrast", "threshold", "speed"],
} satisfies ComponentMeta;
