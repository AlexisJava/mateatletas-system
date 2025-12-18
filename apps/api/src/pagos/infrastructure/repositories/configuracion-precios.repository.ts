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
 * Sistema de Tiers STEAM 2026:
 * - STEAM_LIBROS: $40.000/mes - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65.000/mes - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95.000/mes - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 10% para 2do hermano en adelante
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
      // Precios por Tier STEAM (Sistema 2026)
      precioSteamLibros: new Decimal(config.precio_steam_libros.toString()),
      precioSteamAsincronico: new Decimal(
        config.precio_steam_asincronico.toString(),
      ),
      precioSteamSincronico: new Decimal(
        config.precio_steam_sincronico.toString(),
      ),
      // Descuento familiar simplificado
      descuentoSegundoHermano: new Decimal(
        config.descuento_segundo_hermano.toString(),
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

    // Precios por Tier STEAM
    if (config.precioSteamLibros !== undefined) {
      resultado.precio_steam_libros = config.precioSteamLibros;
    }
    if (config.precioSteamAsincronico !== undefined) {
      resultado.precio_steam_asincronico = config.precioSteamAsincronico;
    }
    if (config.precioSteamSincronico !== undefined) {
      resultado.precio_steam_sincronico = config.precioSteamSincronico;
    }

    // Descuento familiar simplificado
    if (config.descuentoSegundoHermano !== undefined) {
      resultado.descuento_segundo_hermano = config.descuentoSegundoHermano;
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
      // Precios por Tier STEAM
      precio_steam_libros: config.precio_steam_libros.toString(),
      precio_steam_asincronico: config.precio_steam_asincronico.toString(),
      precio_steam_sincronico: config.precio_steam_sincronico.toString(),
      // Descuento familiar
      descuento_segundo_hermano: config.descuento_segundo_hermano.toString(),
      // Configuración de notificaciones
      dia_vencimiento: config.dia_vencimiento,
      dias_antes_recordatorio: config.dias_antes_recordatorio,
      notificaciones_activas: config.notificaciones_activas,
    };
  }
}
