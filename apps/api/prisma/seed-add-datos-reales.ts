/**
 * AGREGAR DATOS REALES DE MATEATLETAS AL SEED
 * Este script AGREGA los datos reales sin borrar los existentes
 */

import { PrismaClient, TipoProducto } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'Mateatletas2024!';

async function main() {
  console.log('🚀 Agregando datos reales de Mateatletas...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ============================================
  // 1. DOCENTES REALES
  // ============================================
  console.log('👩‍🏫 Agregando docentes reales...');

  const gimena = await prisma.docente.upsert({
    where: { email: 'gime.reniero@mateatletas.com' },
    update: {},
    create: {
      email: 'gime.reniero@mateatletas.com',
      password_hash: hashedPassword,
      nombre: 'Gimena',
      apellido: 'Reniero',
      titulo: 'Profesora en Matemática',
      bio: 'Especialista en trabajo con niños y experta en Matific',
    }
  });
  console.log(`  ✓ Gimena Reniero`);

  const ayelen = await prisma.docente.upsert({
    where: { email: 'ayelen.yanez@mateatletas.com' },
    update: {},
    create: {
      email: 'ayelen.yanez@mateatletas.com',
      password_hash: hashedPassword,
      nombre: 'Ayelen',
      apellido: 'Yañez',
      titulo: 'Licenciada en Psicopedagogía',
      bio: 'Especialista en habilidades y dificultades del aprendizaje de matemáticas. Diplomada en dificultades y habilidades matemáticas',
    }
  });
  console.log(`  ✓ Ayelen Yañez\n`);

  // ============================================
  // 2. TUTORES REALES
  // ============================================
  console.log('👨‍👩‍👧‍👦 Agregando tutores reales...');

  const laura = await prisma.tutor.upsert({
    where: { email: 'laura.hermoso@test.com' },
    update: {},
    create: {
      email: 'laura.hermoso@test.com',
      password_hash: hashedPassword,
      nombre: 'Laura',
      apellido: 'Hermoso',
      telefono: '29912345678',
    }
  });
  console.log(`  ✓ Laura Hermoso`);

  const adriana = await prisma.tutor.upsert({
    where: { email: 'adriana.lui@test.com' },
    update: {},
    create: {
      email: 'adriana.lui@test.com',
      password_hash: hashedPassword,
      nombre: 'Adriana',
      apellido: 'Lui',
      telefono: '29978945612',
    }
  });
  console.log(`  ✓ Adriana Lui\n`);

  // ============================================
  // 3. ESTUDIANTES REALES
  // ============================================
  console.log('👶 Agregando estudiantes reales...');

  // Dante Migani (tutor: Laura)
  await prisma.estudiante.upsert({
    where: { username: 'dante.migani' },
    update: {},
    create: {
      username: 'dante.migani',
      email: 'dante.migani@estudiante.com',
      password_hash: hashedPassword,
      nombre: 'Dante',
      apellido: 'Migani',
      edad: 6,
      nivel_escolar: '2do Primaria',
      tutor_id: laura.id,
    }
  });
  console.log(`  ✓ Dante Migani (2do grado)`);

  // Nicolas Schenone (tutor: Adriana)
  await prisma.estudiante.upsert({
    where: { username: 'nicolas.schenone' },
    update: {},
    create: {
      username: 'nicolas.schenone',
      email: 'nicolas.schenone@estudiante.com',
      password_hash: hashedPassword,
      nombre: 'Nicolas',
      apellido: 'Schenone',
      edad: 6,
      nivel_escolar: '3ro Primaria',
      tutor_id: adriana.id,
    }
  });
  console.log(`  ✓ Nicolas Schenone (3ro grado)`);

  // Isabella Schenone (tutor: Adriana)
  await prisma.estudiante.upsert({
    where: { username: 'isabella.schenone' },
    update: {},
    create: {
      username: 'isabella.schenone',
      email: 'isabella.schenone@estudiante.com',
      password_hash: hashedPassword,
      nombre: 'Isabella',
      apellido: 'Schenone',
      edad: 5,
      nivel_escolar: '2do Primaria',
      tutor_id: adriana.id,
    }
  });
  console.log(`  ✓ Isabella Schenone (2do grado)`);

  // Giuliana Schenone (tutor: Adriana)
  await prisma.estudiante.upsert({
    where: { username: 'giuliana.schenone' },
    update: {},
    create: {
      username: 'giuliana.schenone',
      email: 'giuliana.schenone@estudiante.com',
      password_hash: hashedPassword,
      nombre: 'Giuliana',
      apellido: 'Schenone',
      edad: 8,
      nivel_escolar: '4to Primaria',
      tutor_id: adriana.id,
    }
  });
  console.log(`  ✓ Giuliana Schenone (4to grado)`);

  // Theo Ghesla (tutor: Adriana)
  await prisma.estudiante.upsert({
    where: { username: 'theo.ghesla' },
    update: {},
    create: {
      username: 'theo.ghesla',
      email: 'theo.ghesla@estudiante.com',
      password_hash: hashedPassword,
      nombre: 'Theo',
      apellido: 'Ghesla',
      edad: 6,
      nivel_escolar: '3ro Primaria',
      tutor_id: adriana.id,
    }
  });
  console.log(`  ✓ Theo Ghesla (3ro grado)\n`);

  // ============================================
  // 4. PRODUCTOS REALES
  // ============================================
  console.log('💳 Agregando productos reales del club...');

  // Los productos ya fueron creados en el seed principal
  // Solo agregamos personas reales del club
  console.log(`  → Los productos ya fueron creados en el seed principal\n`);

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('✅ DATOS REALES AGREGADOS EXITOSAMENTE\n');
  console.log('📊 RESUMEN:');
  console.log('  • 2 Docentes reales agregados');
  console.log('  • 2 Tutores reales agregados');
  console.log('  • 5 Estudiantes reales agregados');
  console.log('\n🔑 CREDENCIALES DE ACCESO:');
  console.log('  Password para todos: Mateatletas2024!');
  console.log('\n  DOCENTES REALES:');
  console.log('    • gime.reniero@mateatletas.com');
  console.log('    • ayelen.yanez@mateatletas.com');
  console.log('\n  TUTORES REALES:');
  console.log('    • laura.hermoso@test.com');
  console.log('    • adriana.lui@test.com');
  console.log('\n  ESTUDIANTES REALES:');
  console.log('    • dante.migani@estudiante.com');
  console.log('    • nicolas.schenone@estudiante.com');
  console.log('    • isabella.schenone@estudiante.com');
  console.log('    • giuliana.schenone@estudiante.com');
  console.log('    • theo.ghesla@estudiante.com');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error agregando datos reales:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
