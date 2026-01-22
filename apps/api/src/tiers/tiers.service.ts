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
  descuentoPorcentaje: number;
  descuentoMonto: number;
  total: number;
}

/**
 * Configuración de mundos por tier
 */
interface MundosTierConfig {
  mundosAsync: number;
  mundosSync: number;
}

/**
 * Resultado de solicitar cambio de tier
 */
interface CambioTierResult {
  id: string;
  tipoCambio: 'upgrade' | 'downgrade';
  aplicacionInmediata: boolean;
  fechaEfectiva: Date;
  tierActual: TierNombre;
  tierPendiente: TierNombre;
  cambioAplicado: boolean;
  estado: 'pendiente' | 'aplicado' | 'cancelado';
  accesosRemovidos?: string[];
  mundosAsyncPermitidos?: number;
}

/**
 * Resultado de cancelar cambio pendiente
 */
interface CancelacionResult {
  id: string;
  estado: 'cancelado';
  canceladoEn: Date;
}

/**
 * Constantes de configuración de tiers STEAM
 * Estas constantes permiten cálculos síncronos sin necesidad de consultar DB
 *
 * Modelo STEAM 2026:
 * - STEAM_LIBROS: $40k - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65k - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95k - Todo + clases en vivo con docente
 */
const TIER_CONFIG: Record<
  TierNombre,
  MundosTierConfig & {
    tieneDocente: boolean;
    precioMensual: number;
    orden: number;
  }
> = {
  [TierNombre.STEAM_LIBROS]: {
    mundosAsync: 3, // Acceso a todos los mundos (Mate, Progra, Ciencias)
    mundosSync: 0,
    tieneDocente: false,
    precioMensual: 40000,
    orden: 1,
  },
  [TierNombre.STEAM_ASINCRONICO]: {
    mundosAsync: 3,
    mundosSync: 0,
    tieneDocente: false,
    precioMensual: 65000,
    orden: 2,
  },
  [TierNombre.STEAM_SINCRONICO]: {
    mundosAsync: 3,
    mundosSync: 1,
    tieneDocente: true,
    precioMensual: 95000,
    orden: 3,
  },
};

/**
 * Descuento familiar simplificado - 10% para 2do hermano en adelante
 */
const DESCUENTO_SEGUNDO_HERMANO = 10;

/**
 * Servicio para gestión de Tiers - Sistema Mateatletas 2026
 *
 * Modelo STEAM:
 * - STEAM_LIBROS: $40k - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65k - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95k - Todo + clases en vivo con docente
 *
 * Descuento familiar: 10% para 2do hermano en adelante
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
      orderBy: { precioMensual: 'asc' },
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
   * Descuento simplificado STEAM 2026:
   * - 1 hijo: 0% (precio completo)
   * - 2+ hijos: 10% de descuento para el 2do hermano en adelante
   *
   * El descuento se aplica solo al monto de los hermanos adicionales,
   * no al primer estudiante.
   */
  calcularPrecioFamiliar(
    tiers: Pick<Tier, 'precioMensual'>[],
  ): PrecioFamiliarResult {
    if (tiers.length === 0) {
      return {
        subtotal: 0,
        descuentoPorcentaje: 0,
        descuentoMonto: 0,
        total: 0,
      };
    }

    const subtotal = tiers.reduce((acc, tier) => acc + tier.precioMensual, 0);
    const cantidadHijos = tiers.length;

    // Descuento solo aplica a partir del 2do hermano
    // El 10% se aplica al monto de los hermanos adicionales (no al primero)
    let descuentoMonto = 0;
    if (cantidadHijos >= 2) {
      // Calcular el monto de los hermanos adicionales (todos menos el primero)
      const montoHermanosAdicionales = tiers
        .slice(1)
        .reduce((acc, tier) => acc + tier.precioMensual, 0);
      descuentoMonto = Math.round(
        montoHermanosAdicionales * (DESCUENTO_SEGUNDO_HERMANO / 100),
      );
    }

    const total = subtotal - descuentoMonto;

    // Calcular porcentaje efectivo sobre el subtotal
    const descuentoPorcentaje =
      subtotal > 0 ? Math.round((descuentoMonto / subtotal) * 100) : 0;

    return {
      subtotal,
      descuentoPorcentaje,
      descuentoMonto,
      total,
    };
  }

  /**
   * Valida la selección de mundos según las reglas del tier STEAM
   *
   * Reglas STEAM 2026:
   * - STEAM_LIBROS: máximo 3 mundos async, 0 sync
   * - STEAM_ASINCRONICO: máximo 3 mundos async, 0 sync
   * - STEAM_SINCRONICO: máximo 3 mundos async + 1 mundo sync
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
      case TierNombre.STEAM_LIBROS:
        if (mundosAsync.length > config.mundosAsync) {
          throw new BadRequestException(
            `STEAM_LIBROS permite máximo ${config.mundosAsync} mundos async`,
          );
        }
        if (mundosSync.length > 0) {
          throw new BadRequestException(
            'STEAM_LIBROS no incluye clases en vivo',
          );
        }
        break;

      case TierNombre.STEAM_ASINCRONICO:
        if (mundosAsync.length > config.mundosAsync) {
          throw new BadRequestException(
            `STEAM_ASINCRONICO permite máximo ${config.mundosAsync} mundos async`,
          );
        }
        if (mundosSync.length > 0) {
          throw new BadRequestException(
            'STEAM_ASINCRONICO no incluye clases en vivo',
          );
        }
        break;

      case TierNombre.STEAM_SINCRONICO:
        if (mundosAsync.length > config.mundosAsync) {
          throw new BadRequestException(
            `STEAM_SINCRONICO permite máximo ${config.mundosAsync} mundos async`,
          );
        }
        if (mundosSync.length > config.mundosSync) {
          throw new BadRequestException(
            `STEAM_SINCRONICO permite máximo ${config.mundosSync} mundo sync`,
          );
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
      mundosAsync: config.mundosAsync,
      mundosSync: config.mundosSync,
    };
  }

  /**
   * Indica si un tier incluye acceso a docente
   */
  tieneDocente(tierNombre: TierNombre): boolean {
    return TIER_CONFIG[tierNombre].tieneDocente;
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
      tipoCambio: tipoCambio,
      aplicacionInmediata: aplicacionInmediata,
      fechaEfectiva: fechaEfectiva,
      tierActual: tierActual,
      tierPendiente: tierNuevo,
      cambioAplicado: cambioAplicado,
      estado: cambioAplicado ? 'aplicado' : 'pendiente',
    };

    // Para downgrade, calcular accesos removidos y mundos permitidos
    if (!esUpgrade) {
      const accesosRemovidos: string[] = [];

      // Si el tier actual tiene docente y el nuevo no, se remueve
      if (configActual.tieneDocente && !configNuevo.tieneDocente) {
        accesosRemovidos.push('docente');
      }

      // Si el tier actual tiene mundos sync y el nuevo no, se remueven
      if (configActual.mundosSync > 0 && configNuevo.mundosSync === 0) {
        accesosRemovidos.push('mundo_sync');
      }

      result.accesosRemovidos = accesosRemovidos;
      result.mundosAsyncPermitidos = configNuevo.mundosAsync;
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
      canceladoEn: new Date(),
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
