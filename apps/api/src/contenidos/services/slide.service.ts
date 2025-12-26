import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido } from '@prisma/client';
import { CreateSlideDto, UpdateSlideDto, ReordenarSlidesDto } from '../dto';

/**
 * Service para gestionar slides dentro de un contenido
 * Responsabilidad: CRUD de slides y reordenamiento
 */
@Injectable()
export class SlideService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que el contenido existe y está en BORRADOR
   */
  private async validateContenidoEditable(contenidoId: string) {
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      select: { id: true, estado: true, titulo: true },
    });

    if (!contenido) {
      throw new NotFoundException(
        `Contenido con ID ${contenidoId} no encontrado`,
      );
    }

    if (contenido.estado !== EstadoContenido.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden modificar slides de contenidos en estado BORRADOR',
      );
    }

    return contenido;
  }

  /**
   * Agrega un nuevo slide al contenido
   * @param contenidoId - ID del contenido
   * @param dto - Datos del slide
   */
  async addSlide(contenidoId: string, dto: CreateSlideDto) {
    await this.validateContenidoEditable(contenidoId);

    // Si no se especifica orden, agregar al final
    let orden = dto.orden;
    if (orden === undefined) {
      const lastSlide = await this.prisma.slide.findFirst({
        where: { contenidoId },
        orderBy: { orden: 'desc' },
        select: { orden: true },
      });
      orden = (lastSlide?.orden ?? -1) + 1;
    }

    return this.prisma.slide.create({
      data: {
        contenidoId,
        titulo: dto.titulo,
        contenidoJson: dto.contenidoJson,
        orden,
      },
    });
  }

  /**
   * Actualiza un slide existente
   * @param slideId - ID del slide
   * @param dto - Datos a actualizar
   */
  async updateSlide(slideId: string, dto: UpdateSlideDto) {
    const slide = await this.prisma.slide.findUnique({
      where: { id: slideId },
      select: { id: true, contenidoId: true },
    });

    if (!slide) {
      throw new NotFoundException(`Slide con ID ${slideId} no encontrado`);
    }

    await this.validateContenidoEditable(slide.contenidoId);

    return this.prisma.slide.update({
      where: { id: slideId },
      data: dto,
    });
  }

  /**
   * Elimina un slide
   * @param slideId - ID del slide
   */
  async removeSlide(slideId: string) {
    const slide = await this.prisma.slide.findUnique({
      where: { id: slideId },
      select: { id: true, contenidoId: true, titulo: true },
    });

    if (!slide) {
      throw new NotFoundException(`Slide con ID ${slideId} no encontrado`);
    }

    await this.validateContenidoEditable(slide.contenidoId);

    await this.prisma.slide.delete({ where: { id: slideId } });

    return { success: true, mensaje: `Slide "${slide.titulo}" eliminado` };
  }

  /**
   * Reordena múltiples slides
   * @param contenidoId - ID del contenido
   * @param dto - Nuevas posiciones de slides
   */
  async reordenar(contenidoId: string, dto: ReordenarSlidesDto) {
    await this.validateContenidoEditable(contenidoId);

    // Actualizar orden de cada slide en transacción
    await this.prisma.$transaction(
      dto.orden.map((item) =>
        this.prisma.slide.update({
          where: { id: item.slideId },
          data: { orden: item.orden },
        }),
      ),
    );

    // Retornar slides actualizados
    return this.prisma.slide.findMany({
      where: { contenidoId },
      orderBy: { orden: 'asc' },
    });
  }
}
