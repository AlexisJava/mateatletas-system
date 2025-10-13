import { PrismaClient, TipoProducto } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  await seedAdmin();
  await seedEquipos();
  await seedRutasCurriculares();
  await seedProductos();

  console.log('\n🎉 Seed completado exitosamente!');
}

async function seedAdmin() {
  console.log('👤 Creando/actualizando usuario Admin por defecto...');

  const email = process.env.ADMIN_EMAIL ?? 'admin@mateatletas.com';
  const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: hashedPassword,
      nombre: process.env.ADMIN_NOMBRE ?? 'Admin',
      apellido: process.env.ADMIN_APELLIDO ?? 'Mateatletas',
    },
  });

  console.log(`✅ Admin listo: ${email}`);
}

async function seedEquipos() {
  console.log('\n🛡️  Creando equipos base...');

  const equipos = [
    {
      nombre: 'Fénix',
      color_primario: '#FF6B35',
      color_secundario: '#F7B801',
    },
    {
      nombre: 'Dragón',
      color_primario: '#F44336',
      color_secundario: '#9C27B0',
    },
    {
      nombre: 'Tigre',
      color_primario: '#2196F3',
      color_secundario: '#00BCD4',
    },
    {
      nombre: 'Águila',
      color_primario: '#4CAF50',
      color_secundario: '#8BC34A',
    },
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { nombre: equipo.nombre },
      update: {
        color_primario: equipo.color_primario,
        color_secundario: equipo.color_secundario,
      },
      create: equipo,
    });
    console.log(`   • ${equipo.nombre}`);
  }

  console.log('✅ Equipos cargados');
}

async function seedRutasCurriculares() {
  console.log('\n🧭 Creando rutas curriculares...');

  const rutas = [
    {
      id: 'seed-ruta-logica',
      nombre: 'Lógica y Razonamiento',
      color: '#8B5CF6',
      descripcion:
        'Desarrollo de pensamiento lógico, resolución de problemas y razonamiento abstracto',
    },
    {
      id: 'seed-ruta-algebra',
      nombre: 'Álgebra',
      color: '#3B82F6',
      descripcion: 'Ecuaciones, sistemas, funciones y expresiones algebraicas',
    },
    {
      id: 'seed-ruta-geometria',
      nombre: 'Geometría',
      color: '#10B981',
      descripcion:
        'Figuras planas, cuerpos geométricos, trigonometría y transformaciones',
    },
    {
      id: 'seed-ruta-aritmetica',
      nombre: 'Aritmética',
      color: '#F59E0B',
      descripcion:
        'Números, operaciones básicas, fracciones, decimales y porcentajes',
    },
    {
      id: 'seed-ruta-estadistica',
      nombre: 'Estadística y Probabilidad',
      color: '#EF4444',
      descripcion:
        'Análisis de datos, gráficos, medidas de tendencia y probabilidad',
    },
    {
      id: 'seed-ruta-calculo',
      nombre: 'Cálculo',
      color: '#6366F1',
      descripcion: 'Límites, derivadas, integrales y análisis matemático',
    },
  ];

  for (const ruta of rutas) {
    const { id, ...data } = ruta;

    await prisma.rutaCurricular.upsert({
      where: { nombre: ruta.nombre },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${ruta.nombre}`);
  }

  console.log('✅ Rutas curriculares cargadas');
}

async function seedProductos() {
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

main()
  .catch((error) => {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
