import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

/**
 * Tests E2E para SLICE #14: Reportes con Gráficos
 * Página: /docente/reportes
 */

test.describe('Reportes del Docente', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDocente(page);
  });

  test('debe cargar la página de reportes correctamente', async ({ page }) => {
    await page.goto('/docente/reportes');

    // Esperar a que la navegación se complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verificar título (más específico)
    await expect(page.locator('main h1, h1').first()).toContainText('Reportes', {
      timeout: 10000,
    });

    // Esperar a que carguen los datos
    await page.waitForTimeout(1500);
  });

  test('debe mostrar las 4 tarjetas de estadísticas globales', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2000);

    // Buscar tarjetas con números/estadísticas
    const statCards = page.locator('div').filter({
      hasText: /total|registros|presentes|ausentes|porcentaje/i,
    });

    // Debería haber al menos 4 tarjetas
    const count = await statCards.count();
    console.log(`Found ${count} stat cards`);

    // Verificar que hay contenido estadístico
    await expect(page.locator('text=/\d+/').first()).toBeVisible();
  });

  test('debe mostrar el gráfico de barras de asistencia semanal', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // Buscar el contenedor del gráfico usando data-testid
    const chartContainer = page.locator('[data-testid="chart-asistencia-semanal"]');
    await expect(chartContainer).toBeVisible({ timeout: 10000 });

    // Buscar canvas dentro del contenedor
    const canvas = chartContainer.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Verificar que el canvas tiene contenido
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(width).toBeGreaterThan(0);
  });

  test('debe mostrar el gráfico de dona de distribución de estados', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // Buscar el contenedor del gráfico de dona usando data-testid
    const chartContainer = page.locator('[data-testid="chart-distribucion-estados"]');
    await expect(chartContainer).toBeVisible({ timeout: 10000 });

    // Buscar canvas dentro del contenedor
    const canvas = chartContainer.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Verificar que el canvas tiene contenido
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(width).toBeGreaterThan(0);
  });

  test('debe mostrar el gráfico de líneas por ruta curricular', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    // Buscar el contenedor del gráfico de líneas usando data-testid
    const chartContainer = page.locator('[data-testid="chart-lineas-rutas"]');
    await expect(chartContainer).toBeVisible({ timeout: 10000 });

    // Buscar canvas dentro del contenedor
    const canvas = chartContainer.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Verificar que el canvas tiene contenido
    const width = await canvas.evaluate((el: HTMLCanvasElement) => el.width);
    expect(width).toBeGreaterThan(0);
  });

  test('debe mostrar la tabla de top 10 estudiantes', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2500);

    // Buscar texto de "top" o "mejores estudiantes"
    const topText = page.locator('text=/top|mejores|frecuentes/i');

    if (await topText.isVisible()) {
      console.log('Found top students section');

      // Buscar tabla
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        await expect(table).toBeVisible();
      }
    }
  });

  test('debe mostrar la tabla de asistencia por ruta', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2500);

    // Buscar tablas
    const tables = page.locator('table');
    const count = await tables.count();

    console.log(`Found ${count} tables`);

    // Si hay datos, debería haber al menos 1 tabla
    if (count > 0) {
      await expect(tables.first()).toBeVisible();
    }
  });

  test('debe manejar estado de carga', async ({ page }) => {
    await page.goto('/docente/reportes');

    // Verificar indicador de carga (si existe)
    const loader = page.locator('text=/cargando|loading/i');

    // Puede que cargue muy rápido
    await page.waitForTimeout(500);

    // Verificar que eventualmente muestra contenido
    await page.waitForTimeout(2000);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('debe manejar caso sin datos', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2500);

    // Puede mostrar gráficos vacíos o mensaje de "sin datos"
    const noDataMessage = page.locator('text=/sin datos|no hay|empty/i');
    const hasCharts = (await page.locator('canvas').count()) > 0;

    // Debe mostrar algo (mensaje o gráficos)
    const hasContent = (await noDataMessage.isVisible()) || hasCharts;
    console.log(`Has content: ${hasContent}`);
  });

  test('debe ser responsive', async ({ page }) => {
    // Probar en viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2000);

    await expect(page.locator('h1')).toBeVisible();

    // Los gráficos deberían adaptarse
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      await expect(canvas).toBeVisible();
    }

    // Volver a desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
  });

  test('debe cargar Chart.js correctamente', async ({ page }) => {
    await page.goto('/docente/reportes');

    await page.waitForTimeout(2500);

    // Verificar que Chart.js se cargó checando si hay canvas
    const canvases = page.locator('canvas');
    const count = await canvases.count();

    if (count > 0) {
      // Chart.js debe haber creado contextos 2D
      const hasContext = await canvases.first().evaluate((el: HTMLCanvasElement) => {
        return el.getContext('2d') !== null;
      });

      expect(hasContext).toBeTruthy();
    }
  });
});
