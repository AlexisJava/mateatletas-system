import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Servicio especializado para gestión de alertas administrativas
 * Extraído de AdminService para separar responsabilidades
 */
@Injectable()
export class AdminAlertasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todas las alertas pendientes (no resueltas)
   * Incluye información del estudiante y clase relacionada
   */
  async listarAlertas() {
    const alertas = await this.prisma.alerta.findMany({
      where: { resuelta: false },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            nivelEscolar: true,
          },
        },
        clase: {
          select: {
            id: true,
            fecha_hora_inicio: true,
            duracion_minutos: true,
            rutaCurricular: {
              select: {
                nombre: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return alertas.map((alerta) => ({
      id: alerta.id,
      descripcion: alerta.descripcion,
      fecha: alerta.fecha,
      resuelta: alerta.resuelta,
      estudiante: alerta.estudiante,
      clase: {
        id: alerta.clase.id,
        fecha_hora_inicio: alerta.clase.fecha_hora_inicio,
        duracion_minutos: alerta.clase.duracion_minutos,
        rutaCurricular: alerta.clase.rutaCurricular?.nombre ?? 'Sin ruta',
        color: alerta.clase.rutaCurricular?.color ?? '#6B7280',
      },
      createdAt: alerta.createdAt,
    }));
  }

  /**
   * Marcar una alerta como resuelta
   */
  async resolverAlerta(id: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    await this.prisma.alerta.update({
      where: { id },
      data: { resuelta: true },
    });

    return {
      message: 'Alerta marcada como resuelta',
      alertaId: id,
    };
  }

  /**
   * Generar sugerencia para resolver una alerta
   * Por ahora retorna una sugerencia estática
   * TODO: Integrar con OpenAI para sugerencias dinámicas
   */
  async sugerirSolucion(alertaId: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id: alertaId },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
            nivelEscolar: true,
          },
        },
        clase: {
          select: {
            rutaCurricular: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // TODO: Integrar con OpenAI API
    // Por ahora retornamos una sugerencia estática basada en el contexto
    const sugerencia = this.generarSugerenciaEstatica(alerta);

    return {
      alertaId: alerta.id,
      estudiante: `${alerta.estudiante.nombre} ${alerta.estudiante.apellido}`,
      problema: alerta.descripcion,
      sugerencia,
    };
  }

  /**
   * Crear una alerta manualmente (para testing/debugging)
   */
  async crearAlerta(
    estudianteId: string,
    claseId: string,
    descripcion: string,
  ) {
    const alerta = await this.prisma.alerta.create({
      data: {
        estudiante_id: estudianteId,
        clase_id: claseId,
        descripcion,
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        clase: {
          select: {
            rutaCurricular: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    return alerta;
  }

  /**
   * Genera una sugerencia estática basada en el contexto de la alerta
   * Será reemplazado por integración con OpenAI en el futuro
   */
  private generarSugerenciaEstatica(alerta: {
    descripcion: string;
    estudiante: { nivelEscolar: string };
    clase: { rutaCurricular: { nombre: string } | null };
  }): string {
    const nivel = alerta.estudiante.nivelEscolar;
    const ruta = alerta.clase.rutaCurricular?.nombre || 'General';

    // Sugerencias basadas en patrones comunes
    if (alerta.descripcion.toLowerCase().includes('ausente')) {
      return `Contactar al tutor para verificar el motivo de la ausencia. Considerar reprogramar la clase o asignar material de recuperación para ${ruta}.`;
    }

    if (alerta.descripcion.toLowerCase().includes('dificultad')) {
      return `Revisar los prerequisitos de ${ruta} para ${nivel}. Considerar sesión de refuerzo individual o ajustar el ritmo del contenido.`;
    }

    if (alerta.descripcion.toLowerCase().includes('comportamiento')) {
      return `Coordinar reunión con el tutor para discutir estrategias de manejo. Evaluar si el nivel de dificultad es apropiado para ${nivel}.`;
    }

    // Sugerencia genérica
    return `Revisar el progreso del estudiante en ${ruta}. Contactar al tutor para obtener más contexto y determinar si se requiere intervención adicional.`;
  }
}
