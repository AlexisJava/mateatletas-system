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
    const configuracionActual = await this.configuracionRepo.obtenerConfiguracion();
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
    const configuracionActualizada = await this.configuracionRepo.actualizarConfiguracion(
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
    // Validar precios no negativos
    const precios = [
      input.precioClubMatematicas,
      input.precioCursosEspecializados,
      input.precioMultipleActividades,
      input.precioHermanosBasico,
      input.precioHermanosMultiple,
    ].filter(Boolean);

    for (const precio of precios) {
      if (precio && precio.isNegative()) {
        throw new Error('Los precios no pueden ser negativos');
      }
    }

    // Validar porcentaje de descuento AACREA
    if (input.descuentoAacreaPorcentaje !== undefined) {
      const porcentaje = input.descuentoAacreaPorcentaje;
      if (porcentaje.lessThan(0) || porcentaje.greaterThan(100)) {
        throw new Error('El porcentaje de descuento debe estar entre 0 y 100');
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
        throw new Error('Los días antes de recordatorio deben estar entre 0 y 30');
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

    // Comparar precios
    if (propuesto.precioClubMatematicas && !propuesto.precioClubMatematicas.equals(actual.precioClubMatematicas)) {
      cambios.push({
        campo: 'precioClubMatematicas',
        valorAnterior: actual.precioClubMatematicas,
        valorNuevo: propuesto.precioClubMatematicas,
      });
    }

    if (propuesto.precioCursosEspecializados && !propuesto.precioCursosEspecializados.equals(actual.precioCursosEspecializados)) {
      cambios.push({
        campo: 'precioCursosEspecializados',
        valorAnterior: actual.precioCursosEspecializados,
        valorNuevo: propuesto.precioCursosEspecializados,
      });
    }

    if (propuesto.precioMultipleActividades && !propuesto.precioMultipleActividades.equals(actual.precioMultipleActividades)) {
      cambios.push({
        campo: 'precioMultipleActividades',
        valorAnterior: actual.precioMultipleActividades,
        valorNuevo: propuesto.precioMultipleActividades,
      });
    }

    if (propuesto.precioHermanosBasico && !propuesto.precioHermanosBasico.equals(actual.precioHermanosBasico)) {
      cambios.push({
        campo: 'precioHermanosBasico',
        valorAnterior: actual.precioHermanosBasico,
        valorNuevo: propuesto.precioHermanosBasico,
      });
    }

    if (propuesto.precioHermanosMultiple && !propuesto.precioHermanosMultiple.equals(actual.precioHermanosMultiple)) {
      cambios.push({
        campo: 'precioHermanosMultiple',
        valorAnterior: actual.precioHermanosMultiple,
        valorNuevo: propuesto.precioHermanosMultiple,
      });
    }

    // Comparar descuento AACREA
    if (propuesto.descuentoAacreaPorcentaje && !propuesto.descuentoAacreaPorcentaje.equals(actual.descuentoAacreaPorcentaje)) {
      cambios.push({
        campo: 'descuentoAacreaPorcentaje',
        valorAnterior: actual.descuentoAacreaPorcentaje,
        valorNuevo: propuesto.descuentoAacreaPorcentaje,
      });
    }

    if (propuesto.descuentoAacreaActivo !== undefined && propuesto.descuentoAacreaActivo !== actual.descuentoAacreaActivo) {
      cambios.push({
        campo: 'descuentoAacreaActivo',
        valorAnterior: actual.descuentoAacreaActivo,
        valorNuevo: propuesto.descuentoAacreaActivo,
      });
    }

    // Comparar configuración de notificaciones
    if (propuesto.diaVencimiento !== undefined) {
      cambios.push({
        campo: 'diaVencimiento',
        valorAnterior: 15, // Valor por defecto del schema
        valorNuevo: propuesto.diaVencimiento,
      });
    }

    if (propuesto.diasAntesRecordatorio !== undefined) {
      cambios.push({
        campo: 'diasAntesRecordatorio',
        valorAnterior: 5, // Valor por defecto del schema
        valorNuevo: propuesto.diasAntesRecordatorio,
      });
    }

    if (propuesto.notificacionesActivas !== undefined) {
      cambios.push({
        campo: 'notificacionesActivas',
        valorAnterior: true, // Valor por defecto del schema
        valorNuevo: propuesto.notificacionesActivas,
      });
    }

    return cambios;
  }

  /**
   * Construye el objeto de actualización parcial
   */
  private construirActualizacion(
    input: ActualizarConfiguracionPreciosInputDTO,
  ): Partial<ConfiguracionPrecios> {
    const actualizacion: Partial<ConfiguracionPrecios> = {};

    if (input.precioClubMatematicas) {
      actualizacion.precioClubMatematicas = input.precioClubMatematicas;
    }
    if (input.precioCursosEspecializados) {
      actualizacion.precioCursosEspecializados = input.precioCursosEspecializados;
    }
    if (input.precioMultipleActividades) {
      actualizacion.precioMultipleActividades = input.precioMultipleActividades;
    }
    if (input.precioHermanosBasico) {
      actualizacion.precioHermanosBasico = input.precioHermanosBasico;
    }
    if (input.precioHermanosMultiple) {
      actualizacion.precioHermanosMultiple = input.precioHermanosMultiple;
    }
    if (input.descuentoAacreaPorcentaje) {
      actualizacion.descuentoAacreaPorcentaje = input.descuentoAacreaPorcentaje;
    }
    if (input.descuentoAacreaActivo !== undefined) {
      actualizacion.descuentoAacreaActivo = input.descuentoAacreaActivo;
    }

    return actualizacion;
  }

  /**
   * Mapea ConfiguracionPrecios del domain al DTO
   */
  private mapearConfiguracionADTO(config: ConfiguracionPrecios): ConfiguracionPreciosDTO {
    return {
      precioClubMatematicas: config.precioClubMatematicas,
      precioCursosEspecializados: config.precioCursosEspecializados,
      precioMultipleActividades: config.precioMultipleActividades,
      precioHermanosBasico: config.precioHermanosBasico,
      precioHermanosMultiple: config.precioHermanosMultiple,
      descuentoAacreaPorcentaje: config.descuentoAacreaPorcentaje,
      descuentoAacreaActivo: config.descuentoAacreaActivo,
      diaVencimiento: 15, // TODO: obtener del config cuando esté en el domain type
      diasAntesRecordatorio: 5,
      notificacionesActivas: true,
      actualizadoEn: new Date(),
    };
  }
}
