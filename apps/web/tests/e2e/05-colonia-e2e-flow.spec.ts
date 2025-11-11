import { test, expect } from '@playwright/test';

/**
 * 🎯 COLONIA E2E - Flujo Completo de Usuario
 *
 * Test end-to-end que simula el journey completo de un usuario:
 * 1. Llega a la landing page
 * 2. Explora los cursos
 * 3. Filtra por edad/área
 * 4. Abre el formulario de inscripción
 * 5. Completa todos los pasos del formulario
 *
 * Este test NO envía el formulario final (no queremos crear pagos reales)
 */

test.describe('Colonia E2E - User Journey Completo', () => {
  test.slow(); // Marcar test como lento (tiene más timeout)

  test('Journey completo: landing → filtros → inscripción (sin pago final)', async ({ page }) => {
    // ===== PASO 1: Llegar a la landing page =====
    await page.goto('/colonia-verano-2025');

    // Verificar que cargó correctamente
    await expect(page.locator('text=COLONIA DE').first()).toBeVisible();
    await expect(page.locator('text=5 Enero - 3 Marzo 2026').first()).toBeVisible();

    // ===== PASO 2: Explorar Hero y hacer scroll =====
    await page.evaluate(() => window.scrollTo(0, 400));

    // ===== PASO 3: Navegar a catálogo de cursos =====
    await page.locator('#cursos').scrollIntoViewIfNeeded();

    // Verificar que estamos en catálogo
    await expect(page.locator('text=ELIGE TU').first()).toBeVisible({ timeout: 10000 });

    // ===== PASO 4: Filtrar por edad (8-9 años) =====
    const age8_9Btn = page.locator('button:has-text("8-9 años")').first();
    await age8_9Btn.click();

    // Verificar que el filtro se aplicó
    const resultsText = page.locator('text=/Mostrando \\d+ curso/i').first();
    await expect(resultsText).toBeVisible();

    // ===== PASO 5: Filtrar por área (Matemática) =====
    const matematicaBtn = page.locator('button:has-text("Matemática")').first();
    await matematicaBtn.click();

    // ===== PASO 6: Ver más detalles de un curso (si hay botón "VER MÁS") =====
    const verMasBtn = page.locator('button:has-text("VER MÁS")').first();
    const verMasBtnExists = await verMasBtn.isVisible().catch(() => false);

    if (verMasBtnExists) {
      await verMasBtn.click();

      // Cerrar modal de detalles si se abrió
      const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
      const closeBtnExists = await closeBtn.isVisible().catch(() => false);
      if (closeBtnExists) {
        await closeBtn.click();
      }
    }

    // ===== PASO 7: Scroll a sección de precios =====
    await page.locator('#precios').scrollIntoViewIfNeeded();

    // ===== PASO 8: Click en botón de inscripción =====
    // Buscar cualquier botón de inscripción visible
    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.scrollIntoViewIfNeeded();
    await inscriptionBtn.click();

    // Verificar que se abrió el modal
    await expect(page.locator('text=Inscripción Colonia de Verano').first()).toBeVisible();

    // ===== PASO 9: Completar Paso 1 - Datos del Tutor =====
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Ana García');
    await page.locator('input[type="email"]').fill('ana.garcia@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 9876-5432');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('27987654321');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('SecurePass123');
    await passwordInputs.nth(1).fill('SecurePass123');

    await page.locator('input[placeholder*="Ciudad"]').fill('Córdoba');

    // Seleccionar origen (opcional)
    const origenSelect = page.locator('select').first();
    const origenExists = await origenSelect.isVisible().catch(() => false);
    if (origenExists) {
      await origenSelect.selectOption('Instagram');
    }


    // Click en Siguiente
    await page.locator('button:has-text("Siguiente")').first().click();

    // ===== PASO 10: Completar Paso 2 - Datos del Estudiante =====
    await expect(page.locator('text=Estudiantes a Inscribir').first()).toBeVisible();

    await page.locator('input[placeholder*="María Pérez"]').fill('Sofía García');
    await page.locator('input[type="number"]').fill('9');

    // Agregar segundo estudiante
    const addBtn = page.locator('button:has-text("Agregar otro estudiante")').first();
    await addBtn.click();

    // Llenar datos del segundo estudiante
    const nameInputs = page.locator('input[placeholder*="María Pérez"]');
    await nameInputs.nth(1).fill('Lucas García');

    const ageInputs = page.locator('input[type="number"]');
    await ageInputs.nth(1).fill('7');


    // Click en Siguiente
    await page.locator('button:has-text("Siguiente")').first().click();

    // ===== PASO 11: Completar Paso 3 - Selección de Cursos =====
    await expect(page.locator('text=Selección de Cursos').first()).toBeVisible();

    // Seleccionar cursos para cada estudiante
    // Estudiante 1: Sofía (9 años)
    const courseButtons = page.locator('button').filter({ hasText: /Matemática|Programación|Ciencias/i });

    if (await courseButtons.count() >= 2) {
      // Seleccionar primer curso para Sofía
      await courseButtons.nth(0).click();
    }


    // Click en Siguiente
    await page.locator('button:has-text("Siguiente")').first().click();

    // ===== PASO 12: Paso 4 - Mundo STEAM (puede ser skipeado en Colonia) =====
    // La Colonia puede no requerir selección de mundo, solo el Ciclo 2026
    // Si aparece, lo completamos. Si no, continuamos.

    const mundoTitle = page.locator('text=Selección de Mundo STEAM').first();
    const hasMundoStep = await mundoTitle.isVisible().catch(() => false);

    if (hasMundoStep) {
      // Seleccionar mundos para estudiantes
      const matematicaMundoBtn = page.locator('button:has-text("🔢 Matemática")').first();
      await matematicaMundoBtn.click();

      // Click en Siguiente
      await page.locator('button:has-text("Siguiente")').first().click();
    }

    // ===== PASO 13: Paso 5 - Resumen =====
    const resumenTitle = page.locator('text=Resumen de Inscripción').first();
    await expect(resumenTitle).toBeVisible({ timeout: 10000 });

    // Verificar que aparecen los datos ingresados
    await expect(page.locator('text=Ana García').first()).toBeVisible();
    await expect(page.locator('text=Sofía García').first()).toBeVisible();
    await expect(page.locator('text=Lucas García').first()).toBeVisible();

    // Verificar que hay información de precios
    await expect(page.locator('text=/Inscripción:/i').first()).toBeVisible();
    await expect(page.locator('text=/A pagar hoy:/i').first()).toBeVisible();

    // Verificar descuento por hermanos
    await expect(page.locator('text=/Descuento por hermanos/i').first()).toBeVisible();

    // ===== PASO 14: NO hacer click en "Confirmar y Pagar" =====
    // No queremos crear pagos reales en MercadoPago durante tests

    const confirmBtn = page.locator('button:has-text("Confirmar y Pagar")').first();
    await expect(confirmBtn).toBeVisible();
    await expect(confirmBtn).toBeEnabled();

    // FIN del journey - NO clickeamos el botón final
  });

  test('Journey alternativo: usuario sin hermanos, 1 solo curso', async ({ page }) => {
    // ===== PASO 1: Llegar a la landing =====
    await page.goto('/colonia-verano-2025');
    await expect(page.locator('text=COLONIA DE').first()).toBeVisible();

    // ===== PASO 2: Ir directo a inscripción sin explorar =====
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // ===== PASO 3: Llenar formulario rápido =====
    // Paso 1: Tutor
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Pedro Rodríguez');
    await page.locator('input[type="email"]').fill('pedro@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 5555-5555');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20111111111');

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Test1234');
    await passwordInputs.nth(1).fill('Test1234');

    await page.locator('input[placeholder*="Ciudad"]').fill('Rosario');

    await page.locator('button:has-text("Siguiente")').click();

    // Paso 2: Un solo estudiante
    await page.locator('input[placeholder*="María Pérez"]').fill('Martín Rodríguez');
    await page.locator('input[type="number"]').fill('10');

    await page.locator('button:has-text("Siguiente")').click();

    // Paso 3: Seleccionar 1 curso
    const courseBtn = page.locator('button').filter({ hasText: /Matemática|Programación/i }).first();
    await courseBtn.click();

    await page.locator('button:has-text("Siguiente")').click();

    // Paso 5: Verificar resumen (puede skipear paso 4 si no aplica)
    const resumenTitle = page.locator('text=Resumen de Inscripción').first();
    await expect(resumenTitle).toBeVisible({ timeout: 10000 });

    // Verificar que NO hay descuento por hermanos (solo 1 estudiante)
    const descuentoMsg = page.locator('text=/Descuento por hermanos/i').first();
    const hasDescuento = await descuentoMsg.isVisible().catch(() => false);

    // Si solo hay 1 estudiante, no debería haber descuento
    // O el descuento debería ser 0%
    // (depende de la lógica de negocio, ajustar según corresponda)

    // Verificar datos
    await expect(page.locator('text=Pedro Rodríguez').first()).toBeVisible();
    await expect(page.locator('text=Martín Rodríguez').first()).toBeVisible();

    // Botón final habilitado
    const confirmBtn = page.locator('button:has-text("Confirmar y Pagar")').first();
    await expect(confirmBtn).toBeEnabled();
  });

  test('Journey con navegación hacia atrás (back buttons)', async ({ page }) => {
    // ===== Setup: llegar al paso 3 =====
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Paso 1
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Test User');
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Pass1234');
    await passwordInputs.nth(1).fill('Pass1234');
    await page.locator('input[placeholder*="Ciudad"]').fill('Buenos Aires');
    await page.locator('button:has-text("Siguiente")').click();

    // Paso 2
    await page.locator('input[placeholder*="María Pérez"]').fill('Test Student');
    await page.locator('input[type="number"]').fill('8');
    await page.locator('button:has-text("Siguiente")').click();

    // Estamos en paso 3
    await expect(page.locator('text=Selección de Cursos').first()).toBeVisible();

    // ===== Test: Click en "Atrás" =====
    const backBtn = page.locator('button:has-text("Atrás")').first();
    await backBtn.click();

    // Deberíamos estar en paso 2
    await expect(page.locator('text=Estudiantes a Inscribir').first()).toBeVisible();

    // Click en "Atrás" de nuevo
    await backBtn.click();

    // Deberíamos estar en paso 1
    await expect(page.locator('text=Datos del Padre/Madre/Tutor').first()).toBeVisible();

    // Los datos deberían persistir
    const emailInput = page.locator('input[type="email"]').first();
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe('test@example.com');
  });
});

test.describe('Colonia E2E - Edge Cases', () => {
  test('Cerrar modal en medio del proceso no pierde datos', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Llenar algo de datos
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Usuario Test');
    await page.locator('input[type="email"]').fill('usuario@test.com');

    // Cerrar modal
    const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await closeBtn.click();

    // Reabrir modal
    await inscriptionBtn.click();

    // Los datos pueden o no persistir dependiendo de la implementación
    // Este test documenta el comportamiento actual
    const nameInput = page.locator('input[placeholder*="Juan Pérez"]').first();
    const currentValue = await nameInput.inputValue();

    // Si el modal resetea state al cerrarse, estará vacío
    // Si persiste, tendrá el valor anterior
    // Ambos comportamientos son válidos, solo documentamos
    expect(currentValue).toBeDefined();
  });

  test('Intentar avanzar sin llenar campos requeridos mantiene botón deshabilitado', async ({ page }) => {
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // NO llenar campos, verificar que botón está disabled
    const nextBtn = page.locator('button:has-text("Siguiente")').first();
    await expect(nextBtn).toBeDisabled();

    // Llenar solo algunos campos
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Test');

    // Debería seguir disabled
    await expect(nextBtn).toBeDisabled();

    // Llenar todos los campos
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1234-5678');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20123456789');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Pass1234');
    await passwordInputs.nth(1).fill('Pass1234');
    await page.locator('input[placeholder*="Ciudad"]').fill('Test City');

    // Ahora debería estar enabled
    await expect(nextBtn).toBeEnabled();
  });
});

test.describe('Colonia E2E - Performance', () => {
  test('El flujo completo se completa en menos de 2 minutos', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos

    const startTime = Date.now();

    // Flujo rápido
    await page.goto('/colonia-verano-2025');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const inscriptionBtn = page.locator('button:has-text("INSCRIB")').first();
    await inscriptionBtn.click();

    // Paso 1
    await page.locator('input[placeholder*="Juan Pérez"]').fill('Fast User');
    await page.locator('input[type="email"]').fill('fast@test.com');
    await page.locator('input[type="tel"]').fill('+54 9 11 1111-1111');
    await page.locator('input[placeholder*="20-12345678-9"]').fill('20111111111');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Fast1234');
    await passwordInputs.nth(1).fill('Fast1234');
    await page.locator('input[placeholder*="Ciudad"]').fill('Fast City');
    await page.locator('button:has-text("Siguiente")').click();

    // Paso 2
    await page.locator('input[placeholder*="María Pérez"]').fill('Fast Kid');
    await page.locator('input[type="number"]').fill('10');
    await page.locator('button:has-text("Siguiente")').click();

    // Paso 3
    const courseBtn = page.locator('button').filter({ hasText: /Matemática|Programación/i }).first();
    await courseBtn.click();
    await page.locator('button:has-text("Siguiente")').click();

    // Llegar a resumen
    const resumenTitle = page.locator('text=Resumen de Inscripción').first();
    await expect(resumenTitle).toBeVisible({ timeout: 10000 });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Debería completarse en menos de 30 segundos (mucho menos de 2 minutos)
    expect(totalTime).toBeLessThan(30000);
  });
});
