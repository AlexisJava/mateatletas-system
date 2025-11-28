/**
 * Script para subir animaciones de Ready Player Me a Vercel Blob
 * Uso: node scripts/upload-animations.mjs
 */

// Cargar variables de entorno desde .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { put } from '@vercel/blob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname as pathDirname } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

const ANIMATIONS_SOURCE =
  process.env.ANIMATIONS_SOURCE || `${homedir()}/rpm-animations/animation-library`;
const SELECTED_FILE =
  process.env.SELECTED_FILE ||
  `${homedir()}/rpm-animations/animation-library/selected-animations.txt`;
const OUTPUT_JSON = resolve(__dirname, '../apps/web/public/animations-config.json');

// Mapeo de nombres de categorías para mostrar nombres más amigables
const categoryNames = {
  dance: 'Bailes',
  expression: 'Expresiones',
  idle: 'Espera',
  locomotion: 'Movimiento',
};

// Descripciones por categoría
const categoryDescriptions = {
  dance: 'Baile celebratorio',
  expression: 'Expresión facial',
  idle: 'Animación de espera',
  locomotion: 'Movimiento de locomoción',
};

async function uploadAnimations() {
  console.log('🚀 Iniciando subida de animaciones a Vercel Blob...\n');

  // Verificar que existe el token de Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN no está configurado');
    console.error('Por favor ejecuta: vercel env pull .env.local');
    process.exit(1);
  }

  // Leer lista de animaciones seleccionadas
  let selectedPaths;
  try {
    selectedPaths = readFileSync(SELECTED_FILE, 'utf-8')
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#') && line.endsWith('.glb'));
  } catch (error) {
    console.error(`❌ Error leyendo ${SELECTED_FILE}:`, error.message);
    process.exit(1);
  }

  console.log(`📋 Encontradas ${selectedPaths.length} animaciones para subir\n`);

  const animations = [];
  let uploadCount = 0;
  let errorCount = 0;

  for (const relativePath of selectedPaths) {
    try {
      const fullPath = resolve(ANIMATIONS_SOURCE, relativePath);
      const fileName = basename(relativePath);
      const category = dirname(relativePath).split('/').pop();
      const gender = relativePath.startsWith('masculine') ? 'masculine' : 'feminine';

      // Crear ID único
      const animationId = `${gender}-${category}-${fileName.replace('.glb', '')}`.toLowerCase();

      console.log(
        `📤 [${uploadCount + 1}/${selectedPaths.length}] Subiendo: ${fileName} (${category})...`,
      );

      // Leer archivo
      const fileBuffer = await readFile(fullPath);

      // Subir a Vercel Blob
      const blob = await put(`animations/${gender}/${category}/${fileName}`, fileBuffer, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log(`   ✅ URL: ${blob.url}\n`);

      // Calcular puntos necesarios basados en la categoría
      let requiredPoints = 50;
      if (category === 'dance') requiredPoints = 100;
      else if (category === 'expression') requiredPoints = 75;
      else if (category === 'locomotion') requiredPoints = 150;
      else if (category === 'idle') requiredPoints = 50;

      // Agregar a la configuración
      animations.push({
        id: animationId,
        name: fileName.replace('.glb', '').replace(/_/g, ' '),
        displayName: `${categoryNames[category] || category} ${uploadCount + 1}`,
        category: category.toLowerCase(),
        gender: gender,
        filename: fileName,
        url: blob.url,
        requiredPoints: requiredPoints,
        description: `${categoryDescriptions[category] || 'Animación'} para avatar ${gender === 'masculine' ? 'masculino' : 'femenino'}`,
        unlocked: category === 'idle', // Las animaciones idle vienen desbloqueadas por defecto
      });

      uploadCount++;
    } catch (error) {
      console.error(`   ❌ Error subiendo ${relativePath}:`, error.message);
      errorCount++;
    }
  }

  // Ordenar animaciones por categoría y género
  animations.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.gender !== b.gender) return a.gender.localeCompare(b.gender);
    return a.filename.localeCompare(b.filename);
  });

  // Generar archivo de configuración JSON
  const config = {
    version: '1.0.0',
    lastUpdate: new Date().toISOString(),
    totalAnimations: animations.length,
    categories: {
      dance: animations.filter((a) => a.category === 'dance').length,
      expression: animations.filter((a) => a.category === 'expression').length,
      idle: animations.filter((a) => a.category === 'idle').length,
      locomotion: animations.filter((a) => a.category === 'locomotion').length,
    },
    genders: {
      masculine: animations.filter((a) => a.gender === 'masculine').length,
      feminine: animations.filter((a) => a.gender === 'feminine').length,
    },
    animations: animations,
  };

  writeFileSync(OUTPUT_JSON, JSON.stringify(config, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ PROCESO COMPLETADO!');
  console.log('='.repeat(60));
  console.log(`📊 Total subidas exitosas: ${uploadCount} de ${selectedPaths.length}`);
  if (errorCount > 0) {
    console.log(`⚠️  Errores: ${errorCount}`);
  }
  console.log(`📄 Configuración guardada en: ${OUTPUT_JSON}`);
  console.log('\n📈 Resumen por categoría:');
  console.log(`   🕺 Bailes: ${config.categories.dance}`);
  console.log(`   😊 Expresiones: ${config.categories.expression}`);
  console.log(`   🧍 Espera: ${config.categories.idle}`);
  console.log(`   🏃 Movimiento: ${config.categories.locomotion}`);
  console.log('\n👥 Resumen por género:');
  console.log(`   ♂️  Masculino: ${config.genders.masculine}`);
  console.log(`   ♀️  Femenino: ${config.genders.feminine}`);
  console.log('\n🎉 ¡Listo para usar en tu aplicación!');
  console.log('='.repeat(60) + '\n');
}

// Ejecutar
uploadAnimations().catch((error) => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
