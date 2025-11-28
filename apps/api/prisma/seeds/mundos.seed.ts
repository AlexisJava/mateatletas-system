import { PrismaClient, MundoTipo } from '@prisma/client';

/**
 * Seed: Mundos STEAM (Sistema 2026)
 * Crea los 3 mundos de conocimiento
 *
 * SISTEMA DE MUNDOS 2026:
 * - MATEMATICA: Naranja - Numeros, algebra, geometria
 * - PROGRAMACION: Verde - Codigo, algoritmos, logica
 * - CIENCIAS: Azul - Fisica, quimica, biologia
 *
 * REGLAS DE NEGOCIO:
 * - Tier ARCADE: acceso a 1 mundo
 * - Tier ARCADE+: acceso a 2 mundos
 * - Tier PRO: acceso a 3 mundos
 */

interface MundoData {
  tipo: MundoTipo;
  nombre: string;
  descripcion: string;
  icono: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  gradiente: string;
  orden: number;
}

export async function seedMundos(prisma: PrismaClient): Promise<void> {
  console.log('\n🌍 Creando mundos STEAM 2026...');

  const mundos: MundoData[] = [
    {
      tipo: MundoTipo.MATEMATICA,
      nombre: 'Matematica',
      descripcion:
        'Numeros, algebra, geometria y razonamiento logico-matematico',
      icono: '🔢',
      colorPrimary: '#F59E0B', // Naranja/Amber
      colorSecondary: '#D97706',
      colorAccent: '#FDE68A',
      gradiente: 'from-amber-400 to-orange-500',
      orden: 1,
    },
    {
      tipo: MundoTipo.PROGRAMACION,
      nombre: 'Programacion',
      descripcion:
        'Codigo, algoritmos, estructuras de datos y pensamiento computacional',
      icono: '💻',
      colorPrimary: '#10B981', // Verde/Emerald
      colorSecondary: '#059669',
      colorAccent: '#A7F3D0',
      gradiente: 'from-emerald-400 to-green-500',
      orden: 2,
    },
    {
      tipo: MundoTipo.CIENCIAS,
      nombre: 'Ciencias',
      descripcion: 'Fisica, quimica, biologia y metodo cientifico',
      icono: '🔬',
      colorPrimary: '#3B82F6', // Azul
      colorSecondary: '#2563EB',
      colorAccent: '#BFDBFE',
      gradiente: 'from-blue-400 to-blue-600',
      orden: 3,
    },
  ];

  for (const mundo of mundos) {
    await prisma.mundo.upsert({
      where: { tipo: mundo.tipo },
      update: {
        nombre: mundo.nombre,
        descripcion: mundo.descripcion,
        icono: mundo.icono,
        colorPrimary: mundo.colorPrimary,
        colorSecondary: mundo.colorSecondary,
        colorAccent: mundo.colorAccent,
        gradiente: mundo.gradiente,
        orden: mundo.orden,
      },
      create: mundo,
    });
    console.log(`   ${mundo.icono} ${mundo.nombre}`);
  }

  console.log('✅ Mundos STEAM 2026 cargados');
}
