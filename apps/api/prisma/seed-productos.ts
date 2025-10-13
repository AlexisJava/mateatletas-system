import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding productos iniciales...\n');

  // 1. Crear producto de Suscripción Mensual
  const suscripcionMensual = await prisma.producto.upsert({
    where: { id: 'seed-suscripcion-mensual' },
    update: {},
    create: {
      id: 'seed-suscripcion-mensual',
      nombre: 'Suscripción Mensual Mateatletas',
      descripcion:
        'Acceso ilimitado a todos los cursos y recursos de la plataforma durante un mes. Incluye clases en vivo, ejercicios interactivos, seguimiento personalizado y sistema de gamificación.',
      precio: 2500.0, // $2500 ARS
      tipo: 'Suscripcion',
      activo: true,
      duracion_meses: 1,
    },
  });
  console.log('✅ Creada:', suscripcionMensual.nombre);

  // 2. Crear producto de Suscripción Anual (con descuento)
  const suscripcionAnual = await prisma.producto.upsert({
    where: { id: 'seed-suscripcion-anual' },
    update: {},
    create: {
      id: 'seed-suscripcion-anual',
      nombre: 'Suscripción Anual Mateatletas',
      descripcion:
        'Acceso ilimitado por 12 meses con 20% de descuento. Incluye todos los beneficios de la suscripción mensual más acceso prioritario a nuevos cursos y contenido exclusivo.',
      precio: 24000.0, // $24,000 ARS (equivalente a 10 meses, 20% descuento)
      tipo: 'Suscripcion',
      activo: true,
      duracion_meses: 12,
    },
  });
  console.log('✅ Creada:', suscripcionAnual.nombre);

  // 3. Crear un curso de ejemplo
  const cursoAlgebra = await prisma.producto.upsert({
    where: { id: 'seed-curso-algebra-basica' },
    update: {},
    create: {
      id: 'seed-curso-algebra-basica',
      nombre: 'Curso Intensivo: Álgebra Básica',
      descripcion:
        'Curso intensivo de 4 semanas para dominar los fundamentos del álgebra. Incluye ecuaciones lineales, sistemas de ecuaciones, factorización y funciones lineales. Ideal para estudiantes de secundaria.',
      precio: 3500.0, // $3,500 ARS pago único
      tipo: 'Curso',
      activo: true,
      fecha_inicio: new Date('2025-11-15'), // Inicia en noviembre
      fecha_fin: new Date('2025-12-13'), // 4 semanas después
      cupo_maximo: 25,
    },
  });
  console.log('✅ Creado:', cursoAlgebra.nombre);

  // 4. Crear curso de geometría
  const cursoGeometria = await prisma.producto.upsert({
    where: { id: 'seed-curso-geometria' },
    update: {},
    create: {
      id: 'seed-curso-geometria',
      nombre: 'Curso: Geometría y Trigonometría',
      descripcion:
        'Aprende geometría plana y espacial, más introducción a trigonometría. Incluye teoremas, construcciones geométricas y aplicaciones prácticas. Duración: 6 semanas.',
      precio: 4200.0, // $4,200 ARS
      tipo: 'Curso',
      activo: true,
      fecha_inicio: new Date('2025-12-01'),
      fecha_fin: new Date('2026-01-12'), // 6 semanas
      cupo_maximo: 20,
    },
  });
  console.log('✅ Creado:', cursoGeometria.nombre);

  // 5. Crear recurso digital de ejemplo
  const guiaEjercicios = await prisma.producto.upsert({
    where: { id: 'seed-recurso-guia-ejercicios' },
    update: {},
    create: {
      id: 'seed-recurso-guia-ejercicios',
      nombre: 'Guía Completa de Ejercicios - Matemática Nivel Secundaria',
      descripcion:
        'Colección digital de más de 500 ejercicios resueltos y explicados paso a paso. Incluye todos los temas de matemática de nivel secundario con diferentes niveles de dificultad.',
      precio: 1500.0, // $1,500 ARS
      tipo: 'RecursoDigital',
      activo: true,
    },
  });
  console.log('✅ Creado:', guiaEjercicios.nombre);

  console.log('\n✨ Seed de productos completado exitosamente!');
  console.log('\nResumen:');
  console.log('- 2 Suscripciones (mensual y anual)');
  console.log('- 2 Cursos (Álgebra y Geometría)');
  console.log('- 1 Recurso Digital (Guía de ejercicios)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
