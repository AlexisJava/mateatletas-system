import { Inject, Injectable } from '@nestjs/common';
import { NivelDificultad } from '@prisma/client';
import {
  IPlanificacionRepository,
  CreateActividadData,
} from '../../domain/planificacion.repository.interface';
import { ActividadEntity } from '../../domain/actividad.entity';
import { CreateActividadDto } from '../dto/create-actividad.dto';

@Injectable()
export class AddActividadToPlanificacionUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(
    planificacionId: string,
    dto: CreateActividadDto,
  ): Promise<ActividadEntity> {
    await this.planificacionRepository.findById(planificacionId);

    const existingActividades =
      await this.planificacionRepository.findActividades(planificacionId);

    const createData: CreateActividadData = {
      planificacionId,
      semanaNumero: dto.semana,
      titulo: dto.titulo ?? `Semana ${dto.semana}`,
      descripcion: dto.descripcion,
      componenteNombre: dto.componente,
      componenteProps: dto.props ?? {},
      nivelDificultad: dto.nivel_dificultad ?? NivelDificultad.BASICO,
      tiempoEstimadoMinutos: dto.tiempo_estimado_minutos ?? 30,
      puntosGamificacion: dto.puntos_gamificacion ?? 10,
      instruccionesDocente:
        dto.instrucciones_docente ??
        'Instrucciones para el docente pendientes de completar.',
      instruccionesEstudiante:
        dto.instrucciones_estudiante ??
        'Instrucciones para el estudiante pendientes de completar.',
      recursosUrl: dto.recursos_url ?? null,
      orden: dto.orden ?? existingActividades.length + 1,
    };

    return this.planificacionRepository.createActividad(createData);
  }
}
