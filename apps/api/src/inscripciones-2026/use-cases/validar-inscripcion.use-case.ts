import { Injectable, BadRequestException } from '@nestjs/common';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';
import {
  CreateInscripcion2026Dto,
  TipoInscripcion2026,
} from '../dto/create-inscripcion-2026.dto';

/**
 * Resultado de la validación de inscripción
 */
export interface ValidacionInscripcionResult {
  isValid: boolean;
  inscripcionFee: number;
  monthlyTotal: number;
  siblingDiscount: number;
  cursosPerStudent: number[];
}

/**
 * Use Case: Validar datos de inscripción 2026
 *
 * Responsabilidad única: Validar que los datos de inscripción sean correctos
 * según el tipo de inscripción y calcular precios.
 *
 * NO accede a la base de datos.
 * NO tiene efectos secundarios.
 */
@Injectable()
export class ValidarInscripcionUseCase {
  constructor(private readonly pricingCalculator: PricingCalculatorService) {}

  /**
   * Ejecuta la validación de inscripción
   *
   * @param dto - Datos de inscripción a validar
   * @returns Resultado de validación con cálculos de precios
   * @throws BadRequestException si los datos no son válidos
   */
  execute(dto: CreateInscripcion2026Dto): ValidacionInscripcionResult {
    // 1. Validar datos según tipo de inscripción
    this.validateInscriptionData(dto);

    // 2. Mapear tipo para pricing
    const pricingTipo = this.mapTipoToPricing(dto.tipo_inscripcion);

    // 3. Calcular tarifa de inscripción
    const inscripcionFee =
      this.pricingCalculator.calcularTarifaInscripcion(pricingTipo);

    // 4. Calcular cursos por estudiante
    const cursosPerStudent = dto.estudiantes.map(
      (e) => e.cursos_seleccionados?.length || 0,
    );

    // 5. Calcular total mensual con descuentos
    const { total: monthlyTotal, descuento: siblingDiscount } =
      this.pricingCalculator.calcularTotalInscripcion2026(
        pricingTipo,
        dto.estudiantes.length,
        cursosPerStudent,
      );

    return {
      isValid: true,
      inscripcionFee,
      monthlyTotal,
      siblingDiscount,
      cursosPerStudent,
    };
  }

  /**
   * Valida que los datos sean consistentes según el tipo de inscripción
   */
  private validateInscriptionData(dto: CreateInscripcion2026Dto): void {
    const { tipo_inscripcion, estudiantes } = dto;

    estudiantes.forEach((estudiante, index) => {
      const hasCursos =
        estudiante.cursos_seleccionados &&
        estudiante.cursos_seleccionados.length > 0;
      const hasMundo = !!estudiante.mundo_seleccionado;

      switch (tipo_inscripcion) {
        case TipoInscripcion2026.COLONIA:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia`,
            );
          }
          if (hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar mundo STEAM para Colonia`,
            );
          }
          break;

        case TipoInscripcion2026.CICLO_2026:
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Ciclo 2026`,
            );
          }
          if (hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: No debe seleccionar cursos de Colonia para Ciclo 2026`,
            );
          }
          break;

        case TipoInscripcion2026.PACK_COMPLETO:
          if (!hasCursos) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar al menos 1 curso de Colonia para Pack Completo`,
            );
          }
          if (!hasMundo) {
            throw new BadRequestException(
              `Estudiante ${index + 1}: Debe seleccionar un mundo STEAM para Pack Completo`,
            );
          }
          break;

        default:
          throw new BadRequestException(
            `Tipo de inscripción inválido: ${tipo_inscripcion}`,
          );
      }
    });
  }

  /**
   * Convierte TipoInscripcion2026 a tipo esperado por PricingCalculator
   */
  private mapTipoToPricing(
    tipo: TipoInscripcion2026,
  ): 'COLONIA' | 'CICLO_2026' | 'PACK_COMPLETO' {
    switch (tipo) {
      case TipoInscripcion2026.COLONIA:
        return 'COLONIA';
      case TipoInscripcion2026.CICLO_2026:
        return 'CICLO_2026';
      case TipoInscripcion2026.PACK_COMPLETO:
        return 'PACK_COMPLETO';
      default:
        throw new BadRequestException(`Tipo de inscripción inválido: ${tipo}`);
    }
  }
}
