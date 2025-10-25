import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Entorno de pruebas
    environment: 'jsdom',

    // Archivos de setup
    setupFiles: ['./src/test/setup.ts'],

    // Incluir archivos de test
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Excluir
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],

    // Cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Thresholds - mínimo 80% coverage
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },

      // Incluir
      include: [
        'src/**/*.{ts,tsx}',
      ],

      // Excluir de coverage
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.ts',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/test/**',
        'src/types/**',
        'src/**/*.stories.{ts,tsx}',
        // Archivos de Next.js
        'src/app/**/layout.tsx',
        'src/app/**/error.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/not-found.tsx',
      ],
    },

    // Globals
    globals: true,

    // Reporters
    reporters: ['verbose'],

    // Timeout
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
