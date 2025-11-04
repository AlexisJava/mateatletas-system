import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Creando estudiante de prueba...');

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('prueba123', 10);

  // Crear estudiante
  const estudiante = await prisma.estudiante.upsert({
    where: { username: 'prueba' },
    update: {
      password: hashedPassword,
      nombre: 'Estudiante',
      apellido: 'Prueba',
    },
    create: {
      username: 'prueba',
      password: hashedPassword,
      nombre: 'Estudiante',
      apellido: 'Prueba',
      nivel_actual: 1,
      puntos_totales: 0,
      fecha_nacimiento: new Date('2010-01-01'),
    },
  });

  console.log('✅ Estudiante creado exitosamente:');
  console.log('   Username: prueba');
  console.log('   Password: prueba123');
  console.log('   ID:', estudiante.id);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
