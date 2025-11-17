import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ConfiguracionPreciosRepository } from '../infrastructure/repositories/configuracion-precios.repository';
import { InscripcionMensualRepository } from '../infrastructure/repositories/inscripcion-mensual.repository';
import { EstadoPago, EstadoMembresia } from '@prisma/client';

/**
 * Parámetros para búsqueda de inscripciones
 */
export interface FindAllInscripcionesParams {
  tutorId?: number;
  estudianteId?: number;
  anio?: number;
  mes?: number;
  estado?: string;
  page?: number;
  limit?: number;
}

/**
 * Servicio de queries de pagos (solo lecturas)
 *
 * Responsabilidades:
 * - Consultar inscripciones mensuales
 * - Consultar membresías
 * - Consultar configuración de precios
 * - Consultar historial de cambios
 * - Consultar estudiantes con descuentos
 *
 * Este servicio NO modifica datos, solo consulta (CQRS - Query side)
 */
@Injectable()
export class PaymentQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configuracionRepo: ConfiguracionPreciosRepository,
    private readonly inscripcionRepo: InscripcionMensualRepository,
  ) {}

  /**
   * Buscar inscripciones mensuales con filtros y paginación
   *
   * @param params - Parámetros de búsqueda y paginación
   * @returns Inscripciones paginadas con totales
   */
  async findAllInscripciones(params: FindAllInscripcionesParams) {
    const {
      tutorId,
      estudianteId,
      anio,
      mes,
      estado,
      page = 1,
      limit = 10,
    } = params;

    const where: any = {};
    if (tutorId) where.tutor_id = String(tutorId);
    if (estudianteId) where.estudiante_id = String(estudianteId);
    if (anio) where.anio = anio;
    if (mes) where.mes = mes;
    if (estado) where.estado_pago = estado;

    const [data, total] = await Promise.all([
      this.prisma.inscripcionMensual.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
        },
        orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      }),
      this.prisma.inscripcionMensual.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener una inscripción mensual por ID
   *
   * @param id - ID de la inscripción (string o number)
   * @returns Inscripción con datos de estudiante y tutor
   * @throws NotFoundException si no existe
   */
  async findInscripcionById(id: string | number) {
    const inscripcion = await this.prisma.inscripcionMensual.findUnique({
      where: { id: String(id) },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción mensual ${id} no encontrada`,
      );
    }

    return inscripcion;
  }

  /**
   * Verificar si estudiante tiene inscripción pendiente en un periodo
   *
   * @param estudianteId - ID del estudiante
   * @param anio - Año del periodo
   * @param mes - Mes del periodo
   * @returns true si tiene inscripción pendiente
   */
  async tieneInscripcionPendiente(
    estudianteId: string,
    anio: number,
    mes: number,
  ): Promise<boolean> {
    const inscripcion = await this.prisma.inscripcionMensual.findFirst({
      where: {
        estudiante_id: estudianteId,
        anio,
        mes,
        estado_pago: EstadoPago.Pendiente,
      },
    });

    return !!inscripcion;
  }

  /**
   * Obtener membresías de un tutor (todas)
   *
   * @param tutorId - ID del tutor
   * @returns Lista de membresías con producto
   */
  async findMembresiasDelTutor(tutorId: string) {
    return this.prisma.membresia.findMany({
      where: { tutor_id: tutorId },
      include: {
        producto: true,
      },
      orderBy: { fecha_inicio: 'desc' },
    });
  }

  /**
   * Obtener membresía activa de un tutor
   *
   * @param tutorId - ID del tutor
   * @returns Membresía activa o null si no tiene
   */
  async findMembresiaActiva(tutorId: string) {
    return this.prisma.membresia.findFirst({
      where: {
        tutor_id: tutorId,
        estado: EstadoMembresia.Activa,
      },
      include: {
        producto: true,
      },
    });
  }

  /**
   * Buscar inscripción por periodo específico
   *
   * @param estudianteId - ID del estudiante
   * @param anio - Año del periodo
   * @param mes - Mes del periodo
   * @returns Inscripción del periodo o null
   */
  async findInscripcionPorPeriodo(
    estudianteId: string,
    anio: number,
    mes: number,
  ) {
    return this.prisma.inscripcionMensual.findFirst({
      where: {
        estudiante_id: estudianteId,
        anio,
        mes,
      },
      include: {
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
          },
        },
      },
    });
  }

  /**
   * Obtener la configuración de precios actual
   *
   * @returns Configuración singleton de precios
   */
  async obtenerConfiguracion() {
    return this.configuracionRepo.obtenerConfiguracion();
  }

  /**
   * Obtener historial de cambios de precios
   *
   * @param limit - Cantidad máxima de registros (default: 50)
   * @returns Historial de cambios para auditoría
   */
  async obtenerHistorialCambios(limit: number = 50) {
    return this.configuracionRepo.obtenerHistorialCambios(limit);
  }

  /**
   * Obtener inscripciones pendientes del periodo actual
   *
   * @returns Inscripciones con estado Pendiente del periodo actual
   */
  async obtenerInscripcionesPendientes() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const inscripciones =
      await this.inscripcionRepo.obtenerInscripcionesPorPeriodo(periodo);

    // Filtrar solo pendientes
    return inscripciones.filter((i) => i.estadoPago === EstadoPago.Pendiente);
  }

  /**
   * Obtener estudiantes con descuentos aplicados
   *
   * @returns Estudiantes agrupados con sus descuentos
   */
  async obtenerEstudiantesConDescuentos() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return this.inscripcionRepo.obtenerEstudiantesConDescuentos(periodo);
  }

  /**
   * Buscar inscripciones pendientes de un estudiante en un periodo
   *
   * @param estudianteId - ID del estudiante
   * @param tutorId - ID del tutor
   * @param periodo - Periodo en formato YYYY-MM
   * @returns Inscripciones pendientes del estudiante
   */
  async buscarInscripcionesPendientes(
    estudianteId: string,
    tutorId: string,
    periodo: string,
  ) {
    return this.prisma.inscripcionMensual.findMany({
      where: {
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        periodo,
        estado_pago: 'Pendiente',
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });
  }
}
