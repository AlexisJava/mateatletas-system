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
 * Sistema de Tiers 2026:
 * - Arcade: $30.000/mes - 1 mundo async
 * - Arcade+: $60.000/mes - 3 mundos async
 * - Pro: $75.000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12%
 * - 3er hermano en adelante: 20%
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
    // Validar precios de Tiers no negativos
    const precios = [
      input.precioArcade,
      input.precioArcadePlus,
      input.precioPro,
    ].filter(Boolean);

    for (const precio of precios) {
      if (precio && precio.isNegative()) {
        throw new Error('Los precios no pueden ser negativos');
      }
    }

    // Validar descuentos familiares (porcentajes)
    const descuentos = [
      { valor: input.descuentoHermano2, nombre: 'descuento segundo hermano' },
      {
        valor: input.descuentoHermano3Mas,
        nombre: 'descuento tercer hermano en adelante',
      },
    ];

    for (const descuento of descuentos) {
      if (descuento.valor !== undefined) {
        if (descuento.valor.lessThan(0) || descuento.valor.greaterThan(100)) {
          throw new Error(`El ${descuento.nombre} debe estar entre 0 y 100`);
        }
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

    // Comparar precios de Tiers
    if (
      propuesto.precioArcade &&
      !propuesto.precioArcade.equals(actual.precioArcade)
    ) {
      cambios.push({
        campo: 'precioArcade',
        valorAnterior: actual.precioArcade,
        valorNuevo: propuesto.precioArcade,
      });
    }

    if (
      propuesto.precioArcadePlus &&
      !propuesto.precioArcadePlus.equals(actual.precioArcadePlus)
    ) {
      cambios.push({
        campo: 'precioArcadePlus',
        valorAnterior: actual.precioArcadePlus,
        valorNuevo: propuesto.precioArcadePlus,
      });
    }

    if (propuesto.precioPro && !propuesto.precioPro.equals(actual.precioPro)) {
      cambios.push({
        campo: 'precioPro',
        valorAnterior: actual.precioPro,
        valorNuevo: propuesto.precioPro,
      });
    }

    // Comparar descuentos familiares
    if (
      propuesto.descuentoHermano2 &&
      !propuesto.descuentoHermano2.equals(actual.descuentoHermano2)
    ) {
      cambios.push({
        campo: 'descuentoHermano2',
        valorAnterior: actual.descuentoHermano2,
        valorNuevo: propuesto.descuentoHermano2,
      });
    }

    if (
      propuesto.descuentoHermano3Mas &&
      !propuesto.descuentoHermano3Mas.equals(actual.descuentoHermano3Mas)
    ) {
      cambios.push({
        campo: 'descuentoHermano3Mas',
        valorAnterior: actual.descuentoHermano3Mas,
        valorNuevo: propuesto.descuentoHermano3Mas,
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
   * Sistema de Tiers 2026:
   * - Los precios de cada Tier son independientes
   * - Los descuentos familiares se aplican sobre cualquier Tier
   *
   * CONTABILIDAD: Los precios en ARS deben ser enteros (sin centavos)
   */
  private construirActualizacion(
    input: ActualizarConfiguracionPreciosInputDTO,
  ): Partial<ConfiguracionPrecios> {
    const actualizacion: Record<string, Decimal | boolean | number> = {};

    // Precios por Tier
    if (input.precioArcade) {
      actualizacion.precioArcade = input.precioArcade;
    }
    if (input.precioArcadePlus) {
      actualizacion.precioArcadePlus = input.precioArcadePlus;
    }
    if (input.precioPro) {
      actualizacion.precioPro = input.precioPro;
    }

    // Descuentos familiares
    if (input.descuentoHermano2) {
      actualizacion.descuentoHermano2 = input.descuentoHermano2;
    }
    if (input.descuentoHermano3Mas) {
      actualizacion.descuentoHermano3Mas = input.descuentoHermano3Mas;
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
      // Precios por Tier
      precioArcade: config.precioArcade,
      precioArcadePlus: config.precioArcadePlus,
      precioPro: config.precioPro,
      // Descuentos familiares
      descuentoHermano2: config.descuentoHermano2,
      descuentoHermano3Mas: config.descuentoHermano3Mas,
      // Configuración de notificaciones
      diaVencimiento: config.diaVencimiento,
      diasAntesRecordatorio: config.diasAntesRecordatorio,
      notificacionesActivas: config.notificacionesActivas,
      // Metadata
      actualizadoEn: new Date(),
    };
  }
}
