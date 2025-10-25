/**
 * Test E2E del flujo completo de Planificaciones Simples
 *
 * Flujo testeado:
 * 1. Auto-detección de planificaciones
 * 2. Admin asigna planificación a docente
 * 3. Docente activa semanas
 * 4. Estudiante accede y juega
 * 5. Verificación de progreso
 */

import { test, expect } from '@playwright/test';

// URLs base
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

// Credenciales de prueba
const ADMIN_CREDENTIALS = {
  email: 'admin.test@mateatletas.com',
  password: 'Admin123!',
};

const DOCENTE_CREDENTIALS = {
  email: 'docente.test@mateatletas.com',
  password: 'Docente123!',
};

const ESTUDIANTE_CREDENTIALS = {
  email: 'estudiante.test@mateatletas.com',
  password: 'Estudiante123!',
};

test.describe('Planificaciones - Flujo Completo', () => {
  test.beforeAll(async () => {
    // Verificar que las planificaciones estén detectadas
    console.log('🔍 Verificando auto-detección de planificaciones...');
  });

  test('1. Auto-detección debe haber registrado ejemplo-minimo', async ({ request }) => {
    const response = await request.get(`${API_URL}/planificaciones`, {
      headers: {
        // Necesitamos autenticarnos como admin
        Authorization: `Bearer ${await getAdminToken(request)}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const planificaciones = await response.json();

    const ejemploMinimo = planificaciones.find(
      (p: any) => p.codigo === 'ejemplo-minimo',
    );

    expect(ejemploMinimo).toBeDefined();
    expect(ejemploMinimo.titulo).toBe('Ejemplo Mínimo - Planificación de Prueba');
    expect(ejemploMinimo.estado).toBe('DETECTADA');
  });

  test('2. Admin puede ver planificaciones en la interfaz', async ({ page }) => {
    // Login como admin
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Esperar redirección
    await page.waitForURL(/\/admin/);

    // Navegar a planificaciones
    await page.goto(`${WEB_URL}/admin/planificaciones-simples`);

    // Verificar que se muestra la tabla
    await expect(page.locator('text=ejemplo-minimo')).toBeVisible();
    await expect(page.locator('text=Ejemplo Mínimo')).toBeVisible();
  });

  test('3. Admin asigna planificación a docente', async ({ request, page }) => {
    // Login como admin en la página
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);

    // Navegar al detalle de la planificación
    await page.goto(`${WEB_URL}/admin/planificaciones-simples/ejemplo-minimo`);

    // Click en "Asignar a Docente"
    await page.click('text=Asignar a Docente');

    // Esperar que aparezca el modal
    await expect(page.locator('text=Asignar a Docente').nth(1)).toBeVisible();

    // Seleccionar docente (primer option que no sea "Seleccionar...")
    await page.locator('select').first().selectOption({ index: 1 });

    // Seleccionar grupo
    await page.locator('select').nth(1).selectOption({ index: 1 });

    // Click en Asignar
    await page.click('button:has-text("Asignar")');

    // Verificar mensaje de éxito
    await expect(page.locator('text=exitosamente')).toBeVisible({ timeout: 5000 });
  });

  test('4. Docente puede ver la planificación asignada', async ({ page }) => {
    // Login como docente
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', DOCENTE_CREDENTIALS.email);
    await page.fill('input[name="password"]', DOCENTE_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/docente/);

    // Navegar a planificaciones
    await page.goto(`${WEB_URL}/docente/planificaciones`);

    // Verificar que aparece la planificación
    await expect(page.locator('text=Ejemplo Mínimo')).toBeVisible();
  });

  test('5. Docente activa semanas 1 y 2', async ({ page }) => {
    // Login como docente
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', DOCENTE_CREDENTIALS.email);
    await page.fill('input[name="password"]', DOCENTE_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/docente/);

    // Navegar a planificaciones
    await page.goto(`${WEB_URL}/docente/planificaciones`);

    // Activar semana 1
    await page.locator('button:has-text("Semana") >> text=1').first().click();

    // Esperar un momento
    await page.waitForTimeout(1000);

    // Activar semana 2
    await page.locator('button:has-text("Semana") >> text=2').first().click();

    // Verificar que ambas están activas (color verde)
    const semana1 = page.locator('button:has-text("Semana") >> text=1').first();
    const semana2 = page.locator('button:has-text("Semana") >> text=2').first();

    await expect(semana1).toHaveClass(/emerald/);
    await expect(semana2).toHaveClass(/emerald/);
  });

  test('6. Estudiante puede ver y acceder a la planificación', async ({ page }) => {
    // Login como estudiante
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', ESTUDIANTE_CREDENTIALS.email);
    await page.fill('input[name="password"]', ESTUDIANTE_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/estudiante/);

    // Navegar a planificaciones
    await page.goto(`${WEB_URL}/estudiante/planificaciones`);

    // Verificar que aparece la planificación
    await expect(page.locator('text=Ejemplo Mínimo')).toBeVisible();

    // Click en "Comenzar" o "Continuar"
    await page.click('button:has-text("Comenzar"), button:has-text("Continuar")');

    // Debería redirigir a la planificación
    await expect(page.url()).toContain('/estudiante/planificaciones/ejemplo-minimo');

    // Verificar que carga el componente de la planificación
    await expect(page.locator('text=Semana 1')).toBeVisible({ timeout: 10000 });
  });

  test('7. Estudiante puede interactuar y guardar progreso', async ({ page }) => {
    // Login como estudiante
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', ESTUDIANTE_CREDENTIALS.email);
    await page.fill('input[name="password"]', ESTUDIANTE_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/estudiante/);

    // Acceder directamente a la planificación
    await page.goto(`${WEB_URL}/estudiante/planificaciones/ejemplo-minimo`);

    // Esperar que cargue
    await page.waitForSelector('text=Semana 1', { timeout: 10000 });

    // Interactuar - Click en "Subir Nivel" si existe
    const subirNivelBtn = page.locator('button:has-text("Subir Nivel")');
    if (await subirNivelBtn.isVisible()) {
      await subirNivelBtn.click();
      await page.waitForTimeout(500);
    }

    // Click en "Guardar Progreso"
    await page.click('button:has-text("Guardar Progreso")');

    // Verificar mensaje de guardado
    await expect(page.locator('text=guardado')).toBeVisible({ timeout: 3000 });
  });

  test('8. Docente puede ver el progreso del estudiante', async ({ page }) => {
    // Login como docente
    await page.goto(`${WEB_URL}/login`);
    await page.fill('input[name="email"]', DOCENTE_CREDENTIALS.email);
    await page.fill('input[name="password"]', DOCENTE_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/docente/);

    // Navegar a planificaciones
    await page.goto(`${WEB_URL}/docente/planificaciones`);

    // Click en "Ver Progreso"
    await page.click('button:has-text("Ver Progreso")');

    // Verificar que aparece el modal
    await expect(page.locator('text=Progreso de Estudiantes')).toBeVisible();

    // Verificar que aparecen estudiantes
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});

// Helper function para obtener token de admin
async function getAdminToken(request: any): Promise<string> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    },
  });

  const data = await response.json();
  return data.access_token;
}
