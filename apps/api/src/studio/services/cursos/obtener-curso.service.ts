import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { CursoCompleto, SemanaResumen } from '../../interfaces';

/**
 * Servicio para obtener un curso específico
 * Responsabilidad única: Consultar un curso por ID con sus semanas
 */
@Injectable()
export class ObtenerCursoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene un curso completo con sus semanas
   * @param cursoId ID del curso
   * @returns Curso con semanas resumidas
   */
  async ejecutar(cursoId: string): Promise<CursoCompleto> {
    const curso = await this.prisma.cursoStudio.findUnique({
      where: { id: cursoId },
      include: {
        semanas: {
          select: {
            id: true,
            numero: true,
            nombre: true,
            estado: true,
          },
          orderBy: { numero: 'asc' },
        },
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    const semanas: SemanaResumen[] = curso.semanas.map((s) => ({
      id: s.id,
      numero: s.numero,
      nombre: s.nombre,
      estado: s.estado,
    }));

    return {
      id: curso.id,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      categoria: curso.categoria,
      mundo: curso.mundo,
      casa: curso.casa,
      tierMinimo: curso.tier_minimo,
      tipoExperiencia: curso.tipo_experiencia,
      materia: curso.materia,
      esteticaBase: curso.estetica_base,
      esteticaVariante: curso.estetica_variante,
      cantidadSemanas: curso.cantidad_semanas,
      actividadesPorSemana: curso.actividades_por_semana,
      estado: curso.estado,
      landingMundo: curso.landing_mundo,
      landingHome: curso.landing_home,
      catalogoInterno: curso.catalogo_interno,
      notificarUpgrade: curso.notificar_upgrade,
      fechaVenta: curso.fecha_venta,
      fechaDisponible: curso.fecha_disponible,
      creadoEn: curso.creado_en,
      actualizadoEn: curso.actualizado_en,
      semanas,
    };
  }

  /**
   * Verifica si un curso existe
   * @param cursoId ID del curso
   * @returns true si existe
   */
  async existe(cursoId: string): Promise<boolean> {
    const count = await this.prisma.cursoStudio.count({
      where: { id: cursoId },
    });
    return count > 0;
  }
}
