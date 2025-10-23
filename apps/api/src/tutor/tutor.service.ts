import { Injectable } from '@nestjs/common';
import { InscripcionMensualRepository } from '../pagos/infrastructure/repositories/inscripcion-mensual.repository';
import { EstadoPago } from '../pagos/domain/types/pagos.types';
import { InscripcionMensual } from '../pagos/domain/repositories/inscripcion-mensual.repository.interface';
import { EstadoPagoFilter } from './dto/get-mis-inscripciones.dto';

/**
 * Response type para getMisInscripciones
 */
export interface MisInscripcionesResponse {
  inscripciones: InscripcionMensual[];
  resumen: {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  };
}

/**
 * TutorService
 *
 * Lógica de negocio específica para tutores
 * - Obtener inscripciones mensuales
 * - Calcular resúmenes financieros
 * - Gestionar perfil de tutor
 */
@Injectable()
export class TutorService {
  constructor(
    private readonly inscripcionRepo: InscripcionMensualRepository,
  ) {}

  /**
   * Obtiene las inscripciones mensuales de un tutor con resumen
   *
   * @param tutorId - ID del tutor autenticado (viene del JWT)
   * @param periodo - Filtro opcional por período (YYYY-MM)
   * @param estadoPago - Filtro opcional por estado
   * @returns Inscripciones y resumen financiero
   */
  async getMisInscripciones(
    tutorId: string,
    periodo?: string,
    estadoPago?: EstadoPagoFilter,
  ): Promise<MisInscripcionesResponse> {
    // Mapear EstadoPagoFilter a EstadoPago del dominio
    const estadoDominio: EstadoPago | undefined = estadoPago as EstadoPago | undefined;

    // Obtener inscripciones del repositorio
    const inscripciones = await this.inscripcionRepo.obtenerPorTutor(
      tutorId,
      periodo,
      estadoDominio,
    );

    // Calcular resumen
    const resumen = this.calcularResumen(inscripciones);

    return {
      inscripciones,
      resumen,
    };
  }

  /**
   * Calcula el resumen financiero de las inscripciones
   *
   * @param inscripciones - Array de inscripciones
   * @returns Resumen con totales y conteos
   */
  private calcularResumen(inscripciones: InscripcionMensual[]): {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  } {
    let totalPendiente = 0;
    let totalPagado = 0;
    const estudiantesSet = new Set<string>();

    for (const inscripcion of inscripciones) {
      // Sumar totales según estado
      if (inscripcion.estadoPago === 'Pendiente' || inscripcion.estadoPago === 'Vencido') {
        totalPendiente += Number(inscripcion.precioFinal);
      } else if (inscripcion.estadoPago === 'Pagado') {
        totalPagado += Number(inscripcion.precioFinal);
      }

      // Contar estudiantes únicos
      estudiantesSet.add(inscripcion.estudianteId);
    }

    return {
      totalPendiente: Math.round(totalPendiente),
      totalPagado: Math.round(totalPagado),
      cantidadInscripciones: inscripciones.length,
      estudiantesUnicos: estudiantesSet.size,
    };
  }
}
