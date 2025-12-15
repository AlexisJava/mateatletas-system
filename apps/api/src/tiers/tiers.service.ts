import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TierNombre, MundoTipo, Tier } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Resultado del cálculo de precio familiar
 */
interface PrecioFamiliarResult {
  subtotal: number;
  descuento_porcentaje: number;
  descuento_monto: number;
  total: number;
}

/**
 * Configuración de mundos por tier
 */
interface MundosTierConfig {
  mundos_async: number;
  mundos_sync: number;
}

/**
 * Resultado de solicitar cambio de tier
 */
interface CambioTierResult {
  id: string;
  tipo_cambio: 'upgrade' | 'downgrade';
  aplicacion_inmediata: boolean;
  fecha_efectiva: Date;
  tier_actual: TierNombre;
  tier_pendiente: TierNombre;
  cambio_aplicado: boolean;
  estado: 'pendiente' | 'aplicado' | 'cancelado';
  accesos_removidos?: string[];
  mundos_async_permitidos?: number;
}

/**
 * Resultado de cancelar cambio pendiente
 */
interface CancelacionResult {
  id: string;
  estado: 'cancelado';
  cancelado_en: Date;
}

/**
 * Constantes de configuración de tiers
 * Estas constantes permiten cálculos síncronos sin necesidad de consultar DB
 */
const TIER_CONFIG: Record<
  TierNombre,
  MundosTierConfig & {
    tiene_docente: boolean;
    precio_mensual: number;
    orden: number;
  }
> = {
  [TierNombre.ARCADE]: {
    mundos_async: 1,
    mundos_sync: 0,
    tiene_docente: false,
    precio_mensual: 30000,
    orden: 1,
  },
  [TierNombre.ARCADE_PLUS]: {
    mundos_async: 3,
    mundos_sync: 0,
    tiene_docente: false,
    precio_mensual: 60000,
    orden: 2,
  },
  [TierNombre.PRO]: {
    mundos_async: 1,
    mundos_sync: 1,
    tiene_docente: true,
    precio_mensual: 75000,
    orden: 3,
  },
};

/**
 * Descuentos familiares según cantidad de hijos
 */
const DESCUENTOS_FAMILIARES: Record<number, number> = {
  1: 0,
  2: 12,
};
const DESCUENTO_3_O_MAS = 20;

/**
 * Servicio para gestión de Tiers - Sistema Mateatletas 2026
 *
 * Modelo de negocio:
 * - ARCADE: $30k - 1 mundo async, 0 sync, sin docente
 * - ARCADE_PLUS: $60k - 3 mundos async, 0 sync, sin docente
 * - PRO: $75k - 1 mundo async, 1 sync, con docente
 */
@Injectable()
export class TiersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los tiers activos ordenados por precio
   */
  async findAll(): Promise<Tier[]> {
    return this.prisma.tier.findMany({
      where: { activo: true },
      orderBy: { precio_mensual: 'asc' },
    });
  }

  /**
   * Busca un tier por su nombre
   * @throws NotFoundException si el tier no existe
   */
  async findByNombre(nombre: TierNombre): Promise<Tier> {
    const tier = await this.prisma.tier.findUnique({
      where: { nombre },
    });

    if (!tier) {
      throw new NotFoundException(`Tier ${nombre} no encontrado`);
    }

    return tier;
  }

  /**
   * Busca un tier por su ID
   * @throws NotFoundException si el tier no existe
   */
  async findOne(id: string): Promise<Tier> {
    const tier = await this.prisma.tier.findUnique({
      where: { id },
    });

    if (!tier) {
      throw new NotFoundException(`Tier con id ${id} no encontrado`);
    }

    return tier;
  }

  /**
   * Calcula el precio familiar con descuentos aplicables
   *
   * Descuentos:
   * - 1 hijo: 0%
   * - 2 hijos: 12%
   * - 3+ hijos: 20%
   */
  calcularPrecioFamiliar(
    tiers: Pick<Tier, 'precio_mensual'>[],
  ): PrecioFamiliarResult {
    if (tiers.length === 0) {
      return {
        subtotal: 0,
        descuento_porcentaje: 0,
        descuento_monto: 0,
        total: 0,
      };
    }

    const subtotal = tiers.reduce((acc, tier) => acc + tier.precio_mensual, 0);
    const cantidadHijos = tiers.length;

    let descuento_porcentaje: number;
    if (cantidadHijos >= 3) {
      descuento_porcentaje = DESCUENTO_3_O_MAS;
    } else {
      descuento_porcentaje = DESCUENTOS_FAMILIARES[cantidadHijos] ?? 0;
    }

    const descuento_monto = Math.round(subtotal * (descuento_porcentaje / 100));
    const total = subtotal - descuento_monto;

    return {
      subtotal,
      descuento_porcentaje,
      descuento_monto,
      total,
    };
  }

  /**
   * Valida la selección de mundos según las reglas del tier
   *
   * Reglas:
   * - ARCADE: máximo 1 mundo async, 0 sync
   * - ARCADE_PLUS: máximo 3 mundos async, 0 sync
   * - PRO: exactamente 1 async + 1 sync, deben ser diferentes
   *
   * @throws BadRequestException si la selección no cumple las reglas
   */
  validarSeleccionMundos(
    tierNombre: TierNombre,
    mundosAsync: MundoTipo[],
    mundosSync: MundoTipo[],
  ): void {
    const config = TIER_CONFIG[tierNombre];

    switch (tierNombre) {
      case TierNombre.ARCADE:
        if (mundosAsync.length > config.mundos_async) {
          throw new BadRequestException(
            `ARCADE permite maximo ${config.mundos_async} mundo async`,
          );
        }
        if (mundosSync.length > 0) {
          throw new BadRequestException('ARCADE no incluye mundos sync');
        }
        break;

      case TierNombre.ARCADE_PLUS:
        if (mundosAsync.length > config.mundos_async) {
          throw new BadRequestException(
            `ARCADE_PLUS permite maximo ${config.mundos_async} mundos async`,
          );
        }
        if (mundosSync.length > 0) {
          throw new BadRequestException('ARCADE_PLUS no incluye mundos sync');
        }
        break;

      case TierNombre.PRO:
        if (mundosAsync.length !== config.mundos_async) {
          throw new BadRequestException(
            `PRO permite exactamente ${config.mundos_async} mundo async`,
          );
        }
        if (mundosSync.length !== config.mundos_sync) {
          throw new BadRequestException(
            `PRO requiere exactamente ${config.mundos_sync} mundo sync`,
          );
        }
        // PRO requiere que async != sync
        if (mundosAsync.length > 0 && mundosSync.length > 0) {
          const asyncSet = new Set(mundosAsync);
          const haySuperposicion = mundosSync.some((mundo) =>
            asyncSet.has(mundo),
          );
          if (haySuperposicion) {
            throw new BadRequestException(
              'PRO requiere que el mundo sync sea diferente del async',
            );
          }
        }
        break;
    }
  }

  /**
   * Obtiene la configuración de mundos para un tier
   * Esta función es síncrona ya que usa constantes
   */
  getCantidadMundosPorTier(tierNombre: TierNombre): MundosTierConfig {
    const config = TIER_CONFIG[tierNombre];
    return {
      mundos_async: config.mundos_async,
      mundos_sync: config.mundos_sync,
    };
  }

  /**
   * Indica si un tier incluye acceso a docente
   */
  tieneDocente(tierNombre: TierNombre): boolean {
    return TIER_CONFIG[tierNombre].tiene_docente;
  }

  /**
   * Solicita un cambio de tier (upgrade o downgrade)
   *
   * Reglas:
   * - Upgrade: se programa para el 1ro del próximo mes
   * - Downgrade: se aplica inmediatamente
   * - No se puede cambiar al mismo tier
   */
  solicitarCambioTier(
    _estudianteInscripcionId: string,
    tierActual: TierNombre,
    tierNuevo: TierNombre,
  ): CambioTierResult {
    // Validar que no sea el mismo tier
    if (tierActual === tierNuevo) {
      throw new BadRequestException('No se puede cambiar al mismo tier');
    }

    const configActual = TIER_CONFIG[tierActual];
    const configNuevo = TIER_CONFIG[tierNuevo];

    // Determinar si es upgrade o downgrade basado en el orden/precio
    const esUpgrade = configNuevo.orden > configActual.orden;
    const tipoCambio: 'upgrade' | 'downgrade' = esUpgrade
      ? 'upgrade'
      : 'downgrade';

    const ahora = new Date();
    let fechaEfectiva: Date;
    let aplicacionInmediata: boolean;
    let cambioAplicado: boolean;

    if (esUpgrade) {
      // Upgrade: programar para el 1ro del próximo mes
      fechaEfectiva = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
      aplicacionInmediata = false;
      cambioAplicado = false;
    } else {
      // Downgrade: aplicar inmediatamente
      fechaEfectiva = ahora;
      aplicacionInmediata = true;
      cambioAplicado = true;
    }

    // Preparar resultado base
    const result: CambioTierResult = {
      id: this.generateCambioTierId(),
      tipo_cambio: tipoCambio,
      aplicacion_inmediata: aplicacionInmediata,
      fecha_efectiva: fechaEfectiva,
      tier_actual: tierActual,
      tier_pendiente: tierNuevo,
      cambio_aplicado: cambioAplicado,
      estado: cambioAplicado ? 'aplicado' : 'pendiente',
    };

    // Para downgrade, calcular accesos removidos y mundos permitidos
    if (!esUpgrade) {
      const accesosRemovidos: string[] = [];

      // Si el tier actual tiene docente y el nuevo no, se remueve
      if (configActual.tiene_docente && !configNuevo.tiene_docente) {
        accesosRemovidos.push('docente');
      }

      // Si el tier actual tiene mundos sync y el nuevo no, se remueven
      if (configActual.mundos_sync > 0 && configNuevo.mundos_sync === 0) {
        accesosRemovidos.push('mundo_sync');
      }

      result.accesos_removidos = accesosRemovidos;
      result.mundos_async_permitidos = configNuevo.mundos_async;
    }

    return result;
  }

  /**
   * Cancela un cambio de tier pendiente
   *
   * Solo se pueden cancelar upgrades pendientes (downgrades son inmediatos)
   */
  cancelarCambioPendiente(cambioTierId: string): CancelacionResult {
    return {
      id: cambioTierId,
      estado: 'cancelado',
      cancelado_en: new Date(),
    };
  }

  /**
   * Genera un ID único para el cambio de tier
   * En producción, esto sería manejado por Prisma al crear el registro
   */
  private generateCambioTierId(): string {
    return `cambio-tier-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
