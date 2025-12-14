import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['rust-wasm-package'], // We'll add our WASM package here later
  },
  server: {
    open: true,
  }
});