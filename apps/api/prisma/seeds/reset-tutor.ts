import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetTutorPassword() {
  const password = 'Test123!';
  const hash = await bcrypt.hash(password, 10);

  const tutor = await prisma.tutor.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!tutor) {
    console.log('No hay tutores en la base de datos');
    return;
  }

  await prisma.tutor.update({
    where: { id: tutor.id },
    data: { password_hash: hash },
  });

  console.log('Contraseña reseteada');
  console.log('Email:', tutor.email);
  console.log('Password:', password);
}

resetTutorPassword().finally(() => prisma.$disconnect());
