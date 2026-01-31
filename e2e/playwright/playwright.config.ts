import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  reporter: [['list']],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm install && npm run dev',
    cwd: '../../demo/web/minimal-app',
    url: 'http://127.0.0.1:5173',
    timeout: 60_000,
    reuseExistingServer: false,
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
});
