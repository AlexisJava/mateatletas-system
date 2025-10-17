import { PrismaClient, TipoProducto } from '@prisma/client';

export async function seedProductos(prisma: PrismaClient) {
  console.log('\n🛒 Creando productos del catálogo...');

  const productos = [
    {
      id: 'seed-suscripcion-mensual',
      nombre: 'Suscripción Mensual Mateatletas',
      descripcion:
        'Acceso ilimitado a todos los cursos y recursos de la plataforma durante un mes. Incluye clases en vivo, ejercicios interactivos, seguimiento personalizado y sistema de gamificación.',
      precio: 2500.0,
      tipo: TipoProducto.Suscripcion,
      activo: true,
      duracion_meses: 1,
    },
    {
      id: 'seed-suscripcion-anual',
      nombre: 'Suscripción Anual Mateatletas',
      descripcion:
        'Acceso ilimitado por 12 meses con 20% de descuento. Incluye todos los beneficios de la suscripción mensual más acceso prioritario a nuevos cursos y contenido exclusivo.',
      precio: 24000.0,
      tipo: TipoProducto.Suscripcion,
      activo: true,
      duracion_meses: 12,
    },
    {
      id: 'seed-curso-algebra-basica',
      nombre: 'Curso Intensivo: Álgebra Básica',
      descripcion:
        'Curso intensivo de 4 semanas para dominar los fundamentos del álgebra. Incluye ecuaciones lineales, sistemas de ecuaciones, factorización y funciones lineales. Ideal para estudiantes de secundaria.',
      precio: 3500.0,
      tipo: TipoProducto.Curso,
      activo: true,
      fecha_inicio: new Date('2025-11-15'),
      fecha_fin: new Date('2025-12-13'),
      cupo_maximo: 25,
    },
    {
      id: 'seed-curso-geometria',
      nombre: 'Curso: Geometría y Trigonometría',
      descripcion:
        'Aprende geometría plana y espacial, más introducción a trigonometría. Incluye teoremas, construcciones geométricas y aplicaciones prácticas. Duración: 6 semanas.',
      precio: 4200.0,
      tipo: TipoProducto.Curso,
      activo: true,
      fecha_inicio: new Date('2025-12-01'),
      fecha_fin: new Date('2026-01-12'),
      cupo_maximo: 20,
    },
    {
      id: 'seed-recurso-guia-ejercicios',
      nombre: 'Guía Completa de Ejercicios - Matemática Nivel Secundaria',
      descripcion:
        'Colección digital de más de 500 ejercicios resueltos y explicados paso a paso. Incluye todos los temas de matemática de nivel secundario.',
      precio: 1500.0,
      tipo: TipoProducto.RecursoDigital,
      activo: true,
    },
  ];

  for (const producto of productos) {
    const { id, ...data } = producto;
    await prisma.producto.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${producto.nombre}`);
  }

  console.log('✅ Productos del catálogo listos');
}
