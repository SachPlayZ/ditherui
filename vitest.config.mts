import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@/lib/dotgrain': fileURLToPath(new URL('./registry/engine', import.meta.url)) },
  },
  test: {
    include: ['registry/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
  },
});
