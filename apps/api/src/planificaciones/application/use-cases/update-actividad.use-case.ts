import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IPlanificacionRepository,
  UpdateActividadData,
} from '../../domain/planificacion.repository.interface';
import { ActividadEntity } from '../../domain/actividad.entity';
import { UpdateActividadDto } from '../dto/update-actividad.dto';

@Injectable()
export class UpdateActividadUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(
    planificacionId: string,
    actividadId: string,
    dto: UpdateActividadDto,
  ): Promise<ActividadEntity> {
    const actividad =
      await this.planificacionRepository.findActividadById(actividadId);

    if (actividad.planificacionId !== planificacionId) {
      throw new NotFoundException(
        'La actividad no pertenece a la planificación solicitada',
      );
    }

    const updateData: UpdateActividadData = {
      semanaNumero: dto.semana,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      componenteNombre: dto.componente,
      componenteProps: dto.props,
      nivelDificultad: dto.nivel_dificultad,
      tiempoEstimadoMinutos: dto.tiempo_estimado_minutos,
      puntosGamificacion: dto.puntos_gamificacion,
      instruccionesDocente: dto.instrucciones_docente,
      instruccionesEstudiante: dto.instrucciones_estudiante,
      recursosUrl: dto.recursos_url,
      orden: dto.orden,
    };

    return this.planificacionRepository.updateActividad(
      actividadId,
      updateData,
    );
  }
}
