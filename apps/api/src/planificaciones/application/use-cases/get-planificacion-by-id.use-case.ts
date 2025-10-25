import { Inject, Injectable } from '@nestjs/common';
import {
  IPlanificacionRepository,
  PlanificacionDetail,
} from '../../domain/planificacion.repository.interface';

@Injectable()
export class GetPlanificacionByIdUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(id: string): Promise<PlanificacionDetail> {
    return this.planificacionRepository.findDetailById(id);
  }
}
