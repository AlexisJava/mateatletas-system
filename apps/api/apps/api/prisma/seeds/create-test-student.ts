import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function createTestStudent() {
  console.log('🎓 Creando estudiante de prueba...');

  const hashedPassword = await bcrypt.hash('prueba123', 10);

  const estudiante = await prisma.estudiante.upsert({
    where: { username: 'prueba' },
    update: {
      nombre: 'Estudiante',
      apellido: 'Prueba',
    },
    create: {
      username: 'prueba',
      nombre: 'Estudiante',
      apellido: 'Prueba',
      nivel_actual: 1,
      puntos_totales: 0,
      fecha_nacimiento: new Date('2010-01-01'),
      credentials: {
        create: {
          password: hashedPassword,
        },
      },
    },
  });

  console.log('✅ Estudiante de prueba creado:');
  console.log('   Username: prueba');
  console.log('   Password: prueba123');
  console.log('   ID:', estudiante.id);

  return estudiante;
}

// Si se ejecuta directamente
if (require.main === module) {
  createTestStudent()
    .catch((e) => {
      console.error('❌ Error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
