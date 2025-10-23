import { ConfiguracionPrecios } from '../types/pagos.types';

/**
 * Interface del repositorio de Configuración de Precios
 * Define el contrato para operaciones de persistencia
 *
 * Ubicación en Clean Architecture:
 * - Domain Layer define la interface
 * - Infrastructure Layer implementa la interface
 * - Application Layer (Use Cases) depende de la interface
 */
export interface IConfiguracionPreciosRepository {
  /**
   * Obtiene la configuración singleton de precios
   * @returns ConfiguracionPrecios o null si no existe
   */
  obtenerConfiguracion(): Promise<ConfiguracionPrecios | null>;

  /**
   * Actualiza la configuración de precios
   * Automáticamente guarda el historial de cambios
   *
   * @param nuevaConfiguracion - Nueva configuración a aplicar
   * @param adminId - ID del administrador que realiza el cambio
   * @param motivo - Motivo del cambio (opcional)
   * @returns ConfiguracionPrecios actualizada
   */
  actualizarConfiguracion(
    nuevaConfiguracion: Partial<ConfiguracionPrecios>,
    adminId: string,
    motivo?: string,
  ): Promise<ConfiguracionPrecios>;

  /**
   * Obtiene el historial de cambios de precios
   * Útil para auditoría y reportes
   *
   * @param limit - Cantidad máxima de registros (default: 50)
   * @returns Array de cambios ordenados por fecha descendente
   */
  obtenerHistorialCambios(limit?: number): Promise<HistorialCambio[]>;
}

/**
 * Representa un cambio en la configuración de precios
 * Para consultas de auditoría
 */
export interface HistorialCambio {
  readonly id: string;
  readonly valoresAnteriores: Record<string, unknown>;
  readonly valoresNuevos: Record<string, unknown>;
  readonly motivoCambio: string | null;
  readonly adminId: string;
  readonly fechaCambio: Date;
}
