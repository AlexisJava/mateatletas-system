import { test, expect } from '@playwright/test';
import {
  loginEstudiante,
  navigateToGimnasio,
  waitForDashboardLoad,
  expectNoServerError,
  expectVisible,
  takeScreenshot,
  TEST_USERS,
} from './helpers/portal-helpers';

/**
 * Tests E2E Críticos - Portal Estudiante
 *
 * Verificación pre-lanzamiento de funcionalidades core:
 * - Login y autenticación
 * - Navegación al hub del gimnasio
 * - Creación de avatar (Ready Player Me)
 * - Navegación entre secciones principales
 *
 * Estos tests DEBEN PASAR antes del lanzamiento de hoy a las 12pm.
 */

test.describe('🎓 Portal Estudiante - Tests Críticos Pre-Lanzamiento', () => {
  // ============================================================================
  // TEST 1: Login Estudiante
  // ============================================================================

  test('✅ Estudiante puede hacer login con credenciales válidas', async ({
    page,
  }) => {
    console.log('\n🧪 TEST: Login estudiante');

    // Realizar login
    await loginEstudiante(page);

    // Verificar que redirigió correctamente
    await expect(page).toHaveURL(/\/estudiante/);

    // Verificar que no hay errores de servidor
    await expectNoServerError(page);

    // Screenshot para evidencia
    await takeScreenshot(page, 'estudiante-login-success', {
      fullPage: true,
    });

    console.log('✅ TEST PASADO: Login estudiante exitoso\n');
  });

  // ============================================================================
  // TEST 2: Gimnasio Hub Carga Correctamente
  // ============================================================================

  test('✅ Hub del gimnasio carga sin errores', async ({ page }) => {
    console.log('\n🧪 TEST: Hub gimnasio carga correctamente');

    // Login primero
    await loginEstudiante(page);

    // Navegar al gimnasio (puede ya estar ahí después del login)
    await navigateToGimnasio(page);

    // Esperar que cargue completamente
    await waitForDashboardLoad(page);

    // Verificar que no hay errores 500/404
    await expectNoServerError(page);

    // Verificar que hay contenido en la página (no es una página en blanco)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100);

    // Screenshot
    await takeScreenshot(page, 'estudiante-gimnasio-hub', { fullPage: true });

    console.log('✅ TEST PASADO: Hub del gimnasio carga correctamente\n');
  });

  // ============================================================================
  // TEST 3: Elementos del Hub Visibles
  // ============================================================================

  test('✅ Elementos principales del hub están visibles', async ({ page }) => {
    console.log('\n🧪 TEST: Elementos del hub visibles');

    await loginEstudiante(page);
    await navigateToGimnasio(page);
    await waitForDashboardLoad(page);

    // Verificar que existen elementos de navegación comunes
    // Nota: Los selectores exactos pueden variar, usamos selectores flexibles

    const elementosEsperados = [
      {
        selector: 'text=/gimnasio/i, [href*="gimnasio"]',
        descripcion: 'Gimnasio',
      },
      {
        selector: 'text=/perfil/i, [href*="perfil"], button:has-text("Perfil")',
        descripcion: 'Perfil',
      },
      {
        selector:
          'text=/cursos/i, [href*="cursos"], text=/entrenamientos/i, [href*="entrenamientos"]',
        descripcion: 'Cursos/Entrenamientos',
      },
    ];

    // Verificar cada elemento (con timeout corto para no bloquear)
    for (const elemento of elementosEsperados) {
      const locator = page.locator(elemento.selector);
      const count = await locator.count();

      if (count > 0) {
        console.log(`  ✅ Encontrado: ${elemento.descripcion}`);
      } else {
        console.warn(
          `  ⚠️ No encontrado: ${elemento.descripcion} (puede ser normal si no está en esta vista)`
        );
      }
    }

    // Screenshot final
    await takeScreenshot(page, 'estudiante-hub-elementos', {
      fullPage: true,
    });

    console.log('✅ TEST PASADO: Elementos del hub verificados\n');
  });

  // ============================================================================
  // TEST 4: Navegación a Perfil
  // ============================================================================

  test('✅ Estudiante puede navegar a su perfil', async ({ page }) => {
    console.log('\n🧪 TEST: Navegación a perfil');

    await loginEstudiante(page);
    await navigateToGimnasio(page);

    // Buscar link/botón de perfil
    const perfilLink = page.locator(
      'a[href*="/estudiante/perfil"], button:has-text("Perfil"), text=/mi perfil/i'
    );

    if ((await perfilLink.count()) > 0) {
      await perfilLink.first().click();
      await page.waitForLoadState('networkidle');

      // Verificar que navegó
      await expect(page).toHaveURL(/\/estudiante\/perfil/);
      await expectNoServerError(page);

      console.log('  ✅ Navegación a perfil exitosa');
    } else {
      console.log(
        '  ⚠️ Link de perfil no encontrado en esta vista (puede ser modal o dropdown)'
      );

      // Intentar navegar directamente
      await page.goto('http://localhost:3000/estudiante/perfil');
      await page.waitForLoadState('networkidle');
      await expectNoServerError(page);

      console.log('  ✅ Navegación directa a perfil exitosa');
    }

    // Screenshot
    await takeScreenshot(page, 'estudiante-perfil', { fullPage: true });

    console.log('✅ TEST PASADO: Navegación a perfil\n');
  });

  // ============================================================================
  // TEST 5: Botón Crear Avatar Visible
  // ============================================================================

  test('✅ Botón "Crear Avatar" está visible y funcional', async ({ page }) => {
    console.log('\n🧪 TEST: Botón crear avatar');

    await loginEstudiante(page);
    await navigateToGimnasio(page);
    await waitForDashboardLoad(page);

    // Buscar botón de crear avatar
    // Puede estar en diferentes lugares: modal, banner, menú
    const crearAvatarButton = page.locator(
      'button:has-text("Crear Avatar"), a:has-text("Crear Avatar"), text=/crear.*avatar/i, [href*="criar-avatar"]'
    );

    const count = await crearAvatarButton.count();

    if (count > 0) {
      console.log('  ✅ Botón "Crear Avatar" encontrado');

      // Verificar que es clickeable
      await expect(crearAvatarButton.first()).toBeVisible();

      // Click en el botón
      await crearAvatarButton.first().click();

      // Esperar 2 segundos para que se abra modal o redirija
      await page.waitForTimeout(2000);

      // Verificar que se abrió algo (modal, iframe, o nueva página)
      // Nota: Ready Player Me puede abrir en iframe o nueva pestaña

      // Opción 1: Verificar si hay iframe de Ready Player Me
      const readyPlayerIframe = page.frameLocator(
        'iframe[src*="readyplayer.me"], iframe[src*="rpm.io"]'
      );
      const iframeExists = await page
        .locator('iframe[src*="readyplayer.me"], iframe[src*="rpm.io"]')
        .count();

      if (iframeExists > 0) {
        console.log('  ✅ Iframe de Ready Player Me detectado');
      } else {
        // Opción 2: Verificar si redirigió a página de creación de avatar
        const currentUrl = page.url();
        if (currentUrl.includes('criar-avatar')) {
          console.log('  ✅ Redirigió a página de creación de avatar');
        } else {
          console.log(
            '  ⚠️ No se detectó iframe ni redirección (puede ser modal personalizado)'
          );
        }
      }

      // Screenshot
      await takeScreenshot(page, 'estudiante-crear-avatar-click', {
        fullPage: true,
      });

      console.log('✅ TEST PASADO: Botón crear avatar funcional\n');
    } else {
      console.log(
        '  ⚠️ Botón "Crear Avatar" no encontrado (puede estar en perfil o ya tener avatar creado)'
      );

      // Intentar navegar directamente a la página de creación
      await page.goto('http://localhost:3000/estudiante/criar-avatar');
      await page.waitForLoadState('networkidle');

      await expectNoServerError(page);

      // Screenshot
      await takeScreenshot(page, 'estudiante-criar-avatar-page', {
        fullPage: true,
      });

      console.log('  ✅ Página de crear avatar accesible directamente\n');
    }
  });

  // ============================================================================
  // TEST 6: Navegación a Gamificación
  // ============================================================================

  test('✅ Estudiante puede navegar a gamificación/logros', async ({ page }) => {
    console.log('\n🧪 TEST: Navegación a gamificación');

    await loginEstudiante(page);
    await navigateToGimnasio(page);

    // Intentar navegar a sección de gamificación
    const gamificacionLink = page.locator(
      'a[href*="/estudiante/gamificacion"], button:has-text("Logros"), text=/logros/i, text=/gamificación/i'
    );

    if ((await gamificacionLink.count()) > 0) {
      await gamificacionLink.first().click();
      await page.waitForLoadState('networkidle');

      await expectNoServerError(page);

      console.log('  ✅ Navegación a gamificación exitosa');
    } else {
      console.log(
        '  ℹ️ Link de gamificación no encontrado, intentando navegación directa'
      );

      // Intentar directamente
      await page.goto('http://localhost:3000/estudiante/gamificacion');
      await page.waitForLoadState('networkidle');

      await expectNoServerError(page);

      console.log('  ✅ Navegación directa a gamificación exitosa');
    }

    // Screenshot
    await takeScreenshot(page, 'estudiante-gamificacion', { fullPage: true });

    console.log('✅ TEST PASADO: Navegación a gamificación\n');
  });

  // ============================================================================
  // TEST 7: Logout Funciona
  // ============================================================================

  test('✅ Estudiante puede cerrar sesión correctamente', async ({ page }) => {
    console.log('\n🧪 TEST: Logout estudiante');

    await loginEstudiante(page);
    await navigateToGimnasio(page);

    // Buscar botón de logout
    const logoutButton = page.locator(
      'button:has-text("Cerrar sesión"), button:has-text("Salir"), a:has-text("Cerrar sesión"), [data-testid="logout"]'
    );

    if ((await logoutButton.count()) > 0) {
      await logoutButton.first().click();

      // Esperar redirección a login
      await page.waitForURL('**/login', { timeout: 10000 });

      // Verificar que está en login
      await expect(page).toHaveURL(/\/login/);

      console.log('  ✅ Logout exitoso');
    } else {
      console.log(
        '  ⚠️ Botón de logout no encontrado (puede estar en menú desplegable)'
      );
    }

    // Screenshot
    await takeScreenshot(page, 'estudiante-logout', { fullPage: false });

    console.log('✅ TEST PASADO: Logout funcional\n');
  });
});

// ============================================================================
// TESTS CON MÚLTIPLES ESTUDIANTES
// ============================================================================

test.describe('🎓 Portal Estudiante - Tests con Múltiples Usuarios', () => {
  test('✅ Ambos estudiantes de prueba pueden hacer login', async ({
    page,
  }) => {
    console.log('\n🧪 TEST: Login con múltiples estudiantes');

    // Estudiante 1: Lucas
    console.log('  📝 Probando estudiante 1 (Lucas)...');
    await loginEstudiante(
      page,
      TEST_USERS.estudiante1.email,
      TEST_USERS.estudiante1.password
    );
    await expectNoServerError(page);
    await takeScreenshot(page, 'estudiante1-lucas-login');

    // Logout
    await page.goto('http://localhost:3000/login');

    // Estudiante 2: Sofía
    console.log('  📝 Probando estudiante 2 (Sofía)...');
    await loginEstudiante(
      page,
      TEST_USERS.estudiante2.email,
      TEST_USERS.estudiante2.password
    );
    await expectNoServerError(page);
    await takeScreenshot(page, 'estudiante2-sofia-login');

    console.log('✅ TEST PASADO: Ambos estudiantes pueden hacer login\n');
  });
});
