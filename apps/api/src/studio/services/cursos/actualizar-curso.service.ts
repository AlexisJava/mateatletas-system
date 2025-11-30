import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { ActualizarCursoDto } from '../../dto/actualizar-curso.dto';
import { CursoCompleto } from '../../interfaces';
import { ObtenerCursoService } from './obtener-curso.service';

/**
 * Servicio para actualizar cursos
 * Responsabilidad única: Actualizar datos de un curso existente
 */
@Injectable()
export class ActualizarCursoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly obtenerCursoService: ObtenerCursoService,
  ) {}

  /**
   * Actualiza un curso existente
   * @param cursoId ID del curso
   * @param dto Datos a actualizar
   * @returns Curso actualizado completo
   */
  async ejecutar(
    cursoId: string,
    dto: ActualizarCursoDto,
  ): Promise<CursoCompleto> {
    // Verificar que existe
    const existe = await this.obtenerCursoService.existe(cursoId);
    if (!existe) {
      throw new NotFoundException(`Curso con ID ${cursoId} no encontrado`);
    }

    // Construir objeto de actualización solo con campos presentes
    const updateData: Record<string, unknown> = {};

    if (dto.nombre !== undefined) updateData.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.tipoExperiencia !== undefined)
      updateData.tipoExperiencia = dto.tipoExperiencia;
    if (dto.materia !== undefined) updateData.materia = dto.materia;
    if (dto.esteticaBase !== undefined)
      updateData.esteticaBase = dto.esteticaBase;
    if (dto.esteticaVariante !== undefined)
      updateData.esteticaVariante = dto.esteticaVariante;
    if (dto.cantidadSemanas !== undefined)
      updateData.cantidadSemanas = dto.cantidadSemanas;
    if (dto.actividadesPorSemana !== undefined)
      updateData.actividadesPorSemana = dto.actividadesPorSemana;
    if (dto.tierMinimo !== undefined) updateData.tierMinimo = dto.tierMinimo;

    await this.prisma.cursoStudio.update({
      where: { id: cursoId },
      data: updateData,
    });

    // Retornar curso actualizado
    return this.obtenerCursoService.ejecutar(cursoId);
  }
}
