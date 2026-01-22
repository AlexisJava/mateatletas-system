import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { calcularFechaVencimiento } from './helpers/calcular-fecha-vencimiento.helper';

type InscripcionMensualConRelaciones = Prisma.InscripcionMensualGetPayload<{
  select: {
    id: true;
    periodo: true;
    precioFinal: true;
    estadoPago: true;
    estudianteId: true;
    tutorId: true;
    estudiante: {
      select: {
        id: true;
        nombre: true;
        apellido: true;
      };
    };
    tutor: {
      select: {
        id: true;
        nombre: true;
        apellido: true;
        email: true;
        telefono: true;
      };
    };
  };
}>;

type InscripcionMensualBasica = Prisma.InscripcionMensualGetPayload<{
  select: {
    id: true;
    periodo: true;
    precioFinal: true;
  };
}>;

type EstudianteConDeuda = Prisma.EstudianteGetPayload<{
  select: {
    id: true;
    nombre: true;
    apellido: true;
    edad: true;
    tutor: {
      select: {
        id: true;
        nombre: true;
        apellido: true;
        email: true;
        telefono: true;
      };
    };
    inscripcionesMensuales: {
      select: {
        id: true;
        periodo: true;
        precioFinal: true;
        estadoPago: true;
      };
    };
  };
}>;

type InscripcionMensualDeEstudiante =
  EstudianteConDeuda['inscripcionesMensuales'][number];

interface DetalleDeuda {
  periodo: string;
  monto: number;
  fechaVencimiento: Date;
  diasVencido: number;
}

export interface EstudianteMorosoDetalle {
  id: string;
  nombre: string;
  edad: number;
  tutor: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
  };
  cuotasVencidas: number;
  totalAdeudado: number;
  detalleDeuda: DetalleDeuda[];
}

interface InscripcionConFechaVencimiento<T> {
  registro: T;
  fechaVencimiento: Date;
}

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
    hoy.setHours(0, 0, 0, 0);

    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          estudianteId: estudianteId,
          estadoPago: 'Pendiente',
        },
        select: {
          periodo: true,
        },
        orderBy: {
          periodo: 'asc',
        },
      });

    const pagosPendientesVencidos = inscripcionesPendientes.filter(
      ({ periodo }: { periodo: string }) =>
        calcularFechaVencimiento(periodo) < hoy,
    );

    return pagosPendientesVencidos.length > 0;
  }

  /**
   * Verifica si un tutor tiene estudiantes con pagos pendientes vencidos
   * @param tutorId ID del tutor
   * @returns información sobre morosidad del tutor
   */
  async verificarMorosidadTutor(tutorId: string) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inscripcionesPendientes =
      (await this.prisma.inscripcionMensual.findMany({
        where: {
          tutorId: tutorId,
          estadoPago: 'Pendiente',
        },
        select: {
          id: true,
          periodo: true,
          precioFinal: true,
          estadoPago: true,
          estudianteId: true,
          tutorId: true,
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
        },
        orderBy: {
          periodo: 'asc',
        },
      })) as InscripcionMensualConRelaciones[];

    const inscripcionesConFecha: InscripcionConFechaVencimiento<InscripcionMensualConRelaciones>[] =
      inscripcionesPendientes.map(
        (inscripcion: InscripcionMensualConRelaciones) => ({
          registro: inscripcion,
          fechaVencimiento: calcularFechaVencimiento(inscripcion.periodo),
        }),
      );

    const inscripcionesVencidas = inscripcionesConFecha.filter(
      ({
        fechaVencimiento,
      }: InscripcionConFechaVencimiento<InscripcionMensualConRelaciones>) =>
        fechaVencimiento < hoy,
    );

    const totalAdeudado = inscripcionesVencidas.reduce<number>(
      (
        sum: number,
        {
          registro,
        }: InscripcionConFechaVencimiento<InscripcionMensualConRelaciones>,
      ) => sum + Number(registro.precioFinal),
      0,
    );

    const estudiantesConDeuda = Array.from(
      new Set(
        inscripcionesVencidas.map(
          ({
            registro,
          }: InscripcionConFechaVencimiento<InscripcionMensualConRelaciones>) =>
            registro.estudianteId,
        ),
      ),
    );

    return {
      tieneMorosidad: inscripcionesVencidas.length > 0,
      cantidadCuotasVencidas: inscripcionesVencidas.length,
      totalAdeudado,
      estudiantesAfectados: estudiantesConDeuda.length,
      detalleEstudiantes: inscripcionesVencidas.map(
        ({
          registro,
          fechaVencimiento,
        }: InscripcionConFechaVencimiento<InscripcionMensualConRelaciones>) => {
          const diasVencido = Math.floor(
            (hoy.getTime() - fechaVencimiento.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          return {
            estudianteId: registro.estudiante.id,
            estudianteNombre: `${registro.estudiante.nombre} ${registro.estudiante.apellido}`,
            periodo: registro.periodo,
            monto: Number(registro.precioFinal),
            fechaVencimiento,
            diasVencido,
          };
        },
      ),
    };
  }

  /**
   * Obtiene todos los estudiantes morosos del sistema
   * @returns lista de estudiantes con deudas vencidas
   */
  async obtenerEstudiantesMorosos() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const estudiantesPendientes = (await this.prisma.estudiante.findMany({
      where: {
        inscripcionesMensuales: {
          some: {
            estadoPago: 'Pendiente',
            periodo: {
              lte: periodoActual,
            },
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
        inscripcionesMensuales: {
          where: {
            estadoPago: 'Pendiente',
            periodo: {
              lte: periodoActual,
            },
          },
          orderBy: {
            periodo: 'asc',
          },
          select: {
            id: true,
            periodo: true,
            precioFinal: true,
            estadoPago: true,
          },
        },
      },
    })) as EstudianteConDeuda[];

    const estudiantesMorosos = estudiantesPendientes
      .map<EstudianteMorosoDetalle | null>((estudiante: EstudianteConDeuda) => {
        const inscripcionesConFecha: InscripcionConFechaVencimiento<InscripcionMensualDeEstudiante>[] =
          estudiante.inscripcionesMensuales.map(
            (inscripcion: InscripcionMensualDeEstudiante) => ({
              registro: inscripcion,
              fechaVencimiento: calcularFechaVencimiento(inscripcion.periodo),
            }),
          );

        const inscripcionesVencidas = inscripcionesConFecha.filter(
          ({
            fechaVencimiento,
          }: InscripcionConFechaVencimiento<InscripcionMensualDeEstudiante>) =>
            fechaVencimiento < hoy,
        );

        if (inscripcionesVencidas.length === 0) {
          return null;
        }

        const totalAdeudado = inscripcionesVencidas.reduce<number>(
          (
            sum: number,
            {
              registro,
            }: InscripcionConFechaVencimiento<InscripcionMensualDeEstudiante>,
          ) => sum + Number(registro.precioFinal),
          0,
        );

        const detalleDeuda: DetalleDeuda[] = inscripcionesVencidas.map(
          ({
            registro,
            fechaVencimiento,
          }: InscripcionConFechaVencimiento<InscripcionMensualDeEstudiante>) => {
            const diasVencido = Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            return {
              periodo: registro.periodo,
              monto: Number(registro.precioFinal),
              fechaVencimiento,
              diasVencido,
            };
          },
        );

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
          cuotasVencidas: detalleDeuda.length,
          totalAdeudado,
          detalleDeuda,
        };
      })
      .filter(
        (
          estudiante: EstudianteMorosoDetalle | null,
        ): estudiante is EstudianteMorosoDetalle => estudiante !== null,
      );

    return estudiantesMorosos;
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
    hoy.setHours(0, 0, 0, 0);
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const inscripcionesPendientes =
      (await this.prisma.inscripcionMensual.findMany({
        where: {
          estudianteId: estudianteId,
          estadoPago: 'Pendiente',
          periodo: {
            lte: periodoActual,
          },
        },
        select: {
          id: true,
          periodo: true,
          precioFinal: true,
        },
        orderBy: {
          periodo: 'asc',
        },
      })) as InscripcionMensualBasica[];

    const deudasConFecha: InscripcionConFechaVencimiento<InscripcionMensualBasica>[] =
      inscripcionesPendientes.map((inscripcion: InscripcionMensualBasica) => ({
        registro: inscripcion,
        fechaVencimiento: calcularFechaVencimiento(inscripcion.periodo),
      }));

    const deudasVencidas = deudasConFecha.filter(
      ({
        fechaVencimiento,
      }: InscripcionConFechaVencimiento<InscripcionMensualBasica>) =>
        fechaVencimiento < hoy,
    );

    const primeraDeudaVencida = deudasVencidas[0];
    if (!primeraDeudaVencida) {
      return {
        permitirAcceso: true,
        mensaje: 'Estudiante al día con los pagos',
      };
    }

    const totalAdeudado = deudasVencidas.reduce<number>(
      (
        sum: number,
        { registro }: InscripcionConFechaVencimiento<InscripcionMensualBasica>,
      ) => sum + Number(registro.precioFinal),
      0,
    );

    const periodos = deudasVencidas.map(
      ({
        registro,
      }: InscripcionConFechaVencimiento<InscripcionMensualBasica>) =>
        registro.periodo,
    );

    const primeraDeuda = periodos[0];
    const fechaVencimientoMasAntigua = primeraDeudaVencida.fechaVencimiento;

    return {
      permitirAcceso: false,
      mensaje: 'Acceso bloqueado por pagos pendientes',
      detalles: {
        cuotasVencidas: deudasVencidas.length,
        totalAdeudado,
        periodos,
        primeraDeuda,
        fechaVencimientoMasAntigua,
      },
    };
  }
}
