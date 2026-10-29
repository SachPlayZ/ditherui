import asciiVideo from "./ascii-video.ts";
import ditherField from "./dither-field.ts";
import ditherImage from "./dither-image.ts";
import ditherProgress from "./dither-progress.ts";
import scrambleText from "./scramble-text.ts";
import type { ComponentMeta } from "./types.ts";

export const components: ComponentMeta[] = [ditherField, ditherImage, ditherProgress, asciiVideo, scrambleText];
