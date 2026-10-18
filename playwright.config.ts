import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  // Software WebGL is slow on busy machines, so give assertions room before calling a flake.
  expect: { timeout: 10_000 },
  webServer: {
    command: 'npx vite build --mode e2e && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    // MapLibre needs WebGL; software rendering keeps CI and containers without a GPU working.
    launchOptions: {
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
})
