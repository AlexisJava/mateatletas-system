import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    // Nota: Prisma usa snake_case para los campos de la DB
    const updateData: Prisma.CursoStudioUpdateInput = {};

    if (dto.nombre !== undefined) updateData.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.tipoExperiencia !== undefined)
      updateData.tipo_experiencia = dto.tipoExperiencia;
    if (dto.materia !== undefined) updateData.materia = dto.materia;
    if (dto.esteticaBase !== undefined)
      updateData.estetica_base = dto.esteticaBase;
    if (dto.esteticaVariante !== undefined)
      updateData.estetica_variante = dto.esteticaVariante;
    if (dto.cantidadSemanas !== undefined)
      updateData.cantidad_semanas = dto.cantidadSemanas;
    if (dto.actividadesPorSemana !== undefined)
      updateData.actividades_por_semana = dto.actividadesPorSemana;
    if (dto.tierMinimo !== undefined) updateData.tier_minimo = dto.tierMinimo;

    await this.prisma.cursoStudio.update({
      where: { id: cursoId },
      data: updateData,
    });

    // Retornar curso actualizado
    return this.obtenerCursoService.ejecutar(cursoId);
  }
}
