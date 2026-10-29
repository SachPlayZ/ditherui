export const REGISTRY_URL = "https://dotgrain.space/r";

export const PACKAGE_MANAGERS = {
  npm: "npx shadcn@latest",
  pnpm: "pnpm dlx shadcn@latest",
  yarn: "yarn shadcn@latest",
  bun: "bunx --bun shadcn@latest",
} as const;

export type PackageManager = keyof typeof PACKAGE_MANAGERS;

/** shadcn add command; `item` is a URL or a namespaced name like `@dotgrain/dither-field`. */
export function addCommand(item: string, pm: PackageManager = "npm"): string {
  return `${PACKAGE_MANAGERS[pm]} add ${item}`;
}
