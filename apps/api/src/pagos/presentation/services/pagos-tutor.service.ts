import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EstadoInscripcionCurso,
  EstadoMembresia,
  Producto,
  TipoProducto,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../../core/database/prisma.service';
import { ProductosService } from '../../../catalogo/productos.service';
import { MercadoPagoService } from '../../mercadopago.service';

export interface PreferenciaPagoResponse {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

interface MembresiaWithProducto {
  id: string;
  tutor_id: string;
  producto_id: string;
  estado: EstadoMembresia;
  fecha_inicio: Date | null;
  fecha_proximo_pago: Date | null;
  preferencia_id: string | null;
  createdAt: Date;
  updatedAt: Date;
  producto?: Producto & { precio: number };
}

interface InscripcionCursoWithProducto {
  id: string;
  estudiante_id: string;
  producto_id: string;
  estado: EstadoInscripcionCurso;
  fecha_inscripcion: Date | null;
  preferencia_id: string | null;
  createdAt: Date;
  updatedAt: Date;
  producto?: Producto & { precio: any };
}

/**
 * Servicio de orquestación para flujos de pagos orientados a tutores
 * Maneja creación de preferencias, lectura de membresías e inscripciones.
 */
@Injectable()
export class PagosTutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productosService: ProductosService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Genera una preferencia de MercadoPago para una suscripción.
   */
  async crearPreferenciaSuscripcion(
    tutorId: string,
    productoId?: string,
  ): Promise<PreferenciaPagoResponse> {
    const producto = await this.obtenerProductoSuscripcion(productoId);
    const tutor = await this.obtenerTutorBasico(tutorId);

    const membresia = await this.prisma.membresia.create({
      data: {
        tutor_id: tutorId,
        producto_id: producto.id,
        estado: EstadoMembresia.Pendiente,
        fecha_inicio: null,
        fecha_proximo_pago: null,
      },
    });

    try {
      const preferencia = await this.crearPreferenciaMercadoPago(
        'membresia',
        membresia.id,
        () =>
          this.mercadoPagoService.buildMembershipPreferenceData(
            producto,
            tutor,
            membresia.id,
            tutorId,
            this.getBackendUrl(),
            this.getFrontendUrl(),
          ),
      );

      await this.prisma.membresia.update({
        where: { id: membresia.id },
        data: { preferencia_id: preferencia.id },
      });

      return preferencia;
    } catch (error) {
      await this.prisma.membresia
        .delete({ where: { id: membresia.id } })
        .catch(() => undefined);
      throw error;
    }
  }

  /**
   * Genera una preferencia de MercadoPago para un curso individual.
   */
  async crearPreferenciaCurso(
    tutorId: string,
    estudianteId: string,
    productoId: string,
  ): Promise<PreferenciaPagoResponse> {
    const producto = await this.productosService.findById(productoId);

    if (producto.tipo !== TipoProducto.Curso) {
      throw new BadRequestException('El producto especificado no es un curso');
    }

    const estudiante = await this.prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        tutor_id: tutorId,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        'Estudiante no encontrado o no pertenece al tutor',
      );
    }

    const tutor = await this.obtenerTutorBasico(tutorId);

    const inscripcionExistente = await this.prisma.inscripcionCurso.findUnique({
      where: {
        estudiante_id_producto_id: {
          estudiante_id: estudianteId,
          producto_id: productoId,
        },
      },
    });

    if (inscripcionExistente) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en este curso',
      );
    }

    const inscripcion = await this.prisma.inscripcionCurso.create({
      data: {
        estudiante_id: estudianteId,
        producto_id: productoId,
        estado: EstadoInscripcionCurso.PreInscrito,
      },
    });

    try {
      const preferencia = await this.crearPreferenciaMercadoPago(
        'curso',
        inscripcion.id,
        () =>
          this.mercadoPagoService.buildCoursePreferenceData(
            producto,
            estudiante,
            tutor,
            inscripcion.id,
            estudianteId,
            this.getBackendUrl(),
            this.getFrontendUrl(),
          ),
      );

      await this.prisma.inscripcionCurso.update({
        where: { id: inscripcion.id },
        data: { preferencia_id: preferencia.id },
      });

      return preferencia;
    } catch (error) {
      await this.prisma.inscripcionCurso
        .delete({ where: { id: inscripcion.id } })
        .catch(() => undefined);
      throw error;
    }
  }

  /** Obtiene la membresía más reciente del tutor. */
  async obtenerMembresiaActual(tutorId: string) {
    const membresia = await this.prisma.membresia.findFirst({
      where: { tutor_id: tutorId },
      orderBy: { createdAt: 'desc' },
      include: { producto: true },
    });

    if (!membresia) {
      return null;
    }

    return this.mapearMembresia(membresia);
  }

  /** Obtiene el estado de una membresía específica para el tutor. */
  async obtenerEstadoMembresia(tutorId: string, membresiaId: string) {
    const membresia = await this.prisma.membresia.findFirst({
      where: { id: membresiaId, tutor_id: tutorId },
      include: { producto: true },
    });

    return {
      tiene_membresia: Boolean(membresia),
      membresia: membresia ? this.mapearMembresia(membresia) : null,
    };
  }

  /** Obtiene las inscripciones a cursos de los estudiantes del tutor. */
  async obtenerInscripcionesTutor(tutorId: string) {
    const inscripciones = await this.prisma.inscripcionCurso.findMany({
      where: {
        estudiante: {
          tutor_id: tutorId,
        },
      },
      include: { producto: true },
      orderBy: { createdAt: 'desc' },
    });

    return inscripciones.map((inscripcion) =>
      this.mapearInscripcion(inscripcion),
    );
  }

  /**
   * Activa manualmente una membresía (solo modo mock / entornos no productivos).
   */
  async activarMembresiaManual(tutorId: string, membresiaId: string) {
    const isMock = this.mercadoPagoService.isMockMode();
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') || process.env.NODE_ENV;

    if (!isMock && nodeEnv === 'production') {
      throw new BadRequestException(
        'La activación manual solo está disponible en modo mock',
      );
    }

    const membresia = await this.prisma.membresia.findFirst({
      where: { id: membresiaId, tutor_id: tutorId },
      include: { producto: true },
    });

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    const duracion = membresia.producto?.duracion_meses ?? 1;
    const fechaInicio = new Date();
    const fechaProximoPago = this.addMonths(fechaInicio, duracion);

    const actualizada = await this.prisma.membresia.update({
      where: { id: membresia.id },
      data: {
        estado: EstadoMembresia.Activa,
        fecha_inicio: fechaInicio,
        fecha_proximo_pago: fechaProximoPago,
      },
      include: { producto: true },
    });

    return this.mapearMembresia(actualizada);
  }

  private async obtenerProductoSuscripcion(productoId?: string) {
    if (productoId) {
      const producto = await this.productosService.findById(productoId);

      if (producto.tipo !== TipoProducto.Suscripcion) {
        throw new BadRequestException(
          'El producto especificado no es una suscripción',
        );
      }

      return producto;
    }

    const suscripciones = await this.productosService.findSuscripciones();

    if (!suscripciones || suscripciones.length === 0) {
      throw new NotFoundException(
        'No hay productos de suscripción disponibles',
      );
    }

    return suscripciones[0];
  }

  private async obtenerTutorBasico(tutorId: string) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    return tutor;
  }

  private async crearPreferenciaMercadoPago(
    tipo: 'membresia' | 'curso',
    entidadId: string,
    buildData: () => any,
  ): Promise<PreferenciaPagoResponse> {
    if (this.mercadoPagoService.isMockMode()) {
      return this.buildMockPreference(tipo, entidadId);
    }

    const preference =
      await this.mercadoPagoService.createPreference(buildData());

    if (!preference.id || !preference.init_point) {
      throw new Error('MercadoPago preference created without required fields');
    }

    return {
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point ?? undefined,
    };
  }

  private buildMockPreference(
    tipo: 'membresia' | 'curso',
    entidadId: string,
  ): PreferenciaPagoResponse {
    const frontendUrl = this.getFrontendUrl();
    const preferenceId = `mock-${tipo}-${entidadId}-${randomUUID()}`;
    const path = tipo === 'membresia' ? 'membresia' : 'curso';
    const initPoint = `${frontendUrl}/pagos/mock/${path}?id=${entidadId}&pref=${preferenceId}`;

    return {
      id: preferenceId,
      init_point: initPoint,
      sandbox_init_point: initPoint,
    };
  }

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000'
    );
  }

  private getBackendUrl(): string {
    return (
      this.configService.get<string>('BACKEND_URL') ||
      process.env.BACKEND_URL ||
      'http://localhost:3001'
    );
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private mapearProducto(producto?: Producto & { precio: any }) {
    if (!producto) {
      return undefined;
    }

    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? undefined,
      precio: Number(producto.precio),
      tipo: producto.tipo,
    };
  }

  private mapearMembresia(membresia: MembresiaWithProducto) {
    return {
      id: membresia.id,
      tutor_id: membresia.tutor_id,
      producto_id: membresia.producto_id,
      estado: membresia.estado,
      fecha_inicio: membresia.fecha_inicio
        ? membresia.fecha_inicio.toISOString()
        : null,
      fecha_proximo_pago: membresia.fecha_proximo_pago
        ? membresia.fecha_proximo_pago.toISOString()
        : null,
      preferencia_id: membresia.preferencia_id,
      createdAt: membresia.createdAt.toISOString(),
      updatedAt: membresia.updatedAt.toISOString(),
      producto: this.mapearProducto(membresia.producto),
    };
  }

  private mapearInscripcion(inscripcion: InscripcionCursoWithProducto) {
    return {
      id: inscripcion.id,
      estudiante_id: inscripcion.estudiante_id,
      producto_id: inscripcion.producto_id,
      estado: inscripcion.estado,
      fecha_inscripcion: inscripcion.fecha_inscripcion
        ? inscripcion.fecha_inscripcion.toISOString()
        : null,
      preferencia_id: inscripcion.preferencia_id,
      createdAt: inscripcion.createdAt.toISOString(),
      updatedAt: inscripcion.updatedAt.toISOString(),
      producto: this.mapearProducto(inscripcion.producto),
    };
  }
}
