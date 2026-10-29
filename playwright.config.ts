import { defineConfig } from '@playwright/test';

// Baselines are Linux-only: run through `pnpm test:visual` (Playwright Docker image), same as CI.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 832, height: 1200 },
    // SwiftShader keeps WebGL2 output identical across machines without a GPU.
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
});
