import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPlanificacionRepository } from '../../domain/planificacion.repository.interface';

@Injectable()
export class DeleteActividadUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(planificacionId: string, actividadId: string): Promise<void> {
    const actividad =
      await this.planificacionRepository.findActividadById(actividadId);

    if (actividad.planificacionId !== planificacionId) {
      throw new NotFoundException(
        'La actividad no pertenece a la planificación solicitada',
      );
    }

    await this.planificacionRepository.deleteActividad(actividadId);
  }
}
