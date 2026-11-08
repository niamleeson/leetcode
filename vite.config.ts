import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { retainDeployedAssets } from './tools/build/retained-assets.mjs'

export default defineConfig({
  plugins: [react(), retainDeployedAssets()],
  base: '/leetcode/',
  build: {
    outDir: 'docs',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
