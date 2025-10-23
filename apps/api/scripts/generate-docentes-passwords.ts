/**
 * Script para generar contraseñas temporales para docentes existentes
 *
 * Uso:
 * cd apps/api
 * npx ts-node scripts/generate-docentes-passwords.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Función para generar contraseña segura
function generateSecurePassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin I, O para evitar confusión
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Sin i, l, o para evitar confusión
  const numbers = '23456789'; // Sin 0, 1 para evitar confusión
  const symbols = '!@#$%&*+-=?';

  let password = '';

  // Asegurar al menos 1 de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Rellenar el resto con caracteres aleatorios de todos los tipos
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres para que los obligatorios no estén siempre al inicio
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

async function main() {
  console.log('🔐 Generando contraseñas temporales para docentes...\n');

  // Obtener todos los docentes
  const docentes = await prisma.docente.findMany({
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      password_temporal: true,
    },
  });

  console.log(`📊 Total de docentes encontrados: ${docentes.length}\n`);

  const results = [];

  for (const docente of docentes) {
    // Generar nueva contraseña temporal
    const passwordTemporal = generateSecurePassword();
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    // Actualizar docente
    await prisma.docente.update({
      where: { id: docente.id },
      data: {
        password_temporal: passwordTemporal,
        password_hash: passwordHash,
        debe_cambiar_password: true,
      },
    });

    results.push({
      email: docente.email,
      nombre: `${docente.nombre} ${docente.apellido}`,
      password: passwordTemporal,
    });

    console.log(`✅ ${docente.nombre} ${docente.apellido} (${docente.email})`);
    console.log(`   Contraseña temporal: ${passwordTemporal}\n`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RESUMEN DE CREDENCIALES GENERADAS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const result of results) {
    console.log(`👤 ${result.nombre}`);
    console.log(`   Email: ${result.email}`);
    console.log(`   Contraseña: ${result.password}`);
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Proceso completado exitosamente!');
  console.log('📊 Las credenciales ahora están disponibles en /admin/credenciales');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
