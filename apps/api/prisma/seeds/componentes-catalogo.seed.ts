import { PrismaClient, CategoriaComponente } from '@prisma/client';

const prisma = new PrismaClient();

const COMPONENTES_IMPLEMENTADOS = [
  {
    tipo: 'MultipleChoice',
    nombre: 'Opción Múltiple',
    descripcion: 'Pregunta con múltiples opciones y una respuesta correcta',
    categoria: CategoriaComponente.INTERACTIVO,
    icono: 'CircleDot',
    configSchema: {},
    ejemploConfig: {
      pregunta: '¿Cuánto es 2 + 2?',
      opciones: ['3', '4', '5', '22'],
      respuestaCorrecta: 1,
    },
    implementado: true,
    habilitado: true,
    orden: 1,
  },
  {
    tipo: 'FillBlanks',
    nombre: 'Completar Espacios',
    descripcion: 'Texto con espacios en blanco para completar',
    categoria: CategoriaComponente.INTERACTIVO,
    icono: 'TextCursorInput',
    configSchema: {},
    ejemploConfig: {
      texto: 'El resultado de {{0}} + {{1}} es {{2}}',
      respuestas: ['2', '3', '5'],
    },
    implementado: true,
    habilitado: true,
    orden: 2,
  },
  {
    tipo: 'VerdaderoFalso',
    nombre: 'Verdadero o Falso',
    descripcion: 'Afirmación para marcar como verdadera o falsa',
    categoria: CategoriaComponente.INTERACTIVO,
    icono: 'ToggleLeft',
    configSchema: {},
    ejemploConfig: {
      afirmacion: 'La Tierra es plana',
      esVerdadero: false,
    },
    implementado: true,
    habilitado: true,
    orden: 3,
  },
  {
    tipo: 'VideoPlayer',
    nombre: 'Reproductor de Video',
    descripcion: 'Reproducir video con controles',
    categoria: CategoriaComponente.CONTENIDO,
    icono: 'Play',
    configSchema: {},
    ejemploConfig: {
      url: 'https://youtube.com/watch?v=ejemplo',
      titulo: 'Video de ejemplo',
    },
    implementado: true,
    habilitado: true,
    orden: 4,
  },
];

export async function seedComponentesCatalogo(): Promise<void> {
  console.log('🌱 Seeding ComponenteCatalogo...');

  for (const comp of COMPONENTES_IMPLEMENTADOS) {
    await prisma.componenteCatalogo.upsert({
      where: { tipo: comp.tipo },
      update: comp,
      create: comp,
    });
    console.log(`  ✅ ${comp.tipo}`);
  }

  console.log(
    `✅ Seed completado: ${COMPONENTES_IMPLEMENTADOS.length} componentes`,
  );
}

// Ejecutar si se llama directamente
seedComponentesCatalogo()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
