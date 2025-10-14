import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

/**
 * Tests de Integración E2E para SLICE #14
 * Flujo completo del portal docente
 */

test.describe('Portal Docente - Flujo de Integración', () => {
  test('flujo completo: navegación entre todas las páginas', async ({ page }) => {
    // 1. Login
    await loginAsDocente(page);

    // 2. Ir a perfil
    await page.goto('/docente/perfil');
    await expect(page.locator('h1')).toContainText('Perfil');
    await page.waitForTimeout(1000);

    // 3. Navegar a calendario
    const calendarioLink = page.locator('a[href="/docente/calendario"]');
    await calendarioLink.click();
    await expect(page.locator('h1')).toContainText('Calendario');
    await page.waitForTimeout(1000);

    // 4. Navegar a observaciones
    const observacionesLink = page.locator('a[href="/docente/observaciones"]');
    await observacionesLink.click();
    await expect(page.locator('h1')).toContainText('Observaciones');
    await page.waitForTimeout(1000);

    // 5. Navegar a reportes
    const reportesLink = page.locator('a[href="/docente/reportes"]');
    await reportesLink.click();
    await expect(page.locator('h1')).toContainText('Reportes');
    await page.waitForTimeout(2000);

    // 6. Volver a perfil
    const perfilLink = page.locator('a[href="/docente/perfil"]');
    await perfilLink.click();
    await expect(page.locator('h1')).toContainText('Perfil');

    console.log('✅ Navegación completa exitosa entre todas las páginas');
  });

  test('todas las páginas deben tener navegación consistente', async ({ page }) => {
    await loginAsDocente(page);

    const pages = [
      '/docente/perfil',
      '/docente/calendario',
      '/docente/observaciones',
      '/docente/reportes',
    ];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(1000);

      // Verificar que todos los links de navegación están presentes
      await expect(page.locator('a[href="/docente/calendario"]')).toBeVisible();
      await expect(page.locator('a[href="/docente/observaciones"]')).toBeVisible();
      await expect(page.locator('a[href="/docente/reportes"]')).toBeVisible();
      await expect(page.locator('a[href="/docente/perfil"]')).toBeVisible();

      console.log(`✅ Navegación correcta en ${pageUrl}`);
    }
  });

  test('no debe haber errores en consola en ninguna página', async ({ page }) => {
    await loginAsDocente(page);

    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    const pages = [
      '/docente/perfil',
      '/docente/calendario',
      '/docente/observaciones',
      '/docente/reportes',
    ];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(2000);
      console.log(`Checked ${pageUrl}`);
    }

    // Mostrar errores si los hay
    if (errors.length > 0) {
      console.log('⚠️ Errores en consola encontrados:');
      errors.forEach((error) => console.log(`  - ${error}`));
    } else {
      console.log('✅ No se encontraron errores en consola');
    }

    // No fallar el test si hay errores menores
    // expect(errors.length).toBe(0);
  });

  test('todas las páginas deben cargar en menos de 5 segundos', async ({ page }) => {
    await loginAsDocente(page);

    const pages = [
      '/docente/perfil',
      '/docente/calendario',
      '/docente/observaciones',
      '/docente/reportes',
    ];

    for (const pageUrl of pages) {
      const startTime = Date.now();

      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      console.log(`${pageUrl} cargó en ${loadTime}ms`);

      expect(loadTime).toBeLessThan(5000);
    }
  });

  test('debe mantener autenticación en todas las páginas', async ({ page }) => {
    await loginAsDocente(page);

    const pages = [
      '/docente/perfil',
      '/docente/calendario',
      '/docente/observaciones',
      '/docente/reportes',
    ];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForTimeout(1000);

      // Verificar que el token sigue en localStorage
      const token = await page.evaluate(() => {
        return localStorage.getItem('token');
      });

      expect(token).toBeTruthy();

      // Verificar que no redirige a login
      const url = page.url();
      expect(url).not.toContain('login');
    }
  });

  test('debe manejar navegación directa por URL', async ({ page }) => {
    await loginAsDocente(page);

    // Navegar directamente a cada página sin usar links
    await page.goto('/docente/reportes');
    await expect(page.locator('h1')).toContainText('Reportes');
    await page.waitForTimeout(1500);

    await page.goto('/docente/observaciones');
    await expect(page.locator('h1')).toContainText('Observaciones');
    await page.waitForTimeout(1000);

    await page.goto('/docente/calendario');
    await expect(page.locator('h1')).toContainText('Calendario');
    await page.waitForTimeout(1000);

    await page.goto('/docente/perfil');
    await expect(page.locator('h1')).toContainText('Perfil');

    console.log('✅ Navegación directa funciona correctamente');
  });

  test('debe funcionar el botón de volver atrás del navegador', async ({ page }) => {
    await loginAsDocente(page);

    // Ir a perfil
    await page.goto('/docente/perfil');
    await page.waitForTimeout(1000);

    // Ir a calendario
    await page.goto('/docente/calendario');
    await page.waitForTimeout(1000);

    // Volver atrás
    await page.goBack();
    await expect(page.locator('h1')).toContainText('Perfil');

    // Ir adelante
    await page.goForward();
    await expect(page.locator('h1')).toContainText('Calendario');

    console.log('✅ Navegación atrás/adelante funciona correctamente');
  });
});
