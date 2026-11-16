// Ensure Electron is never forced into Node-only mode by parent terminal/IDE environment
delete process.env.ELECTRON_RUN_AS_NODE;

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron([
      {
        // Main process entry point (built as CommonJS for reliable native Electron runtime compatibility)
        entry: 'electron/main.ts',
        vite: {
          build: {
            lib: {
              entry: 'electron/main.ts',
              formats: ['cjs'],
              fileName: () => 'main.cjs',
            },
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                'koffi',
                '@smartspectra/node-sdk',
                '@smartspectra/node-sdk/main',
                '@smartspectra/node-sdk/preload',
              ],
            },
          },
        },
      },
      {
        // Preload script entry point (must be CommonJS for Chromium preload isolate)
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            lib: {
              entry: 'electron/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.cjs',
            },
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      // Direct renderer imports of @smartspectra/node-sdk strictly to constants.js (browser-safe, zero koffi)
      { find: /^@smartspectra\/node-sdk$/, replacement: path.resolve(__dirname, './node_modules/@smartspectra/node-sdk/js/constants.js') },
    ],
  },
  optimizeDeps: {
    exclude: ['koffi'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  // @ts-expect-error vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
