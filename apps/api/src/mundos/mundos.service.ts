import { Injectable, NotFoundException } from '@nestjs/common';
import { MundoTipo } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio para gestionar los Mundos STEAM del sistema Mateatletas 2026
 *
 * Sistema de 3 mundos:
 * - MATEMATICA: Numeros, algebra, geometria
 * - PROGRAMACION: Codigo, algoritmos, logica
 * - CIENCIAS: Fisica, quimica, biologia
 *
 * Reglas de negocio:
 * - Tier ARCADE: acceso a 1 mundo
 * - Tier ARCADE+: acceso a 2 mundos
 * - Tier PRO: acceso a 3 mundos
 */
@Injectable()
export class MundosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los mundos ordenados por orden de visualizacion
   */
  async findAll(): Promise<MundoBasico[]> {
    return this.prisma.mundo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Obtiene un mundo por su ID
   *
   * @param id - ID del mundo
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<MundoBasico> {
    const mundo = await this.prisma.mundo.findUnique({
      where: { id },
    });

    if (!mundo) {
      throw new NotFoundException(`Mundo con ID ${id} no encontrado`);
    }

    return mundo;
  }

  /**
   * Obtiene un mundo por su tipo
   *
   * @param tipo - Tipo de mundo (MATEMATICA, PROGRAMACION, CIENCIAS)
   * @throws NotFoundException si no existe
   */
  async findByTipo(tipo: MundoTipo): Promise<MundoBasico> {
    const mundo = await this.prisma.mundo.findUnique({
      where: { tipo },
    });

    if (!mundo) {
      throw new NotFoundException(`Mundo de tipo ${tipo} no encontrado`);
    }

    return mundo;
  }

  /**
   * Obtiene los mundos accesibles segun el tier de suscripcion
   *
   * @param tier - Tier de suscripcion (ARCADE, ARCADE_PLUS, PRO)
   * @returns Lista de mundos accesibles para ese tier
   */
  async getMundosPorTier(tier: TierSuscripcion): Promise<MundoBasico[]> {
    const mundosPermitidos = this.getMundosPermitidosPorTier(tier);

    return this.prisma.mundo.findMany({
      where: {
        activo: true,
        tipo: { in: mundosPermitidos },
      },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Determina cuantos mundos puede acceder un tier
   */
  getCantidadMundosPorTier(tier: TierSuscripcion): number {
    switch (tier) {
      case 'ARCADE':
        return 1;
      case 'ARCADE_PLUS':
        return 2;
      case 'PRO':
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Determina los tipos de mundos permitidos por tier
   * - ARCADE: Solo el primer mundo elegido
   * - ARCADE+: Dos mundos elegidos
   * - PRO: Todos los mundos
   */
  private getMundosPermitidosPorTier(tier: TierSuscripcion): MundoTipo[] {
    // PRO tiene acceso a todo
    if (tier === 'PRO') {
      return [MundoTipo.MATEMATICA, MundoTipo.PROGRAMACION, MundoTipo.CIENCIAS];
    }

    // Para ARCADE y ARCADE+ depende de la seleccion del estudiante
    // Por defecto retornamos todos y el filtrado real se hace por estudiante
    return [MundoTipo.MATEMATICA, MundoTipo.PROGRAMACION, MundoTipo.CIENCIAS];
  }

  /**
   * Verifica si un estudiante puede acceder a un mundo especifico
   *
   * @param estudianteId - ID del estudiante
   * @param mundoTipo - Tipo de mundo a verificar
   * @returns true si tiene acceso
   */
  async puedeAccederMundo(
    estudianteId: string,
    mundoTipo: MundoTipo,
  ): Promise<boolean> {
    // Buscar los mundos seleccionados del estudiante
    const mundosSeleccionados =
      await this.prisma.cicloMundoSeleccionado2026.findMany({
        where: {
          estudiante_inscripcion: {
            estudiante_id: estudianteId,
          },
        },
        select: {
          mundo: true,
        },
      });

    // Si no tiene mundos seleccionados, no tiene acceso
    if (mundosSeleccionados.length === 0) {
      return false;
    }

    // Verificar si el mundo solicitado esta entre los seleccionados
    return mundosSeleccionados.some((m) => m.mundo === mundoTipo);
  }

  /**
   * Obtiene estadisticas de los mundos
   */
  async getEstadisticas(): Promise<EstadisticasMundos> {
    const mundos = await this.prisma.mundo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });

    // Contar estudiantes por mundo
    const conteos = await Promise.all(
      mundos.map(async (mundo) => {
        const count = await this.prisma.cicloMundoSeleccionado2026.count({
          where: { mundo: mundo.tipo },
        });
        return { tipo: mundo.tipo, count };
      }),
    );

    const totalEstudiantes = conteos.reduce((sum, c) => sum + c.count, 0);

    return {
      totalMundos: mundos.length,
      totalEstudiantes,
      mundos: mundos.map((mundo) => {
        const conteo = conteos.find((c) => c.tipo === mundo.tipo);
        return {
          id: mundo.id,
          tipo: mundo.tipo,
          nombre: mundo.nombre,
          icono: mundo.icono,
          cantidadEstudiantes: conteo?.count ?? 0,
        };
      }),
    };
  }
}

// Tipos auxiliares para el servicio
type TierSuscripcion = 'ARCADE' | 'ARCADE_PLUS' | 'PRO';

interface MundoBasico {
  id: string;
  tipo: MundoTipo;
  nombre: string;
  descripcion: string | null;
  icono: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  gradiente: string;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EstadisticasMundos {
  totalMundos: number;
  totalEstudiantes: number;
  mundos: MundoEstadistica[];
}

interface MundoEstadistica {
  id: string;
  tipo: MundoTipo;
  nombre: string;
  icono: string;
  cantidadEstudiantes: number;
}
