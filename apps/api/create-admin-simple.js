const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Creando admin con contraseña simple...');

    // Usar una contraseña sin caracteres especiales
    const password = 'Admin1234';
    const passwordHash = await bcrypt.hash(password, 10);

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

    console.log('\n✅ Admin creado/actualizado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password);
    console.log('🆔 ID:', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Usa estas credenciales para iniciar sesión');
    console.log('   (sin caracteres especiales que puedan causar problemas)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
