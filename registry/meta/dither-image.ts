import type { ComponentMeta } from "./types.ts";

export default {
  name: "dither-image",
  title: "Dither Image",
  description: "Converts any image to dither or ASCII live, with the real image kept for accessibility.",
  category: "media",
  modes: ["dither", "ascii"],
  tier: "free",
  files: ["registry/ui/dither-image.tsx"],
  props: [
    { name: "src", type: "string", description: "Image URL. Cross-origin images need CORS headers and `crossOrigin`." },
    { name: "alt", type: "string", description: "Required alt text for the real, visually hidden image." },
    { name: "width", type: "number", description: "Intrinsic width; with `height` it reserves the aspect ratio." },
    { name: "height", type: "number", description: "Intrinsic height; with `width` it reserves the aspect ratio." },
    { name: "crossOrigin", type: '"anonymous"', description: "Request the image with CORS so its pixels can be read." },
  ],
  example: { props: { src: "/examples/landscape.svg", alt: "A sun setting behind mountains over the sea", width: 1200, height: 800 } },
  knobs: ["mode", "pattern", "palette", "glyphs", "cell", "contrast", "threshold"],
} satisfies ComponentMeta;
