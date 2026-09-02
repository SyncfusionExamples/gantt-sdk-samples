import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Presale Kanban Showcase.
// React JS, no TypeScript, served as a single-page app.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  }
});
