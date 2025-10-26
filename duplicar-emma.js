const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function duplicarEmma() {
  try {
    // Obtener a Emma del sector Matemática
    const emma = await prisma.estudiante.findFirst({
      where: {
        nombre: 'Emma',
        apellido: 'Figueroa Yañez',
        sector_id: 'cmgwe19t10000xwk6grajhfx1' // Matemática
      },
      include: {
        tutor: true
      }
    });

    if (!emma) {
      console.log('❌ Emma no encontrada en Matemática');
      return;
    }

    console.log('✅ Emma encontrada:', emma.nombre, emma.apellido);
    console.log('   Sector actual:', emma.sector_id);
    console.log('   Tutor:', emma.tutor.nombre, emma.tutor.apellido);

    // Verificar si ya existe en Programación
    const existeEnProgramacion = await prisma.estudiante.findFirst({
      where: {
        tutor_id: emma.tutor_id,
        nombre: emma.nombre,
        apellido: emma.apellido,
        sector_id: 'cmgwe19t90001xwk692m43f31' // Programación
      }
    });

    if (existeEnProgramacion) {
      console.log('⚠️  Emma ya existe en Programación');
      return;
    }

    // Duplicar en Programación
    const emmaDuplicada = await prisma.estudiante.create({
      data: {
        nombre: emma.nombre,
        apellido: emma.apellido,
        edad: emma.edad,
        nivel_escolar: emma.nivel_escolar,
        email: emma.email,
        tutor_id: emma.tutor_id,
        sector_id: 'cmgwe19t90001xwk692m43f31', // Programación
        nivel_actual: emma.nivel_actual,
        puntos_totales: emma.puntos_totales,
        avatar_url: emma.avatar_url,
        equipo_id: emma.equipo_id,
      },
      include: {
        sector: true,
        tutor: true
      }
    });

    console.log('🎉 Emma duplicada exitosamente en Programación!');
    console.log('   ID original (Matemática):', emma.id);
    console.log('   ID duplicado (Programación):', emmaDuplicada.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

duplicarEmma();
