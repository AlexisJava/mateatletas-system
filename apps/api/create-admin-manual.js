const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Generar hash de la contraseña
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    // Crear admin
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@mateatletas.com' },
      update: {
        password_hash: passwordHash,
        roles: ['admin'],
      },
      create: {
        email: 'admin@mateatletas.com',
        password_hash: passwordHash,
        nombre: 'Admin',
        apellido: 'Mateatletas',
        roles: ['admin'],
      },
    });

    console.log('✅ Admin creado/actualizado exitosamente');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin123!');
    console.log('   ID:', admin.id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
