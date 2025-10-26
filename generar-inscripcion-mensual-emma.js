const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generarInscripcionMensual() {
  console.log('💳 Generando inscripción mensual para Emma...\n');

  try {
    // Obtener Emma
    const emma = await prisma.estudiante.findFirst({
      where: {
        nombre: 'Emma',
        apellido: 'Figueroa Yañez'
      },
      include: {
        tutor: true
      }
    });

    if (!emma) {
      console.log('❌ Emma no encontrada');
      return;
    }

    console.log(`✅ Emma encontrada: ${emma.nombre} ${emma.apellido}`);
    console.log(`   Tutor: ${emma.tutor.nombre} ${emma.tutor.apellido}`);

    // Obtener producto "Club Matemáticas"
    const producto = await prisma.producto.findFirst({
      where: {
        nombre: {
          contains: 'Matemáticas'
        },
        tipo: 'Suscripcion'
      }
    });

    if (!producto) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log(`✅ Producto encontrado: ${producto.nombre} - $${producto.precio}`);

    // Determinar período actual
    const now = new Date();
    const anio = now.getFullYear();
    const mes = now.getMonth() + 1; // 0-11 -> 1-12
    const periodo = `${anio}-${mes.toString().padStart(2, '0')}`;

    console.log(`📅 Período: ${periodo}`);

    // Verificar si ya existe inscripción para este período
    const existente = await prisma.inscripcionMensual.findFirst({
      where: {
        estudiante_id: emma.id,
        producto_id: producto.id,
        periodo: periodo
      }
    });

    if (existente) {
      console.log('⚠️  Ya existe una inscripción mensual para este período');
      return;
    }

    // Crear inscripción mensual
    const inscripcion = await prisma.inscripcionMensual.create({
      data: {
        estudiante_id: emma.id,
        producto_id: producto.id,
        tutor_id: emma.tutor_id,
        anio: anio,
        mes: mes,
        periodo: periodo,
        precio_base: producto.precio,
        descuento_aplicado: 0,
        precio_final: producto.precio,
        tipo_descuento: 'NINGUNO',
        detalle_calculo: 'Inscripción mensual al Club Matemáticas',
        estado_pago: 'Pendiente'
      }
    });

    console.log('\n🎉 Inscripción mensual creada exitosamente!');
    console.log(`   ID: ${inscripcion.id}`);
    console.log(`   Período: ${inscripcion.periodo}`);
    console.log(`   Precio: $${inscripcion.precio_final}`);
    console.log(`   Estado: ${inscripcion.estado_pago}`);

    // Verificar total de inscripciones mensuales del tutor
    const totalInscripciones = await prisma.inscripcionMensual.count({
      where: {
        tutor_id: emma.tutor_id
      }
    });

    console.log(`\n📊 Total de inscripciones mensuales del tutor: ${totalInscripciones}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generarInscripcionMensual();
