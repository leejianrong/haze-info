/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// MapLibre starts its worker from './maplibre-gl-worker.mjs' next to the chunk that loads it.
// The bundler does not emit those files, so copy them to assets/ ourselves.
function maplibreWorker(): Plugin {
  const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
  return {
    name: 'maplibre-worker',
    generateBundle() {
      for (const f of files) {
        const source = readFileSync(
          new URL(`./node_modules/maplibre-gl/dist/${f}`, import.meta.url),
        )
        this.emitFile({ type: 'asset', fileName: `assets/${f}`, source })
      }
    },
  }
}

// Relative base keeps the build working under /haze-info/ on GitHub Pages (ADR-0001).
export default defineConfig({
  base: './',
  plugins: [svelte(), maplibreWorker()],
  test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
})
