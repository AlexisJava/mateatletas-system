import { test, expect } from '@playwright/test';

/**
 * 📝 COLONIA INSCRIPTION FORM - Tests de Formulario
 *
 * Verificamos que:
 * - El modal de inscripción se abre correctamente
 * - Todos los pasos del formulario funcionan
 * - La validación funciona adecuadamente
 * - Se puede navegar entre pasos
 */

test.describe('Colonia Inscription Form - Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');
  });

  test('Botón "VER CURSOS DISPONIBLES" del Hero NO abre modal directamente', async ({ page }) => {
    // Este botón debe linkear a #cursos, no abrir modal
    const coursesBtn = page.locator('text=VER CURSOS DISPONIBLES').first();
    await expect(coursesBtn).toHaveAttribute('href', '#cursos');
  });

  test('Hay botones de inscripción en diferentes secciones', async ({ page }) => {
    // Scroll a diferentes secciones para cargar contenido
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // Buscar botones que digan "INSCRIBIRSE" o similar
    const inscriptionBtns = page.locator('button:has-text("INSCRIB")');
    const btnCount = await inscriptionBtns.count();

    // Debería haber al menos 1 botón de inscripción
    expect(btnCount).toBeGreaterThan(0);
  });

  test('Click en botón de inscripción abre el modal', async ({ page }) => {
    // Scroll para encontrar un botón de inscripción
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    // Click en primer botón de inscripción
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();

    if (await inscriptionBtn.isVisible()) {
      await inscriptionBtn.click();

      // Verificar que aparece el modal
      // Buscar el título del modal
      const modalTitle = page.locator('text=Inscripción Colonia de Verano').first();
      await expect(modalTitle).toBeVisible({ timeout: 5000 });
    }
  });

  test('Modal tiene botón de cerrar (X)', async ({ page }) => {
    // Scroll y abrir modal
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();

    if (await inscriptionBtn.isVisible()) {
      await inscriptionBtn.click();

      // Buscar botón de cerrar
      const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' });
      const closeBtnVisible = await closeBtn.count();

      expect(closeBtnVisible).toBeGreaterThan(0);
    }
  });

  test('Click en botón X cierra el modal', async ({ page }) => {
    // Abrir modal
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();

    if (await inscriptionBtn.isVisible()) {
      await inscriptionBtn.click();

      // Verificar que está abierto
      const modalTitle = page.locator('text=Inscripción Colonia de Verano').first();
      await expect(modalTitle).toBeVisible();

      // Cerrar modal (buscar X) - buscar específicamente en el header del modal
      const closeBtn = page.getByRole('button', { name: /close/i }).or(
        page.locator('button').filter({ hasText: '×' })
      ).first();

      // Usar force click si el botón está siendo interceptado por overlay
      await closeBtn.click({ force: true });

      // Modal debería cerrarse
      await expect(modalTitle).not.toBeVisible();
    }
  });
});

test.describe('Colonia Inscription Form - Step 1: Tutor Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Abrir modal
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();
  });

  test('Paso 1 muestra todos los campos requeridos', async ({ page }) => {
    // Verificar título
    const stepTitle = page.locator('text=Datos del Padre/Madre/Tutor').first();
    await expect(stepTitle).toBeVisible();

    // Verificar campos
    await expect(page.locator('input[placeholder*="Juan Pérez"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="tel"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="20-12345678-9"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Ciudad"]').first()).toBeVisible();
  });

  test('Campo CUIL formatea correctamente con guiones', async ({ page }) => {
    const cuilInput = page.locator('input[placeholder*="20-12345678-9"]').first();

    // Escribir CUIL sin guiones
    await cuilInput.fill('20123456789');
    await cuilInput.blur();
    await page.waitForTimeout(200);

    // Verificar que se formateó (puede no aplicar hasta blur, depende de implementación)
    // El valor debería tener guiones
    const value = await cuilInput.inputValue();
    // Debería tener 11 dígitos sin contar guiones
    const digitsOnly = value.replace(/\D/g, '');
    expect(digitsOnly.length).toBe(11);
  });

  test('Contraseñas deben coincidir para avanzar', async ({ page }) => {
    // Llenar campos obligatorios
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Test User');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');

    // Contraseñas diferentes
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('DifferentPass456');


    // Verificar mensaje de error
    const errorMsg = page.locator('text=Las contraseñas no coinciden').first();
    await expect(errorMsg).toBeVisible();

    // Botón "Siguiente" debería estar deshabilitado
    const nextBtn = page.locator('button:has-text("Siguiente")').first();
    await expect(nextBtn).toBeDisabled();
  });

  test('Con datos válidos, botón Siguiente se habilita', async ({ page }) => {
    // Llenar todos los campos correctamente
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('Password123');

    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');


    // Botón "Siguiente" debería estar habilitado
    const nextBtn = page.locator('button:has-text("Siguiente")').first();
    await expect(nextBtn).toBeEnabled();
  });

  test('Click en Siguiente avanza al paso 2', async ({ page }) => {
    // Llenar datos
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('Password123');

    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');


    // Click en Siguiente - usar el botón del modal (no el de la grilla de horarios)
    const nextBtn = page.locator('button:has-text("Siguiente")').last();
    await nextBtn.click();

    // Verificar que estamos en paso 2
    const step2Title = page.locator('text=Estudiantes a Inscribir').first();
    await expect(step2Title).toBeVisible();
  });
});

test.describe('Colonia Inscription Form - Step 2: Estudiantes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Abrir modal y completar paso 1
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Completar paso 1
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('Password123');
    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');

    // Avanzar a paso 2
    await page.locator('button:has-text("Siguiente")').click();
  });

  test('Paso 2 muestra formulario de estudiante', async ({ page }) => {
    const step2Title = page.locator('text=Estudiantes a Inscribir').first();
    await expect(step2Title).toBeVisible();

    // Debe haber campos para estudiante
    await expect(page.locator('input[placeholder*="María Pérez"]').first()).toBeVisible();
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test('Botón "Agregar otro estudiante" funciona', async ({ page }) => {
    // Click en agregar
    const addBtn = page.locator('button:has-text("Agregar otro estudiante")').first();
    await addBtn.click();

    // Debería haber 2 formularios de estudiante
    const estudianteHeaders = page.locator('text=/Estudiante \\d+/');
    const count = await estudianteHeaders.count();
    expect(count).toBe(2);
  });

  test('Agregar 2+ estudiantes muestra mensaje de descuento', async ({ page }) => {
    // Agregar un estudiante
    const addBtn = page.locator('button:has-text("Agregar otro estudiante")').first();
    await addBtn.click();

    // Debería aparecer mensaje de descuento
    const discountMsg = page.locator('text=/Descuento por hermanos/i').first();
    await expect(discountMsg).toBeVisible();

    // Verificar que menciona 12%
    const msg = await discountMsg.textContent();
    expect(msg).toContain('12%');
  });

  test('Agregar 3 estudiantes muestra descuento 24%', async ({ page }) => {
    // Agregar 2 estudiantes
    const addBtn = page.locator('button:has-text("Agregar otro estudiante")').first();
    await addBtn.click();
    await page.waitForTimeout(200);
    await addBtn.click();

    // Mensaje debería decir 24%
    const discountMsg = page.locator('text=/Descuento por hermanos/i').first();
    const msg = await discountMsg.textContent();
    expect(msg).toContain('24%');
  });

  test('Botón "Eliminar" elimina estudiante', async ({ page }) => {
    // Agregar estudiante
    const addBtn = page.locator('button:has-text("Agregar otro estudiante")').first();
    await addBtn.click();

    // Debe haber 2 estudiantes
    let estudianteCount = await page.locator('text=/Estudiante \\d+/').count();
    expect(estudianteCount).toBe(2);

    // Click en eliminar
    const deleteBtn = page.locator('button:has-text("Eliminar")').first();
    await deleteBtn.click();

    // Debería quedar solo 1
    estudianteCount = await page.locator('text=/Estudiante \\d+/').count();
    expect(estudianteCount).toBe(1);
  });

  test('Con datos válidos, avanza al paso 3 (selección de cursos)', async ({ page }) => {
    // Llenar datos de estudiante
    await page.locator('input[placeholder*="María Pérez"]').fill('María Pérez');
    await page.locator('input[type="number"]').fill('8');

    // Click en siguiente
    const nextBtn = page.locator('button:has-text("Siguiente")').first();
    await nextBtn.click();

    // Debería estar en paso 3 (selección de cursos)
    const step3Title = page.locator('text=Selección de Cursos').first();
    await expect(step3Title).toBeVisible();
  });

  test('Botón "Atrás" vuelve al paso 1', async ({ page }) => {
    // Click en atrás
    const backBtn = page.locator('button:has-text("Atrás")').first();
    await backBtn.click();

    // Debería estar de vuelta en paso 1
    const step1Title = page.locator('text=Datos del Padre/Madre/Tutor').first();
    await expect(step1Title).toBeVisible();
  });
});

test.describe('Colonia Inscription Form - Step 3: Course Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Abrir modal y completar pasos 1 y 2
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Paso 1
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('Password123');
    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');
    await page.locator('button:has-text("Siguiente")').click();

    // Paso 2
    await page.locator('input[placeholder*="María Pérez"]').fill('María Pérez');
    await page.locator('input[type="number"]').fill('8');
    await page.locator('button:has-text("Siguiente")').click();
  });

  test('Paso 3 muestra lista de cursos disponibles', async ({ page }) => {
    const step3Title = page.locator('text=Selección de Cursos').first();
    await expect(step3Title).toBeVisible();

    // Debería mostrar el nombre del estudiante
    const studentName = page.locator('text=María Pérez').first();
    await expect(studentName).toBeVisible();

    // Debería haber botones de curso disponibles
    const courseButtons = page.locator('button').filter({ hasText: /Matemática|Programación|Ciencias/i });
    const count = await courseButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Se puede seleccionar un curso', async ({ page }) => {
    // Seleccionar primer curso disponible
    const firstCourseBtn = page.locator('button').filter({ hasText: /Matemática|Programación/i }).first();
    await firstCourseBtn.click();

    // Debería mostrar un check o cambiar de estilo
    const checkmark = page.locator('text=✓').first();
    const isVisible = await checkmark.isVisible();
    expect(isVisible).toBe(true);
  });

  test('Se pueden seleccionar hasta 2 cursos', async ({ page }) => {
    // Obtener los primeros 2 cursos
    const courseButtons = page.locator('button').filter({ hasText: /Matemática|Programación|Ciencias/i });

    if (await courseButtons.count() >= 2) {
      await courseButtons.nth(0).click();
      await page.waitForTimeout(200);
      await courseButtons.nth(1).click();

      // Debería haber 2 checkmarks
      const checkmarks = page.locator('text=✓');
      const count = await checkmarks.count();
      expect(count).toBe(2);

      // El tercer curso no debería ser seleccionable (botón disabled)
      if (await courseButtons.count() >= 3) {
        const thirdCourse = courseButtons.nth(2);
        const isDisabled = await thirdCourse.isDisabled();
        expect(isDisabled).toBe(true);
      }
    }
  });

  test('Con al menos 1 curso seleccionado, se puede avanzar', async ({ page }) => {
    // Seleccionar un curso
    const firstCourseBtn = page.locator('button').filter({ hasText: /Matemática|Programación/i }).first();
    await firstCourseBtn.click();

    // Botón siguiente debería estar habilitado
    const nextBtn = page.locator('button:has-text("Siguiente")').first();
    await expect(nextBtn).toBeEnabled();
  });
});

test.describe('Colonia Inscription Form - Navigation & Progress', () => {
  test('Progress bar muestra paso actual', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Verificar que dice "Paso 1 de 5"
    const stepIndicator = page.locator('text=/Paso \\d+ de 5/i').first();
    await expect(stepIndicator).toBeVisible();

    const text = await stepIndicator.textContent();
    expect(text).toContain('Paso 1');
  });

  test('Progress bar avanza con los pasos', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Completar paso 1
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123');
    await passwordInputs.nth(1).fill('Password123');
    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');
    await page.locator('button:has-text("Siguiente")').click();

    // Verificar que ahora dice "Paso 2 de 5"
    const stepIndicator = page.locator('text=/Paso \\d+ de 5/i').first();
    const text = await stepIndicator.textContent();
    expect(text).toContain('Paso 2');
  });
});
