import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { CalcularPrecioUseCase } from './calcular-precio.use-case';
import { IInscripcionMensualRepository } from '../../domain/repositories/inscripcion-mensual.repository.interface';
import {
  CrearInscripcionMensualInputDTO,
  CrearInscripcionMensualOutputDTO,
  InscripcionCreadaDTO,
  ResumenInscripcionDTO,
} from '../dtos/crear-inscripcion-mensual.dto';
import { EstadoPago } from '../../domain/types/pagos.types';

/**
 * Use Case: Crear Inscripciones Mensuales
 *
 * Responsabilidades (Application Layer):
 * 1. Reutilizar CalcularPrecioUseCase para obtener cálculos
 * 2. Validar que no existan inscripciones duplicadas
 * 3. Crear inscripciones en el repositorio
 * 4. Retornar resumen estructurado
 *
 * Flujo:
 * 1. Validar entrada (año, mes válidos)
 * 2. Calcular precios con CalcularPrecioUseCase
 * 3. Verificar duplicados
 * 4. Crear inscripciones en batch
 * 5. Retornar resumen con todas las inscripciones
 */
@Injectable()
export class CrearInscripcionMensualUseCase {
  constructor(
    private readonly calcularPrecioUseCase: CalcularPrecioUseCase,
    private readonly inscripcionRepo: IInscripcionMensualRepository,
  ) {}

  async execute(
    input: CrearInscripcionMensualInputDTO,
  ): Promise<CrearInscripcionMensualOutputDTO> {
    // 1. Validaciones de entrada
    this.validarInput(input);

    // 2. Generar período en formato "YYYY-MM"
    const periodo = this.generarPeriodo(input.anio, input.mes);

    // 3. Calcular precios usando el use case existente
    const calculoPrecio = await this.calcularPrecioUseCase.execute({
      tutorId: input.tutorId,
      estudiantesIds: input.estudiantesIds,
      productosIdsPorEstudiante: input.productosIdsPorEstudiante,
      tieneAACREA: input.tieneAACREA,
    });

    // 4. Verificar duplicados
    await this.verificarDuplicados(calculoPrecio.calculos, periodo);

    // 5. Crear inscripciones
    const inscripcionesCreadas: InscripcionCreadaDTO[] = [];

    for (const calculo of calculoPrecio.calculos) {
      const inscripcion = await this.inscripcionRepo.crear({
        estudianteId: calculo.estudianteId,
        productoId: calculo.productoId,
        tutorId: input.tutorId,
        anio: input.anio,
        mes: input.mes,
        periodo,
        precioBase: calculo.precioBase,
        descuentoAplicado: calculo.descuentoAplicado,
        precioFinal: calculo.precioFinal,
        tipoDescuento: calculo.tipoDescuento,
        detalleCalculo: calculo.detalleCalculo,
      });

      inscripcionesCreadas.push({
        id: inscripcion.id,
        estudianteId: inscripcion.estudianteId,
        estudianteNombre: calculo.estudianteNombre,
        productoId: inscripcion.productoId,
        productoNombre: calculo.productoNombre,
        periodo: inscripcion.periodo,
        precioBase: inscripcion.precioBase,
        descuentoAplicado: inscripcion.descuentoAplicado,
        precioFinal: inscripcion.precioFinal,
        tipoDescuento: inscripcion.tipoDescuento,
        detalleCalculo: inscripcion.detalleCalculo,
        estadoPago: inscripcion.estadoPago,
      });
    }

    // 6. Calcular resumen
    const totalGeneral = inscripcionesCreadas.reduce(
      (sum, i) => sum.plus(i.precioFinal),
      new Decimal(0),
    );

    const resumen: ResumenInscripcionDTO = {
      periodo,
      cantidadInscripciones: inscripcionesCreadas.length,
      totalGeneral,
      estadoPago: EstadoPago.Pendiente, // Todas inician como Pendiente
    };

    return {
      inscripciones: inscripcionesCreadas,
      resumen,
      mensaje: `Se crearon exitosamente ${inscripcionesCreadas.length} inscripc${inscripcionesCreadas.length !== 1 ? 'iones' : 'ión'} para el período ${periodo}`,
    };
  }

  /**
   * Valida el input del use case
   */
  private validarInput(input: CrearInscripcionMensualInputDTO): void {
    // Validar mes (1-12)
    if (input.mes < 1 || input.mes > 12) {
      throw new Error('El mes debe estar entre 1 y 12');
    }

    // Validar año (mínimo 2024)
    if (input.anio < 2024) {
      throw new Error('El año debe ser mayor o igual a 2024');
    }

    // Validar año máximo razonable
    if (input.anio > 2100) {
      throw new Error('El año debe ser menor o igual a 2100');
    }
  }

  /**
   * Genera período en formato "YYYY-MM"
   */
  private generarPeriodo(anio: number, mes: number): string {
    const mesStr = mes.toString().padStart(2, '0');
    return `${anio}-${mesStr}`;
  }

  /**
   * Verifica que no existan inscripciones duplicadas
   */
  private async verificarDuplicados(
    calculos: readonly { estudianteId: string; productoId: string }[],
    periodo: string,
  ): Promise<void> {
    for (const calculo of calculos) {
      const existe = await this.inscripcionRepo.existe(
        calculo.estudianteId,
        calculo.productoId,
        periodo,
      );

      if (existe) {
        throw new Error(
          `Ya existe una inscripción para el estudiante ${calculo.estudianteId} y el producto ${calculo.productoId} en el período ${periodo}`,
        );
      }
    }
  }
}
