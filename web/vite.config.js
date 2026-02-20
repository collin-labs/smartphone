import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Tudo em um único bundle (melhor para FiveM NUI)
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  // Dev server (para testar no browser)
  server: {
    port: 3000,
    open: true
  }
});
