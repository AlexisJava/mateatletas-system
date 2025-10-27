import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class VerificacionMorosidadService {
  constructor(private prisma: PrismaService) {}

  private calcularFechaVencimiento(periodo: string): Date {
    const [anioStr, mesStr] = periodo.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr);

    if (!anio || !mes || Number.isNaN(anio) || Number.isNaN(mes)) {
      throw new Error(`Periodo inválido para calcular vencimiento: ${periodo}`);
    }

    const fecha = new Date(anio, mes, 0);
    fecha.setHours(23, 59, 59, 999);

    return fecha;
  }

  /**
   * Verifica si un estudiante tiene pagos pendientes vencidos
   * @param estudianteId ID del estudiante
   * @returns true si el estudiante está moroso, false si está al día
   */
  async esEstudianteMoroso(estudianteId: string): Promise<boolean> {
    const hoy = new Date();

    const inscripcionesPendientes = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
      select: {
        fecha_vencimiento: true,
        periodo: true,
      },
    });

    return inscripcionesPendientes.some((inscripcion) => {
      const fechaVencimiento =
        inscripcion.fecha_vencimiento ??
        this.calcularFechaVencimiento(inscripcion.periodo);

      return fechaVencimiento.getTime() < hoy.getTime();
    });
  }

  /**
   * Verifica si un tutor tiene estudiantes con pagos pendientes vencidos
   * @param tutorId ID del tutor
   * @returns información sobre morosidad del tutor
  */
  async verificarMorosidadTutor(tutorId: string) {
    const hoy = new Date();

    const inscripcionesPendientes = await this.prisma.inscripcionMensual.findMany({
      where: {
        tutor_id: tutorId,
        estado_pago: { in: ['Pendiente', 'Vencido'] },
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
    });

    const inscripcionesVencidas = inscripcionesPendientes
      .map((inscripcion) => {
        const fechaVencimiento =
          inscripcion.fecha_vencimiento ??
          this.calcularFechaVencimiento(inscripcion.periodo);

        return {
          ...inscripcion,
          fechaVencimiento,
        };
      })
      .filter((inscripcion) => inscripcion.fechaVencimiento.getTime() < hoy.getTime())
      .sort(
        (a, b) =>
          a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime(),
      );

    const totalAdeudado = inscripcionesVencidas.reduce(
      (sum, inscripcion) => sum + Number(inscripcion.precio_final),
      0,
    );

    const estudiantesConDeuda = [
      ...new Set(inscripcionesVencidas.map((inscripcion) => inscripcion.estudiante_id)),
    ];

    return {
      tieneMorosidad: inscripcionesVencidas.length > 0,
      cantidadCuotasVencidas: inscripcionesVencidas.length,
      totalAdeudado,
      estudiantesAfectados: estudiantesConDeuda.length,
      detalleEstudiantes: inscripcionesVencidas.map((inscripcion) => ({
        estudianteId: inscripcion.estudiante.id,
        estudianteNombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        periodo: inscripcion.periodo,
        monto: Number(inscripcion.precio_final),
        fechaVencimiento: inscripcion.fechaVencimiento,
        diasVencido: Math.floor(
          (hoy.getTime() - inscripcion.fechaVencimiento.getTime()) /
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
            estado_pago: { in: ['Pendiente', 'Vencido'] },
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
            estado_pago: { in: ['Pendiente', 'Vencido'] },
          },
        },
      },
    });

    return estudiantesConDeuda
      .map((estudiante) => {
        const inscripcionesVencidas = estudiante.inscripciones_mensuales
          .map((inscripcion) => {
            const fechaVencimiento =
              inscripcion.fecha_vencimiento ??
              this.calcularFechaVencimiento(inscripcion.periodo);

            return {
              ...inscripcion,
              fechaVencimiento,
            };
          })
          .filter(
            (inscripcion) => inscripcion.fechaVencimiento.getTime() < hoy.getTime(),
          )
          .sort(
            (a, b) =>
              a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime(),
          );

        if (!inscripcionesVencidas.length) {
          return null;
        }

        return {
          id: estudiante.id,
          nombre: `${estudiante.nombre} ${estudiante.apellido}`,
          edad: estudiante.edad,
          tutor: {
            id: estudiante.tutor.id,
            nombre: `${estudiante.tutor.nombre} ${estudiante.tutor.apellido}`,
            email: estudiante.tutor.email,
            telefono: estudiante.tutor.telefono,
          },
          cuotasVencidas: inscripcionesVencidas.length,
          totalAdeudado: inscripcionesVencidas.reduce(
            (sum, inscripcion) => sum + Number(inscripcion.precio_final),
            0,
          ),
          detalleDeuda: inscripcionesVencidas.map((inscripcion) => ({
            periodo: inscripcion.periodo,
            monto: Number(inscripcion.precio_final),
            fechaVencimiento: inscripcion.fechaVencimiento,
            diasVencido: Math.floor(
              (hoy.getTime() - inscripcion.fechaVencimiento.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          })),
        };
      })
      .filter((estudiante): estudiante is NonNullable<typeof estudiante> => !!estudiante);
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
    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
    });

    const deudas = inscripciones
      .map((inscripcion) => {
        const fechaVencimiento =
          inscripcion.fecha_vencimiento ??
          this.calcularFechaVencimiento(inscripcion.periodo);

        return {
          ...inscripcion,
          fechaVencimiento,
        };
      })
      .filter((inscripcion) => inscripcion.fechaVencimiento.getTime() < hoy.getTime())
      .sort(
        (a, b) =>
          a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime(),
      );

    const totalAdeudado = deudas.reduce(
      (sum, deuda) => sum + Number(deuda.precio_final),
      0,
    );

    return {
      permitirAcceso: false,
      mensaje: 'Acceso bloqueado por pagos pendientes',
      detalles: {
        cuotasVencidas: deudas.length,
        totalAdeudado,
        periodos: deudas.map((deuda) => deuda.periodo),
        primeraDeuda: deudas[0]?.periodo,
        fechaVencimientoMasAntigua: deudas[0]?.fechaVencimiento,
      },
    };
  }
}
