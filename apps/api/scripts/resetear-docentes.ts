import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function generateDocentePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = 'Docente-';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function resetearDocentes() {
  console.log('🔄 Reseteando contraseñas de TODOS los docentes...\n');

  try {
    // 1. Obtener todos los docentes
    const docentes = await prisma.docente.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    });

    console.log(`📊 Total de docentes encontrados: ${docentes.length}\n`);

    if (docentes.length === 0) {
      console.log('⚠️  No hay docentes en la base de datos');
      return;
    }

    const credenciales: Array<{
      nombre: string;
      apellido: string;
      email: string;
      password: string;
    }> = [];

    // 2. Resetear cada docente
    for (const docente of docentes) {
      const nuevaPassword = generateDocentePassword();
      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

      await prisma.docente.update({
        where: { id: docente.id },
        data: {
          password_hash: hashedPassword,
          password_temporal: nuevaPassword,
          debe_cambiar_password: true,
        },
      });

      credenciales.push({
        nombre: docente.nombre,
        apellido: docente.apellido,
        email: docente.email,
        password: nuevaPassword,
      });

      console.log(`✅ ${docente.nombre} ${docente.apellido} - Contraseña reseteada`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🔑 CREDENCIALES DE DOCENTES (GUARDALAS!)');
    console.log('='.repeat(80) + '\n');

    credenciales.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.nombre} ${cred.apellido}`);
      console.log(`   Email:    ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('✅ TODAS LAS CONTRASEÑAS HAN SIDO RESETEADAS');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error durante el reseteo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetearDocentes();
