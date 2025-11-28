import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 🦾 ACCESSIBILITY TESTS - Cumplimiento WCAG
 *
 * Tests de accesibilidad usando axe-core para garantizar que la aplicación
 * cumple con los estándares WCAG 2.1 Level AA.
 *
 * Categorías de tests:
 * - Color contrast
 * - Keyboard navigation
 * - Screen reader support
 * - ARIA attributes
 * - Form labels
 * - Semantic HTML
 */

test.describe('Accessibility - Landing Page', () => {
  test('La página principal no tiene violaciones críticas de accesibilidad', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Ejecutar análisis de accesibilidad
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Verificar que no hay violaciones
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('HeroSection cumple estándares de accesibilidad', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Analizar solo la sección Hero
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#hero-section') // O el selector de tu Hero
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('CourseCatalog cumple estándares de accesibilidad', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Scroll a catálogo para cargarlo
    await page.locator('#cursos').scrollIntoViewIfNeeded();

    const accessibilityScanResults = await new AxeBuilder({ page }).include('#cursos').analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('PricingSection cumple estándares de accesibilidad', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    await page.locator('#precios').scrollIntoViewIfNeeded();

    const accessibilityScanResults = await new AxeBuilder({ page }).include('#precios').analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Modal de Inscripción', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // Abrir modal
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Esperar a que el modal esté visible
    await page.locator('text=Inscripción Colonia de Verano').first().waitFor();
  });

  test('Modal de inscripción no tiene violaciones de accesibilidad', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Si hay violaciones, mostrar detalles para debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Violaciones encontradas:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.help}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Formulario de inscripción tiene labels apropiados', async ({ page }) => {
    // Verificar que todos los inputs tienen labels asociados
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const id = await input.getAttribute('id');
      const hasLabel = await page.locator(`label[for="${id}"]`).count();

      // El input debe tener una de estas opciones para accesibilidad
      const hasAccessibleLabel = ariaLabel || ariaLabelledBy || hasLabel > 0;
      expect(hasAccessibleLabel).toBeTruthy();
    }
  });

  test('Modal puede ser cerrado con teclado (ESC)', async ({ page }) => {
    // Verificar que el modal está abierto
    const modalTitle = page.locator('text=Inscripción Colonia de Verano').first();
    await expect(modalTitle).toBeVisible();

    // Presionar ESC
    await page.keyboard.press('Escape');

    // Modal debería cerrarse
    await expect(modalTitle).not.toBeVisible();
  });
});

test.describe('Accessibility - Navegación por Teclado', () => {
  test('Todos los elementos interactivos son accesibles con Tab', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Contar elementos focuseables antes de empezar
    const focusableElements = await page
      .locator(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      .count();

    expect(focusableElements).toBeGreaterThan(0);

    // Verificar que los primeros elementos son focuseables
    for (let i = 0; i < Math.min(5, focusableElements); i++) {
      await page.keyboard.press('Tab');

      // Verificar que hay un elemento con foco
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });

      expect(focusedElement).toBeTruthy();
    }
  });

  test('Los botones principales tienen focus visible', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Buscar el primer botón CTA
    const ctaBtn = page.locator('button').first();
    await ctaBtn.focus();

    // Verificar que el botón tiene focus (outline u otro indicador visual)
    const hasFocusIndicator = await ctaBtn.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      // Verificar si tiene outline o ring (Tailwind)
      return (
        styles.outline !== 'none' ||
        styles.boxShadow.includes('rgb') ||
        el.matches(':focus-visible')
      );
    });

    expect(hasFocusIndicator).toBe(true);
  });

  test('Los links tienen estados de foco visibles', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Scroll para cargar todos los links
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const links = page.locator('a[href]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Probar el primer link
      const firstLink = links.first();
      await firstLink.focus();

      const hasFocusIndicator = await firstLink.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.boxShadow.includes('rgb') ||
          el.matches(':focus-visible')
        );
      });

      expect(hasFocusIndicator).toBe(true);
    }
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('Títulos principales tienen suficiente contraste', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // axe-core ya verifica esto, pero podemos hacer un test específico
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('h1, h2, h3')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast',
    );

    expect(contrastViolations).toEqual([]);
  });

  test('Botones tienen suficiente contraste', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('button')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast',
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe('Accessibility - ARIA y Semántica', () => {
  test('La página tiene un heading h1', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('Los headings siguen un orden lógico', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Las imágenes decorativas tienen alt vacío', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Los botones tienen texto descriptivo o aria-label', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('La landing page mobile no tiene violaciones de accesibilidad', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Los touch targets tienen tamaño mínimo de 44x44px', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // axe-core verifica esto con la regla 'target-size'
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['target-size'])
      .analyze();

    // Esta regla puede no estar disponible en todas las versiones de axe-core
    // Solo verificar si existen violaciones
    if (accessibilityScanResults.violations.length > 0) {
      const targetSizeViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'target-size',
      );
      expect(targetSizeViolations).toEqual([]);
    }
  });
});
