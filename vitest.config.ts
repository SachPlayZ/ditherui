import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['registry/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
  },
});
