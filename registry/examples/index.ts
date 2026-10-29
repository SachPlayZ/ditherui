import type { ComponentType } from "react";
import DitherFieldDemo from "./dither-field-demo";
import DitherFieldPatternsDemo from "./dither-field-patterns-demo";
import DitherFieldProviderDemo from "./dither-field-provider-demo";

/** Every docs example by name; visual regression screenshots each one. */
export const examples: Record<string, ComponentType> = {
  "dither-field-demo": DitherFieldDemo,
  "dither-field-provider-demo": DitherFieldProviderDemo,
  "dither-field-patterns-demo": DitherFieldPatternsDemo,
};
