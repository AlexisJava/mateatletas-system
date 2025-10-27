import { Injectable } from '@nestjs/common';
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
  private mapearPrismaADomain(config: any): ConfiguracionPrecios {
    return {
      precioClubMatematicas: new Decimal(
        config.precio_club_matematicas.toString(),
      ),
      precioCursosEspecializados: new Decimal(
        config.precio_cursos_especializados.toString(),
      ),
      precioMultipleActividades: new Decimal(
        config.precio_multiple_actividades.toString(),
      ),
      precioHermanosBasico: new Decimal(
        config.precio_hermanos_basico.toString(),
      ),
      precioHermanosMultiple: new Decimal(
        config.precio_hermanos_multiple.toString(),
      ),
      descuentoAacreaPorcentaje: new Decimal(
        config.descuento_aacrea_porcentaje.toString(),
      ),
      descuentoAacreaActivo: config.descuento_aacrea_activo,
    };
  }

  /**
   * Convierte de tipos del Domain a tipos de Prisma
   * Prepara objeto para update/create de Prisma
   */
  private mapearDomainAPrisma(
    config: Partial<ConfiguracionPrecios>,
  ): Record<string, any> {
    const resultado: Record<string, any> = {};

    if (config.precioClubMatematicas !== undefined) {
      resultado.precio_club_matematicas = config.precioClubMatematicas;
    }
    if (config.precioCursosEspecializados !== undefined) {
      resultado.precio_cursos_especializados =
        config.precioCursosEspecializados;
    }
    if (config.precioMultipleActividades !== undefined) {
      resultado.precio_multiple_actividades = config.precioMultipleActividades;
    }
    if (config.precioHermanosBasico !== undefined) {
      resultado.precio_hermanos_basico = config.precioHermanosBasico;
    }
    if (config.precioHermanosMultiple !== undefined) {
      resultado.precio_hermanos_multiple = config.precioHermanosMultiple;
    }
    if (config.descuentoAacreaPorcentaje !== undefined) {
      resultado.descuento_aacrea_porcentaje = config.descuentoAacreaPorcentaje;
    }
    if (config.descuentoAacreaActivo !== undefined) {
      resultado.descuento_aacrea_activo = config.descuentoAacreaActivo;
    }

    return resultado;
  }

  /**
   * Extrae valores para guardar en el historial
   * Convierte Decimals a strings para almacenamiento en JSON
   */
  private extraerValoresParaHistorial(
    config: any,
  ): Record<string, string | boolean> {
    return {
      precio_club_matematicas: config.precio_club_matematicas.toString(),
      precio_cursos_especializados:
        config.precio_cursos_especializados.toString(),
      precio_multiple_actividades:
        config.precio_multiple_actividades.toString(),
      precio_hermanos_basico: config.precio_hermanos_basico.toString(),
      precio_hermanos_multiple: config.precio_hermanos_multiple.toString(),
      descuento_aacrea_porcentaje:
        config.descuento_aacrea_porcentaje.toString(),
      descuento_aacrea_activo: config.descuento_aacrea_activo,
    };
  }
}
