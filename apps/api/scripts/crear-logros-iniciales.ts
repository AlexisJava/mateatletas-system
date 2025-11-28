/**
 * Script para crear logros iniciales de bienvenida
 *
 * Logros:
 * 1. "Primer Ingreso" - Al iniciar sesión por primera vez
 * 2. "Avatar Creado" - Al crear su avatar personalizado
 *
 * Uso: npx tsx scripts/crear-logros-iniciales.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando logros iniciales de bienvenida...\n');

  try {
    // Logro 1: Primer Ingreso
    const logroPrimerIngreso = await prisma.logro.upsert({
      where: { codigo: 'PRIMER_INGRESO' },
      update: {},
      create: {
        codigo: 'PRIMER_INGRESO',
        nombre: '¡Bienvenido!',
        descripcion: 'Has iniciado sesión por primera vez en Mateatletas',
        icono: '🎉',
        categoria: 'INICIO',
        rareza: 'COMUN',
        monedas_recompensa: 50,
        xp_recompensa: 25,
        criterio_tipo: 'primer_login',
        criterio_valor: JSON.stringify({ requiere_primer_login: true }),
        mensaje_desbloqueo:
          '¡Bienvenido a Mateatletas! Has dado tu primer paso en esta aventura.',
        activo: true,
        secreto: false,
        orden: 1,
      },
    });

    console.log('✅ Logro creado:', logroPrimerIngreso.nombre);
    console.log(`   Código: ${logroPrimerIngreso.codigo}`);
    console.log(
      `   XP: ${logroPrimerIngreso.xp_recompensa} | Monedas: ${logroPrimerIngreso.monedas_recompensa}`,
    );
    console.log(`   Descripción: ${logroPrimerIngreso.descripcion}\n`);

    // Logro 2: Avatar Creado
    const logroAvatarCreado = await prisma.logro.upsert({
      where: { codigo: 'AVATAR_CREADO' },
      update: {},
      create: {
        codigo: 'AVATAR_CREADO',
        nombre: '¡Mírame!',
        descripcion: 'Has creado tu avatar personalizado',
        icono: '🎨',
        categoria: 'PERSONALIZACION',
        rareza: 'COMUN',
        monedas_recompensa: 75,
        xp_recompensa: 50,
        criterio_tipo: 'avatar_creado',
        criterio_valor: JSON.stringify({ requiere_avatar: true }),
        mensaje_desbloqueo:
          '¡Tu avatar está listo! Ahora todos pueden ver tu estilo único.',
        activo: true,
        secreto: false,
        orden: 2,
      },
    });

    console.log('✅ Logro creado:', logroAvatarCreado.nombre);
    console.log(`   Código: ${logroAvatarCreado.codigo}`);
    console.log(
      `   XP: ${logroAvatarCreado.xp_recompensa} | Monedas: ${logroAvatarCreado.monedas_recompensa}`,
    );
    console.log(`   Descripción: ${logroAvatarCreado.descripcion}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ LOGROS INICIALES CREADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      `Total XP: ${logroPrimerIngreso.xp_recompensa + logroAvatarCreado.xp_recompensa}`,
    );
    console.log(
      `Total Monedas: ${logroPrimerIngreso.monedas_recompensa + logroAvatarCreado.monedas_recompensa}`,
    );
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error al crear logros:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
