/**
 * API Client para Tienda y Recursos (XP, Monedas, Gemas)
 */

import type { JsonValue } from '@/types/common';
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
      return await apiClient.get<RecursosEstudiante>(`/recursos/${estudianteId}`);
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
      return await apiClient.post<RecursosActualizadosResponse>(
        '/recursos/actualizar-por-actividad',
        data,
      );
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
    metadata?: Record<string, JsonValue>,
  ): Promise<RecursosActualizadosResponse> => {
    try {
      return await apiClient.post<RecursosActualizadosResponse>(
        `/recursos/${estudianteId}/gemas`,
        {
          cantidad,
          razon,
          metadata,
        },
      );
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

      const response = await apiClient.get<
        TransaccionRecurso[] | { data?: TransaccionRecurso[] }
      >(`/recursos/${estudianteId}/historial?${params.toString()}`);

      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
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
      return await apiClient.get<CategoriaItem[]>('/tienda/categorias');
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

      const response = await apiClient.get<
        ItemsTiendaResponse | { data?: ItemsTiendaResponse }
      >(`/tienda/items?${params.toString()}`);

      if (response && 'data' in response && response.data) {
        return response.data;
      }

      return response as ItemsTiendaResponse;
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
      return await apiClient.get<ItemTiendaConCategoria>(`/tienda/items/${itemId}`);
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
      return await apiClient.get<InventarioEstudianteResponse>(
        `/tienda/inventario/${estudianteId}`,
      );
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
      return await apiClient.put<ItemObtenido>(
        `/tienda/inventario/${estudianteId}/equipar/${itemId}`,
      );
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
      return await apiClient.post<CompraResponse>('/tienda/comprar', data);
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
      return await apiClient.get<CompraResponse[]>(`/tienda/compras/${estudianteId}`);
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
