/**
 * Script para crear usuario de prueba en Railway
 *
 * Uso:
 * DATABASE_URL="postgresql://..." ts-node scripts/crear-usuario-prueba-railway.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando usuario de prueba en Railway...\n');

  const email = 'test-pagos@mateatletas.com';
  const password = 'TestPagos2025!';

  try {
    // Verificar si ya existe
    const existing = await prisma.tutor.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('✅ Usuario ya existe:', email);
      console.log('ID:', existing.id);
      console.log('Nombre:', existing.nombre, existing.apellido);
      return;
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);

    const tutor = await prisma.tutor.create({
      data: {
        email,
        nombre: 'Test',
        apellido: 'Pagos',
        password: hashedPassword,
        telefono: '1234567890',
        dni: '99999999',
        domicilio: 'Calle Test 123',
        fechaNacimiento: new Date('1990-01-01'),
        rol: 'TUTOR',
      },
    });

    console.log('✅ Usuario creado exitosamente!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 ID:', tutor.id);
    console.log('\n📝 Usa estas credenciales para hacer login y obtener el JWT token');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
