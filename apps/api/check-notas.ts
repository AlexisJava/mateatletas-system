import { PrismaClient } from '@prisma/client';

async function checkNotas() {
  const prisma = new PrismaClient();

  console.log('🔍 Buscando eventos tipo NOTA en la base de datos...\n');

  const eventos = await prisma.evento.findMany({
    where: { tipo: 'NOTA' },
    include: {
      nota: true,
      docente: { select: { nombre: true, apellido: true } }
    },
    orderBy: { fecha_inicio: 'desc' },
  });

  console.log(`✅ Total de notas encontradas: ${eventos.length}\n`);

  eventos.forEach((evento, i) => {
    console.log(`\n📝 Nota #${i + 1}:`);
    console.log(`   ID: ${evento.id}`);
    console.log(`   Título: ${evento.titulo}`);
    console.log(`   Docente: ${evento.docente?.nombre} ${evento.docente?.apellido}`);
    console.log(`   Fecha: ${evento.fecha_inicio}`);
    console.log(`   Tiene objeto nota: ${!!evento.nota}`);
    if (evento.nota) {
      console.log(`   Contenido: ${evento.nota.contenido.substring(0, 100)}...`);
      console.log(`   Categoría: ${evento.nota.categoria || 'Sin categoría'}`);
      console.log(`   Color: ${evento.nota.color}`);
    }
  });

  await prisma.$disconnect();
}

checkNotas().catch(console.error);
