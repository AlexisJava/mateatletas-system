import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IConfiguracionPreciosRepository } from '../../domain/repositories/configuracion-precios.repository.interface';
import {
  ActualizarConfiguracionPreciosInputDTO,
  ActualizarConfiguracionPreciosOutputDTO,
  CambioRealizadoDTO,
  ConfiguracionPreciosDTO,
} from '../dtos/actualizar-configuracion-precios.dto';
import { ConfiguracionPrecios } from '../../domain/types/pagos.types';

/**
 * Use Case: Actualizar Configuración de Precios
 *
 * Sistema STEAM 2026:
 * - STEAM_LIBROS: $40.000/mes - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65.000/mes - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95.000/mes - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 10% para segundo hermano en adelante
 *
 * Responsabilidades (Application Layer):
 * 1. Validar que existe configuración actual
 * 2. Validar cambios propuestos (rangos válidos, etc.)
 * 3. Detectar qué campos cambiaron
 * 4. Delegar persistencia al repositorio (que maneja auditoría)
 * 5. Retornar resumen de cambios para confirmación al admin
 *
 * Importante:
 * - El repositorio se encarga de guardar el historial automáticamente
 * - Este use case solo orquesta y valida
 */
@Injectable()
export class ActualizarConfiguracionPreciosUseCase {
  constructor(
    private readonly configuracionRepo: IConfiguracionPreciosRepository,
  ) {}

  async execute(
    input: ActualizarConfiguracionPreciosInputDTO,
  ): Promise<ActualizarConfiguracionPreciosOutputDTO> {
    // 1. Validaciones básicas
    this.validarInput(input);

    // 2. Obtener configuración actual
    const configuracionActual =
      await this.configuracionRepo.obtenerConfiguracion();
    if (!configuracionActual) {
      throw new Error('No se encontró la configuración de precios');
    }

    // 3. Validar cambios propuestos
    this.validarCambios(input);

    // 4. Detectar cambios realizados
    const cambiosRealizados = this.detectarCambios(configuracionActual, input);

    if (cambiosRealizados.length === 0) {
      throw new Error('No se proporcionaron cambios para actualizar');
    }

    // 5. Construir objeto de actualización
    const actualizacion = this.construirActualizacion(input);

    // 6. Actualizar en el repositorio (automáticamente guarda historial)
    const configuracionActualizada =
      await this.configuracionRepo.actualizarConfiguracion(
        actualizacion,
        input.adminId,
        input.motivoCambio,
      );

    // 7. Retornar resultado
    return {
      configuracion: this.mapearConfiguracionADTO(configuracionActualizada),
      cambiosRealizados,
      mensaje: `Configuración de precios actualizada exitosamente. ${cambiosRealizados.length} cambio(s) aplicado(s).`,
    };
  }

  /**
   * Valida el input básico
   */
  private validarInput(input: ActualizarConfiguracionPreciosInputDTO): void {
    if (!input.adminId) {
      throw new Error('adminId es requerido');
    }
  }

  /**
   * Valida los valores de los cambios propuestos
   */
  private validarCambios(input: ActualizarConfiguracionPreciosInputDTO): void {
    // Validar precios de Tiers STEAM no negativos
    const precios = [
      input.precioSteamLibros,
      input.precioSteamAsincronico,
      input.precioSteamSincronico,
    ].filter(Boolean);

    for (const precio of precios) {
      if (precio && precio.isNegative()) {
        throw new Error('Los precios no pueden ser negativos');
      }
    }

    // Validar descuento familiar (porcentaje)
    if (input.descuentoSegundoHermano !== undefined) {
      if (
        input.descuentoSegundoHermano.lessThan(0) ||
        input.descuentoSegundoHermano.greaterThan(100)
      ) {
        throw new Error(
          'El descuento para segundo hermano debe estar entre 0 y 100',
        );
      }
    }

    // Validar día de vencimiento
    if (input.diaVencimiento !== undefined) {
      if (input.diaVencimiento < 1 || input.diaVencimiento > 31) {
        throw new Error('El día de vencimiento debe estar entre 1 y 31');
      }
    }

    // Validar días antes de recordatorio
    if (input.diasAntesRecordatorio !== undefined) {
      if (input.diasAntesRecordatorio < 0 || input.diasAntesRecordatorio > 30) {
        throw new Error(
          'Los días antes de recordatorio deben estar entre 0 y 30',
        );
      }
    }
  }

  /**
   * Detecta qué campos cambiaron comparando actual vs propuesto
   */
  private detectarCambios(
    actual: ConfiguracionPrecios,
    propuesto: ActualizarConfiguracionPreciosInputDTO,
  ): CambioRealizadoDTO[] {
    const cambios: CambioRealizadoDTO[] = [];

    // Comparar precios de Tiers STEAM
    if (
      propuesto.precioSteamLibros &&
      !propuesto.precioSteamLibros.equals(actual.precioSteamLibros)
    ) {
      cambios.push({
        campo: 'precioSteamLibros',
        valorAnterior: actual.precioSteamLibros,
        valorNuevo: propuesto.precioSteamLibros,
      });
    }

    if (
      propuesto.precioSteamAsincronico &&
      !propuesto.precioSteamAsincronico.equals(actual.precioSteamAsincronico)
    ) {
      cambios.push({
        campo: 'precioSteamAsincronico',
        valorAnterior: actual.precioSteamAsincronico,
        valorNuevo: propuesto.precioSteamAsincronico,
      });
    }

    if (
      propuesto.precioSteamSincronico &&
      !propuesto.precioSteamSincronico.equals(actual.precioSteamSincronico)
    ) {
      cambios.push({
        campo: 'precioSteamSincronico',
        valorAnterior: actual.precioSteamSincronico,
        valorNuevo: propuesto.precioSteamSincronico,
      });
    }

    // Comparar descuento familiar simplificado
    if (
      propuesto.descuentoSegundoHermano &&
      !propuesto.descuentoSegundoHermano.equals(actual.descuentoSegundoHermano)
    ) {
      cambios.push({
        campo: 'descuentoSegundoHermano',
        valorAnterior: actual.descuentoSegundoHermano,
        valorNuevo: propuesto.descuentoSegundoHermano,
      });
    }

    // Comparar configuración de notificaciones
    if (
      propuesto.diaVencimiento !== undefined &&
      propuesto.diaVencimiento !== actual.diaVencimiento
    ) {
      cambios.push({
        campo: 'diaVencimiento',
        valorAnterior: actual.diaVencimiento,
        valorNuevo: propuesto.diaVencimiento,
      });
    }

    if (
      propuesto.diasAntesRecordatorio !== undefined &&
      propuesto.diasAntesRecordatorio !== actual.diasAntesRecordatorio
    ) {
      cambios.push({
        campo: 'diasAntesRecordatorio',
        valorAnterior: actual.diasAntesRecordatorio,
        valorNuevo: propuesto.diasAntesRecordatorio,
      });
    }

    if (
      propuesto.notificacionesActivas !== undefined &&
      propuesto.notificacionesActivas !== actual.notificacionesActivas
    ) {
      cambios.push({
        campo: 'notificacionesActivas',
        valorAnterior: actual.notificacionesActivas,
        valorNuevo: propuesto.notificacionesActivas,
      });
    }

    return cambios;
  }

  /**
   * Construye el objeto de actualización parcial
   *
   * Sistema STEAM 2026:
   * - Los precios de cada Tier son independientes
   * - El descuento familiar se aplica sobre cualquier Tier
   *
   * CONTABILIDAD: Los precios en ARS deben ser enteros (sin centavos)
   */
  private construirActualizacion(
    input: ActualizarConfiguracionPreciosInputDTO,
  ): Partial<ConfiguracionPrecios> {
    const actualizacion: Record<string, Decimal | boolean | number> = {};

    // Precios por Tier STEAM
    if (input.precioSteamLibros) {
      actualizacion.precioSteamLibros = input.precioSteamLibros;
    }
    if (input.precioSteamAsincronico) {
      actualizacion.precioSteamAsincronico = input.precioSteamAsincronico;
    }
    if (input.precioSteamSincronico) {
      actualizacion.precioSteamSincronico = input.precioSteamSincronico;
    }

    // Descuento familiar simplificado
    if (input.descuentoSegundoHermano) {
      actualizacion.descuentoSegundoHermano = input.descuentoSegundoHermano;
    }

    // Configuración de notificaciones
    if (input.diaVencimiento !== undefined) {
      actualizacion.diaVencimiento = input.diaVencimiento;
    }
    if (input.diasAntesRecordatorio !== undefined) {
      actualizacion.diasAntesRecordatorio = input.diasAntesRecordatorio;
    }
    if (input.notificacionesActivas !== undefined) {
      actualizacion.notificacionesActivas = input.notificacionesActivas;
    }

    return actualizacion as Partial<ConfiguracionPrecios>;
  }

  /**
   * Mapea ConfiguracionPrecios del domain al DTO
   */
  private mapearConfiguracionADTO(
    config: ConfiguracionPrecios,
  ): ConfiguracionPreciosDTO {
    return {
      // Precios por Tier STEAM
      precioSteamLibros: config.precioSteamLibros,
      precioSteamAsincronico: config.precioSteamAsincronico,
      precioSteamSincronico: config.precioSteamSincronico,
      // Descuento familiar simplificado
      descuentoSegundoHermano: config.descuentoSegundoHermano,
      // Configuración de notificaciones
      diaVencimiento: config.diaVencimiento,
      diasAntesRecordatorio: config.diasAntesRecordatorio,
      notificacionesActivas: config.notificacionesActivas,
      // Metadata
      actualizadoEn: new Date(),
    };
  }
}
