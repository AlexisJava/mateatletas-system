import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class VerificacionMorosidadService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula la fecha de vencimiento para un periodo dado
   * El vencimiento es el último día del mes especificado en el periodo
   * @param periodo Formato "YYYY-MM"
   * @returns Fecha de vencimiento (último día del mes)
   */
  private calcularFechaVencimiento(periodo: string): Date {
    const [anio, mes] = periodo.split('-').map(Number);
    // Día 0 del mes siguiente = último día del mes actual
    return new Date(anio, mes, 0);
  }

  /**
   * Verifica si un estudiante tiene pagos pendientes vencidos
   * @param estudianteId ID del estudiante
   * @returns true si el estudiante está moroso, false si está al día
   */
  async esEstudianteMoroso(estudianteId: string): Promise<boolean> {
    const hoy = new Date();

    // Obtener todas las inscripciones pendientes
    const candidatas = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        estado_pago: 'Pendiente',
      },
      select: {
        periodo: true,
      },
    });

    // Filtrar en memoria las que están vencidas
    const pagosPendientesVencidos = candidatas.filter(
      (insc) => this.calcularFechaVencimiento(insc.periodo) < hoy,
    ).length;

    return pagosPendientesVencidos > 0;
  }

  /**
   * Verifica si un tutor tiene estudiantes con pagos pendientes vencidos
   * @param tutorId ID del tutor
   * @returns información sobre morosidad del tutor
   */
  async verificarMorosidadTutor(tutorId: string) {
    const hoy = new Date();

    // Obtener todas las inscripciones pendientes del tutor
    const inscripcionesPendientes = await this.prisma.inscripcionMensual.findMany({
      where: {
        tutor_id: tutorId,
        estado_pago: 'Pendiente',
      },
      select: {
        periodo: true,
        precio_final: true,
        estudiante_id: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    // Filtrar y ordenar en memoria por fecha de vencimiento
    const inscripcionesVencidas = inscripcionesPendientes
      .filter((insc) => this.calcularFechaVencimiento(insc.periodo) < hoy)
      .sort((a, b) =>
        this.calcularFechaVencimiento(a.periodo).getTime() -
        this.calcularFechaVencimiento(b.periodo).getTime()
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
      detalleEstudiantes: inscripcionesVencidas.map((insc) => {
        const fechaVencimiento = this.calcularFechaVencimiento(insc.periodo);
        return {
          estudianteId: insc.estudiante.id,
          estudianteNombre: `${insc.estudiante.nombre} ${insc.estudiante.apellido}`,
          periodo: insc.periodo,
          monto: Number(insc.precio_final),
          fechaVencimiento,
          diasVencido: Math.floor(
            (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24),
          ),
        };
      }),
    };
  }

  /**
   * Obtiene todos los estudiantes morosos del sistema
   * @returns lista de estudiantes con deudas vencidas
   */
  async obtenerEstudiantesMorosos() {
    const hoy = new Date();

    // Obtener estudiantes con inscripciones pendientes
    const estudiantesConInscripcionesPendientes = await this.prisma.estudiante.findMany({
      where: {
        inscripciones_mensuales: {
          some: {
            estado_pago: 'Pendiente',
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        edad: true,
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
          },
          select: {
            periodo: true,
            precio_final: true,
          },
        },
      },
    });

    // Filtrar estudiantes que tienen deudas VENCIDAS
    return estudiantesConInscripcionesPendientes
      .map((est) => {
        // Filtrar inscripciones vencidas
        const inscripcionesVencidas = est.inscripciones_mensuales
          .filter((insc) => this.calcularFechaVencimiento(insc.periodo) < hoy)
          .sort((a, b) =>
            this.calcularFechaVencimiento(a.periodo).getTime() -
            this.calcularFechaVencimiento(b.periodo).getTime()
          );

        if (inscripcionesVencidas.length === 0) {
          return null; // No tiene deudas vencidas
        }

        return {
          id: est.id,
          nombre: `${est.nombre} ${est.apellido}`,
          edad: est.edad,
          tutor: {
            id: est.tutor.id,
            nombre: `${est.tutor.nombre} ${est.tutor.apellido}`,
            email: est.tutor.email,
            telefono: est.tutor.telefono,
          },
          cuotasVencidas: inscripcionesVencidas.length,
          totalAdeudado: inscripcionesVencidas.reduce(
            (sum: number, insc: { precio_final: Prisma.Decimal }) =>
              sum + Number(insc.precio_final),
            0,
          ),
          detalleDeuda: inscripcionesVencidas.map(
            (insc: { periodo: string; precio_final: Prisma.Decimal }) => {
              const fechaVencimiento = this.calcularFechaVencimiento(insc.periodo);
              return {
                periodo: insc.periodo,
                monto: Number(insc.precio_final),
                fechaVencimiento,
                diasVencido: Math.floor(
                  (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24),
                ),
              };
            }
          ),
        };
      })
      .filter((est) => est !== null); // Eliminar estudiantes sin deudas vencidas
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

    // Obtener deudas pendientes
    const deudasPendientes = await this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        estado_pago: 'Pendiente',
      },
      select: {
        periodo: true,
        precio_final: true,
      },
    });

    // Filtrar y ordenar las vencidas
    const deudas = deudasPendientes
      .filter((d) => this.calcularFechaVencimiento(d.periodo) < hoy)
      .sort((a, b) =>
        this.calcularFechaVencimiento(a.periodo).getTime() -
        this.calcularFechaVencimiento(b.periodo).getTime()
      );

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
        fechaVencimientoMasAntigua: this.calcularFechaVencimiento(deudas[0].periodo),
      },
    };
  }
}
