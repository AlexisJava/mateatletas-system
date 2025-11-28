/**
 * Script para asignar links de Google Meet a los grupos
 *
 * Links por grupo:
 * - B1: https://meet.google.com/fsa-ckxq-dku
 * - B2: https://meet.google.com/vjq-dnkx-vou
 * - B3: https://meet.google.com/yow-xfqj-fkd
 *
 * Uso: npx tsx scripts/asignar-links-meet.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LINKS_MEET = {
  B1: 'https://meet.google.com/fsa-ckxq-dku',
  B2: 'https://meet.google.com/vjq-dnkx-vou',
  B3: 'https://meet.google.com/yow-xfqj-fkd',
};

async function main() {
  console.log('🚀 Asignando links de Google Meet a los grupos...\n');

  try {
    for (const [codigo, link] of Object.entries(LINKS_MEET)) {
      // Buscar el grupo por código
      const grupo = await prisma.grupo.findUnique({
        where: { codigo },
      });

      if (!grupo) {
        console.log(`⚠️  Grupo ${codigo} no encontrado, saltando...`);
        continue;
      }

      // Actualizar el link de Meet
      await prisma.grupo.update({
        where: { codigo },
        data: { link_meet: link },
      });

      console.log(`✅ ${codigo} (${grupo.nombre})`);
      console.log(`   Link: ${link}\n`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ LINKS DE MEET ASIGNADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      `Total de grupos actualizados: ${Object.keys(LINKS_MEET).length}`,
    );
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error al asignar links de Meet:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
