/**
 * CREAR INSCRIPCIONES MENSUALES PARA TODOS LOS ESTUDIANTES
 * Genera los pagos pendientes del mes actual
 */

import { PrismaClient, EstadoPago } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(
    '💳 Creando inscripciones mensuales para todos los estudiantes...\n',
  );

  // Obtener el producto Club Matemáticas
  const productoMensual = await prisma.producto.findFirst({
    where: {
      nombre: { contains: 'Club' },
      activo: true,
    },
  });

  if (!productoMensual) {
    console.error('❌ No se encontró el producto de suscripción mensual');
    return;
  }

  console.log(
    `📦 Producto: ${productoMensual.nombre} - $${productoMensual.precio}\n`,
  );

  // Obtener todos los estudiantes con sus tutores
  const estudiantes = await prisma.estudiante.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      tutor_id: true,
    },
  });

  console.log(`👶 Total estudiantes: ${estudiantes.length}\n`);

  // Fecha actual para el periodo
  const ahora = new Date();
  const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;

  let creadas = 0;
  let yaExistentes = 0;

  for (const estudiante of estudiantes) {
    try {
      // Verificar si ya existe inscripción para este periodo
      const existente = await prisma.inscripcionMensual.findUnique({
        where: {
          estudiante_id_producto_id_periodo: {
            estudiante_id: estudiante.id,
            producto_id: productoMensual.id,
            periodo: periodo,
          },
        },
      });

      if (existente) {
        yaExistentes++;
        continue;
      }

      // Crear inscripción mensual
      const [anio, mes] = periodo.split('-').map(Number);

      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          producto_id: productoMensual.id,
          tutor_id: estudiante.tutor_id,
          periodo: periodo,
          anio: anio,
          mes: mes,
          precio_base: productoMensual.precio,
          descuento_aplicado: 0,
          precio_final: productoMensual.precio,
          tipo_descuento: 'NINGUNO',
          estado_pago: 'Pendiente',
          detalle_calculo: `Inscripción mensual - ${productoMensual.nombre}`,
        },
      });

      creadas++;
      console.log(
        `  ✓ ${estudiante.nombre} ${estudiante.apellido} - ${periodo}`,
      );
    } catch (error: any) {
      console.log(
        `  ✗ Error con ${estudiante.nombre} ${estudiante.apellido}: ${error.message}`,
      );
    }
  }

  console.log('\n========================================');
  console.log('✅ INSCRIPCIONES MENSUALES CREADAS');
  console.log('========================================');
  console.log(`📝 Inscripciones creadas: ${creadas}`);
  console.log(`⚠️  Ya existentes: ${yaExistentes}`);
  console.log(`📅 Periodo: ${periodo}`);
  console.log(`💰 Monto por estudiante: $${productoMensual.precio}`);
  console.log(
    `💵 Total a cobrar: $${creadas * Number(productoMensual.precio)}\n`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error creando inscripciones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
