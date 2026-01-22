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
          actualizadoPorAdminId: adminId,
        },
      });

      // 2. Guardar historial
      await tx.historialCambioPrecios.create({
        data: {
          configuracionId: 'singleton',
          valoresAnteriores: this.extraerValoresParaHistorial(configActual),
          valoresNuevos: this.extraerValoresParaHistorial(configActualizada),
          adminId: adminId,
          motivoCambio: motivo || null,
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
      where: { configuracionId: 'singleton' },
      orderBy: { fechaCambio: 'desc' },
      take: limit,
    });

    return historial.map((registro) => ({
      id: registro.id,
      valoresAnteriores: registro.valoresAnteriores as Record<string, unknown>,
      valoresNuevos: registro.valoresNuevos as Record<string, unknown>,
      motivoCambio: registro.motivoCambio,
      adminId: registro.adminId,
      fechaCambio: registro.fechaCambio,
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
      precioSteamLibros: new Decimal(config.precioSteamLibros.toString()),
      precioSteamAsincronico: new Decimal(
        config.precioSteamAsincronico.toString(),
      ),
      precioSteamSincronico: new Decimal(
        config.precioSteamSincronico.toString(),
      ),
      // Descuento familiar simplificado
      descuentoSegundoHermano: new Decimal(
        config.descuentoSegundoHermano.toString(),
      ),
      // Configuración de notificaciones
      diaVencimiento: config.diaVencimiento,
      diasAntesRecordatorio: config.diasAntesRecordatorio,
      notificacionesActivas: config.notificacionesActivas,
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
      resultado.precioSteamLibros = config.precioSteamLibros;
    }
    if (config.precioSteamAsincronico !== undefined) {
      resultado.precioSteamAsincronico = config.precioSteamAsincronico;
    }
    if (config.precioSteamSincronico !== undefined) {
      resultado.precioSteamSincronico = config.precioSteamSincronico;
    }

    // Descuento familiar simplificado
    if (config.descuentoSegundoHermano !== undefined) {
      resultado.descuentoSegundoHermano = config.descuentoSegundoHermano;
    }

    // Configuración de notificaciones
    if (config.diaVencimiento !== undefined) {
      resultado.diaVencimiento = config.diaVencimiento;
    }
    if (config.diasAntesRecordatorio !== undefined) {
      resultado.diasAntesRecordatorio = config.diasAntesRecordatorio;
    }
    if (config.notificacionesActivas !== undefined) {
      resultado.notificacionesActivas = config.notificacionesActivas;
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
      precioSteamLibros: config.precioSteamLibros.toString(),
      precioSteamAsincronico: config.precioSteamAsincronico.toString(),
      precioSteamSincronico: config.precioSteamSincronico.toString(),
      // Descuento familiar
      descuentoSegundoHermano: config.descuentoSegundoHermano.toString(),
      // Configuración de notificaciones
      diaVencimiento: config.diaVencimiento,
      diasAntesRecordatorio: config.diasAntesRecordatorio,
      notificacionesActivas: config.notificacionesActivas,
    };
  }
}
