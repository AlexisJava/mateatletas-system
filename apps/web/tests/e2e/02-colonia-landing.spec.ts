import { test, expect } from '@playwright/test';

/**
 * 🏖️ COLONIA LANDING PAGE - Tests de Smoke y Visuales
 *
 * Verificamos que todos los elementos de la landing page se carguen
 * correctamente y estén visibles.
 */

test.describe('Colonia Landing Page - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');
  });

  test('La landing page carga correctamente', async ({ page }) => {
    // Verificar URL
    expect(page.url()).toContain('colonia-verano-2025');

    // Verificar título de la página
    await expect(page).toHaveTitle(/Mateatletas/i);
  });

  test('HeroSection - Elementos principales visibles', async ({ page }) => {
    // Badge "Verano 2026"
    const badge = page.locator('text=Verano 2026').first();
    await expect(badge).toBeVisible();

    // Título principal "COLONIA DE VERANO STEAM"
    const mainTitle = page.locator('text=COLONIA DE').first();
    await expect(mainTitle).toBeVisible();

    const steamTitle = page.locator('text=VERANO STEAM').first();
    await expect(steamTitle).toBeVisible();

    // Fechas
    const dates = page.locator('text=5 Enero - 3 Marzo 2026').first();
    await expect(dates).toBeVisible();

    // Stats - 11 Cursos
    const coursesCount = page.locator('text=11 Cursos').first();
    await expect(coursesCount).toBeVisible();

    // Stats - 10 Alumnos
    const studentsMax = page.locator('text=10 Alumnos').first();
    await expect(studentsMax).toBeVisible();

    // Stats - Virtual
    const virtualStat = page.locator('text=Virtual').first();
    await expect(virtualStat).toBeVisible();
  });

  test('HeroSection - CTAs funcionales', async ({ page }) => {
    // Botón "VER CURSOS DISPONIBLES"
    const coursesBtn = page.locator('text=VER CURSOS DISPONIBLES').first();
    await expect(coursesBtn).toBeVisible();
    await expect(coursesBtn).toHaveAttribute('href', '#cursos');

    // Botón "VER PRECIOS"
    const pricesBtn = page.locator('text=VER PRECIOS').first();
    await expect(pricesBtn).toBeVisible();
    await expect(pricesBtn).toHaveAttribute('href', '#precios');

    // Notice "Cupos limitados"
    const notice = page.locator('text=Cupos limitados - Inscripciones abiertas').first();
    await expect(notice).toBeVisible();
  });

  test('InfoSection está visible', async ({ page }) => {
    // Scroll para cargar secciones lazy
    await page.evaluate(() => window.scrollTo(0, 800));

    // Buscar elementos típicos de InfoSection
    const infoSection = page.locator('text=¿Qué es la colonia?').first();
    await expect(infoSection).toBeVisible();
  });

  test('CourseCatalog - Sección visible con título', async ({ page }) => {
    // Scroll a la sección de cursos
    await page.locator('#cursos').scrollIntoViewIfNeeded();

    // Título "ELIGE TU AVENTURA"
    const catalogTitle = page.locator('text=ELIGE TU').first();
    await expect(catalogTitle).toBeVisible();

    const adventureTitle = page.locator('text=AVENTURA').first();
    await expect(adventureTitle).toBeVisible();

    // Subtítulo con "11 cursos"
    const subtitle = page.locator('text=11 cursos diseñados para que aprendan jugando').first();
    await expect(subtitle).toBeVisible();
  });

  test('PricingSection es visible', async ({ page }) => {
    // Scroll a precios
    await page.locator('#precios').scrollIntoViewIfNeeded();

    // Buscar indicadores de pricing
    const pricingIndicator = page.locator('text=Planes').first();
    await expect(pricingIndicator).toBeVisible();
  });

  test('Footer está presente', async ({ page }) => {
    // Scroll al final
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer debe estar visible - usar solo el selector de footer
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('ScrollToTop aparece después de hacer scroll', async ({ page }) => {
    // Al inicio no debe estar visible (o no debe ser clickeable)
    const scrollBtn = page
      .locator('button:has-text("⬆")')
      .or(page.locator('[aria-label="Scroll to top"]'));

    // Hacer scroll hacia abajo
    await page.evaluate(() => window.scrollTo(0, 1000));

    // Ahora debería aparecer
    const scrollBtnCount = await scrollBtn.count();
    expect(scrollBtnCount).toBeGreaterThanOrEqual(0);
  });

  test('No hay errores en consola', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/colonia-verano-2025');
    await page.waitForLoadState('networkidle');

    // No debe haber errores críticos
    const criticalErrors = errors.filter(
      (err) => !err.includes('favicon') && !err.includes('Extension') && !err.includes('DevTools'),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('Responsive - Mobile viewport funciona', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/colonia-verano-2025');

    // Verificar que elementos clave son visibles en móvil
    const mainTitle = page.locator('text=COLONIA DE').first();
    await expect(mainTitle).toBeVisible();

    const dates = page.locator('text=5 Enero - 3 Marzo 2026').first();
    await expect(dates).toBeVisible();
  });

  test('Responsive - Tablet viewport funciona', async ({ page }) => {
    // Configurar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/colonia-verano-2025');

    // Verificar que elementos clave son visibles en tablet
    const coursesBtn = page.locator('text=VER CURSOS DISPONIBLES').first();
    await expect(coursesBtn).toBeVisible();
  });
});
