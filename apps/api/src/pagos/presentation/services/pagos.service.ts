import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { CalcularPrecioUseCase } from '../../application/use-cases/calcular-precio.use-case';
import { ActualizarConfiguracionPreciosUseCase } from '../../application/use-cases/actualizar-configuracion-precios.use-case';
import { CrearInscripcionMensualUseCase } from '../../application/use-cases/crear-inscripcion-mensual.use-case';
import { ObtenerMetricasDashboardUseCase } from '../../application/use-cases/obtener-metricas-dashboard.use-case';
import { ConfiguracionPreciosRepository } from '../../infrastructure/repositories/configuracion-precios.repository';
import { InscripcionMensualRepository } from '../../infrastructure/repositories/inscripcion-mensual.repository';
import {
  CalcularPrecioInputDTO,
  CalcularPrecioOutputDTO,
} from '../../application/dtos/calcular-precio.dto';
import {
  ActualizarConfiguracionPreciosInputDTO,
  ActualizarConfiguracionPreciosOutputDTO,
} from '../../application/dtos/actualizar-configuracion-precios.dto';
import {
  CrearInscripcionMensualInputDTO,
  CrearInscripcionMensualOutputDTO,
} from '../../application/dtos/crear-inscripcion-mensual.dto';
import {
  ObtenerMetricasDashboardInputDTO,
  ObtenerMetricasDashboardOutputDTO,
} from '../../application/dtos/obtener-metricas-dashboard.dto';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';
import { CrearInscripcionMensualRequestDto } from '../dtos/crear-inscripcion-mensual-request.dto';
import { ObtenerMetricasDashboardRequestDto } from '../dtos/obtener-metricas-dashboard-request.dto';

/**
 * PagosService - Presentation Layer
 *
 * Responsabilidades:
 * - Adaptador entre HTTP DTOs y Application DTOs
 * - Conversión de tipos (number → Decimal)
 * - Inyección de dependencias de Use Cases
 * - Orquestación de llamadas a Use Cases
 *
 * NO contiene lógica de negocio (eso está en Use Cases)
 */
@Injectable()
export class PagosService {
  constructor(
    private readonly calcularPrecioUseCase: CalcularPrecioUseCase,
    private readonly actualizarConfiguracionUseCase: ActualizarConfiguracionPreciosUseCase,
    private readonly crearInscripcionUseCase: CrearInscripcionMensualUseCase,
    private readonly obtenerMetricasUseCase: ObtenerMetricasDashboardUseCase,
    private readonly configuracionRepo: ConfiguracionPreciosRepository,
    private readonly inscripcionRepo: InscripcionMensualRepository,
  ) {}

  /**
   * Calcula el precio de actividades
   * Convierte DTO HTTP → DTO Application → Use Case
   */
  async calcularPrecio(
    requestDto: CalcularPrecioRequestDto,
  ): Promise<CalcularPrecioOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: CalcularPrecioInputDTO = {
      tutorId: requestDto.tutorId,
      estudiantesIds: requestDto.estudiantesIds,
      productosIdsPorEstudiante: requestDto.productosIdsPorEstudiante,
      tieneAACREA: requestDto.tieneAACREA,
    };

    // Ejecutar use case
    return await this.calcularPrecioUseCase.execute(applicationDto);
  }

  /**
   * Actualiza la configuración de precios
   * Convierte numbers a Decimals antes de llamar al Use Case
   */
  async actualizarConfiguracionPrecios(
    requestDto: ActualizarConfiguracionPreciosRequestDto,
  ): Promise<ActualizarConfiguracionPreciosOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    // IMPORTANTE: Convertir numbers a Decimals
    const applicationDto: ActualizarConfiguracionPreciosInputDTO = {
      adminId: requestDto.adminId,
      precioClubMatematicas: requestDto.precioClubMatematicas
        ? new Decimal(requestDto.precioClubMatematicas)
        : undefined,
      precioCursosEspecializados: requestDto.precioCursosEspecializados
        ? new Decimal(requestDto.precioCursosEspecializados)
        : undefined,
      precioMultipleActividades: requestDto.precioMultipleActividades
        ? new Decimal(requestDto.precioMultipleActividades)
        : undefined,
      precioHermanosBasico: requestDto.precioHermanosBasico
        ? new Decimal(requestDto.precioHermanosBasico)
        : undefined,
      precioHermanosMultiple: requestDto.precioHermanosMultiple
        ? new Decimal(requestDto.precioHermanosMultiple)
        : undefined,
      descuentoAacreaPorcentaje: requestDto.descuentoAacreaPorcentaje
        ? new Decimal(requestDto.descuentoAacreaPorcentaje)
        : undefined,
      descuentoAacreaActivo: requestDto.descuentoAacreaActivo,
      diaVencimiento: requestDto.diaVencimiento,
      diasAntesRecordatorio: requestDto.diasAntesRecordatorio,
      notificacionesActivas: requestDto.notificacionesActivas,
      motivoCambio: requestDto.motivoCambio,
    };

    // Ejecutar use case
    return await this.actualizarConfiguracionUseCase.execute(applicationDto);
  }

  /**
   * Crea inscripciones mensuales
   * Convierte DTO HTTP a DTO Application
   */
  async crearInscripcionMensual(
    requestDto: CrearInscripcionMensualRequestDto,
  ): Promise<CrearInscripcionMensualOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: CrearInscripcionMensualInputDTO = {
      tutorId: requestDto.tutorId,
      estudiantesIds: requestDto.estudiantesIds,
      productosIdsPorEstudiante: requestDto.productosIdsPorEstudiante,
      anio: requestDto.anio,
      mes: requestDto.mes,
      tieneAACREA: requestDto.tieneAACREA,
    };

    // Ejecutar use case
    return await this.crearInscripcionUseCase.execute(applicationDto);
  }

  /**
   * Obtiene métricas del dashboard
   * Convierte DTO HTTP a DTO Application
   */
  async obtenerMetricasDashboard(
    requestDto: ObtenerMetricasDashboardRequestDto,
  ): Promise<ObtenerMetricasDashboardOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: ObtenerMetricasDashboardInputDTO = {
      anio: requestDto.anio,
      mes: requestDto.mes,
      tutorId: requestDto.tutorId,
    };

    // Ejecutar use case
    return await this.obtenerMetricasUseCase.execute(applicationDto);
  }

  /**
   * Obtiene la configuración de precios actual
   */
  async obtenerConfiguracion() {
    const config = await this.configuracionRepo.obtenerConfiguracion();
    return config;
  }

  /**
   * Obtiene el historial de cambios de precios
   */
  async obtenerHistorialCambios() {
    const historial = await this.configuracionRepo.obtenerHistorialCambios(50);
    return historial;
  }

  /**
   * Obtiene inscripciones pendientes con información de estudiantes
   */
  async obtenerInscripcionesPendientes() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const inscripciones = await this.inscripcionRepo.obtenerInscripcionesPorPeriodo(periodo);

    // Filtrar solo pendientes
    return inscripciones.filter((i) => i.estadoPago === 'Pendiente');
  }

  /**
   * Obtiene estudiantes con descuentos aplicados
   */
  async obtenerEstudiantesConDescuentos() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return await this.inscripcionRepo.obtenerEstudiantesConDescuentos(periodo);
  }
}
