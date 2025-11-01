import { Page, expect } from '@playwright/test';

/**
 * Portal Helpers - Funciones auxiliares para tests E2E de portales Mateatletas
 *
 * Proporciona funciones de alto nivel para:
 * - Login en cada portal (Estudiante, Docente, Admin)
 * - Navegación a secciones específicas
 * - Esperas y verificaciones comunes
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

export const BASE_URL = 'http://localhost:3000';

export const TEST_USERS = {
  admin: {
    email: 'admin@mateatletas.com',
    password: 'Admin123!',
    expectedRedirect: '/admin/dashboard',
  },
  docente: {
    email: 'juan.perez@docente.com',
    password: 'Test123!',
    expectedRedirect: '/docente/dashboard',
  },
  tutor: {
    email: 'maria.garcia@tutor.com',
    password: 'Test123!',
    expectedRedirect: '/dashboard',
  },
  estudiante1: {
    email: 'lucas.garcia@email.com',
    password: 'Student123!',
    expectedRedirect: '/estudiante/gimnasio',
  },
  estudiante2: {
    email: 'sofia.garcia@email.com',
    password: 'Student123!',
    expectedRedirect: '/estudiante/gimnasio',
  },
} as const;

// ============================================================================
// LOGIN FUNCTIONS
// ============================================================================

/**
 * Login como Estudiante
 * Navega a /login, selecciona toggle de estudiante, ingresa credenciales
 */
export async function loginEstudiante(
  page: Page,
  email: string = TEST_USERS.estudiante1.email,
  password: string = TEST_USERS.estudiante1.password
) {
  console.log(`🎓 Login como estudiante: ${email}`);

  // Ir a página de login
  await page.goto(`${BASE_URL}/login`);

  // Esperar que cargue el formulario
  await page.waitForLoadState('networkidle');

  // Seleccionar toggle "Estudiante" (si existe)
  // Nota: El toggle puede variar según la implementación, verificar múltiples selectores
  const estudianteToggle = page.locator(
    'button:has-text("Estudiante"), input[value="estudiante"], [role="tab"]:has-text("Estudiante")'
  );

  if ((await estudianteToggle.count()) > 0) {
    await estudianteToggle.first().click();
    await page.waitForTimeout(500); // Esperar animación de toggle
  }

  // Llenar formulario
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Esperar redirección
  await page.waitForURL('**/estudiante/**', { timeout: 10000 });

  console.log('✅ Login estudiante exitoso');
}

/**
 * Login como Docente
 * Navega a /login, selecciona toggle de tutor/padre, ingresa credenciales de docente
 */
export async function loginDocente(
  page: Page,
  email = TEST_USERS.docente.email,
  password = TEST_USERS.docente.password
) {
  console.log(`👨‍🏫 Login como docente: ${email}`);

  // Ir a página de login
  await page.goto(`${BASE_URL}/login`);

  // Esperar que cargue el formulario
  await page.waitForLoadState('networkidle');

  // Seleccionar toggle "Tutor/Padre" (es el default, pero por si acaso)
  const tutorToggle = page.locator(
    'button:has-text("Tutor"), button:has-text("Padre"), input[value="tutor"], [role="tab"]:has-text("Tutor")'
  );

  if ((await tutorToggle.count()) > 0) {
    await tutorToggle.first().click();
    await page.waitForTimeout(500);
  }

  // Llenar formulario
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Esperar redirección
  await page.waitForURL('**/docente/**', { timeout: 10000 });

  console.log('✅ Login docente exitoso');
}

/**
 * Login como Admin
 */
export async function loginAdmin(
  page: Page,
  email = TEST_USERS.admin.email,
  password = TEST_USERS.admin.password
) {
  console.log(`👑 Login como admin: ${email}`);

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Admin usa el mismo toggle que Tutor/Padre
  const tutorToggle = page.locator(
    'button:has-text("Tutor"), button:has-text("Padre"), input[value="tutor"]'
  );

  if ((await tutorToggle.count()) > 0) {
    await tutorToggle.first().click();
    await page.waitForTimeout(500);
  }

  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  await page.click('button[type="submit"]');

  // Esperar redirección (puede haber selector de rol si admin tiene múltiples roles)
  await page.waitForURL('**/admin/**', { timeout: 10000 });

  console.log('✅ Login admin exitoso');
}

/**
 * Login como Tutor
 */
export async function loginTutor(
  page: Page,
  email = TEST_USERS.tutor.email,
  password = TEST_USERS.tutor.password
) {
  console.log(`👨‍👩‍👧 Login como tutor: ${email}`);

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);

  await page.click('button[type="submit"]');

  // Tutor redirige a /dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  console.log('✅ Login tutor exitoso');
}

// ============================================================================
// NAVIGATION FUNCTIONS
// ============================================================================

/**
 * Navegar al hub del gimnasio (Portal Estudiante)
 */
export async function navigateToGimnasio(page: Page) {
  console.log('🏋️ Navegando al gimnasio...');

  await page.goto(`${BASE_URL}/estudiante/gimnasio`);
  await page.waitForLoadState('networkidle');

  // Verificar que no hay error 500 o 404
  await expectNoServerError(page);

  console.log('✅ En página de gimnasio');
}

/**
 * Navegar al dashboard del docente
 */
export async function navigateToDocenteDashboard(page: Page) {
  console.log('📊 Navegando al dashboard docente...');

  await page.goto(`${BASE_URL}/docente/dashboard`);
  await page.waitForLoadState('networkidle');

  await expectNoServerError(page);

  console.log('✅ En dashboard docente');
}

/**
 * Navegar al dashboard del admin
 */
export async function navigateToAdminDashboard(page: Page) {
  console.log('👑 Navegando al dashboard admin...');

  await page.goto(`${BASE_URL}/admin/dashboard`);
  await page.waitForLoadState('networkidle');

  await expectNoServerError(page);

  console.log('✅ En dashboard admin');
}

// ============================================================================
// WAIT & VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Esperar a que cargue el dashboard (genérico)
 * Verifica que no haya spinners o loading states
 */
export async function waitForDashboardLoad(page: Page, timeout = 5000) {
  console.log('⏳ Esperando carga de dashboard...');

  // Esperar que desaparezcan los loaders comunes
  const loaders = page.locator(
    '[data-testid="loading"], [role="progressbar"], .spinner, .loading'
  );

  if ((await loaders.count()) > 0) {
    await loaders.first().waitFor({ state: 'hidden', timeout });
  }

  // Esperar networkidle
  await page.waitForLoadState('networkidle', { timeout });

  console.log('✅ Dashboard cargado');
}

/**
 * Verificar que no hay errores del servidor (500, 404)
 */
export async function expectNoServerError(page: Page) {
  // Verificar que no hay texto de error común
  const errorTexts = [
    'Error 500',
    'Internal Server Error',
    'Error 404',
    'Page Not Found',
    'Application error',
  ];

  for (const errorText of errorTexts) {
    const errorElement = page.locator(`text="${errorText}"`);
    if ((await errorElement.count()) > 0) {
      throw new Error(`❌ Página muestra error: "${errorText}"`);
    }
  }

  // Verificar que el body no está vacío (indicador de crash)
  const bodyText = await page.locator('body').textContent();
  if (!bodyText || bodyText.trim().length === 0) {
    throw new Error('❌ Página renderiza body vacío');
  }
}

/**
 * Verificar que un elemento está visible con timeout personalizado
 */
export async function expectVisible(
  page: Page,
  selector: string,
  options?: { timeout?: number; description?: string }
) {
  const element = page.locator(selector);
  const description = options?.description || selector;

  try {
    await expect(element).toBeVisible({
      timeout: options?.timeout || 5000,
    });
    console.log(`✅ Elemento visible: ${description}`);
  } catch (error) {
    console.error(`❌ Elemento NO visible: ${description}`);
    throw error;
  }
}

// ============================================================================
// LOGOUT FUNCTION
// ============================================================================

/**
 * Logout genérico
 * Busca el botón de logout en el UI y lo clickea
 */
export async function logout(page: Page) {
  console.log('🚪 Cerrando sesión...');

  // Buscar botón de logout (puede estar en menú, dropdown, etc.)
  const logoutButton = page.locator(
    'button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión"), [data-testid="logout"]'
  );

  if ((await logoutButton.count()) > 0) {
    await logoutButton.first().click();

    // Esperar redirección a login
    await page.waitForURL('**/login', { timeout: 10000 });

    console.log('✅ Sesión cerrada');
  } else {
    console.warn('⚠️ No se encontró botón de logout');
  }
}

// ============================================================================
// SCREENSHOT HELPERS
// ============================================================================

/**
 * Tomar screenshot con nombre descriptivo
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
) {
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const path = `test-results/${sanitizedName}.png`;

  await page.screenshot({
    path,
    fullPage: options?.fullPage || false,
  });

  console.log(`📸 Screenshot guardado: ${path}`);
}
