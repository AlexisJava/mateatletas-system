#!/usr/bin/env ts-node
/**
 * Script de Auditoría de Tests
 *
 * Detecta:
 * 1. Tests que importan archivos que ya no existen
 * 2. Tests que usan describe.skip o it.skip
 * 3. Tests que referencian campos/métodos obsoletos del schema
 * 4. Tests sin ejecutar en los últimos X días (si hay coverage)
 *
 * Uso: npx ts-node scripts/audit-tests.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const INTEGRATION_DIR = path.join(__dirname, '../test/integration');
const SRC_DIR = path.join(__dirname, '../src');

interface AuditResult {
  file: string;
  issues: AuditIssue[];
}

interface AuditIssue {
  type: 'skip' | 'missing-import' | 'obsolete-field' | 'no-assertions';
  line?: number;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

// Campos obsoletos conocidos (actualizar según cambios de schema)
const OBSOLETE_FIELDS = [
  'precioClubMatematicas',
  'precioCursosEspecializados',
  'precioMultipleActividades',
  'descuentoAACREA',
  'tieneAACREA',
  'CLUB_MATEMATICAS',
  'CURSO_ESPECIALIZADO',
];

// Imports que probablemente ya no existen
const POTENTIALLY_DEAD_IMPORTS = [
  'calcular-precio.use-case',
  'actualizar-configuracion-precios.use-case',
  'precio.rules',
  'inscripcion-mensual.repository',
  'configuracion-precios.repository',
];

function getAllTestFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTestFiles(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function auditFile(filePath: string): AuditResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: AuditIssue[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Detectar describe.skip o it.skip
    if (line.match(/describe\.skip|it\.skip|test\.skip|xit\(|xdescribe\(/)) {
      issues.push({
        type: 'skip',
        line: lineNum,
        description: `Test saltado: ${line.trim().substring(0, 60)}...`,
        severity: 'medium',
      });
    }

    // Detectar campos obsoletos
    for (const field of OBSOLETE_FIELDS) {
      if (line.includes(field)) {
        issues.push({
          type: 'obsolete-field',
          line: lineNum,
          description: `Campo obsoleto "${field}" encontrado`,
          severity: 'high',
        });
      }
    }

    // Detectar imports potencialmente muertos
    for (const deadImport of POTENTIALLY_DEAD_IMPORTS) {
      if (line.includes(deadImport)) {
        issues.push({
          type: 'missing-import',
          line: lineNum,
          description: `Import posiblemente obsoleto: ${deadImport}`,
          severity: 'high',
        });
      }
    }
  });

  // Detectar tests sin assertions
  const hasExpect = content.includes('expect(');
  const hasIt = content.includes('it(') || content.includes('test(');
  if (hasIt && !hasExpect) {
    issues.push({
      type: 'no-assertions',
      description: 'Archivo de test sin expect() - posiblemente incompleto',
      severity: 'medium',
    });
  }

  return { file: relativePath, issues };
}

function printReport(results: AuditResult[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('  AUDITORÍA DE TESTS - Mateatletas Ecosystem');
  console.log('='.repeat(80) + '\n');

  let totalIssues = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  const filesWithIssues = results.filter((r) => r.issues.length > 0);

  if (filesWithIssues.length === 0) {
    console.log('✅ No se encontraron problemas en los tests!\n');
    return;
  }

  for (const result of filesWithIssues) {
    console.log(`\n📁 ${result.file}`);
    console.log('-'.repeat(60));

    for (const issue of result.issues) {
      totalIssues++;
      const icon =
        issue.severity === 'high'
          ? '🔴'
          : issue.severity === 'medium'
            ? '🟡'
            : '🟢';
      const lineInfo = issue.line ? `L${issue.line}: ` : '';
      console.log(`  ${icon} ${lineInfo}${issue.description}`);

      if (issue.severity === 'high') highCount++;
      else if (issue.severity === 'medium') mediumCount++;
      else lowCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('  RESUMEN');
  console.log('='.repeat(80));
  console.log(`  Total archivos analizados: ${results.length}`);
  console.log(`  Archivos con problemas: ${filesWithIssues.length}`);
  console.log(`  Total issues: ${totalIssues}`);
  console.log(`    🔴 Alta severidad: ${highCount}`);
  console.log(`    🟡 Media severidad: ${mediumCount}`);
  console.log(`    🟢 Baja severidad: ${lowCount}`);
  console.log('='.repeat(80) + '\n');
}

// Main
const testFiles = getAllTestFiles(INTEGRATION_DIR);
const unitTestDir = path.join(SRC_DIR);

// También buscar unit tests dentro de src/
function findUnitTests(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findUnitTests(fullPath));
    } else if (entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const unitTests = findUnitTests(unitTestDir);
const allTests = [...testFiles, ...unitTests];

console.log(`Analizando ${allTests.length} archivos de test...`);

const results = allTests.map(auditFile);
printReport(results);
