import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PROTOTYPE_PORT ?? 3737);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1728, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [{
    name: 'chromium',
    // Viewport last: the device preset carries its own and would win over `use` above.
    use: { ...devices['Desktop Chrome'], viewport: { width: 1728, height: 900 } },
  }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
