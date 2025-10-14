import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E de Mateatletas
 *
 * Documentación: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio donde están los tests
  testDir: './e2e',

  // Timeout para cada test
  timeout: 30000,

  // Timeout para expect()
  expect: {
    timeout: 5000,
  },

  // Reintentar tests fallidos (útil para tests flaky)
  retries: process.env.CI ? 2 : 1,

  // Número de workers (tests en paralelo)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Configuración compartida para todos los tests
  use: {
    // Base URL para todas las navegaciones
    baseURL: 'http://localhost:3000',

    // Screenshot solo cuando falla
    screenshot: 'only-on-failure',

    // Video solo cuando falla
    video: 'retain-on-failure',

    // Trace solo cuando falla
    trace: 'retain-on-failure',

    // Configuración de timeout para navegación
    navigationTimeout: 10000,

    // Configuración de timeout para acciones
    actionTimeout: 10000,
  },

  // Proyectos para diferentes browsers (solo Chromium por ahora)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Descomentar para testear en más browsers:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // Tests en mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Servidor web para los tests
  // Playwright iniciará el servidor automáticamente antes de correr los tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
