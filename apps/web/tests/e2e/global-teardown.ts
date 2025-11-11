import { FullConfig } from '@playwright/test';

/**
 * Global Teardown - Se ejecuta UNA VEZ después de todos los tests
 *
 * Use cases:
 * - Limpiar base de datos de prueba
 * - Eliminar archivos temporales
 * - Cerrar conexiones persistentes
 * - Generar reportes finales
 * - Notificar resultados a servicios externos
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Playwright Global Teardown - Limpiando...');

  // === 1. Limpiar base de datos de prueba ===
  // Ejemplo: eliminar datos de test
  // await execSync('yarn workspace api db:clean:test', { stdio: 'inherit' });

  // === 2. Limpiar archivos temporales ===
  // Ejemplo: eliminar screenshots antiguos, videos, etc.
  // Solo mantener los de la última ejecución
  // const fs = require('fs');
  // const path = require('path');
  // const testResultsDir = path.join(__dirname, '../../test-results');
  // if (fs.existsSync(testResultsDir)) {
  //   // Limpiar archivos antiguos (más de 7 días)
  //   // ... lógica de limpieza
  // }

  // === 3. Generar reporte consolidado (opcional) ===
  // Ejemplo: agregar metadata adicional al reporte JSON
  // const reportPath = path.join(__dirname, '../../test-results/results.json');
  // if (fs.existsSync(reportPath)) {
  //   const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  //   report.metadata = {
  //     timestamp: new Date().toISOString(),
  //     environment: process.env.NODE_ENV || 'test',
  //     baseURL: config.projects[0].use.baseURL,
  //   };
  //   fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  // }

  // === 4. Notificar resultados (opcional) ===
  // Ejemplo: enviar webhook a Slack, Discord, etc.
  // if (process.env.CI && process.env.SLACK_WEBHOOK_URL) {
  //   await fetch(process.env.SLACK_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `Tests E2E completados - ${new Date().toLocaleString()}`,
  //     }),
  //   });
  // }

  console.log('✅ Global Teardown completado');
}

export default globalTeardown;
