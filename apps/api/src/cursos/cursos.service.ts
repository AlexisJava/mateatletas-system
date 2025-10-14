import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';
import { CompletarLeccionDto } from './dto/completar-leccion.dto';

/**
 * Service para gestionar cursos, módulos y lecciones
 * Implementa mejores prácticas de Ed-Tech:
 * - Progressive Disclosure (desbloqueo secuencial)
 * - Learning Analytics (tracking detallado)
 * - Gamificación integrada
 * - Microlearning (lecciones cortas)
 */
@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // MÓDULOS
  // ============================================================================

  /**
   * Crear un nuevo módulo dentro de un curso
   */
  async createModulo(productoId: string, createModuloDto: CreateModuloDto) {
    // Verificar que el producto existe y es tipo Curso
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    if (producto.tipo !== 'Curso') {
      throw new BadRequestException('El producto debe ser de tipo Curso');
    }

    // Crear el módulo
    return this.prisma.modulo.create({
      data: {
        producto_id: productoId,
        ...createModuloDto,
      },
      include: {
        lecciones: {
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  /**
   * Obtener todos los módulos de un curso
   */
  async findModulosByProducto(productoId: string) {
    return this.prisma.modulo.findMany({
      where: { producto_id: productoId },
      orderBy: { orden: 'asc' },
      include: {
        lecciones: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            tipo_contenido: true,
            orden: true,
            puntos_por_completar: true,
            duracion_estimada_minutos: true,
            leccion_prerequisito_id: true,
          },
        },
      },
    });
  }

  /**
   * Obtener un módulo específico con sus lecciones
   */
  async findOneModulo(id: string) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id },
      include: {
        lecciones: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
        },
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
      },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    return modulo;
  }

  /**
   * Actualizar un módulo
   */
  async updateModulo(id: string, updateModuloDto: UpdateModuloDto) {
    // Verificar que existe
    await this.findOneModulo(id);

    return this.prisma.modulo.update({
      where: { id },
      data: updateModuloDto,
      include: {
        lecciones: {
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  /**
   * Eliminar un módulo (y sus lecciones por cascade)
   */
  async removeModulo(id: string) {
    // Verificar que existe
    await this.findOneModulo(id);

    return this.prisma.modulo.delete({
      where: { id },
    });
  }

  /**
   * Reordenar módulos de un curso
   */
  async reordenarModulos(productoId: string, ordenIds: string[]) {
    const updates = ordenIds.map((id, index) =>
      this.prisma.modulo.update({
        where: { id },
        data: { orden: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Módulos reordenados exitosamente' };
  }

  // ============================================================================
  // LECCIONES
  // ============================================================================

  /**
   * Crear una nueva lección dentro de un módulo
   */
  async createLeccion(moduloId: string, createLeccionDto: CreateLeccionDto) {
    // Verificar que el módulo existe
    const modulo = await this.prisma.modulo.findUnique({
      where: { id: moduloId },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${moduloId} no encontrado`);
    }

    // Si hay prerequisito, verificar que existe
    if (createLeccionDto.leccion_prerequisito_id) {
      const prerequisito = await this.prisma.leccion.findUnique({
        where: { id: createLeccionDto.leccion_prerequisito_id },
      });

      if (!prerequisito) {
        throw new NotFoundException('Lección prerequisito no encontrada');
      }
    }

    // Crear la lección
    const leccion = await this.prisma.leccion.create({
      data: {
        modulo_id: moduloId,
        ...createLeccionDto,
      },
      include: {
        modulo: {
          select: {
            id: true,
            titulo: true,
            producto_id: true,
          },
        },
        logro: true,
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    // Actualizar puntos totales del módulo
    await this.recalcularPuntosModulo(moduloId);

    return leccion;
  }

  /**
   * Obtener todas las lecciones de un módulo
   */
  async findLeccionesByModulo(moduloId: string) {
    return this.prisma.leccion.findMany({
      where: {
        modulo_id: moduloId,
        activo: true,
      },
      orderBy: { orden: 'asc' },
      include: {
        logro: {
          select: {
            id: true,
            nombre: true,
            icono: true,
            puntos: true,
          },
        },
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });
  }

  /**
   * Obtener una lección específica con todo su contenido
   */
  async findOneLeccion(id: string) {
    const leccion = await this.prisma.leccion.findUnique({
      where: { id },
      include: {
        modulo: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        logro: true,
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    if (!leccion) {
      throw new NotFoundException(`Lección con ID ${id} no encontrada`);
    }

    return leccion;
  }

  /**
   * Actualizar una lección
   */
  async updateLeccion(id: string, updateLeccionDto: UpdateLeccionDto) {
    // Verificar que existe
    await this.findOneLeccion(id);

    const leccion = await this.prisma.leccion.update({
      where: { id },
      data: updateLeccionDto,
      include: {
        modulo: true,
        logro: true,
      },
    });

    // Recalcular puntos del módulo si cambió puntos_por_completar
    if (updateLeccionDto.puntos_por_completar !== undefined) {
      await this.recalcularPuntosModulo(leccion.modulo_id);
    }

    return leccion;
  }

  /**
   * Eliminar una lección
   */
  async removeLeccion(id: string) {
    const leccion = await this.findOneLeccion(id);

    await this.prisma.leccion.delete({
      where: { id },
    });

    // Recalcular puntos del módulo
    await this.recalcularPuntosModulo(leccion.modulo_id);

    return { message: 'Lección eliminada exitosamente' };
  }

  /**
   * Reordenar lecciones de un módulo
   */
  async reordenarLecciones(moduloId: string, ordenIds: string[]) {
    const updates = ordenIds.map((id, index) =>
      this.prisma.leccion.update({
        where: { id },
        data: { orden: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Lecciones reordenadas exitosamente' };
  }

  // ============================================================================
  // PROGRESO DEL ESTUDIANTE
  // ============================================================================

  /**
   * Completar una lección (acción del estudiante)
   * Implementa:
   * - Immediate Feedback
   * - Gamificación (otorgar puntos)
   * - Learning Analytics (guardar tiempo, calificación)
   * - Desbloquear logros
   */
  async completarLeccion(
    leccionId: string,
    estudianteId: string,
    completarDto: CompletarLeccionDto,
  ) {
    // Obtener la lección
    const leccion = await this.findOneLeccion(leccionId);

    // Verificar que el estudiante está inscrito al curso
    const inscripcion = await this.prisma.inscripcionCurso.findFirst({
      where: {
        estudiante_id: estudianteId,
        producto_id: leccion.modulo.producto_id,
        estado: 'Activo',
      },
    });

    if (!inscripcion) {
      throw new ForbiddenException('No estás inscrito en este curso');
    }

    // Verificar prerequisito (Progressive Disclosure)
    if (leccion.leccion_prerequisito_id) {
      const prerequisitoCompletado = await this.prisma.progresoLeccion.findFirst({
        where: {
          estudiante_id: estudianteId,
          leccion_id: leccion.leccion_prerequisito_id,
          completada: true,
        },
      });

      if (!prerequisitoCompletado) {
        throw new BadRequestException(
          'Debes completar la lección prerequisito primero'
        );
      }
    }

    // Crear o actualizar progreso
    const progreso = await this.prisma.progresoLeccion.upsert({
      where: {
        estudiante_id_leccion_id: {
          estudiante_id: estudianteId,
          leccion_id: leccionId,
        },
      },
      update: {
        completada: true,
        progreso: 100,
        fecha_completada: new Date(),
        calificacion: completarDto.calificacion,
        tiempo_invertido_minutos: completarDto.tiempo_invertido_minutos,
        notas_estudiante: completarDto.notas_estudiante,
        ultima_respuesta: completarDto.ultima_respuesta,
        intentos: {
          increment: 1,
        },
      },
      create: {
        estudiante_id: estudianteId,
        leccion_id: leccionId,
        completada: true,
        progreso: 100,
        fecha_completada: new Date(),
        calificacion: completarDto.calificacion,
        tiempo_invertido_minutos: completarDto.tiempo_invertido_minutos,
        notas_estudiante: completarDto.notas_estudiante,
        ultima_respuesta: completarDto.ultima_respuesta,
        intentos: 1,
      },
      include: {
        leccion: {
          include: {
            logro: true,
          },
        },
      },
    });

    // Otorgar puntos automáticamente (Gamificación)
    const puntosGanados = leccion.puntos_por_completar;
    let logroDesbloqueado = null;

    // Actualizar puntos totales del estudiante
    // TODO: Integrar con GamificacionService para crear registros de PuntoObtenido
    //       Una vez que se defina cómo manejar puntos del sistema (sin docente)
    if (puntosGanados > 0) {
      await this.prisma.estudiante.update({
        where: { id: estudianteId },
        data: {
          puntos_totales: {
            increment: puntosGanados,
          },
        },
      });
    }

    // Desbloquear logro si existe
    if (leccion.logro_desbloqueable_id) {
      const yaDesbloqueado = await this.prisma.logroDesbloqueado.findFirst({
        where: {
          estudiante_id: estudianteId,
          logro_id: leccion.logro_desbloqueable_id,
        },
      });

      if (!yaDesbloqueado) {
        logroDesbloqueado = await this.prisma.logroDesbloqueado.create({
          data: {
            estudiante_id: estudianteId,
            logro_id: leccion.logro_desbloqueable_id,
            contexto: `Completó lección: ${leccion.titulo}`,
          },
          include: {
            logro: true,
          },
        });

        // Otorgar puntos del logro
        // TODO: Integrar con GamificacionService
        if (leccion.logro && leccion.logro.puntos > 0) {
          await this.prisma.estudiante.update({
            where: { id: estudianteId },
            data: {
              puntos_totales: {
                increment: leccion.logro.puntos,
              },
            },
          });
        }
      }
    }

    return {
      progreso,
      puntos_ganados: puntosGanados,
      logro_desbloqueado: logroDesbloqueado,
      mensaje: logroDesbloqueado
        ? `¡Felicidades! Ganaste ${puntosGanados} puntos y desbloqueaste el logro "${logroDesbloqueado.logro.nombre}"! 🎉`
        : `¡Excelente! Ganaste ${puntosGanados} puntos`,
    };
  }

  /**
   * Obtener progreso del estudiante en un curso completo
   */
  async getProgresoCurso(productoId: string, estudianteId: string) {
    // Obtener todos los módulos y lecciones del curso
    const modulos = await this.findModulosByProducto(productoId);

    // Obtener progreso del estudiante
    const leccionIds = modulos.flatMap((m) => m.lecciones.map((l) => l.id));

    const progresos = await this.prisma.progresoLeccion.findMany({
      where: {
        estudiante_id: estudianteId,
        leccion_id: { in: leccionIds },
      },
    });

    // Calcular estadísticas
    const totalLecciones = leccionIds.length;
    const leccionesCompletadas = progresos.filter((p) => p.completada).length;
    const porcentajeCompletado = Math.round(
      (leccionesCompletadas / totalLecciones) * 100
    );

    // Progreso por módulo
    const progresoModulos = modulos.map((modulo) => {
      const leccionesModulo = modulo.lecciones.length;
      const completadasModulo = modulo.lecciones.filter((leccion) =>
        progresos.some((p) => p.leccion_id === leccion.id && p.completada)
      ).length;

      return {
        modulo_id: modulo.id,
        modulo_titulo: modulo.titulo,
        total_lecciones: leccionesModulo,
        lecciones_completadas: completadasModulo,
        porcentaje: Math.round((completadasModulo / leccionesModulo) * 100),
      };
    });

    return {
      producto_id: productoId,
      estudiante_id: estudianteId,
      total_modulos: modulos.length,
      total_lecciones: totalLecciones,
      lecciones_completadas: leccionesCompletadas,
      porcentaje_completado: porcentajeCompletado,
      progreso_modulos: progresoModulos,
    };
  }

  /**
   * Obtener siguiente lección disponible para el estudiante
   * Implementa Progressive Disclosure
   */
  async getSiguienteLeccion(productoId: string, estudianteId: string) {
    const modulos = await this.findModulosByProducto(productoId);

    for (const modulo of modulos) {
      for (const leccion of modulo.lecciones) {
        // Verificar si ya está completada
        const progreso = await this.prisma.progresoLeccion.findUnique({
          where: {
            estudiante_id_leccion_id: {
              estudiante_id: estudianteId,
              leccion_id: leccion.id,
            },
          },
        });

        if (progreso?.completada) continue;

        // Verificar prerequisito
        if (leccion.leccion_prerequisito_id) {
          const prerequisito = await this.prisma.progresoLeccion.findUnique({
            where: {
              estudiante_id_leccion_id: {
                estudiante_id: estudianteId,
                leccion_id: leccion.leccion_prerequisito_id,
              },
            },
          });

          if (!prerequisito?.completada) continue;
        }

        // Esta es la siguiente lección disponible
        return {
          leccion_id: leccion.id,
          leccion,
          modulo: {
            id: modulo.id,
            titulo: modulo.titulo,
          },
        };
      }
    }

    return null; // Curso completado
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Recalcular puntos totales y duración de un módulo
   */
  private async recalcularPuntosModulo(moduloId: string) {
    const lecciones = await this.prisma.leccion.findMany({
      where: {
        modulo_id: moduloId,
        activo: true,
      },
    });

    const puntosTotales = lecciones.reduce(
      (sum, l) => sum + (l.puntos_por_completar || 0),
      0
    );

    const duracionTotal = lecciones.reduce(
      (sum, l) => sum + (l.duracion_estimada_minutos || 0),
      0
    );

    await this.prisma.modulo.update({
      where: { id: moduloId },
      data: {
        puntos_totales: puntosTotales,
        duracion_estimada_minutos: duracionTotal,
      },
    });
  }
}
