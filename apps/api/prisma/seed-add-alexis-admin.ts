/**
 * AGREGAR ALEXIS FIGUEROA COMO ADMIN
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👨‍💼 Creando admin: Alexis Figueroa (CTO)...\n');

  const email = 'alexis.figueroa@mateatletas.com';
  const password = 'Admin2024!'; // Password fuerte para admin
  const hashedPassword = await bcrypt.hash(password, 10);

  const alexis = await prisma.admin.upsert({
    where: { email },
    update: {
      nombre: 'Alexis',
      apellido: 'Figueroa',
    },
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'Alexis',
      apellido: 'Figueroa',
    },
  });

  console.log('✅ Admin creado exitosamente!\n');
  console.log('📊 DATOS DE ACCESO:');
  console.log(`  Email: ${alexis.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Nombre: ${alexis.nombre} ${alexis.apellido}`);
  console.log(`  Rol: CTO y Gerente de Tecnología`);
  console.log('\n🚀 Ya podés hacer login en el sistema como admin!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error creando admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
