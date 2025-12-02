import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { Decimal } from 'decimal.js';
import {
  IConfiguracionPreciosRepository,
  HistorialCambio,
} from '../../domain/repositories/configuracion-precios.repository.interface';
import { ConfiguracionPrecios } from '../../domain/types/pagos.types';

/**
 * Implementación del repositorio de Configuración de Precios
 * Infrastructure Layer - Implementa interface del Domain Layer
 *
 * Sistema de Tiers 2026:
 * - Arcade: $30.000/mes - 1 mundo async
 * - Arcade+: $60.000/mes - 3 mundos async
 * - Pro: $75.000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12%
 * - 3er hermano en adelante: 20%
 *
 * Responsabilidades:
 * - Convertir entre tipos de Prisma y tipos del Domain
 * - Manejar persistencia con PrismaService
 * - Garantizar consistencia de Decimals
 * - Gestionar auditoría automáticamente
 *
 * IMPORTANTE:
 * - Prisma devuelve Decimal de prisma, debemos convertir a Decimal de decimal.js
 * - Siempre usar transacciones para operaciones que modifican múltiples tablas
 */
@Injectable()
export class ConfiguracionPreciosRepository
  implements IConfiguracionPreciosRepository
{
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración singleton de precios
   */
  async obtenerConfiguracion(): Promise<ConfiguracionPrecios | null> {
    const config = await this.prisma.configuracionPrecios.findUnique({
      where: { id: 'singleton' },
    });

    if (!config) {
      return null;
    }

    return this.mapearPrismaADomain(config);
  }

  /**
   * Actualiza la configuración de precios
   * Automáticamente guarda el historial de cambios en una transacción
   */
  async actualizarConfiguracion(
    nuevaConfiguracion: Partial<ConfiguracionPrecios>,
    adminId: string,
    motivo?: string,
  ): Promise<ConfiguracionPrecios> {
    // Obtener configuración actual para el historial
    const configActual = await this.prisma.configuracionPrecios.findUnique({
      where: { id: 'singleton' },
    });

    if (!configActual) {
      throw new Error(
        'No se encontró la configuración de precios para actualizar',
      );
    }

    // Preparar datos para actualización
    const datosActualizacion = this.mapearDomainAPrisma(nuevaConfiguracion);

    // Ejecutar actualización y creación de historial en transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar configuración
      const configActualizada = await tx.configuracionPrecios.update({
        where: { id: 'singleton' },
        data: {
          ...datosActualizacion,
          actualizado_por_admin_id: adminId,
        },
      });

      // 2. Guardar historial
      await tx.historialCambioPrecios.create({
        data: {
          configuracion_id: 'singleton',
          valores_anteriores: this.extraerValoresParaHistorial(configActual),
          valores_nuevos: this.extraerValoresParaHistorial(configActualizada),
          admin_id: adminId,
          motivo_cambio: motivo || null,
        },
      });

      return configActualizada;
    });

    return this.mapearPrismaADomain(resultado);
  }

  /**
   * Obtiene el historial de cambios de precios
   */
  async obtenerHistorialCambios(
    limit: number = 50,
  ): Promise<HistorialCambio[]> {
    const historial = await this.prisma.historialCambioPrecios.findMany({
      where: { configuracion_id: 'singleton' },
      orderBy: { fecha_cambio: 'desc' },
      take: limit,
    });

    return historial.map((registro) => ({
      id: registro.id,
      valoresAnteriores: registro.valores_anteriores as Record<string, unknown>,
      valoresNuevos: registro.valores_nuevos as Record<string, unknown>,
      motivoCambio: registro.motivo_cambio,
      adminId: registro.admin_id,
      fechaCambio: registro.fecha_cambio,
    }));
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - MAPEO Y CONVERSIÓN
  // ============================================================================

  /**
   * Convierte de tipos de Prisma a tipos del Domain
   * IMPORTANTE: Convierte Prisma.Decimal a Decimal de decimal.js
   */
  private mapearPrismaADomain(
    config: Prisma.ConfiguracionPreciosGetPayload<object>,
  ): ConfiguracionPrecios {
    return {
      // Precios por Tier (Sistema 2026)
      precioArcade: new Decimal(config.precio_arcade.toString()),
      precioArcadePlus: new Decimal(config.precio_arcade_plus.toString()),
      precioPro: new Decimal(config.precio_pro.toString()),
      // Descuentos familiares
      descuentoHermano2: new Decimal(config.descuento_hermano_2.toString()),
      descuentoHermano3Mas: new Decimal(
        config.descuento_hermano_3_mas.toString(),
      ),
      // Configuración de notificaciones
      diaVencimiento: config.dia_vencimiento,
      diasAntesRecordatorio: config.dias_antes_recordatorio,
      notificacionesActivas: config.notificaciones_activas,
    };
  }

  /**
   * Convierte de tipos del Domain a tipos de Prisma
   * Prepara objeto para update/create de Prisma
   */
  private mapearDomainAPrisma(
    config: Partial<ConfiguracionPrecios>,
  ): Record<string, unknown> {
    const resultado: Record<string, unknown> = {};

    // Precios por Tier
    if (config.precioArcade !== undefined) {
      resultado.precio_arcade = config.precioArcade;
    }
    if (config.precioArcadePlus !== undefined) {
      resultado.precio_arcade_plus = config.precioArcadePlus;
    }
    if (config.precioPro !== undefined) {
      resultado.precio_pro = config.precioPro;
    }

    // Descuentos familiares
    if (config.descuentoHermano2 !== undefined) {
      resultado.descuento_hermano_2 = config.descuentoHermano2;
    }
    if (config.descuentoHermano3Mas !== undefined) {
      resultado.descuento_hermano_3_mas = config.descuentoHermano3Mas;
    }

    // Configuración de notificaciones
    if (config.diaVencimiento !== undefined) {
      resultado.dia_vencimiento = config.diaVencimiento;
    }
    if (config.diasAntesRecordatorio !== undefined) {
      resultado.dias_antes_recordatorio = config.diasAntesRecordatorio;
    }
    if (config.notificacionesActivas !== undefined) {
      resultado.notificaciones_activas = config.notificacionesActivas;
    }

    return resultado;
  }

  /**
   * Extrae valores para guardar en el historial
   * Convierte Decimals a strings para almacenamiento en JSON
   */
  private extraerValoresParaHistorial(
    config: Prisma.ConfiguracionPreciosGetPayload<object>,
  ): Record<string, string | boolean | number> {
    return {
      // Precios por Tier
      precio_arcade: config.precio_arcade.toString(),
      precio_arcade_plus: config.precio_arcade_plus.toString(),
      precio_pro: config.precio_pro.toString(),
      // Descuentos familiares
      descuento_hermano_2: config.descuento_hermano_2.toString(),
      descuento_hermano_3_mas: config.descuento_hermano_3_mas.toString(),
      // Configuración de notificaciones
      dia_vencimiento: config.dia_vencimiento,
      dias_antes_recordatorio: config.dias_antes_recordatorio,
      notificaciones_activas: config.notificaciones_activas,
    };
  }
}
