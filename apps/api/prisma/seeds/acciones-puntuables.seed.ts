import { PrismaClient } from '@prisma/client';

export async function seedAccionesPuntuables(prisma: PrismaClient) {
  console.log('\n⭐ Creando acciones puntuables...');

  const acciones = [
    {
      nombre: 'Asistencia a clase',
      descripcion: 'El estudiante asistió puntualmente a una clase programada',
      puntos: 10,
    },
    {
      nombre: 'Participación activa',
      descripcion:
        'El estudiante participó activamente durante la clase, respondiendo preguntas o haciendo consultas',
      puntos: 15,
    },
    {
      nombre: 'Ejercicios completados',
      descripcion:
        'El estudiante completó todos los ejercicios asignados durante la clase',
      puntos: 20,
    },
    {
      nombre: 'Ayudó a un compañero',
      descripcion:
        'El estudiante ayudó a explicar un concepto a otro compañero durante la clase',
      puntos: 25,
    },
    {
      nombre: 'Excelencia en ejercicios',
      descripcion:
        'El estudiante completó todos los ejercicios sin errores y de forma destacada',
      puntos: 30,
    },
    {
      nombre: 'Racha semanal',
      descripcion:
        'El estudiante asistió a todas las clases de la semana sin faltas',
      puntos: 50,
    },
    {
      nombre: 'Desafío superado',
      descripcion:
        'El estudiante completó exitosamente un desafío matemático adicional',
      puntos: 40,
    },
    {
      nombre: 'Mejora destacada',
      descripcion:
        'El estudiante mostró una mejora significativa en su desempeño respecto a clases anteriores',
      puntos: 35,
    },
  ];

  for (const accion of acciones) {
    await prisma.accionPuntuable.upsert({
      where: { nombre: accion.nombre },
      update: {
        descripcion: accion.descripcion,
        puntos: accion.puntos,
      },
      create: accion,
    });
    console.log(`   • ${accion.nombre} (${accion.puntos} pts)`);
  }

  console.log('✅ Acciones puntuables cargadas');
}
