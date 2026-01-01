const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log('\n=== AUDITORÍA SISTEMA DE PAGOS ===\n');

  // 1. Inscripciones Mensuales
  const inscripcionesMensuales = await prisma.inscripcionMensual.findMany({
    include: {
      estudiante: { select: { nombre: true, apellido: true } },
      producto: { select: { nombre: true } },
      tutor: { select: { nombre: true, email: true } },
    },
  });

  console.log('=== INSCRIPCIONES MENSUALES ===');
  console.log('Total: ' + inscripcionesMensuales.length);
  inscripcionesMensuales.forEach(function (i) {
    var estudianteNombre = i.estudiante
      ? i.estudiante.nombre + ' ' + i.estudiante.apellido
      : 'N/A';
    console.log('  - ' + estudianteNombre + ' - ' + i.periodo);
    console.log('    Producto: ' + (i.producto ? i.producto.nombre : 'N/A'));
    console.log('    Estado: ' + i.estado_pago);
    console.log('    Precio: $' + i.precio_final);
    console.log('');
  });

  // 2. Colonia Inscripciones
  const coloniaInscripciones = await prisma.coloniaInscripcion.findMany({
    include: {
      tutor: { select: { nombre: true, apellido: true, email: true } },
      estudiantes: true,
      pagos: true,
    },
  });

  console.log('\n=== COLONIA INSCRIPCIONES ===');
  console.log('Total: ' + coloniaInscripciones.length);
  coloniaInscripciones.forEach(function (ci) {
    var tutorNombre = ci.tutor
      ? ci.tutor.nombre + ' ' + ci.tutor.apellido
      : 'N/A';
    console.log('  - Tutor: ' + tutorNombre);
    console.log('    Email: ' + (ci.tutor ? ci.tutor.email : 'N/A'));
    console.log('    Estado: ' + ci.estado);
    console.log('    Descuento: ' + ci.descuento_aplicado + '%');
    console.log('    Total mensual: $' + ci.total_mensual);
    console.log('    Estudiantes: ' + ci.estudiantes.length);
    console.log('    Pagos registrados: ' + ci.pagos.length);
    console.log('');
  });

  // 3. Colonia Pagos
  const coloniaPagos = await prisma.coloniaPago.findMany({
    include: {
      inscripcion: {
        include: {
          tutor: { select: { nombre: true, email: true } },
        },
      },
    },
  });

  console.log('\n=== COLONIA PAGOS ===');
  console.log('Total: ' + coloniaPagos.length);
  coloniaPagos.forEach(function (p) {
    var tutorNombre =
      p.inscripcion && p.inscripcion.tutor ? p.inscripcion.tutor.nombre : 'N/A';
    console.log('  - ' + p.mes + ' ' + p.anio + ' - ' + tutorNombre);
    console.log('    Estado: ' + p.estado);
    console.log('    Monto: $' + p.monto);
    console.log('    MP Preference: ' + (p.mercadopago_preference_id || 'N/A'));
    console.log('    MP Payment: ' + (p.mercadopago_payment_id || 'N/A'));
    console.log('    Vencimiento: ' + p.fecha_vencimiento);
    console.log('');
  });

  // 4. Webhooks Procesados
  const webhooks = await prisma.webhookProcessed.findMany({
    orderBy: { processed_at: 'desc' },
    take: 10,
  });

  console.log('\n=== WEBHOOKS PROCESADOS (últimos 10) ===');
  console.log('Total registros: ' + webhooks.length);
  webhooks.forEach(function (w) {
    console.log('  - Payment ID: ' + w.payment_id);
    console.log('    Tipo: ' + w.webhook_type);
    console.log('    Estado: ' + w.status);
    console.log('    Procesado: ' + w.processed_at);
    console.log('');
  });

  // 5. Productos
  const productos = await prisma.producto.findMany();

  console.log('\n=== PRODUCTOS ===');
  console.log('Total: ' + productos.length);
  productos.forEach(function (p) {
    console.log('  - ' + p.nombre);
    console.log('    Precio: $' + p.precio);
    console.log('    Activo: ' + (p.activo ? 'SI' : 'NO'));
    console.log('');
  });

  // 6. Configuración de Precios
  try {
    const configPrecios = await prisma.configuracionPrecios.findFirst();
    console.log('\n=== CONFIGURACIÓN DE PRECIOS ===');
    if (configPrecios) {
      console.log(
        '  Precio base mensual: $' + configPrecios.precio_base_mensual,
      );
      console.log(
        '  Descuento hermanos: ' +
          configPrecios.porcentaje_descuento_hermanos +
          '%',
      );
      console.log(
        '  Descuento múltiples actividades: ' +
          configPrecios.porcentaje_descuento_multiples_actividades +
          '%',
      );
      console.log(
        '  Descuento AACREA: ' +
          configPrecios.porcentaje_descuento_aacrea +
          '%',
      );
    } else {
      console.log('  NO HAY CONFIGURACIÓN CARGADA');
    }
  } catch (e) {
    console.log('\n=== CONFIGURACIÓN DE PRECIOS ===');
    console.log('  Error: ' + e.message);
  }

  // 7. Resumen
  var pagosPendientes = coloniaPagos.filter(function (p) {
    return p.estado === 'pending';
  }).length;
  var pagosPagados = coloniaPagos.filter(function (p) {
    return p.estado === 'paid';
  }).length;
  var pagosFallidos = coloniaPagos.filter(function (p) {
    return p.estado === 'failed';
  }).length;

  console.log('\n=== RESUMEN ===');
  console.log('Inscripciones mensuales: ' + inscripcionesMensuales.length);
  console.log('Inscripciones colonia: ' + coloniaInscripciones.length);
  console.log('Pagos colonia - Pendientes: ' + pagosPendientes);
  console.log('Pagos colonia - Pagados: ' + pagosPagados);
  console.log('Pagos colonia - Fallidos: ' + pagosFallidos);
  console.log('Webhooks procesados: ' + webhooks.length);
  console.log(
    'Productos activos: ' +
      productos.filter(function (p) {
        return p.activo;
      }).length,
  );

  await prisma.$disconnect();
}

audit().catch(console.error);
