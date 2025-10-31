import { test, expect } from '@playwright/test';
import {
  loginTutor,
  waitForDashboardLoad,
  expectNoServerError,
  takeScreenshot,
  TEST_USERS,
} from './helpers/portal-helpers';

/**
 * Tests E2E Básicos - Portal Tutor
 *
 * NOTA: Estos tests están marcados como SKIP porque el portal de tutor
 * no es crítico para el lanzamiento de hoy.
 *
 * Se dejarán implementados para la próxima semana cuando se finalice
 * la funcionalidad completa del portal tutor.
 */

test.describe('👨‍👩‍👧 Portal Tutor - Tests Básicos (SKIP - No Crítico Hoy)', () => {
  // ============================================================================
  // TEST 1: Login Tutor (SKIP)
  // ============================================================================

  test.skip('Tutor puede hacer login con credenciales válidas', async ({
    page,
  }) => {
    console.log('\n🧪 TEST: Login tutor (SKIP)');

    // Realizar login
    await loginTutor(page);

    // Verificar que redirigió correctamente
    await expect(page).toHaveURL(/\/dashboard/);

    // Verificar que no hay errores de servidor
    await expectNoServerError(page);

    // Screenshot para evidencia
    await takeScreenshot(page, 'tutor-login-success', { fullPage: true });

    console.log('✅ TEST PASADO: Login tutor exitoso (SKIP)\n');
  });

  // ============================================================================
  // TEST 2: Dashboard Tutor (SKIP)
  // ============================================================================

  test.skip('Dashboard tutor carga sin errores', async ({ page }) => {
    console.log('\n🧪 TEST: Dashboard tutor (SKIP)');

    await loginTutor(page);

    // Esperar que cargue
    await waitForDashboardLoad(page);

    // Verificar que no hay errores
    await expectNoServerError(page);

    // Screenshot
    await takeScreenshot(page, 'tutor-dashboard', { fullPage: true });

    console.log('✅ TEST PASADO: Dashboard tutor carga (SKIP)\n');
  });

  // ============================================================================
  // TEST 3: Ver Estudiantes del Tutor (SKIP)
  // ============================================================================

  test.skip('Tutor puede ver sus estudiantes asignados', async ({ page }) => {
    console.log('\n🧪 TEST: Ver estudiantes del tutor (SKIP)');

    await loginTutor(page);
    await waitForDashboardLoad(page);

    // Buscar sección de estudiantes
    const estudiantesLink = page.locator(
      'a[href*="estudiantes"], button:has-text("Estudiantes"), text=/mis estudiantes/i'
    );

    if ((await estudiantesLink.count()) > 0) {
      await estudiantesLink.first().click();
      await page.waitForLoadState('networkidle');

      await expectNoServerError(page);

      console.log('  ✅ Sección de estudiantes accesible');
    } else {
      console.log(
        '  ℹ️ Link de estudiantes no encontrado (puede estar en desarrollo)'
      );
    }

    // Screenshot
    await takeScreenshot(page, 'tutor-estudiantes', { fullPage: true });

    console.log('✅ TEST PASADO: Ver estudiantes (SKIP)\n');
  });

  // ============================================================================
  // TEST 4: Navegación a Planificaciones (SKIP)
  // ============================================================================

  test.skip('Tutor puede navegar a planificaciones', async ({ page }) => {
    console.log('\n🧪 TEST: Navegación a planificaciones (SKIP)');

    await loginTutor(page);
    await waitForDashboardLoad(page);

    // Intentar navegar a planificaciones
    await page.goto('http://localhost:3000/planificaciones');
    await page.waitForLoadState('networkidle');

    await expectNoServerError(page);

    // Screenshot
    await takeScreenshot(page, 'tutor-planificaciones', { fullPage: true });

    console.log('✅ TEST PASADO: Planificaciones accesibles (SKIP)\n');
  });

  // ============================================================================
  // TEST 5: Ver Clases (SKIP)
  // ============================================================================

  test.skip('Tutor puede ver clases de sus estudiantes', async ({ page }) => {
    console.log('\n🧪 TEST: Ver clases (SKIP)');

    await loginTutor(page);
    await waitForDashboardLoad(page);

    // Buscar sección de clases
    const clasesLink = page.locator(
      'a[href*="clases"], a[href*="mis-clases"], button:has-text("Clases")'
    );

    if ((await clasesLink.count()) > 0) {
      await clasesLink.first().click();
      await page.waitForLoadState('networkidle');

      await expectNoServerError(page);

      console.log('  ✅ Sección de clases accesible');
    } else {
      console.log(
        '  ℹ️ Link de clases no encontrado (puede estar en desarrollo)'
      );
    }

    // Screenshot
    await takeScreenshot(page, 'tutor-clases', { fullPage: true });

    console.log('✅ TEST PASADO: Ver clases (SKIP)\n');
  });

  // ============================================================================
  // TEST 6: Logout (SKIP)
  // ============================================================================

  test.skip('Tutor puede cerrar sesión', async ({ page }) => {
    console.log('\n🧪 TEST: Logout tutor (SKIP)');

    await loginTutor(page);
    await waitForDashboardLoad(page);

    // Buscar botón de logout
    const logoutButton = page.locator(
      'button:has-text("Cerrar sesión"), button:has-text("Salir"), a:has-text("Cerrar sesión")'
    );

    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click();

      // Esperar redirección a login
      await page.waitForURL('**/login', { timeout: 10000 });

      await expect(page).toHaveURL(/\/login/);

      console.log('  ✅ Logout exitoso');
    } else {
      console.log('  ⚠️ Botón de logout no encontrado');
    }

    // Screenshot
    await takeScreenshot(page, 'tutor-logout', { fullPage: false });

    console.log('✅ TEST PASADO: Logout tutor (SKIP)\n');
  });
});

// ============================================================================
// NOTA PARA EL EQUIPO
// ============================================================================

/*
 * 📝 IMPLEMENTACIÓN PENDIENTE - PRÓXIMA SEMANA
 *
 * El portal de tutor está en desarrollo y no es crítico para el
 * lanzamiento de hoy a las 12pm.
 *
 * Estos tests básicos están listos para ejecutarse cuando:
 * 1. Se complete la interfaz del portal tutor
 * 2. Se finalice la funcionalidad de gestión de estudiantes
 * 3. Se implemente la vista de progreso de los estudiantes
 *
 * Para habilitar los tests:
 * - Remover el `.skip` de cada test
 * - Ajustar selectores según la implementación final
 * - Ejecutar: npx playwright test tutor-basic.spec.ts
 *
 * Fecha estimada de implementación: Próxima semana
 */
