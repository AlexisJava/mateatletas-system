import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class VerificacionMorosidadService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica si un estudiante tiene pagos pendientes vencidos
   * @param estudianteId ID del estudiante
   * @returns true si el estudiante está moroso, false si está al día
   */
  async esEstudianteMoroso(estudianteId: string): Promise<boolean> {
    const hoy = new Date();

    const pagosPendientesVencidos = await this.prisma.inscripcionMensual.count({
      where: {
        estudiante_id: estudianteId,
        estado_pago: 'Pendiente',
        fecha_vencimiento: {
          lt: hoy, // menor que hoy = vencido
        },
      },
    });

    return pagosPendientesVencidos > 0;
  }

  /**
   * Verifica si un tutor tiene estudiantes con pagos pendientes vencidos
   * @param tutorId ID del tutor
   * @returns información sobre morosidad del tutor
   */
  async verificarMorosidadTutor(tutorId: string) {
    const hoy = new Date();

    const inscripcionesVencidas = await this.prisma.inscripcionMensual.findMany(
      {
        where: {
          tutor_id: tutorId,
          estado_pago: 'Pendiente',
          fecha_vencimiento: {
            lt: hoy,
          },
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: {
          fecha_vencimiento: 'asc',
        },
      },
    );

    const totalAdeudado = inscripcionesVencidas.reduce(
      (sum, insc) => sum + Number(insc.precio_final),
      0,
    );

    const estudiantesConDeuda = [
      ...new Set(inscripcionesVencidas.map((i) => i.estudiante_id)),
    ];

    return {
      tieneMorosidad: inscripcionesVencidas.length > 0,
      cantidadCuotasVencidas: inscripcionesVencidas.length,
      totalAdeudado,
      estudiantesAfectados: estudiantesConDeuda.length,
      detalleEstudiantes: inscripcionesVencidas.map((insc) => ({
        estudianteId: insc.estudiante.id,
        estudianteNombre: `${insc.estudiante.nombre} ${insc.estudiante.apellido}`,
        periodo: insc.periodo,
        monto: Number(insc.precio_final),
        fechaVencimiento: insc.fecha_vencimiento,
        diasVencido: Math.floor(
          (hoy.getTime() - insc.fecha_vencimiento!.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    };
  }

  /**
   * Obtiene todos los estudiantes morosos del sistema
   * @returns lista de estudiantes con deudas vencidas
   */
  async obtenerEstudiantesMorosos() {
    const hoy = new Date();

    const estudiantesConDeuda = await this.prisma.estudiante.findMany({
      where: {
        inscripciones_mensuales: {
          some: {
            estado_pago: 'Pendiente',
            fecha_vencimiento: {
              lt: hoy,
            },
          },
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        inscripciones_mensuales: {
          where: {
            estado_pago: 'Pendiente',
            fecha_vencimiento: {
              lt: hoy,
            },
          },
          orderBy: {
            fecha_vencimiento: 'asc',
          },
        },
      },
    });

    return estudiantesConDeuda.map((est) => ({
      id: est.id,
      nombre: `${est.nombre} ${est.apellido}`,
      edad: est.edad,
      tutor: {
        id: est.tutor.id,
        nombre: `${est.tutor.nombre} ${est.tutor.apellido}`,
        email: est.tutor.email,
        telefono: est.tutor.telefono,
      },
      cuotasVencidas: est.inscripciones_mensuales.length,
      totalAdeudado: est.inscripciones_mensuales.reduce(
        (sum, insc) => sum + Number(insc.precio_final),
        0,
      ),
      detalleDeuda: est.inscripciones_mensuales.map((insc) => ({
        periodo: insc.periodo,
        monto: Number(insc.precio_final),
        fechaVencimiento: insc.fecha_vencimiento,
        diasVencido: Math.floor(
          (hoy.getTime() - insc.fecha_vencimiento!.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      })),
    }));
  }

  /**
   * Verifica si un estudiante puede acceder a la plataforma
   * @param estudianteId ID del estudiante
   * @returns objeto con información de acceso
   */
  async verificarAccesoEstudiante(estudianteId: string) {
    const esMoroso = await this.esEstudianteMoroso(estudianteId);

    if (!esMoroso) {
      return {
        permitirAcceso: true,
        mensaje: 'Estudiante al día con los pagos',
      };
    }

    const hoy = new Date();
    const deudas = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        estado_pago: 'Pendiente',
        fecha_vencimiento: {
          lt: hoy,
        },
      },
      orderBy: {
        fecha_vencimiento: 'asc',
      },
    });

    const totalAdeudado = deudas.reduce(
      (sum, d) => sum + Number(d.precio_final),
      0,
    );

    return {
      permitirAcceso: false,
      mensaje: 'Acceso bloqueado por pagos pendientes',
      detalles: {
        cuotasVencidas: deudas.length,
        totalAdeudado,
        periodos: deudas.map((d) => d.periodo),
        primeraDeuda: deudas[0].periodo,
        fechaVencimientoMasAntigua: deudas[0].fecha_vencimiento,
      },
    };
  }
}
