import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup - Se ejecuta UNA VEZ antes de todos los tests
 *
 * Use cases:
 * - Preparar base de datos de prueba
 * - Autenticación global (guardar cookies/tokens)
 * - Limpiar datos antiguos
 * - Verificar que servicios externos estén disponibles
 * - Seed de datos necesarios para tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Playwright Global Setup - Iniciando...');

  const { baseURL } = config.projects[0].use;

  // === 1. Verificar que la aplicación está disponible ===
  console.log(`📡 Verificando que ${baseURL} está disponible...`);

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Intentar cargar la home
    await page.goto(baseURL || 'http://localhost:3000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('✅ Aplicación disponible');
    await browser.close();
  } catch (error) {
    console.error('❌ Error: La aplicación no está disponible');
    console.error(error);
    throw new Error('La aplicación no responde en ' + baseURL);
  }

  // === 2. Setup de autenticación (si es necesario) ===
  // Ejemplo: hacer login una vez y guardar el estado
  // const browser = await chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // await page.goto(`${baseURL}/login`);
  // await page.fill('input[name="email"]', 'test@example.com');
  // await page.fill('input[name="password"]', 'password');
  // await page.click('button[type="submit"]');
  // await page.waitForURL(`${baseURL}/dashboard`);
  //
  // // Guardar estado de autenticación
  // await context.storageState({ path: 'playwright/.auth/user.json' });
  // await browser.close();

  // === 3. Preparar base de datos (si es necesario) ===
  // Ejemplo: ejecutar script de seed
  // await execSync('yarn workspace api db:seed:test', { stdio: 'inherit' });

  // === 4. Verificar variables de entorno críticas ===
  const requiredEnvVars = [
    // 'NEXT_PUBLIC_API_URL',
    // 'DATABASE_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Variable de entorno ${envVar} no está definida`);
    }
  }

  console.log('✅ Global Setup completado');
}

export default globalSetup;
