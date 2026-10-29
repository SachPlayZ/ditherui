import type { ComponentType } from "react";
import AsciiRainDemo from "./ascii-rain-demo";
import AsciiVideoDemo from "./ascii-video-demo";
import AsciiVideoWebcamDemo from "./ascii-video-webcam-demo";
import DitherFieldAsciiDemo from "./dither-field-ascii-demo";
import DitherFieldDemo from "./dither-field-demo";
import DitherFieldFieldsDemo from "./dither-field-fields-demo";
import DitherFieldPatternsDemo from "./dither-field-patterns-demo";
import DitherImageDemo from "./dither-image-demo";
import DitherImagePatternsDemo from "./dither-image-patterns-demo";
import DitherRevealDemo from "./dither-reveal-demo";
import DitherProgressDemo from "./dither-progress-demo";
import ScrambleTextDemo from "./scramble-text-demo";
import DitherFieldProviderDemo from "./dither-field-provider-demo";

/** Every docs example by name; visual regression screenshots each one. */
export const examples: Record<string, ComponentType> = {
  "dither-field-demo": DitherFieldDemo,
  "dither-field-provider-demo": DitherFieldProviderDemo,
  "dither-field-patterns-demo": DitherFieldPatternsDemo,
  "dither-field-fields-demo": DitherFieldFieldsDemo,
  "dither-field-ascii-demo": DitherFieldAsciiDemo,
  "dither-image-demo": DitherImageDemo,
  "dither-image-patterns-demo": DitherImagePatternsDemo,
  "dither-progress-demo": DitherProgressDemo,
  "ascii-video-demo": AsciiVideoDemo,
  "ascii-video-webcam-demo": AsciiVideoWebcamDemo,
  "scramble-text-demo": ScrambleTextDemo,
  "dither-reveal-demo": DitherRevealDemo,
  "ascii-rain-demo": AsciiRainDemo,
};
