import { test, expect } from '@playwright/test';

/**
 * 🔍 DIAGNÓSTICO RÁPIDO
 *
 * Test simple para verificar que el servidor está corriendo
 * y que la aplicación responde correctamente.
 */

test('🔍 Diagnóstico: Servidor responde correctamente', async ({ page }) => {
  console.log('🔍 Verificando servidor...');

  // Ir a la página principal
  await page.goto('http://localhost:3000/', { timeout: 30000 });

  // Esperar que cargue
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Obtener título de la página
  const title = await page.title();
  console.log(`📄 Título de la página: "${title}"`);

  // Verificar que el body no está vacío
  const bodyText = await page.locator('body').textContent();
  const bodyLength = bodyText?.length || 0;

  console.log(`📏 Longitud del contenido: ${bodyLength} caracteres`);

  expect(bodyLength).toBeGreaterThan(50);

  // Screenshot
  await page.screenshot({ path: 'test-results/diagnostico-home.png' });

  console.log('✅ Servidor funcionando correctamente');
});

test('🔍 Diagnóstico: Página de login carga correctamente', async ({
  page,
}) => {
  console.log('🔍 Verificando página de login...');

  // Ir a login
  await page.goto('http://localhost:3000/login', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Verificar que hay un formulario
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator(
    'input[type="password"], input[name="password"]'
  );

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(passwordInput).toBeVisible({ timeout: 10000 });

  console.log('✅ Página de login tiene los campos esperados');

  // Screenshot
  await page.screenshot({
    path: 'test-results/diagnostico-login.png',
    fullPage: true,
  });
});

test('🔍 Diagnóstico: Verificar estructura de login', async ({ page }) => {
  console.log('🔍 Analizando estructura del login...');

  await page.goto('http://localhost:3000/login', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Buscar diferentes selectores posibles
  const selectores = [
    { nombre: 'Email input', selector: 'input[type="email"]' },
    { nombre: 'Email by name', selector: 'input[name="email"]' },
    { nombre: 'Password input', selector: 'input[type="password"]' },
    { nombre: 'Password by name', selector: 'input[name="password"]' },
    { nombre: 'Submit button', selector: 'button[type="submit"]' },
    { nombre: 'Toggle estudiante', selector: 'text=/estudiante/i' },
    { nombre: 'Toggle tutor', selector: 'text=/tutor/i' },
    { nombre: 'Toggle padre', selector: 'text=/padre/i' },
  ];

  console.log('\n📋 Elementos encontrados:');

  for (const sel of selectores) {
    const count = await page.locator(sel.selector).count();
    const encontrado = count > 0 ? '✅' : '❌';
    console.log(`  ${encontrado} ${sel.nombre}: ${count} elementos`);
  }

  console.log('');
});
