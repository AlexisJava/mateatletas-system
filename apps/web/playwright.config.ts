import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright E2E Configuration - Mateatletas Web
 *
 * Configuración multi-environment para testing end-to-end.
 *
 * Environments:
 * - Local (default): yarn test:e2e
 * - Staging: E2E_ENV=staging yarn test:e2e
 * - Production: E2E_ENV=production yarn test:e2e --grep @smoke
 *
 * Features:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Mobile device testing (Android, iOS)
 * - Video/Screenshot on failures
 * - Multiple reporters (HTML, JSON, JUnit, GitHub)
 * - Auth setup para tests protegidos
 */

// Determinar environment
const environment = process.env.E2E_ENV || 'local';
const CI = !!process.env.CI;

// Configuración por environment
const envConfig = {
  local: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    apiURL: 'http://localhost:3001/api',
    workers: undefined,
    retries: 0,
  },
  staging: {
    baseURL: process.env.STAGING_WEB_URL || 'https://staging.mateatletasclub.com.ar',
    apiURL: process.env.STAGING_API_URL || 'https://mateatletas-system-staging.up.railway.app/api',
    workers: 2,
    retries: 2,
  },
  production: {
    baseURL: process.env.PRODUCTION_WEB_URL || 'https://www.mateatletasclub.com.ar',
    apiURL:
      process.env.PRODUCTION_API_URL || 'https://mateatletas-system-production.up.railway.app/api',
    workers: 1,
    retries: 3,
  },
};

const config = envConfig[environment as keyof typeof envConfig] || envConfig.local;

// Exponer la API URL al runtime de Playwright
if (!process.env.PLAYWRIGHT_API_URL) {
  process.env.PLAYWRIGHT_API_URL = config.apiURL;
}

// Workers: configurable via env var o environment
const WORKERS = process.env.PLAYWRIGHT_WORKERS
  ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
  : CI
    ? 1
    : config.workers;

// Path para storage de autenticación
const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/admin.json');

export default defineConfig({
  testDir: './tests/e2e',

  // Solo archivos .spec.ts en tests/e2e
  testMatch: '**/*.spec.ts',

  // Global setup/teardown
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  // Timeouts
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
  },

  // Ejecución en paralelo
  fullyParallel: true,

  // Forbid .only en CI
  forbidOnly: CI,

  // Retries según environment
  retries: CI ? 2 : config.retries,

  // Workers
  workers: WORKERS,

  // Reporters
  reporter: CI
    ? [
        ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['html', { open: 'on-failure' }], ['list']],

  use: {
    // Base URL según environment
    baseURL: config.baseURL,

    // Tracing
    trace: 'on-first-retry',

    // Screenshots
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: environment === 'staging',

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'es-AR',
    },
  },

  // Projects con setup de autenticación
  projects: [
    // === SETUP: Autenticación ===
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // === TESTS PÚBLICOS (sin auth) ===
    {
      name: 'public',
      testMatch: /0[1-3]-.*\.spec\.ts/, // smoke, colonia-landing, colonia-catalog
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // === TESTS AUTENTICADOS ===
    {
      name: 'chromium',
      testIgnore: /0[1-3]-.*\.spec\.ts|auth\.setup\.ts/, // Ignorar tests públicos y setup
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'firefox',
      testIgnore: /0[1-3]-.*\.spec\.ts|auth\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'webkit',
      testIgnore: /0[1-3]-.*\.spec\.ts|auth\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        storageState: STORAGE_STATE,
      },
    },

    // === MOBILE (autenticado) ===
    {
      name: 'Mobile Chrome',
      testIgnore: /0[1-3]-.*\.spec\.ts|auth\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 5'],
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'Mobile Safari',
      testIgnore: /0[1-3]-.*\.spec\.ts|auth\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: STORAGE_STATE,
      },
    },
  ],

  // Web Server (solo para local)
  webServer:
    environment === 'local'
      ? {
          command: 'yarn dev',
          url: config.baseURL,
          reuseExistingServer: !CI,
          timeout: 120 * 1000,
          stdout: 'pipe',
          stderr: 'pipe',
        }
      : undefined,
});
