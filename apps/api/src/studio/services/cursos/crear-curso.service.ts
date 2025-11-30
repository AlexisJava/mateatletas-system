import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { CrearCursoDto } from '../../dto/crear-curso.dto';
import { CrearCursoResponse, CategoriaStudio } from '../../interfaces';

/**
 * Servicio para crear cursos en Studio
 * Responsabilidad única: Crear un curso nuevo con sus semanas vacías
 */
@Injectable()
export class CrearCursoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo curso y sus semanas vacías
   * @param dto Datos del curso desde el wizard
   * @returns Curso creado con información básica
   */
  async ejecutar(dto: CrearCursoDto): Promise<CrearCursoResponse> {
    // Validar coherencia categoría/tipo
    this.validarCoherenciaTipo(dto);

    // Crear curso con semanas vacías en una transacción
    const curso = await this.prisma.$transaction(async (tx) => {
      // 1. Crear el curso
      const cursoCrado = await tx.cursoStudio.create({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          categoria: dto.categoria,
          mundo: dto.mundo,
          casa: dto.casa,
          tier_minimo: dto.tierMinimo,
          tipo_experiencia: dto.tipoExperiencia ?? null,
          materia: dto.materia ?? null,
          estetica_base: dto.esteticaBase,
          estetica_variante: dto.esteticaVariante ?? null,
          cantidad_semanas: dto.cantidadSemanas,
          actividades_por_semana: dto.actividadesPorSemana,
        },
      });

      // 2. Crear semanas vacías
      const semanasData = Array.from(
        { length: dto.cantidadSemanas },
        (_, i) => ({
          curso_id: cursoCrado.id,
          numero: i + 1,
        }),
      );

      await tx.semanaStudio.createMany({
        data: semanasData,
      });

      return cursoCrado;
    });

    return {
      id: curso.id,
      nombre: curso.nombre,
      estado: curso.estado,
      cantidadSemanas: curso.cantidad_semanas,
    };
  }

  /**
   * Valida que el tipo específico corresponda a la categoría
   */
  private validarCoherenciaTipo(dto: CrearCursoDto): void {
    if (dto.categoria === CategoriaStudio.EXPERIENCIA) {
      if (!dto.tipoExperiencia) {
        throw new BadRequestException(
          'Para categoría EXPERIENCIA, el tipo de experiencia es requerido',
        );
      }
      if (dto.materia) {
        throw new BadRequestException(
          'Para categoría EXPERIENCIA, no se debe especificar materia',
        );
      }
    }

    if (dto.categoria === CategoriaStudio.CURRICULAR) {
      if (!dto.materia) {
        throw new BadRequestException(
          'Para categoría CURRICULAR, la materia es requerida',
        );
      }
      if (dto.tipoExperiencia) {
        throw new BadRequestException(
          'Para categoría CURRICULAR, no se debe especificar tipo de experiencia',
        );
      }
    }
  }
}
