// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },

  server: {
    port: 5173,
    open: true
  },

  preview: {
    port: 4173
  }
})
