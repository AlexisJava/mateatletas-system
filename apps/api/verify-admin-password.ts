import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const testPassword = 'Alexis93$';

  console.log(`🔍 Verificando admin en Railway: ${email}\n`);

  // Buscar admin
  const admin = await prisma.admin.findUnique({
    where: { email }
  });

  if (!admin) {
    console.log('❌ Admin NO encontrado');
    return;
  }

  console.log('✅ Admin encontrado:');
  console.log(`📧 Email: ${admin.email}`);
  console.log(`👤 Nombre: ${admin.nombre} ${admin.apellido}`);
  console.log(`🔑 Password hash: ${admin.password_hash}`);
  console.log(`📏 Hash length: ${admin.password_hash.length}`);

  // Verificar si el hash coincide con la contraseña
  const passwordMatch = await bcrypt.compare(testPassword, admin.password_hash);

  console.log(`\n🔐 Testing password: "${testPassword}"`);
  console.log(`${passwordMatch ? '✅' : '❌'} Password match: ${passwordMatch}`);

  if (!passwordMatch) {
    console.log('\n⚠️  La contraseña NO coincide. Generando nuevo hash...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log(`🆕 Nuevo hash: ${newHash}`);
    console.log(`📏 Nuevo hash length: ${newHash.length}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
