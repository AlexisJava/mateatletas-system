/**
 * API Client para Tienda y Recursos (XP, Monedas, Gemas)
 */

import apiClient from '../axios';
import type {
  RecursosEstudiante,
  TransaccionRecurso,
  TipoRecurso,
  ActualizarRecursosPorActividad,
  RecursosActualizadosResponse,
  ItemsTiendaResponse,
  ItemTiendaConCategoria,
  CategoriaItem,
  FiltrosItemsTienda,
  InventarioEstudianteResponse,
  CompraResponse,
  RealizarCompra,
  ItemObtenido,
} from '@mateatletas/contracts';

// ============================================================================
// RECURSOS API
// ============================================================================

export const recursosApi = {
  /**
   * Obtener recursos actuales del estudiante (XP, Monedas, Gemas)
   */
  obtenerRecursos: async (estudianteId: string): Promise<RecursosEstudiante> => {
    try {
      const response = await apiClient.get(`/recursos/${estudianteId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener recursos del estudiante:', error);
      throw error;
    }
  },

  /**
   * Actualizar recursos después de completar una actividad
   */
  actualizarPorActividad: async (
    data: ActualizarRecursosPorActividad,
  ): Promise<RecursosActualizadosResponse> => {
    try {
      const response = await apiClient.post('/recursos/actualizar-por-actividad', data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar recursos por actividad:', error);
      throw error;
    }
  },

  /**
   * Agregar gemas al estudiante (Admin/Docente)
   */
  agregarGemas: async (
    estudianteId: string,
    cantidad: number,
    razon: string,
    metadata?: Record<string, unknown>,
  ): Promise<RecursosActualizadosResponse> => {
    try {
      const response = await apiClient.post(`/recursos/${estudianteId}/gemas`, {
        cantidad,
        razon,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar gemas:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de transacciones de recursos
   */
  obtenerHistorial: async (
    estudianteId: string,
    tipo?: TipoRecurso,
    limit?: number,
  ): Promise<TransaccionRecurso[]> => {
    try {
      const params = new URLSearchParams();
      if (tipo) params.append('tipo', tipo);
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get(
        `/recursos/${estudianteId}/historial?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de recursos:', error);
      throw error;
    }
  },
};

// ============================================================================
// TIENDA API
// ============================================================================

export const tiendaApi = {
  // ========== CATEGORÍAS ==========

  /**
   * Obtener todas las categorías de la tienda
   */
  obtenerCategorias: async (): Promise<CategoriaItem[]> => {
    try {
      const response = await apiClient.get('/tienda/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías de tienda:', error);
      throw error;
    }
  },

  // ========== ITEMS ==========

  /**
   * Obtener items de la tienda con filtros opcionales
   */
  obtenerItems: async (filtros?: Partial<FiltrosItemsTienda>): Promise<ItemsTiendaResponse> => {
    try {
      const params = new URLSearchParams();

      if (filtros?.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros?.tipo_item) params.append('tipo_item', filtros.tipo_item);
      if (filtros?.rareza) params.append('rareza', filtros.rareza);
      if (filtros?.nivel_estudiante !== undefined) {
        params.append('nivel_estudiante', filtros.nivel_estudiante.toString());
      }
      if (filtros?.solo_disponibles !== undefined) {
        params.append('solo_disponibles', filtros.solo_disponibles.toString());
      }
      if (filtros?.incluir_edicion_limitada !== undefined) {
        params.append('incluir_edicion_limitada', filtros.incluir_edicion_limitada.toString());
      }

      const response = await apiClient.get(`/tienda/items?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener items de tienda:', error);
      throw error;
    }
  },

  /**
   * Obtener un item específico por ID
   */
  obtenerItemPorId: async (itemId: string): Promise<ItemTiendaConCategoria> => {
    try {
      const response = await apiClient.get(`/tienda/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener item de tienda:', error);
      throw error;
    }
  },

  // ========== INVENTARIO ==========

  /**
   * Obtener inventario completo del estudiante
   */
  obtenerInventario: async (estudianteId: string): Promise<InventarioEstudianteResponse> => {
    try {
      const response = await apiClient.get(`/tienda/inventario/${estudianteId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      throw error;
    }
  },

  /**
   * Equipar un item en el estudiante
   */
  equiparItem: async (estudianteId: string, itemId: string): Promise<ItemObtenido> => {
    try {
      const response = await apiClient.put(
        `/tienda/inventario/${estudianteId}/equipar/${itemId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error al equipar item:', error);
      throw error;
    }
  },

  // ========== COMPRAS ==========

  /**
   * Realizar compra de un item
   */
  comprarItem: async (data: RealizarCompra): Promise<CompraResponse> => {
    try {
      const response = await apiClient.post('/tienda/comprar', data);
      return response.data;
    } catch (error) {
      console.error('Error al comprar item:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de compras del estudiante
   */
  obtenerHistorialCompras: async (estudianteId: string): Promise<CompraResponse[]> => {
    try {
      const response = await apiClient.get(`/tienda/compras/${estudianteId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de compras:', error);
      throw error;
    }
  },
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  recursos: recursosApi,
  tienda: tiendaApi,
};
