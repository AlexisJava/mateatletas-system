import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E - Nivel Producción
 * Documentación: https://playwright.dev/docs/test-configuration
 *
 * Features:
 * - ✅ Multi-browser testing (Chrome, Firefox, Safari)
 * - ✅ Mobile device testing (Android, iOS)
 * - ✅ Video recording on failures
 * - ✅ HAR recording para debugging de red
 * - ✅ Multiple reporters (HTML, JSON, JUnit, GitHub)
 * - ✅ Variables de entorno configurables
 * - ✅ Global setup/teardown
 */

// Variables de entorno con fallbacks
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const CI = !!process.env.CI;
const WORKERS = process.env.PLAYWRIGHT_WORKERS
  ? parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
  : CI
    ? 1
    : undefined;

export default defineConfig({
  testDir: './tests/e2e',

  /* Global setup/teardown - útil para seed de BD, login, etc. */
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  /* Timeout para cada test */
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: CI,

  /* Retry on CI only */
  retries: CI ? 2 : 0,

  /* Workers: configurable via env var */
  workers: WORKERS,

  /*
   * Multiple reporters para diferentes propósitos:
   * - html: Reporte visual interactivo
   * - json: Para análisis programático
   * - junit: Para integración con CI/CD (Jenkins, GitLab, etc.)
   * - github: Para GitHub Actions annotations
   * - list: Output en consola (solo en desarrollo)
   */
  reporter: CI
    ? [
        ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['html', { open: 'on-failure' }], ['list']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot only on failure */
    screenshot: 'only-on-failure',

    /* Video recording - solo en fallos para ahorrar espacio */
    video: 'retain-on-failure',

    /* HAR recording - captura requests/responses para debugging */
    ...(CI
      ? {}
      : {
          recordHar: {
            mode: 'minimal' as const,
            path: 'test-results/hars/',
          },
        }),

    /* Configuraciones adicionales */
    actionTimeout: 10000, // Timeout para acciones individuales
    navigationTimeout: 30000, // Timeout para navegación

    /* User agent personalizado (opcional) */
    // userAgent: 'PlaywrightTests/1.0',
  },

  /* Configure projects for major browsers */
  projects: [
    /* === DESKTOP BROWSERS === */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    /* === MOBILE BROWSERS === */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    /* === TABLET === */
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
      },
    },

    /* === BRANDED TESTS - Solo ejecutar en CI o con flag === */
    // Descomentá estos si querés probar navegadores específicos
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //   },
    // },

    // {
    //   name: 'Google Chrome',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn dev',
    url: BASE_URL,
    reuseExistingServer: !CI, // En CI siempre levantar servidor fresco
    timeout: 120 * 1000,
    stdout: 'pipe', // No mostrar logs del servidor
    stderr: 'pipe',
  },
});
