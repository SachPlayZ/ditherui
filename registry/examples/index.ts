import type { ComponentType } from "react";
import DitherFieldAsciiDemo from "./dither-field-ascii-demo";
import DitherFieldDemo from "./dither-field-demo";
import DitherFieldFieldsDemo from "./dither-field-fields-demo";
import DitherFieldPatternsDemo from "./dither-field-patterns-demo";
import DitherFieldProviderDemo from "./dither-field-provider-demo";

/** Every docs example by name; visual regression screenshots each one. */
export const examples: Record<string, ComponentType> = {
  "dither-field-demo": DitherFieldDemo,
  "dither-field-provider-demo": DitherFieldProviderDemo,
  "dither-field-patterns-demo": DitherFieldPatternsDemo,
  "dither-field-fields-demo": DitherFieldFieldsDemo,
  "dither-field-ascii-demo": DitherFieldAsciiDemo,
};
