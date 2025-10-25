import { Inject, Injectable } from '@nestjs/common';
import { IPlanificacionRepository } from '../../domain/planificacion.repository.interface';

@Injectable()
export class DeletePlanificacionUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.planificacionRepository.findById(id);
    await this.planificacionRepository.delete(id);
  }
}
