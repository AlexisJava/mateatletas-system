import { defineConfig, devices } from '@playwright/test';

/**
 * ============================================================================
 * Playwright E2E Configuration - ENTERPRISE EDITION
 * ============================================================================
 *
 * Configuración multi-environment para testing end-to-end.
 *
 * Environments:
 * - Local (default): http://localhost:3000
 * - Staging: E2E_ENV=staging npx playwright test
 * - Production: E2E_ENV=production npx playwright test --grep @smoke
 *
 * Proyecto: Mateatletas
 */

// Determinar environment
const environment = process.env.E2E_ENV || 'local';

// Configuración por environment
const envConfig = {
  local: {
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:3001/api',
    workers: undefined,  // Usar todos los cores disponibles
    retries: 0,  // No retry en local para feedback rápido
  },
  staging: {
    baseURL: process.env.STAGING_WEB_URL || 'https://staging.mateatletasclub.com.ar',
    apiURL: process.env.STAGING_API_URL || 'https://mateatletas-system-staging.up.railway.app/api',
    workers: 2,  // Menos workers en staging para no sobrecargar
    retries: 2,  // 2 retries por flakiness de red
  },
  production: {
    baseURL: process.env.PRODUCTION_WEB_URL || 'https://www.mateatletasclub.com.ar',
    apiURL: process.env.PRODUCTION_API_URL || 'https://mateatletas-system-production.up.railway.app/api',
    workers: 1,  // Solo 1 worker en producción (smoke tests ligeros)
    retries: 3,  // 3 retries por seguridad
  },
};

const config = envConfig[environment as keyof typeof envConfig] || envConfig.local;

// Exponer la API URL al runtime de Playwright para helpers/scripts
if (!process.env.PLAYWRIGHT_API_URL) {
  process.env.PLAYWRIGHT_API_URL = config.apiURL;
}

export default defineConfig({
  testDir: './tests/e2e',

  // Ejecución en paralelo
  fullyParallel: true,

  // Forbid .only en CI
  forbidOnly: !!process.env.CI,

  // Retries según environment
  retries: config.retries,

  // Workers según environment
  workers: process.env.CI ? 1 : config.workers,

  // Timeouts
  timeout: 30000,  // 30s por test
  expect: {
    timeout: 10000,  // 10s para assertions
  },

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['list'],
  ],

  use: {
    // Base URL según environment
    baseURL: config.baseURL,

    // Tracing
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

    // Screenshots
    screenshot: 'only-on-failure',

    // Video
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Network
    actionTimeout: 10000,
    navigationTimeout: 15000,

    // Context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: environment === 'staging',  // Permitir SSL self-signed en staging

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'es-AR',
    },
  },

  // ============================================================================
  // Projects (Browsers)
  // ============================================================================
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Safari solo en CI o cuando se especifica
    ...(process.env.CI || process.env.TEST_SAFARI
      ? [
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],

  // ============================================================================
  // Web Server (solo para local)
  // ============================================================================
  webServer:
    environment === 'local'
      ? {
          command: 'cd apps/web && npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120000,
          stdout: 'ignore',
          stderr: 'pipe',
        }
      : undefined,
});
