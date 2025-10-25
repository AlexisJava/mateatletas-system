/**
 * Script de auto-detección de planificaciones
 *
 * Escanea todos los archivos .tsx en /planificaciones/
 * Busca exports de PLANIFICACION_CONFIG
 * Registra/actualiza en la base de datos
 *
 * Uso:
 *   npm run detect-planificaciones
 *   o se ejecuta automáticamente en build
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// TIPOS
// ============================================================================

interface PlanificacionConfig {
  codigo: string;
  titulo: string;
  grupo: string;
  mes?: number | null;
  anio: number;
  semanas: number;
}

interface PlanificacionDetectada {
  config: PlanificacionConfig;
  filePath: string;
  relativePath: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const PLANIFICACIONES_DIR = path.join(
  __dirname,
  '../../../../web/src/planificaciones'
);

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

// ============================================================================
// ESCANEO DE ARCHIVOS
// ============================================================================

/**
 * Escanea recursivamente un directorio buscando archivos .tsx
 */
function escanearDirectorio(dir: string): string[] {
  const archivos: string[] = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        // Ignorar node_modules, .next, etc
        if (
          item.name === 'node_modules' ||
          item.name === '.next' ||
          item.name === 'dist' ||
          item.name === 'shared' // Carpeta de componentes compartidos
        ) {
          continue;
        }
        // Recursión
        archivos.push(...escanearDirectorio(fullPath));
      } else if (item.isFile() && item.name.endsWith('.tsx')) {
        archivos.push(fullPath);
      }
    }
  } catch (error) {
    // Directorio no existe, está ok (primera vez)
  }

  return archivos;
}

/**
 * Extrae PLANIFICACION_CONFIG de un archivo TypeScript
 */
function extraerConfig(filePath: string): PlanificacionConfig | null {
  try {
    const contenido = fs.readFileSync(filePath, 'utf-8');

    // Buscar export const PLANIFICACION_CONFIG
    const regex =
      /export\s+const\s+PLANIFICACION_CONFIG\s*:\s*\w+\s*=\s*\{([^}]+)\}/s;
    const match = contenido.match(regex);

    if (!match) {
      return null;
    }

    const configBlock = match[1];

    // Extraer valores usando regex simples
    const extractValue = (key: string): string | null => {
      const valueRegex = new RegExp(`${key}\\s*:\\s*['"]([^'"]+)['"]`);
      const valueMatch = configBlock.match(valueRegex);
      return valueMatch ? valueMatch[1] : null;
    };

    const extractNumber = (key: string): number | null => {
      const numberRegex = new RegExp(`${key}\\s*:\\s*(\\d+)`);
      const numberMatch = configBlock.match(numberRegex);
      return numberMatch ? parseInt(numberMatch[1], 10) : null;
    };

    const codigo = extractValue('codigo');
    const titulo = extractValue('titulo');
    const grupo = extractValue('grupo');
    const anio = extractNumber('anio');
    const semanas = extractNumber('semanas');
    const mes = extractNumber('mes');

    if (!codigo || !titulo || !grupo || !anio || !semanas) {
      log(
        `⚠️  Archivo ${path.basename(filePath)}: PLANIFICACION_CONFIG incompleto`,
        COLORS.yellow
      );
      return null;
    }

    return {
      codigo,
      titulo,
      grupo,
      mes: mes || null,
      anio,
      semanas,
    };
  } catch (error) {
    log(
      `❌ Error leyendo ${path.basename(filePath)}: ${error}`,
      COLORS.red
    );
    return null;
  }
}

/**
 * Detectar todas las planificaciones en el directorio
 */
function detectarPlanificaciones(): PlanificacionDetectada[] {
  log('\n🔍 Escaneando planificaciones...', COLORS.blue + COLORS.bright);

  if (!fs.existsSync(PLANIFICACIONES_DIR)) {
    log(
      `⚠️  Directorio no encontrado: ${PLANIFICACIONES_DIR}`,
      COLORS.yellow
    );
    return [];
  }

  const archivos = escanearDirectorio(PLANIFICACIONES_DIR);
  log(`   Encontrados ${archivos.length} archivos .tsx`, COLORS.blue);

  const planificaciones: PlanificacionDetectada[] = [];

  for (const filePath of archivos) {
    const config = extraerConfig(filePath);
    if (config) {
      const relativePath = path.relative(PLANIFICACIONES_DIR, filePath);
      planificaciones.push({
        config,
        filePath,
        relativePath,
      });
      log(`   ✅ ${config.codigo}`, COLORS.green);
    }
  }

  return planificaciones;
}

// ============================================================================
// REGISTRO EN BASE DE DATOS
// ============================================================================

/**
 * Registrar o actualizar planificación en BD
 */
async function registrarPlanificacion(
  planificacion: PlanificacionDetectada
): Promise<void> {
  const { config, relativePath } = planificacion;

  try {
    // Buscar si ya existe
    const existente = await prisma.planificacionSimple.findUnique({
      where: { codigo: config.codigo },
    });

    if (existente) {
      // Actualizar
      await prisma.planificacionSimple.update({
        where: { codigo: config.codigo },
        data: {
          titulo: config.titulo,
          grupo_codigo: config.grupo,
          mes: config.mes,
          anio: config.anio,
          semanas_total: config.semanas,
          archivo_path: relativePath,
          ultima_actualizacion: new Date(),
        },
      });

      log(
        `   🔄 Actualizado: ${config.codigo} - ${config.titulo}`,
        COLORS.yellow
      );
    } else {
      // Crear nuevo
      await prisma.planificacionSimple.create({
        data: {
          codigo: config.codigo,
          titulo: config.titulo,
          grupo_codigo: config.grupo,
          mes: config.mes,
          anio: config.anio,
          semanas_total: config.semanas,
          archivo_path: relativePath,
          estado: 'DETECTADA',
        },
      });

      log(
        `   ✨ Nuevo: ${config.codigo} - ${config.titulo}`,
        COLORS.green + COLORS.bright
      );
    }
  } catch (error) {
    log(
      `   ❌ Error registrando ${config.codigo}: ${error}`,
      COLORS.red
    );
  }
}

/**
 * Limpiar planificaciones que ya no existen en el código
 */
async function limpiarPlanificacionesHuerfanas(
  codigosActuales: string[]
): Promise<void> {
  try {
    // Obtener todas las planificaciones de la BD
    const todasEnBD = await prisma.planificacionSimple.findMany({
      where: { auto_detectada: true },
    });

    const codigosEnBD = todasEnBD.map((p) => p.codigo);
    const huerfanas = codigosEnBD.filter((c) => !codigosActuales.includes(c));

    if (huerfanas.length > 0) {
      log(
        `\n🧹 Limpiando ${huerfanas.length} planificaciones huérfanas...`,
        COLORS.yellow
      );

      for (const codigo of huerfanas) {
        await prisma.planificacionSimple.update({
          where: { codigo },
          data: { estado: 'ARCHIVADA' },
        });

        log(`   🗑️  Archivado: ${codigo}`, COLORS.yellow);
      }
    }
  } catch (error) {
    log(`❌ Error limpiando huérfanas: ${error}`, COLORS.red);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log(
    '\n╔═══════════════════════════════════════════════════════════╗',
    COLORS.blue + COLORS.bright
  );
  log(
    '║  AUTO-DETECCIÓN DE PLANIFICACIONES                       ║',
    COLORS.blue + COLORS.bright
  );
  log(
    '╚═══════════════════════════════════════════════════════════╝',
    COLORS.blue + COLORS.bright
  );

  try {
    // 1. Detectar planificaciones
    const planificaciones = detectarPlanificaciones();

    if (planificaciones.length === 0) {
      log('\n⚠️  No se encontraron planificaciones', COLORS.yellow);
      return;
    }

    log(
      `\n📦 Total detectadas: ${planificaciones.length}`,
      COLORS.blue + COLORS.bright
    );

    // 2. Registrar en BD
    log('\n💾 Registrando en base de datos...', COLORS.blue + COLORS.bright);

    for (const planificacion of planificaciones) {
      await registrarPlanificacion(planificacion);
    }

    // 3. Limpiar huérfanas
    const codigosActuales = planificaciones.map((p) => p.config.codigo);
    await limpiarPlanificacionesHuerfanas(codigosActuales);

    // 4. Resumen
    log(
      '\n╔═══════════════════════════════════════════════════════════╗',
      COLORS.green + COLORS.bright
    );
    log(
      '║  ✅ AUTO-DETECCIÓN COMPLETADA                            ║',
      COLORS.green + COLORS.bright
    );
    log(
      '╚═══════════════════════════════════════════════════════════╝',
      COLORS.green + COLORS.bright
    );

    log(`\n📊 Resumen:`);
    log(`   • Planificaciones detectadas: ${planificaciones.length}`);
    log(`   • Directorio escaneado: ${PLANIFICACIONES_DIR}`);
    log(`   • Estado: Todas registradas en BD`);
    log(`\n✨ Las planificaciones ya están disponibles en el sistema\n`);
  } catch (error) {
    log(
      '\n╔═══════════════════════════════════════════════════════════╗',
      COLORS.red + COLORS.bright
    );
    log(
      '║  ❌ ERROR EN AUTO-DETECCIÓN                              ║',
      COLORS.red + COLORS.bright
    );
    log(
      '╚═══════════════════════════════════════════════════════════╝',
      COLORS.red + COLORS.bright
    );
    log(`\n${error}\n`, COLORS.red);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
