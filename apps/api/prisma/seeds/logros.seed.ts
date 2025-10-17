import { PrismaClient } from '@prisma/client';

export async function seedLogros(prisma: PrismaClient) {
  console.log('\n🏆 Creando logros (achievements)...');

  const logros = [
    {
      nombre: 'Primera Clase',
      descripcion: 'Asististe a tu primera clase en Mateatletas',
      icono: '🎓',
      puntos: 50,
      requisito: 'Asistir a 1 clase',
    },
    {
      nombre: 'Racha de Fuego',
      descripcion: 'Asististe a 5 clases consecutivas sin faltar',
      icono: '🔥',
      puntos: 200,
      requisito: 'Asistir a 5 clases consecutivas',
    },
    {
      nombre: 'Matemático Dedicado',
      descripcion: 'Acumulaste 500 puntos totales',
      icono: '📚',
      puntos: 100,
      requisito: 'Alcanzar 500 puntos totales',
    },
    {
      nombre: 'Estrella Brillante',
      descripcion: 'Alcanzaste el nivel 5',
      icono: '⭐',
      puntos: 150,
      requisito: 'Alcanzar nivel 5',
    },
    {
      nombre: 'Leyenda Matemática',
      descripcion: 'Alcanzaste el nivel 10',
      icono: '👑',
      puntos: 300,
      requisito: 'Alcanzar nivel 10',
    },
    {
      nombre: 'Maestro de Equipo',
      descripcion: 'Tu equipo alcanzó el primer lugar en el ranking',
      icono: '🏆',
      puntos: 250,
      requisito: 'Equipo en primer lugar del ranking',
    },
    {
      nombre: 'Colaborador',
      descripcion: 'Ayudaste a 10 compañeros durante las clases',
      icono: '🤝',
      puntos: 180,
      requisito: 'Ayudar a 10 compañeros',
    },
    {
      nombre: 'Perfeccionista',
      descripcion: 'Completaste 20 ejercicios sin errores',
      icono: '💯',
      puntos: 220,
      requisito: 'Completar 20 ejercicios perfectos',
    },
  ];

  for (const logro of logros) {
    await prisma.logro.upsert({
      where: { nombre: logro.nombre },
      update: {
        descripcion: logro.descripcion,
        icono: logro.icono,
        puntos: logro.puntos,
        requisito: logro.requisito,
      },
      create: logro,
    });
    console.log(`   • ${logro.icono} ${logro.nombre} (${logro.puntos} pts)`);
  }

  console.log('✅ Logros cargados');
}
