import { Inject, Injectable } from '@nestjs/common';
import { EstadoPlanificacion } from '@prisma/client';
import {
  IPlanificacionRepository,
  PlanificacionDetail,
  UpdatePlanificacionData,
} from '../../domain/planificacion.repository.interface';
import { UpdatePlanificacionDto } from '../dto/update-planificacion.dto';

@Injectable()
export class UpdatePlanificacionUseCase {
  constructor(
    @Inject('IPlanificacionRepository')
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdatePlanificacionDto,
  ): Promise<PlanificacionDetail> {
    const existing = await this.planificacionRepository.findById(id);

    const updateData: UpdatePlanificacionData = {
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      tematicaPrincipal: dto.tematica_principal,
      objetivosAprendizaje: dto.objetivos_aprendizaje,
      estado: dto.estado,
      notasDocentes: dto.notas_docentes,
    };

    if (dto.estado !== undefined && dto.estado !== existing.estado) {
      updateData.fechaPublicacion =
        dto.estado === EstadoPlanificacion.PUBLICADA ? new Date() : null;
    }

    await this.planificacionRepository.update(id, updateData);

    return this.planificacionRepository.findDetailById(id);
  }
}
