import { PrismaClient, CasaTipo } from '@prisma/client';

/**
 * Seed: Casas (Sistema 2026)
 * Crea las 3 casas base organizadas por edad
 *
 * SISTEMA DE CASAS 2026:
 * - QUANTUM (6-9 años): Rosa/Magenta - Exploradores 🌟
 * - VERTEX (10-12 años): Celeste - Constructores 🚀
 * - PULSAR (13-17 años): Violeta - Dominadores ⚡
 *
 * REGLAS DE NEGOCIO:
 * - La edad determina la casa base
 * - Solo se puede DESCENDER de casa (nunca ascender)
 * - PULSAR solo puede descender a VERTEX (nunca directo a QUANTUM)
 * - Competencia INTERNA dentro de cada casa
 */

interface CasaData {
  tipo: CasaTipo;
  nombre: string;
  emoji: string;
  slogan: string;
  edadMinima: number;
  edadMaxima: number;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorDark: string;
  gradiente: string;
}

export async function seedCasas(prisma: PrismaClient): Promise<void> {
  console.log('\n🏠 Creando casas del sistema 2026...');

  const casas: CasaData[] = [
    {
      tipo: CasaTipo.QUANTUM,
      nombre: 'Quantum',
      emoji: '🌟',
      slogan: 'Exploradores del Conocimiento',
      edadMinima: 6,
      edadMaxima: 9,
      colorPrimary: '#F472B6', // Rosa/Magenta
      colorSecondary: '#EC4899',
      colorAccent: '#FBCFE8',
      colorDark: '#DB2777',
      gradiente: 'from-pink-400 to-pink-600',
    },
    {
      tipo: CasaTipo.VERTEX,
      nombre: 'Vertex',
      emoji: '🚀',
      slogan: 'Constructores del Futuro',
      edadMinima: 10,
      edadMaxima: 12,
      colorPrimary: '#38BDF8', // Celeste
      colorSecondary: '#0EA5E9',
      colorAccent: '#BAE6FD',
      colorDark: '#0284C7',
      gradiente: 'from-sky-400 to-sky-600',
    },
    {
      tipo: CasaTipo.PULSAR,
      nombre: 'Pulsar',
      emoji: '⚡',
      slogan: 'Dominadores de la Lógica',
      edadMinima: 13,
      edadMaxima: 17,
      colorPrimary: '#6366F1', // Violeta
      colorSecondary: '#4F46E5',
      colorAccent: '#C7D2FE',
      colorDark: '#4338CA',
      gradiente: 'from-indigo-400 to-indigo-600',
    },
  ];

  for (const casa of casas) {
    await prisma.casa.upsert({
      where: { tipo: casa.tipo },
      update: {
        nombre: casa.nombre,
        emoji: casa.emoji,
        slogan: casa.slogan,
        edadMinima: casa.edadMinima,
        edadMaxima: casa.edadMaxima,
        colorPrimary: casa.colorPrimary,
        colorSecondary: casa.colorSecondary,
        colorAccent: casa.colorAccent,
        colorDark: casa.colorDark,
        gradiente: casa.gradiente,
      },
      create: casa,
    });
    console.log(
      `   • ${casa.emoji} ${casa.nombre} (${casa.edadMinima}-${casa.edadMaxima} años)`,
    );
  }

  console.log('✅ Casas 2026 cargadas');
}
