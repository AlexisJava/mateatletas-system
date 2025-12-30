import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/admin.json');

/**
 * Auth Setup - Login como ADMIN antes de los tests
 *
 * Este setup se ejecuta una vez y guarda el estado de autenticación
 * para reutilizarlo en todos los tests que requieran autenticación.
 *
 * IMPORTANTE: Requiere que exista un usuario admin en la base de datos.
 * Credenciales configurables via variables de entorno.
 */
setup('authenticate as admin', async ({ page }) => {
  // Credenciales de test (configurables via env)
  const email = process.env.E2E_ADMIN_EMAIL || 'admin@mateatletas.com';
  const password = process.env.E2E_ADMIN_PASSWORD || 'Admin123!';

  console.log(`🔐 Autenticando como: ${email}`);

  // Ir a la página de login
  await page.goto('/login');

  // Esperar a que cargue el formulario
  await expect(page.getByRole('heading', { name: /Iniciar/i })).toBeVisible({ timeout: 10000 });

  // Llenar credenciales
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);

  // Submit
  await page.getByRole('button', { name: /Ingresar|Iniciar/i }).click();

  // Esperar redirección al dashboard (o a selección de rol si tiene múltiples)
  await page.waitForURL(/\/(admin|docente|estudiante|seleccionar-rol)/, { timeout: 15000 });

  // Si hay selección de rol, elegir ADMIN
  if (page.url().includes('seleccionar-rol')) {
    await page.getByRole('button', { name: /Admin/i }).click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });
  }

  // Verificar que estamos autenticados
  expect(page.url()).toContain('/admin');

  console.log('✅ Autenticación exitosa');

  // Guardar estado de autenticación (cookies y localStorage)
  await page.context().storageState({ path: authFile });

  console.log(`💾 Estado guardado en: ${authFile}`);
});
