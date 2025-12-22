import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CasaTipo } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio para gestionar las Casas del sistema Mateatletas 2026
 *
 * Sistema de 3 casas por edad:
 * - QUANTUM: 6-9 años (exploradores)
 * - VERTEX: 10-12 años (constructores)
 * - PULSAR: 13-17 años (dominadores)
 *
 * Reglas de negocio:
 * - La edad determina la casa BASE
 * - Un estudiante puede BAJAR de casa (nunca subir)
 * - PULSAR solo puede bajar a VERTEX (nunca a QUANTUM)
 *
 * Refactorizado para usar RecursosEstudiante.xp_total en lugar de puntos_totales
 */
@Injectable()
export class CasasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Determina la casa correspondiente según la edad del estudiante
   *
   * @param edad - Edad del estudiante (6-17 años)
   * @returns CasaTipo correspondiente
   * @throws BadRequestException si la edad está fuera del rango
   */
  determinarCasaPorEdad(edad: number): CasaTipo {
    if (edad < 6 || edad > 17) {
      throw new BadRequestException(
        'Edad fuera del rango permitido (6-17 años)',
      );
    }

    if (edad >= 6 && edad <= 9) {
      return 'QUANTUM';
    }

    if (edad >= 10 && edad <= 12) {
      return 'VERTEX';
    }

    // edad >= 13 && edad <= 17
    return 'PULSAR';
  }

  /**
   * Verifica si un estudiante puede descender de una casa a otra
   *
   * Reglas:
   * - Solo se permite descender (nunca ascender)
   * - PULSAR solo puede bajar a VERTEX (protección anti-frustración)
   * - VERTEX puede bajar a QUANTUM
   * - No se permite quedarse en la misma casa (no es descenso)
   *
   * @param casaActual - Casa actual del estudiante
   * @param casaDestino - Casa a la que se quiere mover
   * @returns true si el descenso es válido
   */
  puedeDescender(casaActual: CasaTipo, casaDestino: CasaTipo): boolean {
    // Misma casa = no es descenso
    if (casaActual === casaDestino) {
      return false;
    }

    // Jerarquía: PULSAR (3) > VERTEX (2) > QUANTUM (1)
    const jerarquia: Record<CasaTipo, number> = {
      QUANTUM: 1,
      VERTEX: 2,
      PULSAR: 3,
    };

    const nivelActual = jerarquia[casaActual];
    const nivelDestino = jerarquia[casaDestino];

    // No se puede ascender
    if (nivelDestino >= nivelActual) {
      return false;
    }

    // PULSAR solo puede bajar a VERTEX (no directamente a QUANTUM)
    if (casaActual === 'PULSAR' && casaDestino === 'QUANTUM') {
      return false;
    }

    return true;
  }

  /**
   * Obtiene todas las casas ordenadas por edad mínima
   */
  async findAll(): Promise<CasaConEstudiantes[]> {
    const casas = await this.prisma.casa.findMany({
      orderBy: { edadMinima: 'asc' },
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    return casas;
  }

  /**
   * Obtiene una casa por su ID
   *
   * @param id - ID de la casa
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<CasaConEstudiantes> {
    const casa = await this.prisma.casa.findUnique({
      where: { id },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            nivel_actual: true,
            avatarUrl: true,
            recursos: {
              select: { xp_total: true },
            },
          },
        },
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    if (!casa) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }

    // Ordenar por XP en memoria y mapear
    const estudiantesOrdenados = casa.estudiantes
      .map((est) => ({
        id: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        xp_total: est.recursos?.xp_total ?? 0,
        nivel_actual: est.nivel_actual,
        avatarUrl: est.avatarUrl,
      }))
      .sort((a, b) => b.xp_total - a.xp_total);

    return {
      ...casa,
      estudiantes: estudiantesOrdenados,
    };
  }

  /**
   * Obtiene una casa por su tipo
   *
   * @param tipo - Tipo de casa (QUANTUM, VERTEX, PULSAR)
   * @throws NotFoundException si no existe
   */
  async findByTipo(tipo: CasaTipo): Promise<CasaBasica> {
    const casa = await this.prisma.casa.findFirst({
      where: { tipo },
    });

    if (!casa) {
      throw new NotFoundException(`Casa de tipo ${tipo} no encontrada`);
    }

    return casa;
  }

  /**
   * Obtiene el ranking interno de una casa (estudiantes ordenados por XP)
   *
   * @param casaId - ID de la casa
   * @returns Lista de estudiantes ordenados por XP descendente
   */
  async getRankingInterno(casaId: string): Promise<EstudianteRanking[]> {
    const casa = await this.prisma.casa.findUnique({
      where: { id: casaId },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            nivel_actual: true,
            avatarUrl: true,
            recursos: {
              select: { xp_total: true },
            },
          },
        },
      },
    });

    if (!casa) {
      throw new NotFoundException(`Casa con ID ${casaId} no encontrada`);
    }

    // Mapear y ordenar por XP
    return casa.estudiantes
      .map((est) => ({
        id: est.id,
        nombre: est.nombre,
        apellido: est.apellido,
        puntosTotales: est.recursos?.xp_total ?? 0,
        nivelActual: est.nivel_actual,
        avatarUrl: est.avatarUrl,
      }))
      .sort((a, b) => b.puntosTotales - a.puntosTotales);
  }

  /**
   * Obtiene estadísticas agregadas de todas las casas
   */
  async getEstadisticas(): Promise<EstadisticasCasas> {
    const casas = await this.prisma.casa.findMany({
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
      orderBy: { puntosTotales: 'desc' },
    });

    const totalCasas = casas.length;
    const totalEstudiantes = casas.reduce(
      (sum, casa) => sum + casa._count.estudiantes,
      0,
    );

    return {
      totalCasas,
      totalEstudiantes,
      promedioEstudiantesPorCasa:
        totalCasas > 0
          ? Math.round((totalEstudiantes / totalCasas) * 10) / 10
          : 0,
      ranking: casas.map((casa, index) => ({
        posicion: index + 1,
        id: casa.id,
        tipo: casa.tipo,
        nombre: casa.nombre,
        emoji: casa.emoji,
        puntosTotales: casa.puntosTotales,
        cantidadEstudiantes: casa._count.estudiantes,
      })),
    };
  }

  /**
   * Recalcula los puntos totales de una casa sumando los XP de sus estudiantes
   *
   * @param casaId - ID de la casa
   */
  async recalcularPuntos(casaId: string): Promise<CasaBasica> {
    // Obtener la suma de XP de todos los estudiantes de la casa
    const resultado = await this.prisma.recursosEstudiante.aggregate({
      where: {
        estudiante: {
          casaId: casaId,
        },
      },
      _sum: {
        xp_total: true,
      },
    });

    const puntosTotales = resultado._sum.xp_total ?? 0;

    return this.prisma.casa.update({
      where: { id: casaId },
      data: { puntosTotales },
    });
  }
}

// Tipos auxiliares para el servicio
interface CasaBasica {
  id: string;
  tipo: CasaTipo;
  nombre: string;
  emoji: string;
  slogan: string | null;
  edadMinima: number;
  edadMaxima: number;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorDark: string;
  gradiente: string;
  puntosTotales: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CasaConEstudiantes extends CasaBasica {
  estudiantes?: EstudianteBasico[];
  _count?: { estudiantes: number };
}

interface EstudianteBasico {
  id: string;
  nombre: string;
  apellido: string;
  xp_total: number;
  nivel_actual: number;
  avatarUrl: string | null;
}

interface EstudianteRanking {
  id: string;
  nombre: string;
  apellido: string;
  puntosTotales: number;
  nivelActual: number;
  avatarUrl: string | null;
}

interface EstadisticasCasas {
  totalCasas: number;
  totalEstudiantes: number;
  promedioEstudiantesPorCasa: number;
  ranking: RankingCasa[];
}

interface RankingCasa {
  posicion: number;
  id: string;
  tipo: CasaTipo;
  nombre: string;
  emoji: string;
  puntosTotales: number;
  cantidadEstudiantes: number;
}
