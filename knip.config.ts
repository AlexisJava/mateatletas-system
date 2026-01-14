import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    // Root workspace
    '.': {
      entry: [],
      project: ['scripts/**/*.{ts,mjs,js}'],
      ignore: ['**/dist/**', '**/node_modules/**', '**/.next/**'],
    },

    // NestJS Backend
    'apps/api': {
      entry: ['src/main.ts', 'prisma/seed.ts', 'test/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
      project: ['src/**/*.ts', 'prisma/**/*.ts', 'test/**/*.ts'],
      ignore: ['**/dist/**', '**/node_modules/**', 'prisma/migrations/**'],
      ignoreDependencies: [
        // NestJS uses dependency injection, these are runtime dependencies
        'reflect-metadata',
        'class-transformer',
        'class-validator',
        // Test utilities
        'supertest',
        'jest-mock-extended',
        // Build tools
        'ts-loader',
        'tsconfig-paths',
        'source-map-support',
        // Prisma CLI
        'prisma',
      ],
    },

    // Next.js Frontend
    'apps/web': {
      entry: [
        'src/app/**/{page,layout,loading,error,not-found,route}.tsx',
        'src/app/**/route.ts',
        'next.config.{js,mjs,ts}',
        'postcss.config.{js,mjs}',
        'tailwind.config.{js,ts}',
        'playwright.config.ts',
        'vitest.config.ts',
        'tests/**/*.spec.ts',
      ],
      project: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', 'eslint.config.mjs'],
      ignoreDependencies: [
        // Tailwind PostCSS
        '@tailwindcss/postcss',
        'tailwindcss',
        // Testing
        '@playwright/test',
        '@testing-library/jest-dom',
        'jsdom',
        'happy-dom',
        '@vitejs/plugin-react',
        // Monaco editor
        'monaco-editor',
        // Build tooling
        'eslint-config-next',
        'eslint',
      ],
      eslint: false,
    },

    // Contracts package
    'packages/contracts': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
      ignore: ['**/dist/**', '**/node_modules/**'],
    },

    // UI Design System package
    'packages/ui': {
      entry: ['src/index.ts'],
      project: ['src/**/*.{ts,tsx}'],
      ignore: ['**/dist/**', '**/node_modules/**'],
      ignoreDependencies: [
        // Peer dependencies (provided by consumer)
        'react',
        'react-dom',
        'tailwindcss',
      ],
    },

    // Game Engine package (Phaser)
    'packages/game-engine': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
      ignore: ['**/dist/**', '**/node_modules/**'],
      ignoreDependencies: [
        // Peer dependency
        'react',
      ],
    },

    // Lesson Engine package
    'packages/lesson-engine': {
      entry: ['src/index.ts'],
      project: ['src/**/*.{ts,tsx}'],
      ignore: ['**/dist/**', '**/node_modules/**'],
      ignoreDependencies: [
        // Peer dependencies
        'react',
        'react-dom',
      ],
    },
  },

  // Global ignores
  ignore: [
    '**/dist/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/*.d.ts',
  ],

  // Ignore binaries (CLI tools that are used but not imported)
  ignoreBinaries: [
    'turbo',
    'prisma',
    'nest',
    'next',
    'playwright',
    'vitest',
    'jest',
    'eslint',
    'prettier',
    'husky',
    'ts-node',
  ],

  // Rules configuration
  rules: {
    // Report unused files
    files: 'warn',
    // Report unused dependencies
    dependencies: 'warn',
    // Report unused devDependencies
    devDependencies: 'warn',
    // Report unlisted dependencies
    unlisted: 'warn',
    // Report unused exports
    exports: 'warn',
    // Report unused types
    types: 'warn',
    // Report duplicate exports
    duplicates: 'warn',
  },
};

export default config;
