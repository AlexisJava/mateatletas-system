/**
 * Script de testing completo para el sistema de pagos MercadoPago
 *
 * Prueba:
 * 1. Creación de preferencias (Membresía, Curso, Inscripción 2026, Colonia)
 * 2. Simulación de webhooks (approved, rejected, pending, refunded)
 * 3. Verificación de estados en BD
 *
 * Uso:
 * BACKEND_URL=http://localhost:3001 FRONTEND_URL=http://localhost:3000 ts-node scripts/test-pagos-completo.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface TestData {
  tutorId: string;
  estudianteId: string;
  productoMembresiaId: string;
  productoCursoId: string;
  jwtToken: string;
}

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * PASO 1: Preparar datos de prueba en la BD
 */
async function prepararDatosPrueba(): Promise<TestData> {
  logSection('PASO 1: Preparando datos de prueba');

  // 1. Crear/obtener tutor de prueba
  log('Creando tutor de prueba...');
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  const tutor = await prisma.tutor.upsert({
    where: { email: 'test-pagos@mateatletas.com' },
    update: {},
    create: {
      email: 'test-pagos@mateatletas.com',
      nombre: 'Test',
      apellido: 'Pagos',
      password: hashedPassword,
      telefono: '1234567890',
      dni: '12345678',
      domicilio: 'Test 123',
      fechaNacimiento: new Date('1990-01-01'),
      rol: 'TUTOR',
    },
  });
  logSuccess(`Tutor: ${tutor.email} (${tutor.id})`);

  // 2. Crear/obtener estudiante de prueba
  log('Creando estudiante de prueba...');
  const estudiante = await prisma.estudiante.upsert({
    where: { username: 'test-estudiante-pagos' },
    update: {},
    create: {
      username: 'test-estudiante-pagos',
      pin: '1234',
      nombre: 'Estudiante',
      apellido: 'Test',
      fechaNacimiento: new Date('2010-01-01'),
      tutorId: tutor.id,
    },
  });
  logSuccess(`Estudiante: ${estudiante.username} (${estudiante.id})`);

  // 3. Crear/obtener productos de prueba
  log('Creando productos de prueba...');
  const productoMembresia = await prisma.producto.upsert({
    where: { id: 'test-membresia-001' },
    update: {},
    create: {
      id: 'test-membresia-001',
      nombre: 'Membresía Test',
      descripcion: 'Membresía de prueba para testing',
      precio: 10000,
      tipo: 'MEMBRESIA',
      duracionMeses: 1,
    },
  });
  logSuccess(`Producto Membresía: ${productoMembresia.nombre} ($${productoMembresia.precio})`);

  const productoCurso = await prisma.producto.upsert({
    where: { id: 'test-curso-001' },
    update: {},
    create: {
      id: 'test-curso-001',
      nombre: 'Curso Test',
      descripcion: 'Curso de prueba para testing',
      precio: 5000,
      tipo: 'INSCRIPCION_MENSUAL',
    },
  });
  logSuccess(`Producto Curso: ${productoCurso.nombre} ($${productoCurso.precio})`);

  // 4. Generar JWT token (simulado - en producción vendría de login)
  logWarning('JWT Token: Simular login manual o usar token hardcodeado para testing');

  return {
    tutorId: tutor.id,
    estudianteId: estudiante.id,
    productoMembresiaId: productoMembresia.id,
    productoCursoId: productoCurso.id,
    jwtToken: 'MANUAL_TOKEN_REQUIRED', // Usuario debe proveer token real
  };
}

/**
 * PASO 2: Probar creación de preferencia de Membresía
 */
async function probarPreferenciaMembresia(testData: TestData) {
  logSection('PASO 2: Probando Preferencia de Membresía');

  try {
    log('POST /api/pagos/suscripcion');
    log(`Body: { "productoId": "${testData.productoMembresiaId}" }`);
    logWarning('Requiere JWT token válido - ejecutar manualmente:');
    console.log(
      `
curl -X POST ${BACKEND_URL}/api/pagos/suscripcion \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "productoId": "${testData.productoMembresiaId}"
  }'
    `.trim(),
    );

    logSuccess('Comando curl generado (ejecutar manualmente con token real)');
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

/**
 * PASO 3: Probar creación de preferencia de Curso
 */
async function probarPreferenciaCurso(testData: TestData) {
  logSection('PASO 3: Probando Preferencia de Curso');

  try {
    log('POST /api/pagos/curso');
    log(
      `Body: { "estudianteId": "${testData.estudianteId}", "productoId": "${testData.productoCursoId}" }`,
    );
    logWarning('Requiere JWT token válido - ejecutar manualmente:');
    console.log(
      `
curl -X POST ${BACKEND_URL}/api/pagos/curso \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "estudianteId": "${testData.estudianteId}",
    "productoId": "${testData.productoCursoId}"
  }'
    `.trim(),
    );

    logSuccess('Comando curl generado (ejecutar manualmente con token real)');
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

/**
 * PASO 4: Probar creación de Inscripción 2026
 */
async function probarInscripcion2026(testData: TestData) {
  logSection('PASO 4: Probando Inscripción 2026');

  try {
    log('POST /api/inscripciones-2026');
    const body = {
      tutor: {
        nombre: 'Test',
        apellido: 'Inscripcion',
        email: 'test-inscripcion-2026@mateatletas.com',
        telefono: '1122334455',
        dni: '11223344',
        domicilio: 'Test 456',
        fechaNacimiento: '1990-01-01',
        password: 'Test123!',
      },
      estudiantes: [
        {
          nombre: 'Hijo',
          apellido: 'Uno',
          fechaNacimiento: '2015-05-15',
          dni: '44332211',
        },
      ],
      tipoInscripcion: 'SIMPLE',
    };

    logWarning('Ejecutar manualmente (NO requiere autenticación):');
    console.log(
      `
curl -X POST ${BACKEND_URL}/api/inscripciones-2026 \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'
    `.trim(),
    );

    logSuccess('Comando curl generado');
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

/**
 * PASO 5: Probar creación de Inscripción Colonia
 */
async function probarInscripcionColonia() {
  logSection('PASO 5: Probando Inscripción Colonia');

  try {
    log('POST /api/colonia/inscripcion');
    const body = {
      nombre: 'Test',
      email: 'test-colonia@mateatletas.com',
      telefono: '1234567890',
      password: 'Test123!',
      estudiantes: [
        {
          nombre: 'Niño Test',
          edad: 8,
          cursosSeleccionados: [
            {
              id: 'curso-natacion-1',
              name: 'Natación',
              area: 'Deporte',
              instructor: 'Profe Test',
              dayOfWeek: 1,
              timeSlot: '09:00-10:00',
              color: '#3B82F6',
              icon: '🏊',
            },
          ],
        },
      ],
    };

    logWarning('Ejecutar manualmente (NO requiere autenticación):');
    console.log(
      `
curl -X POST ${BACKEND_URL}/api/colonia/inscripcion \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(body, null, 2)}'
    `.trim(),
    );

    logSuccess('Comando curl generado');
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

/**
 * PASO 6: Simular Webhooks
 */
async function simularWebhooks() {
  logSection('PASO 6: Simulando Webhooks de MercadoPago');

  const paymentId = '12345678';
  const externalReference = 'test-membresia-001';

  // Webhook de pago aprobado
  log('\n6.1. Webhook - Pago APROBADO');
  const webhookApproved = {
    action: 'payment.updated',
    api_version: 'v1',
    data: { id: paymentId },
    date_created: new Date().toISOString(),
    id: Math.random().toString(36).substring(7),
    live_mode: false,
    type: 'payment',
    user_id: '123456',
  };

  logWarning('Ejecutar manualmente (requiere firma HMAC válida o desactivar guard):');
  console.log(
    `
curl -X POST ${BACKEND_URL}/api/pagos/webhook \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(webhookApproved, null, 2)}'
  `.trim(),
  );

  // Webhook de pago rechazado
  log('\n6.2. Webhook - Pago RECHAZADO');
  logWarning('Similar al anterior, cambiar el estado del payment a "rejected"');

  // Webhook de pago pendiente
  log('\n6.3. Webhook - Pago PENDIENTE');
  logWarning('Similar al anterior, cambiar el estado del payment a "pending"');

  // Webhook de reembolso
  log('\n6.4. Webhook - REEMBOLSO');
  logWarning('Similar al anterior, cambiar el estado del payment a "refunded"');
}

/**
 * PASO 7: Verificar estados en BD
 */
async function verificarEstados(testData: TestData) {
  logSection('PASO 7: Verificando Estados en Base de Datos');

  // Verificar membresías
  log('Buscando membresías del tutor de prueba...');
  const membresias = await prisma.membresia.findMany({
    where: { tutorId: testData.tutorId },
    orderBy: { fechaInicio: 'desc' },
    take: 5,
  });

  if (membresias.length > 0) {
    logSuccess(`Encontradas ${membresias.length} membresías`);
    membresias.forEach((m, i) => {
      console.log(`  ${i + 1}. Estado: ${m.estado}, Monto: $${m.monto}, Fecha: ${m.fechaInicio}`);
    });
  } else {
    logWarning('No se encontraron membresías');
  }

  // Verificar inscripciones
  log('\nBuscando inscripciones del estudiante de prueba...');
  const inscripciones = await prisma.inscripcionMensual.findMany({
    where: { estudianteId: testData.estudianteId },
    orderBy: { fechaInscripcion: 'desc' },
    take: 5,
  });

  if (inscripciones.length > 0) {
    logSuccess(`Encontradas ${inscripciones.length} inscripciones`);
    inscripciones.forEach((i, idx) => {
      console.log(
        `  ${idx + 1}. Estado Pago: ${i.estadoPago}, Monto: $${i.monto}, Fecha: ${i.fechaInscripcion}`,
      );
    });
  } else {
    logWarning('No se encontraron inscripciones');
  }

  // Verificar pagos en tabla de auditoría
  log('\nBuscando registros de pagos...');
  const pagos = await prisma.pago.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (pagos.length > 0) {
    logSuccess(`Encontrados ${pagos.length} registros de pago`);
    pagos.forEach((p, i) => {
      console.log(
        `  ${i + 1}. Estado: ${p.estado}, Monto: $${p.monto}, MP ID: ${p.mercadoPagoPaymentId || 'N/A'}`,
      );
    });
  } else {
    logWarning('No se encontraron registros de pago');
  }
}

/**
 * Main
 */
async function main() {
  try {
    log('Script de Testing Completo - Sistema de Pagos MercadoPago', 'blue');
    log(`Backend URL: ${BACKEND_URL}`, 'blue');
    log(`Frontend URL: ${FRONTEND_URL}`, 'blue');

    const testData = await prepararDatosPrueba();

    await probarPreferenciaMembresia(testData);
    await probarPreferenciaCurso(testData);
    await probarInscripcion2026(testData);
    await probarInscripcionColonia();
    await simularWebhooks();
    await verificarEstados(testData);

    logSection('RESUMEN');
    logSuccess('Datos de prueba creados correctamente');
    logWarning('Para ejecutar las pruebas HTTP:');
    console.log('  1. Levantar la API: npm run dev:api');
    console.log('  2. Obtener JWT token: hacer login con test-pagos@mateatletas.com / Test123!');
    console.log('  3. Ejecutar los comandos curl mostrados arriba');
    console.log('  4. Verificar los webhooks (requiere configurar HMAC secret o desactivar guard)');

    logSuccess('\nScript completado');
  } catch (error) {
    logError(`Error fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
