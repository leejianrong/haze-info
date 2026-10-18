/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// Relative base keeps the build working under /haze-info/ on GitHub Pages (ADR-0001).
export default defineConfig({
  base: './',
  plugins: [svelte()],
  test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
})
