/**
 * Admin API Client
 */

import axios from '@/lib/axios';
import {
  DashboardData,
  AdminUser,
  ChangeRoleDto,
  UpdateRolesDto,
  SystemStats,
  DashboardStats,
} from '@/types/admin.types';
import type { Producto } from '@/types/catalogo.types';

// Re-export para uso en componentes
export type { Producto };
import type { CrearProductoDto } from './catalogo.api';
import type { RegisterResponse } from './auth.api';

// Schemas Zod para validación runtime
import {
  clasesListSchema,
  clasesResponseSchema,
  type ClasesResponse,
} from '@/lib/schemas/clase.schema';
import { docentesListSchema } from '@/lib/schemas/docente.schema';
import { rutasListSchema } from '@/lib/schemas/ruta.schema';
import { productoSchema, productosListSchema } from '@/lib/schemas/producto.schema';

export const getDashboard = async (): Promise<DashboardData> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.get<DashboardData>('/admin/dashboard');
  } catch (error) {
    console.error('Error al obtener el dashboard de administración:', error);
    throw error;
  }
};

export const getSystemStats = async (): Promise<SystemStats> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.get<SystemStats>('/admin/estadisticas');
  } catch (error) {
    console.error('Error al obtener las estadísticas del sistema:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.get<AdminUser[]>('/admin/usuarios');
  } catch (error) {
    console.error('Error al obtener los usuarios administradores:', error);
    throw error;
  }
};

/**
 * Obtener todos los estudiantes del sistema con paginación
 * GET /api/admin/estudiantes
 */
export interface EstudianteAdmin {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivel_escolar: string;
  nivel_actual: string | null;
  puntos_totales: number;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  equipo: {
    nombre: string;
    color_primario: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstudiantesResponse {
  data: EstudianteAdmin[];
  metadata: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export const getAllEstudiantes = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<EstudiantesResponse> => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);

  const queryString = params.toString();
  const url = `/admin/estudiantes${queryString ? `?${queryString}` : ''}`;

  try {
    // El interceptor ya retorna response.data directamente
    return await axios.get<EstudiantesResponse>(url);
  } catch (error) {
    console.error('Error al obtener el listado de estudiantes:', error);
    throw error;
  }
};

export const changeUserRole = async (userId: string, data: ChangeRoleDto): Promise<AdminUser> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.post<AdminUser>(`/admin/usuarios/${userId}/role`, data);
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error);
    throw error;
  }
};

export const updateUserRoles = async (
  userId: string,
  data: UpdateRolesDto,
): Promise<{ message: string; userId: string; roles: string[] }> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.put<{ message: string; userId: string; roles: string[] }>(
      `/admin/usuarios/${userId}/roles`,
      data,
    );
  } catch (error) {
    console.error('Error al actualizar los roles del usuario:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`/admin/usuarios/${userId}`);
  } catch (error) {
    console.error('Error al eliminar el usuario administrador:', error);
    throw error;
  }
};

export const getAllClasses = async (): Promise<ClasesResponse> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get('/clases/admin/todas');
    // Backend retorna { data: [...], meta: {...} }, validar con schema completo
    const parsed = clasesResponseSchema.safeParse(response);

    if (parsed.success) {
      return parsed.data;
    }

    // Fallback: manejar diferentes estructuras de respuesta
    // Caso 1: response es un array directo
    if (Array.isArray(response)) {
      const list = clasesListSchema.parse(response).map((clase) => ({
        ...clase,
        ruta_curricular: clase.ruta_curricular ?? clase.rutaCurricular ?? undefined,
      }));
      return { data: list, meta: undefined };
    }

    // Caso 2: response es un objeto con .data que es un array
    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      Array.isArray(response.data)
    ) {
      const list = clasesListSchema.parse(response.data).map((clase) => ({
        ...clase,
        ruta_curricular: clase.ruta_curricular ?? clase.rutaCurricular ?? undefined,
      }));
      return { data: list, meta: undefined };
    }

    // Si no se puede parsear, retornar vacío
    console.warn('getAllClasses: Formato de respuesta inesperado', response);
    return { data: [], meta: undefined };
  } catch (error) {
    console.error('Error al obtener todas las clases para administración:', error);
    throw error;
  }
};

export const createClass = async (data: {
  nombre: string;
  rutaCurricularId?: string;
  docenteId: string;
  sectorId?: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  cuposMaximo: number;
  descripcion?: string;
  productoId?: string;
}) => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post('/clases', data);
    return response;
  } catch (error) {
    console.error('Error al crear una clase desde administración:', error);
    throw error;
  }
};

export const cancelarClase = async (claseId: string) => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.patch(`/clases/${claseId}/cancelar`);
    return response;
  } catch (error) {
    console.error('Error al cancelar la clase desde administración:', error);
    throw error;
  }
};

export const eliminarClase = async (claseId: string) => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.delete(`/clases/${claseId}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar la clase desde administración:', error);
    throw error;
  }
};

export const obtenerClase = async (claseId: string) => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get(`/clases/${claseId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la clase desde administración:', error);
    throw error;
  }
};

export const getRutasCurriculares = async () => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get('/clases/metadata/rutas-curriculares');
    return rutasListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener las rutas curriculares (admin):', error);
    throw error;
  }
};

export const getDocentes = async () => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get('/docentes');
    return docentesListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener los docentes (admin):', error);
    throw error;
  }
};

// Products Management
export const getAllProducts = async (includeInactive = true): Promise<Producto[]> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get(`/productos?soloActivos=${!includeInactive}`);
    const productos = productosListSchema.parse(response);
    return productos.map((producto) => ({
      ...producto,
      descripcion: producto.descripcion ?? '',
    }));
  } catch (error) {
    console.error('Error al obtener los productos (admin):', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Producto> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get(`/productos/${id}`);
    const producto = productoSchema.parse(response);
    return {
      ...producto,
      descripcion: producto.descripcion ?? '',
    };
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    throw error;
  }
};

export const createProduct = async (data: CrearProductoDto): Promise<Producto> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post('/productos', data);
    const producto = productoSchema.parse(response);
    return {
      ...producto,
      descripcion: producto.descripcion ?? '',
    };
  } catch (error) {
    console.error('Error al crear el producto:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  data: Partial<CrearProductoDto>,
): Promise<Producto> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.patch(`/productos/${id}`, data);
    const producto = productoSchema.parse(response);
    return {
      ...producto,
      descripcion: producto.descripcion ?? '',
    };
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string, hardDelete = false) => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.delete(`/productos/${id}?hardDelete=${hardDelete}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
};

// User Management
export interface CreateAdminData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
}

export const createAdmin = async (data: CreateAdminData): Promise<AdminUser> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = (await axios.post<RegisterResponse>(
      '/auth/register',
      data,
    )) as RegisterResponse;

    // Luego cambiamos el rol a admin
    const adminUser = await changeUserRole(response.user.id, {
      role: 'admin',
    });

    return adminUser;
  } catch (error) {
    console.error('Error al crear un administrador:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS COMBINADAS
// ─────────────────────────────────────────────────────────────────────────────

/** Response del endpoint GET /admin/dashboard */
interface AdminDashboardResponse {
  activeMemberships: number;
  upcomingClasses: number;
  openAlerts: number;
  totalEstudiantes: number;
  totalDocentes: number;
  totalTutores: number;
  fecha: string;
}

/** Response del endpoint GET /casas/estadisticas (camelCase) */
interface CasaRankingItem {
  posicion: number;
  id: string;
  tipo: 'QUANTUM' | 'VERTEX' | 'PULSAR';
  nombre: string;
  emoji: string;
  puntosTotales: number;
  cantidadEstudiantes: number;
}

interface CasasEstadisticasResponse {
  totalCasas: number;
  totalEstudiantes: number;
  promedioEstudiantesPorCasa: number;
  ranking: CasaRankingItem[];
}

/**
 * Obtener estadísticas de casas
 * GET /casas/estadisticas
 */
export const getCasasEstadisticas = async (): Promise<CasasEstadisticasResponse> => {
  try {
    return await axios.get<CasasEstadisticasResponse>('/casas/estadisticas');
  } catch (error) {
    console.error('Error al obtener estadísticas de casas:', error);
    throw error;
  }
};

/**
 * Obtener todas las stats del dashboard en una sola llamada
 * Combina: /admin/dashboard + /admin/estadisticas + /casas/estadisticas
 * Transforma al formato esperado por el frontend (DashboardStats)
 */
// ─────────────────────────────────────────────────────────────────────────────
// FINANCE / PAGOS
// ─────────────────────────────────────────────────────────────────────────────

/** Response del endpoint GET /pagos/configuracion (Decimals se serializan como strings) */
export interface TierConfigResponse {
  precioSteamLibros: string;
  precioSteamAsincronico: string;
  precioSteamSincronico: string;
  descuentoSegundoHermano: string;
  diaVencimiento: number;
  diasAntesRecordatorio: number;
  notificacionesActivas: boolean;
}

/** TierConfig con números (para el frontend) */
export interface TierConfig {
  precioSteamLibros: number;
  precioSteamAsincronico: number;
  precioSteamSincronico: number;
  descuentoSegundoHermano: number;
  diaVencimiento: number;
  diasAntesRecordatorio: number;
  notificacionesActivas: boolean;
}

/** Métricas del dashboard de pagos */
export interface FinanceMetricsResponse {
  periodo: string;
  metricas: {
    ingresosMesActual: string;
    pagosPendientes: string;
    inscripcionesActivas: number;
    tasaCobroActual: string;
    comparacionMesAnterior: {
      ingresosCambio: string;
      pendientesCambio: string;
      inscripcionesCambio: number;
      tasaCobroCambio: string;
    };
  };
  evolucionMensual: Array<{
    periodo: string;
    ingresos: string;
    pendientes: string;
    totalEsperado: string;
  }>;
  distribucionEstados: Array<{
    estado: string;
    cantidad: number;
    monto: string;
    porcentaje: string;
  }>;
}

/** Métricas transformadas para el frontend */
export interface FinanceStats {
  ingresosMes: number;
  pagosPendientes: number;
  inscripcionesActivas: number;
  tasaCobro: number;
  cambios: {
    ingresos: number;
    pendientes: number;
    inscripciones: number;
    tasaCobro: number;
  };
}

/**
 * Obtener configuración de precios
 * GET /pagos/configuracion
 */
export const getFinanceConfig = async (): Promise<TierConfig> => {
  try {
    const response = await axios.get<TierConfigResponse>('/pagos/configuracion');
    // Convertir strings (Decimal serializado) a números
    return {
      precioSteamLibros: parseFloat(response.precioSteamLibros),
      precioSteamAsincronico: parseFloat(response.precioSteamAsincronico),
      precioSteamSincronico: parseFloat(response.precioSteamSincronico),
      descuentoSegundoHermano: parseFloat(response.descuentoSegundoHermano),
      diaVencimiento: response.diaVencimiento,
      diasAntesRecordatorio: response.diasAntesRecordatorio,
      notificacionesActivas: response.notificacionesActivas,
    };
  } catch (error) {
    console.error('Error al obtener configuración de precios:', error);
    throw error;
  }
};

/**
 * Obtener métricas del dashboard de finanzas
 * GET /pagos/dashboard/metricas
 */
export const getFinanceMetrics = async (): Promise<FinanceStats> => {
  try {
    const response = await axios.get<FinanceMetricsResponse>('/pagos/dashboard/metricas');
    // Transformar de Decimal strings a números
    return {
      ingresosMes: parseFloat(response.metricas.ingresosMesActual),
      pagosPendientes: parseFloat(response.metricas.pagosPendientes),
      inscripcionesActivas: response.metricas.inscripcionesActivas,
      tasaCobro: parseFloat(response.metricas.tasaCobroActual),
      cambios: {
        ingresos: parseFloat(response.metricas.comparacionMesAnterior.ingresosCambio),
        pendientes: parseFloat(response.metricas.comparacionMesAnterior.pendientesCambio),
        inscripciones: response.metricas.comparacionMesAnterior.inscripcionesCambio,
        tasaCobro: parseFloat(response.metricas.comparacionMesAnterior.tasaCobroCambio),
      },
    };
  } catch (error) {
    console.error('Error al obtener métricas de finanzas:', error);
    throw error;
  }
};

/**
 * Actualizar configuración de precios
 * POST /pagos/configuracion/actualizar
 */
export const updateFinanceConfig = async (config: Partial<TierConfig>): Promise<TierConfig> => {
  try {
    const response = await axios.post<TierConfigResponse>(
      '/pagos/configuracion/actualizar',
      config,
    );
    return {
      precioSteamLibros: parseFloat(response.precioSteamLibros),
      precioSteamAsincronico: parseFloat(response.precioSteamAsincronico),
      precioSteamSincronico: parseFloat(response.precioSteamSincronico),
      descuentoSegundoHermano: parseFloat(response.descuentoSegundoHermano),
      diaVencimiento: response.diaVencimiento,
      diasAntesRecordatorio: response.diasAntesRecordatorio,
      notificacionesActivas: response.notificacionesActivas,
    };
  } catch (error) {
    console.error('Error al actualizar configuración de precios:', error);
    throw error;
  }
};

export const getCombinedDashboardStats = async (): Promise<DashboardStats> => {
  const [dashboard, estadisticas, casas] = await Promise.all([
    axios.get<AdminDashboardResponse>('/admin/dashboard'),
    getSystemStats(),
    getCasasEstadisticas(),
  ]);

  // Calcular tasa de cobro
  const totalFacturado = estadisticas.ingresosTotal + estadisticas.pagosPendientes;
  const tasaCobro =
    totalFacturado > 0 ? Math.round((estadisticas.ingresosTotal / totalFacturado) * 1000) / 10 : 0;

  // Transformar distribución de casas desde ranking
  const distribucionCasas = {
    Quantum: 0,
    Vertex: 0,
    Pulsar: 0,
  };

  casas.ranking.forEach((casa) => {
    if (casa.tipo === 'QUANTUM') distribucionCasas.Quantum = casa.cantidadEstudiantes;
    if (casa.tipo === 'VERTEX') distribucionCasas.Vertex = casa.cantidadEstudiantes;
    if (casa.tipo === 'PULSAR') distribucionCasas.Pulsar = casa.cantidadEstudiantes;
  });

  return {
    totalEstudiantes: estadisticas.totalEstudiantes,
    estudiantesActivos: dashboard.activeMemberships, // Inscripciones activas como proxy
    inscripcionesActivas: estadisticas.inscripcionesActivas,
    ingresosMes: estadisticas.ingresosTotal,
    ingresosPendientes: estadisticas.pagosPendientes,
    tasaCobro,
    crecimientoMensual: 0, // TODO: Implementar cuando exista endpoint de histórico
    distribucionCasas,
  };
};
