// Ensure Electron is never forced into Node-only mode by parent terminal/IDE environment
delete process.env.ELECTRON_RUN_AS_NODE;

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry point
        entry: 'electron/main.ts',
        vite: {
          build: {
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
        // Preload script entry point
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                '@smartspectra/node-sdk',
                '@smartspectra/node-sdk/preload',
              ],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@smartspectra/node-sdk$': path.resolve(__dirname, './node_modules/@smartspectra/node-sdk/js/constants.js'),
    },
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
    rollupOptions: {
      external: [
        'koffi',
        '@smartspectra/node-sdk',
        '@smartspectra/node-sdk/renderer',
        '@smartspectra/node-sdk/main',
        '@smartspectra/node-sdk/preload',
        '@smartspectra/node-sdk/messages',
      ],
    },
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
