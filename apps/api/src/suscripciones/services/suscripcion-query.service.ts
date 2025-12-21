import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EstadoSuscripcion, Suscripcion } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  PlanesResponseDto,
  MisSuscripcionesResponseDto,
  SuscripcionDetalleDto,
  HistorialPagosResponseDto,
  AlertaSuscripcionDto,
  SuscripcionListItemDto,
  PlanResponseDto,
} from '../presentation/dtos';

/**
 * Features por plan para mostrar en UI
 */
const FEATURES_POR_PLAN: Record<string, string[]> = {
  STEAM_LIBROS: [
    'Acceso a biblioteca digital',
    'Material descargable',
    'Ejercicios interactivos',
  ],
  STEAM_ASINCRONICO: [
    'Todo de STEAM_LIBROS',
    'Clases grabadas',
    'Foros de consulta',
    'Seguimiento de progreso',
  ],
  STEAM_SINCRONICO: [
    'Todo de STEAM_ASINCRONICO',
    'Clases en vivo',
    'Docente asignado',
    'Soporte prioritario',
  ],
};

/** Días máximos de gracia antes de cancelación */
const DIAS_GRACIA_MAXIMO = 3;

/** Días de anticipación para alertar próximo cobro */
const DIAS_ALERTA_PROXIMO_COBRO = 3;

/**
 * Tipo parcial de suscripción para calcular alerta
 */
type SuscripcionParaAlerta = Pick<
  Suscripcion,
  | 'estado'
  | 'dias_gracia_usados'
  | 'fecha_inicio_gracia'
  | 'fecha_proximo_cobro'
>;

/**
 * Service de consultas de suscripciones
 *
 * Responsabilidades:
 * - Listar planes disponibles
 * - Obtener suscripciones del tutor
 * - Obtener detalle de suscripción
 * - Obtener historial de pagos
 * - Calcular alertas (gracia, próximo cobro)
 */
@Injectable()
export class SuscripcionQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos los planes de suscripción activos
   */
  async getPlanes(): Promise<PlanesResponseDto> {
    const planes = await this.prisma.planSuscripcion.findMany({
      where: { activo: true },
      orderBy: { precio_base: 'asc' },
    });

    return {
      planes: planes.map((plan) => this.mapPlanToDto(plan)),
    };
  }

  /**
   * Obtiene todas las suscripciones de un tutor
   */
  async getMisSuscripciones(
    tutorId: string,
  ): Promise<MisSuscripcionesResponseDto> {
    const suscripciones = await this.prisma.suscripcion.findMany({
      where: { tutor_id: tutorId },
      include: {
        plan: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      suscripciones: suscripciones.map((sus) =>
        this.mapSuscripcionToListItem(sus),
      ),
    };
  }

  /**
   * Obtiene el detalle de una suscripción con pagos e historial
   */
  async getSuscripcionDetalle(
    suscripcionId: string,
    tutorId: string,
  ): Promise<SuscripcionDetalleDto> {
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: {
        plan: true,
        pagos: {
          orderBy: { created_at: 'desc' },
        },
        historial: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!suscripcion) {
      throw new NotFoundException(`Suscripción ${suscripcionId} no encontrada`);
    }

    if (suscripcion.tutor_id !== tutorId) {
      throw new ForbiddenException('No autorizado para ver esta suscripción');
    }

    const listItem = this.mapSuscripcionToListItem(suscripcion);

    return {
      ...listItem,
      pagos: suscripcion.pagos.map((pago) => ({
        id: pago.id,
        fecha: pago.fecha_cobro || pago.created_at,
        monto: pago.monto.toNumber(),
        estado: pago.mp_status,
        metodo_pago: 'MercadoPago',
      })),
      historial_estados: suscripcion.historial.map((h) => ({
        fecha: h.created_at,
        estado_anterior: h.estado_anterior,
        estado_nuevo: h.estado_nuevo,
        motivo: h.motivo,
      })),
    };
  }

  /**
   * Obtiene el historial de pagos de una suscripción
   */
  async getHistorialPagos(
    suscripcionId: string,
    tutorId: string,
  ): Promise<HistorialPagosResponseDto> {
    // Validar ownership
    const suscripcion = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      select: { tutor_id: true },
    });

    if (!suscripcion) {
      throw new NotFoundException(`Suscripción ${suscripcionId} no encontrada`);
    }

    if (suscripcion.tutor_id !== tutorId) {
      throw new ForbiddenException('No autorizado para ver esta suscripción');
    }

    const pagos = await this.prisma.pagoSuscripcion.findMany({
      where: { suscripcion_id: suscripcionId },
      orderBy: { created_at: 'desc' },
    });

    return {
      pagos: pagos.map((pago) => ({
        id: pago.id,
        fecha: pago.fecha_cobro || pago.created_at,
        monto: pago.monto.toNumber(),
        estado: pago.mp_status,
        metodo_pago: 'MercadoPago',
      })),
      total: pagos.length,
    };
  }

  /**
   * Calcula la alerta para una suscripción
   *
   * Tipos de alerta:
   * - EN_GRACIA: Cuando está en período de gracia
   * - PROXIMO_COBRO: Cuando el cobro es en menos de 3 días
   * - MOROSA: Cuando ya pasó el período de gracia
   */
  calcularAlerta(
    suscripcion: SuscripcionParaAlerta,
  ): AlertaSuscripcionDto | null {
    // Alerta por período de gracia
    if (suscripcion.estado === EstadoSuscripcion.EN_GRACIA) {
      const diasRestantes = DIAS_GRACIA_MAXIMO - suscripcion.dias_gracia_usados;
      return {
        tipo: 'EN_GRACIA',
        mensaje: `Tu suscripción está en período de gracia. Tienes ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para regularizar el pago.`,
        dias_restantes: diasRestantes,
      };
    }

    // Alerta por morosa
    if (suscripcion.estado === EstadoSuscripcion.MOROSA) {
      return {
        tipo: 'MOROSA',
        mensaje: 'Tu suscripción está suspendida por falta de pago.',
        dias_restantes: 0,
      };
    }

    // Alerta por próximo cobro
    if (
      suscripcion.estado === EstadoSuscripcion.ACTIVA &&
      suscripcion.fecha_proximo_cobro
    ) {
      const hoy = new Date();
      const proximoCobro = new Date(suscripcion.fecha_proximo_cobro);
      const diasHastaProximoCobro = Math.ceil(
        (proximoCobro.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (
        diasHastaProximoCobro <= DIAS_ALERTA_PROXIMO_COBRO &&
        diasHastaProximoCobro > 0
      ) {
        return {
          tipo: 'PROXIMO_COBRO',
          mensaje: `Tu próximo cobro será en ${diasHastaProximoCobro} día${diasHastaProximoCobro !== 1 ? 's' : ''}.`,
          dias_restantes: diasHastaProximoCobro,
        };
      }
    }

    return null;
  }

  /**
   * Mapea un plan de Prisma a DTO
   */
  private mapPlanToDto(plan: {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio_base: { toNumber(): number };
  }): PlanResponseDto {
    return {
      id: plan.id,
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: plan.precio_base.toNumber(),
      features: FEATURES_POR_PLAN[plan.nombre] || [],
    };
  }

  /**
   * Mapea una suscripción de Prisma a DTO de lista
   */
  private mapSuscripcionToListItem(
    sus: Suscripcion & {
      plan: {
        id: string;
        nombre: string;
        descripcion: string | null;
        precio_base: { toNumber(): number };
      };
    },
  ): SuscripcionListItemDto {
    const diasRestantes = this.calcularDiasRestantes(sus);
    const alerta = this.calcularAlerta(sus);

    return {
      id: sus.id,
      estado: sus.estado,
      plan: this.mapPlanToDto(sus.plan),
      monto_final: sus.precio_final.toNumber(),
      descuento_aplicado: sus.descuento_porcentaje,
      fecha_inicio: sus.fecha_inicio,
      proximo_cobro: sus.fecha_proximo_cobro,
      dias_restantes: diasRestantes,
      estudiantes: [], // TODO: Implementar cuando se vincule con estudiantes
      alerta: alerta ?? undefined,
    };
  }

  /**
   * Calcula los días restantes del período actual
   */
  private calcularDiasRestantes(suscripcion: Suscripcion): number | null {
    if (!suscripcion.fecha_proximo_cobro) return null;

    const hoy = new Date();
    const proximoCobro = new Date(suscripcion.fecha_proximo_cobro);
    return Math.ceil(
      (proximoCobro.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
