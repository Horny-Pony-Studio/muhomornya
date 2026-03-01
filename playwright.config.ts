import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:10004',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    port: 10004,
    reuseExistingServer: true,
    timeout: process.env.CI ? 120_000 : 60_000,
  },
});
