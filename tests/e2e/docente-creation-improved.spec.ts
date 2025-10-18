/**
 * Test E2E completo para el flujo mejorado de creación de docentes
 *
 * Este test verifica end-to-end:
 * 1. Migración del schema ejecutada (campo debe_cambiar_password existe)
 * 2. Sectores Matemática y Programación existen en DB
 * 3. Formulario simplificado funciona correctamente
 * 4. Auto-generación de contraseñas
 * 5. Asignación de sectores
 * 6. UX mejorada en disponibilidad
 */

import { test, expect } from '@playwright/test';

test.describe('Creación de Docente Mejorada - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@mateatletas.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Navegar a usuarios
    await page.click('text=Usuarios');
    await expect(page).toHaveURL(/\/admin\/usuarios/);
  });

  test('Flujo completo: crear docente con password auto-generado en sector Matemática', async ({ page }) => {
    // Paso 1: Click en "Crear nuevo"
    await page.click('button:has-text("Crear nuevo")');

    // Paso 2: Verificar que se abre modal de creación
    await expect(page.locator('text=Crear Nuevo Docente')).toBeVisible();

    // Paso 3: Verificar que NO aparecen campos removidos
    await expect(page.locator('label:has-text("Años de Experiencia")')).not.toBeVisible();
    await expect(page.locator('label:has-text("Biografía")')).not.toBeVisible();

    // Paso 4: Verificar que campo contraseña es opcional
    const passwordLabel = page.locator('label:has-text("Contraseña")');
    await expect(passwordLabel).toBeVisible();
    await expect(page.locator('text=Se generará automáticamente')).toBeVisible();

    // Paso 5: Llenar solo campos requeridos (sin contraseña)
    await page.fill('input[name="nombre"]', 'Martín');
    await page.fill('input[name="apellido"]', 'González');
    await page.fill('input[name="email"]', `martin.test.${Date.now()}@example.com`);
    await page.fill('input[name="telefono"]', '+54 9 11 9876-5432');
    await page.fill('input[name="titulo"]', 'Profesor de Matemática');

    // Paso 6: Seleccionar sector Matemática con checkbox
    const mateCheckbox = page.locator('input[type="checkbox"]:near(:text("Matemática"))');
    await expect(mateCheckbox).toBeVisible();
    await mateCheckbox.check();
    await expect(mateCheckbox).toBeChecked();

    // Verificar icono de Matemática (📐)
    await expect(page.locator('text=📐')).toBeVisible();

    // Paso 7: Agregar disponibilidad con "Lunes a viernes"
    await page.selectOption('select[name="dia"]', 'lunes');
    await page.fill('input[name="hora_inicio"]', '09:00');
    await page.fill('input[name="hora_fin"]', '17:00');

    // Click en botón "Lunes a viernes"
    await page.click('button:has-text("Lunes a viernes")');

    // Verificar que se agregaron los 5 días
    await expect(page.locator('text=Lunes')).toBeVisible();
    await expect(page.locator('text=Martes')).toBeVisible();
    await expect(page.locator('text=Miércoles')).toBeVisible();
    await expect(page.locator('text=Jueves')).toBeVisible();
    await expect(page.locator('text=Viernes')).toBeVisible();

    // Paso 8: Submit
    await page.click('button:has-text("Crear Docente")');

    // Paso 9: Verificar éxito
    await expect(page.locator('text=Docente creado exitosamente')).toBeVisible({ timeout: 5000 });

    // Paso 10: Verificar que se muestra la contraseña generada
    await expect(page.locator('text=Contraseña generada:')).toBeVisible();

    const passwordDisplay = page.locator('[data-testid="generated-password"]');
    await expect(passwordDisplay).toBeVisible();

    const generatedPassword = await passwordDisplay.textContent();
    expect(generatedPassword).toBeTruthy();
    expect(generatedPassword!.length).toBeGreaterThanOrEqual(12);

    // Verificar que tiene caracteres variados
    expect(/[a-z]/.test(generatedPassword!)).toBe(true);
    expect(/[A-Z]/.test(generatedPassword!)).toBe(true);
    expect(/[0-9]/.test(generatedPassword!)).toBe(true);
    expect(/[^a-zA-Z0-9]/.test(generatedPassword!)).toBe(true);

    // Paso 11: Verificar que el docente aparece en la lista
    await page.click('button:has-text("Cerrar")');
    await expect(page.locator('text=Martín González')).toBeVisible();

    // Paso 12: Verificar que tiene el sector asignado
    const docenteRow = page.locator('tr:has-text("Martín González")');
    await expect(docenteRow.locator('text=📐')).toBeVisible(); // Icono de Matemática
  });

  test('Flujo: crear docente con contraseña manual en sector Programación', async ({ page }) => {
    await page.click('button:has-text("Crear nuevo")');

    // Llenar formulario con contraseña manual
    await page.fill('input[name="nombre"]', 'Sofía');
    await page.fill('input[name="apellido"]', 'Ramírez');
    await page.fill('input[name="email"]', `sofia.test.${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'MiPasswordSeguro123!');

    // Seleccionar Programación
    const progCheckbox = page.locator('input[type="checkbox"]:near(:text("Programación"))');
    await progCheckbox.check();
    await expect(progCheckbox).toBeChecked();

    // Verificar icono de Programación (💻)
    await expect(page.locator('text=💻')).toBeVisible();

    await page.click('button:has-text("Crear Docente")');

    // NO debe mostrar contraseña generada
    await expect(page.locator('text=Docente creado exitosamente')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Contraseña generada:')).not.toBeVisible();

    // Verificar en lista
    await expect(page.locator('text=Sofía Ramírez')).toBeVisible();
    const docenteRow = page.locator('tr:has-text("Sofía Ramírez")');
    await expect(docenteRow.locator('text=💻')).toBeVisible();
  });

  test('Flujo: crear docente con AMBOS sectores (Matemática y Programación)', async ({ page }) => {
    await page.click('button:has-text("Crear nuevo")');

    await page.fill('input[name="nombre"]', 'Diego');
    await page.fill('input[name="apellido"]', 'Torres');
    await page.fill('input[name="email"]', `diego.test.${Date.now()}@example.com`);

    // Seleccionar ambos sectores
    await page.locator('input[type="checkbox"]:near(:text("Matemática"))').check();
    await page.locator('input[type="checkbox"]:near(:text("Programación"))').check();

    // Usar "Seleccionar todos" para disponibilidad
    await page.fill('input[name="hora_inicio"]', '10:00');
    await page.fill('input[name="hora_fin"]', '18:00');
    await page.click('button:has-text("Seleccionar todos")');

    // Verificar que se agregaron todos los días
    await expect(page.locator('text=Lunes')).toBeVisible();
    await expect(page.locator('text=Sábado')).toBeVisible();
    await expect(page.locator('text=Domingo')).toBeVisible();

    await page.click('button:has-text("Crear Docente")');

    await expect(page.locator('text=Docente creado exitosamente')).toBeVisible({ timeout: 5000 });

    // Verificar que tiene AMBOS iconos
    const docenteRow = page.locator('tr:has-text("Diego Torres")');
    await expect(docenteRow.locator('text=📐')).toBeVisible();
    await expect(docenteRow.locator('text=💻')).toBeVisible();
  });

  test('Verificación: debe_cambiar_password se establece correctamente en DB', async ({ page, request }) => {
    // Crear docente con password auto-generado
    await page.click('button:has-text("Crear nuevo")');

    const uniqueEmail = `autopass.${Date.now()}@example.com`;
    await page.fill('input[name="nombre"]', 'AutoPass');
    await page.fill('input[name="apellido"]', 'Test');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.locator('input[type="checkbox"]:near(:text("Matemática"))').check();

    await page.click('button:has-text("Crear Docente")');
    await expect(page.locator('text=Docente creado exitosamente')).toBeVisible({ timeout: 5000 });

    // Obtener el ID del docente creado
    const docenteRow = page.locator('tr:has-text("AutoPass Test")');
    const docenteId = await docenteRow.getAttribute('data-id');

    // Hacer request al API para verificar el campo
    const response = await request.get(`/api/admin/docentes/${docenteId}`, {
      headers: {
        'Cookie': await page.context().cookies().then(cookies =>
          cookies.map(c => `${c.name}=${c.value}`).join('; ')
        ),
      },
    });

    expect(response.ok()).toBe(true);
    const docente = await response.json();

    // Verificar que debe_cambiar_password es true
    expect(docente.debe_cambiar_password).toBe(true);
  });

  test('Flujo de login con password que debe cambiar', async ({ page }) => {
    // Este test simula el flujo completo:
    // 1. Admin crea docente con password auto-generado
    // 2. Docente hace login
    // 3. Sistema lo redirige a cambiar contraseña

    // Crear docente
    await page.click('button:has-text("Crear nuevo")');

    const uniqueEmail = `mustchange.${Date.now()}@example.com`;
    await page.fill('input[name="nombre"]', 'MustChange');
    await page.fill('input[name="apellido"]', 'Test');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.locator('input[type="checkbox"]:near(:text("Matemática"))').check();

    await page.click('button:has-text("Crear Docente")');
    await expect(page.locator('text=Contraseña generada:')).toBeVisible({ timeout: 5000 });

    // Copiar contraseña generada
    const generatedPassword = await page.locator('[data-testid="generated-password"]').textContent();

    // Logout del admin
    await page.click('button[aria-label="Logout"]');
    await expect(page).toHaveURL('/login');

    // Login como el nuevo docente
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', generatedPassword!);
    await page.click('button[type="submit"]');

    // Verificar redirección a página de cambio de contraseña
    await expect(page).toHaveURL(/\/cambiar-password/);
    await expect(page.locator('text=Debe cambiar su contraseña')).toBeVisible();
  });

  test('Validación: no permite crear docente sin nombre', async ({ page }) => {
    await page.click('button:has-text("Crear nuevo")');

    // Llenar todo menos nombre
    await page.fill('input[name="apellido"]', 'Test');
    await page.fill('input[name="email"]', 'test@example.com');

    await page.click('button:has-text("Crear Docente")');

    // Verificar que HTML5 validation previene submit
    const nombreInput = page.locator('input[name="nombre"]');
    const validationMessage = await nombreInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Validación: no permite crear docente con email duplicado', async ({ page }) => {
    const duplicateEmail = `duplicate.${Date.now()}@example.com`;

    // Crear primer docente
    await page.click('button:has-text("Crear nuevo")');
    await page.fill('input[name="nombre"]', 'Primero');
    await page.fill('input[name="apellido"]', 'Docente');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.locator('input[type="checkbox"]:near(:text("Matemática"))').check();
    await page.click('button:has-text("Crear Docente")');
    await expect(page.locator('text=Docente creado exitosamente')).toBeVisible({ timeout: 5000 });

    // Intentar crear segundo con mismo email
    await page.click('button:has-text("Crear nuevo")');
    await page.fill('input[name="nombre"]', 'Segundo');
    await page.fill('input[name="apellido"]', 'Docente');
    await page.fill('input[name="email"]', duplicateEmail);
    await page.locator('input[type="checkbox"]:near(:text("Matemática"))').check();
    await page.click('button:has-text("Crear Docente")');

    // Verificar error
    await expect(page.locator('text=El email ya está registrado')).toBeVisible();
  });

  test('UX: botones de disponibilidad deshabilitados sin horario', async ({ page }) => {
    await page.click('button:has-text("Crear nuevo")');

    const lunesViernesBtn = page.locator('button:has-text("Lunes a viernes")');
    const seleccionarTodosBtn = page.locator('button:has-text("Seleccionar todos")');

    // Sin horario configurado, deben estar deshabilitados
    await expect(lunesViernesBtn).toBeDisabled();
    await expect(seleccionarTodosBtn).toBeDisabled();

    // Configurar horario
    await page.fill('input[name="hora_inicio"]', '09:00');
    await page.fill('input[name="hora_fin"]', '17:00');

    // Ahora deben estar habilitados
    await expect(lunesViernesBtn).toBeEnabled();
    await expect(seleccionarTodosBtn).toBeEnabled();
  });
});

test.describe('Verificación de Schema y Seed', () => {
  test('DB tiene sectores Matemática y Programación', async ({ request }) => {
    const response = await request.get('/api/admin/sectores');
    expect(response.ok()).toBe(true);

    const sectores = await response.json();
    expect(sectores).toHaveLength(2);

    const nombres = sectores.map((s: any) => s.nombre);
    expect(nombres).toContain('Matemática');
    expect(nombres).toContain('Programación');

    const mate = sectores.find((s: any) => s.nombre === 'Matemática');
    expect(mate.icono).toBe('📐');
    expect(mate.activo).toBe(true);

    const prog = sectores.find((s: any) => s.nombre === 'Programación');
    expect(prog.icono).toBe('💻');
    expect(prog.activo).toBe(true);
  });

  test('Schema tiene campo debe_cambiar_password', async ({ request }) => {
    // Este test verifica indirectamente que el campo existe
    // creando un docente y verificando que el campo está en la respuesta

    const response = await request.post('/api/docentes', {
      data: {
        nombre: 'SchemaTest',
        apellido: 'User',
        email: `schematest.${Date.now()}@example.com`,
        // Sin password - auto-generar
      },
    });

    expect(response.ok()).toBe(true);
    const docente = await response.json();

    // Verificar que el campo existe
    expect(docente).toHaveProperty('debe_cambiar_password');
    expect(docente.debe_cambiar_password).toBe(true);
  });
});
