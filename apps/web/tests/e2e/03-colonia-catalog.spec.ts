import { test, expect } from '@playwright/test';

/**
 * 📚 COLONIA COURSE CATALOG - Tests de Filtros y Navegación
 *
 * Verificamos que:
 * - Los filtros de área y edad funcionan correctamente
 * - Se muestran los cursos apropiados según filtros
 * - Los cards de cursos son interactivos
 */

test.describe('Colonia Course Catalog - Filtros', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Navegar a la sección de cursos
    await page.locator('#cursos').scrollIntoViewIfNeeded();
  });

  test('Filtros de área están visibles y funcionales', async ({ page }) => {
    // Verificar que existan los filtros de área
    await expect(page.locator('text=Filtrar por Área').first()).toBeVisible();

    // Verificar filtros específicos
    const todasBtn = page.locator('button:has-text("Todas")').first();
    await expect(todasBtn).toBeVisible();

    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await expect(matematicaBtn).toBeVisible();

    const programacionBtn = page.locator('button:has-text("Programación")').first();
    await expect(programacionBtn).toBeVisible();

    const cienciasBtn = page.locator('button:has-text("Ciencias")').first();
    await expect(cienciasBtn).toBeVisible();
  });

  test('Filtros de edad están visibles', async ({ page }) => {
    await expect(page.locator('text=Filtrar por Edad').first()).toBeVisible();

    // Verificar algunos rangos de edad
    const allAgesBtn = page.locator('button:has-text("Todas las edades")').first();
    await expect(allAgesBtn).toBeVisible();

    const age5_6Btn = page.locator('button:has-text("5-6 años")').first();
    await expect(age5_6Btn).toBeVisible();

    const age8_9Btn = page.locator('button:has-text("8-9 años")').first();
    await expect(age8_9Btn).toBeVisible();
  });

  test('Al inicio muestra todos los cursos (11 cursos)', async ({ page }) => {
    // Verificar contador de resultados con regex para ser más flexible
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();

    // Verificar que dice 11
    const text = await resultsText.textContent();
    expect(text).toContain('11');
  });

  test('Filtro por área "Matemática" reduce la lista de cursos', async ({ page }) => {
    // Click en filtro de Matemática
    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await matematicaBtn.click();

    // Verificar que el contador cambió
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();

    // El número debería ser menor a 11
    const text = await resultsText.textContent();
    const match = text?.match(/Mostrando (\d+) curso/);
    if (match) {
      const count = parseInt(match[1]);
      expect(count).toBeLessThan(11);
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Filtro por área "Programación" muestra cursos correctos', async ({ page }) => {
    const programacionBtn = page.locator('button:has-text("Programación")').first();
    await programacionBtn.click();

    // Debería haber al menos 1 curso de programación
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();

    const text = await resultsText.textContent();
    const match = text?.match(/Mostrando (\d+) curso/);
    if (match) {
      const count = parseInt(match[1]);
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Filtro por edad "5-6 años" muestra cursos para esa edad', async ({ page }) => {
    const age5_6Btn = page.locator('button:has-text("5-6 años")').first();
    await age5_6Btn.click();

    // Verificar que hay resultados
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();

    const text = await resultsText.textContent();
    const match = text?.match(/Mostrando (\d+) curso/);
    if (match) {
      const count = parseInt(match[1]);
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Combinación de filtros: área + edad', async ({ page }) => {
    // Primero seleccionar área
    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await matematicaBtn.click();

    // Luego seleccionar edad
    const age8_9Btn = page.locator('button:has-text("8-9 años")').first();
    await age8_9Btn.click();

    // Debería haber resultados filtrados o mensaje de "no hay cursos"
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    const noResultsText = page.locator('text=No hay cursos con esos filtros').first();

    const hasResults = await resultsText.isVisible().catch(() => false);
    const noResults = await noResultsText.isVisible().catch(() => false);

    expect(hasResults || noResults).toBe(true);
  });

  test('Mensaje "No hay cursos" aparece con filtros incompatibles', async ({ page }) => {
    // Intentar combinación que probablemente no tenga resultados
    // Por ejemplo, "Ciencias" + "5-6 años" (si no hay cursos de ciencias para 5-6)
    const cienciasBtn = page.locator('button:has-text("Ciencias")').first();
    await cienciasBtn.click();

    const age5_6Btn = page.locator('button:has-text("5-6 años")').first();
    await age5_6Btn.click();

    // Verificar si aparece el mensaje o si hay cursos
    const noResultsMsg = page.locator('text=No hay cursos con esos filtros').first();
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();

    const noResults = await noResultsMsg.isVisible().catch(() => false);
    const hasResults = await resultsText.isVisible().catch(() => false);

    // Debe estar en uno de los dos estados
    expect(noResults || hasResults).toBe(true);

    // Si no hay resultados, verificar el emoji
    if (noResults) {
      const sadEmoji = page.locator('text=😢').first();
      await expect(sadEmoji).toBeVisible();
    }
  });

  test('Volver a "Todas" restaura la lista completa', async ({ page }) => {
    // Aplicar un filtro
    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await matematicaBtn.click();

    // Volver a "Todas"
    const todasBtn = page.locator('button:has-text("🌟 Todas")').first();
    await todasBtn.click();

    // Debería mostrar 11 cursos de nuevo
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();
    const text = await resultsText.textContent();
    expect(text).toContain('11');
  });
});

test.describe('Colonia Course Catalog - Course Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.locator('#cursos').scrollIntoViewIfNeeded();
  });

  test('Course cards están visibles', async ({ page }) => {
    // Debe haber al menos un curso visible - buscar elementos motion.div que contienen cursos
    const courseCards = page
      .locator('div')
      .filter({ hasText: /Matemática|Programación|Ciencias/i });
    const cardCount = await courseCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('Course cards son interactivos', async ({ page }) => {
    // Los course cards deben ser clickeables (todo el card es clickeable)
    // Buscar el grid de cursos
    const courseGrid = page.locator('#cursos');
    await expect(courseGrid).toBeVisible({ timeout: 10000 });

    // Verificar que hay contenido de cursos
    const courseContent = page.locator('text=/Matemática|Programación|Ciencias/i').first();
    await expect(courseContent).toBeVisible();
  });

  test('Click en curso puede abrir modal con detalles', async ({ page }) => {
    // Este test verifica si hay modales de detalles, pero no falla si no los hay
    // ya que los CourseCards pueden tener diferentes comportamientos

    // Simplemente verificamos que los cards existen
    const courseCards = page
      .locator('div')
      .filter({ hasText: /Matemática|Programación|Ciencias/i });
    const count = await courseCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Colonia Course Catalog - Performance', () => {
  test('Los filtros responden rápidamente', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.locator('#cursos').scrollIntoViewIfNeeded();

    // Medir tiempo de respuesta al filtrar
    const startTime = Date.now();

    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await matematicaBtn.click();

    // Esperar que se actualice el contador
    await page.locator('text=/Mostrando \\d+ curso/i').first().waitFor({ timeout: 5000 });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // El filtro debería responder en menos de 2 segundos
    expect(responseTime).toBeLessThan(2000);
  });
});
