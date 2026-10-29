import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // First match wins: the engine's install-path alias before the root alias.
    alias: [
      { find: '@/lib/dotgrain', replacement: fileURLToPath(new URL('./registry/engine', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('.', import.meta.url)) },
    ],
  },
  test: {
    include: ['registry/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
  },
});
