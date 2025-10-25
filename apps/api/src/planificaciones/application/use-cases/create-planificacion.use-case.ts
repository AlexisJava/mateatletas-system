import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { EstadoPlanificacion } from '@prisma/client';
import { IPlanificacionRepository } from '../../domain/planificacion.repository.interface';
import { CreatePlanificacionDto } from '../dto/create-planificacion.dto';
import { PlanificacionEntity } from '../../domain/planificacion.entity';

/**
 * Use Case: Crear Planificación Mensual
 *
 * Reglas de negocio:
 * 1. Validar unique constraint (codigo_grupo + mes + año)
 * 2. Estado inicial siempre es BORRADOR
 * 3. Total de actividades inicial es 0
 * 4. Objetivos de aprendizaje por defecto es array vacío
 */
@Injectable()
export class CreatePlanificacionUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(
    dto: CreatePlanificacionDto,
    userId: string,
  ): Promise<PlanificacionEntity> {
    // 1. Verificar que no existe planificación para este grupo/mes/año
    await this.validateUniquePlanificacion(dto);

    // 2. Crear planificación con estado BORRADOR
    const entity = await this.planificacionRepository.create({
      grupoId: dto.grupo_id,
      mes: dto.mes,
      anio: dto.anio,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? '',
      tematicaPrincipal: dto.tematica_principal,
      objetivosAprendizaje: dto.objetivos_aprendizaje ?? [],
      notasDocentes: dto.notas_docentes ?? null,
      estado: EstadoPlanificacion.BORRADOR,
      createdByAdminId: userId,
    });

    // 3. Convertir entity a objeto plano para respuesta
    return entity;
  }

  /**
   * Valida que no exista una planificación para el mismo grupo/mes/año
   */
  private async validateUniquePlanificacion(
    dto: CreatePlanificacionDto,
  ): Promise<void> {
    const existente = await this.planificacionRepository.findByPeriod(
      dto.grupo_id,
      dto.mes,
      dto.anio,
    );

    if (existente) {
      const meses = [
        '',
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];
      const nombreMes = meses[dto.mes];

      throw new ConflictException(
        `Ya existe una planificación para este grupo en ${nombreMes} ${dto.anio}`,
      );
    }
  }
}
