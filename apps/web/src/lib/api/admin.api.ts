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

/**
 * Eliminar un estudiante
 * DELETE /api/admin/estudiantes/:id
 */
export const deleteEstudiante = async (estudianteId: string): Promise<void> => {
  try {
    await axios.delete(`/admin/estudiantes/${estudianteId}`);
  } catch (error) {
    console.error('Error al eliminar el estudiante:', error);
    throw error;
  }
};

/**
 * Eliminar un docente
 * DELETE /api/docentes/:id
 */
export const deleteDocente = async (docenteId: string): Promise<void> => {
  try {
    await axios.delete(`/docentes/${docenteId}`);
  } catch (error) {
    console.error('Error al eliminar el docente:', error);
    throw error;
  }
};

// =============================================================================
// CREAR PERSONAS
// =============================================================================

export interface CrearEstudianteDto {
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
  tutorExistenteId?: string;
  tutorNombre?: string;
  tutorApellido?: string;
  tutorEmail?: string;
  tutorTelefono?: string;
}

export interface CrearDocenteDto {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  titulo?: string;
  telefono?: string;
  especialidades?: string[];
}

/**
 * Crear un estudiante con tutor
 * POST /api/admin/estudiantes
 */
export const createEstudiante = async (dto: CrearEstudianteDto): Promise<EstudianteAdmin> => {
  try {
    return await axios.post('/admin/estudiantes', dto);
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    throw error;
  }
};

/**
 * Crear un docente
 * POST /api/docentes
 */
export const createDocente = async (dto: CrearDocenteDto): Promise<DocenteAdmin> => {
  try {
    return await axios.post('/docentes', dto);
  } catch (error) {
    console.error('Error al crear docente:', error);
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

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS / RETENCIÓN
// ─────────────────────────────────────────────────────────────────────────────

/** Punto de datos de retención mensual */
export interface RetentionDataPoint {
  month: string;
  nuevos: number;
  activos: number;
  bajas: number;
}

/**
 * Obtener histórico de retención de estudiantes
 * GET /admin/analytics/retencion
 */
export const getRetentionStats = async (meses = 6): Promise<RetentionDataPoint[]> => {
  try {
    return await axios.get<RetentionDataPoint[]>(`/admin/analytics/retencion?meses=${meses}`);
  } catch (error) {
    console.error('Error al obtener estadísticas de retención:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGOS / TRANSACCIONES
// ─────────────────────────────────────────────────────────────────────────────

/** Transacción para el admin dashboard */
export interface TransaccionAdmin {
  id: string;
  fecha: string;
  monto: number;
  estado: string;
  concepto: string;
  tutor: { id: string; nombre: string; apellido: string; email: string | null };
  estudiante: { id: string; nombre: string; apellido: string } | null;
  metodoPago: string | null;
}

/** Metadata de paginación */
export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

/** Response paginada */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Obtener transacciones/pagos recientes con paginación
 * GET /admin/pagos/recientes
 */
export const getPagosRecientes = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<TransaccionAdmin>> => {
  try {
    return await axios.get<PaginatedResponse<TransaccionAdmin>>(
      `/admin/pagos/recientes?page=${page}&limit=${limit}`,
    );
  } catch (error) {
    console.error('Error al obtener pagos recientes:', error);
    throw error;
  }
};

/** Punto de datos de ingresos mensual */
export interface RevenueDataPoint {
  month: string;
  ingresos: number;
  pendientes: number;
}

/**
 * Obtener histórico mensual de ingresos y pendientes
 * GET /admin/pagos/historico-mensual
 */
export const getHistoricoMensual = async (meses = 6): Promise<RevenueDataPoint[]> => {
  try {
    return await axios.get<RevenueDataPoint[]>(`/admin/pagos/historico-mensual?meses=${meses}`);
  } catch (error) {
    console.error('Error al obtener histórico mensual:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE / CONFIGURACIÓN
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

// ─────────────────────────────────────────────────────────────────────────────
// COMISIONES (Instancias de Productos tipo Curso)
// ─────────────────────────────────────────────────────────────────────────────

/** Estado de inscripción en comisión */
export type EstadoInscripcionComision = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'ListaEspera';

/** Comisión de producto */
export interface Comision {
  id: string;
  nombre: string;
  descripcion: string | null;
  producto_id: string;
  casa_id: string | null;
  docente_id: string | null;
  cupo_maximo: number | null;
  horario: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  producto?: {
    id: string;
    nombre: string;
    tipo: string;
    precio?: number;
  };
  casa?: {
    id: string;
    nombre: string;
    emoji: string;
  } | null;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
  } | null;
  total_inscriptos?: number;
  cupos_disponibles?: number | null;
}

/** Inscripción en comisión */
export interface InscripcionComision {
  id: string;
  comision_id: string;
  estudiante_id: string;
  estado: EstadoInscripcionComision;
  fecha_inscripcion: string;
  notas: string | null;
  estudiante?: {
    id: string;
    nombre: string;
    apellido: string;
    edad?: number;
    casa?: {
      id: string;
      nombre: string;
      emoji: string;
    } | null;
  };
}

/** DTO para crear comisión */
export interface CreateComisionDto {
  nombre: string;
  descripcion?: string;
  producto_id: string;
  casa_id?: string | null;
  docente_id?: string | null;
  cupo_maximo?: number | null;
  horario?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  activo?: boolean;
}

/** DTO para inscribir estudiantes */
export interface InscribirEstudiantesDto {
  estudiantes_ids: string[];
  estado?: EstadoInscripcionComision;
}

/** Response de lista de comisiones */
export interface ComisionesListResponse {
  success: boolean;
  data: Comision[];
  total: number;
}

/** Response de comisión individual */
export interface ComisionResponse {
  success: boolean;
  data: Comision & { inscripciones?: InscripcionComision[] };
  message?: string;
}

/**
 * Obtener todas las comisiones
 * GET /admin/comisiones
 */
export const getComisiones = async (params?: {
  producto_id?: string;
  casa_id?: string;
  docente_id?: string;
  activo?: boolean;
}): Promise<Comision[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.producto_id) queryParams.append('producto_id', params.producto_id);
    if (params?.casa_id) queryParams.append('casa_id', params.casa_id);
    if (params?.docente_id) queryParams.append('docente_id', params.docente_id);
    if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));

    const url = queryParams.toString()
      ? `/admin/comisiones?${queryParams.toString()}`
      : '/admin/comisiones';

    // El interceptor ya extrae .data del response del backend
    // Entonces response aquí es directamente el array de comisiones
    const comisiones = await axios.get<Comision[]>(url);
    return comisiones ?? [];
  } catch (error) {
    console.error('Error al obtener comisiones:', error);
    return []; // Retornar array vacío en caso de error para evitar undefined
  }
};

/**
 * Obtener comisiones por producto
 * GET /admin/comisiones?producto_id=xxx
 */
export const getComisionesByProducto = async (productoId: string): Promise<Comision[]> => {
  return getComisiones({ producto_id: productoId });
};

/**
 * Obtener una comisión por ID
 * GET /admin/comisiones/:id
 */
export const getComisionById = async (
  id: string,
): Promise<Comision & { inscripciones?: InscripcionComision[] }> => {
  try {
    // El interceptor ya extrae .data del response del backend
    const comision = await axios.get<Comision & { inscripciones?: InscripcionComision[] }>(
      `/admin/comisiones/${id}`,
    );
    return comision;
  } catch (error) {
    console.error('Error al obtener comisión:', error);
    throw error;
  }
};

/**
 * Crear una comisión
 * POST /admin/comisiones
 */
export const createComision = async (data: CreateComisionDto): Promise<Comision> => {
  try {
    // El interceptor ya extrae .data del response del backend
    const comision = await axios.post<Comision>('/admin/comisiones', data);
    return comision;
  } catch (error) {
    console.error('Error al crear comisión:', error);
    throw error;
  }
};

/**
 * Actualizar una comisión
 * PUT /admin/comisiones/:id
 */
export const updateComision = async (
  id: string,
  data: Partial<CreateComisionDto>,
): Promise<Comision> => {
  try {
    // El interceptor ya extrae .data del response del backend
    const comision = await axios.put<Comision>(`/admin/comisiones/${id}`, data);
    return comision;
  } catch (error) {
    console.error('Error al actualizar comisión:', error);
    throw error;
  }
};

/**
 * Eliminar una comisión (soft delete)
 * DELETE /admin/comisiones/:id
 */
export const deleteComision = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/admin/comisiones/${id}`);
  } catch (error) {
    console.error('Error al eliminar comisión:', error);
    throw error;
  }
};

/**
 * Inscribir estudiantes a una comisión
 * POST /admin/comisiones/:id/estudiantes
 */
export const inscribirEstudiantesComision = async (
  comisionId: string,
  data: InscribirEstudiantesDto,
): Promise<InscripcionComision[]> => {
  try {
    // El interceptor ya extrae .data del response del backend
    const inscripciones = await axios.post<InscripcionComision[]>(
      `/admin/comisiones/${comisionId}/estudiantes`,
      data,
    );
    return inscripciones ?? [];
  } catch (error) {
    console.error('Error al inscribir estudiantes:', error);
    throw error;
  }
};

/**
 * Actualizar estado de inscripción
 * PATCH /admin/comisiones/:comisionId/estudiantes/:estudianteId
 */
export const actualizarInscripcionComision = async (
  comisionId: string,
  estudianteId: string,
  data: { estado: EstadoInscripcionComision; notas?: string },
): Promise<InscripcionComision> => {
  try {
    // El interceptor ya extrae .data del response del backend
    const inscripcion = await axios.patch<InscripcionComision>(
      `/admin/comisiones/${comisionId}/estudiantes/${estudianteId}`,
      data,
    );
    return inscripcion;
  } catch (error) {
    console.error('Error al actualizar inscripción:', error);
    throw error;
  }
};

/**
 * Remover estudiante de comisión
 * DELETE /admin/comisiones/:comisionId/estudiantes/:estudianteId
 */
export const removerEstudianteComision = async (
  comisionId: string,
  estudianteId: string,
): Promise<void> => {
  try {
    await axios.delete(`/admin/comisiones/${comisionId}/estudiantes/${estudianteId}`);
  } catch (error) {
    console.error('Error al remover estudiante:', error);
    throw error;
  }
};

/**
 * Respuesta al crear estudiante e inscribirlo en comisión
 */
export interface CrearEstudianteEInscribirResponse {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    edad: number;
    nivelEscolar: string;
  };
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
  };
  tutorCreado: boolean;
  credencialesTutor: {
    username: string;
    passwordTemporal: string;
  } | null;
  credencialesEstudiante: {
    username: string;
    pin: string;
  };
  inscripcion: {
    id: string;
    comision: {
      id: string;
      nombre: string;
    };
    estado: EstadoInscripcionComision;
    fecha_inscripcion: string;
  };
}

/**
 * Crear estudiante nuevo e inscribirlo a una comisión
 * POST /admin/comisiones/:id/estudiantes/nuevo
 *
 * Crea estudiante con credenciales y lo inscribe automáticamente
 */
export const crearEstudianteEInscribir = async (
  comisionId: string,
  dto: CrearEstudianteConCredencialesDto,
): Promise<CrearEstudianteEInscribirResponse> => {
  try {
    return await axios.post(`/admin/comisiones/${comisionId}/estudiantes/nuevo`, dto);
  } catch (error) {
    console.error('Error al crear estudiante e inscribir:', error);
    throw error;
  }
};

// ============================================================================
// SECTORES Y CASAS
// ============================================================================

/**
 * Sector del sistema (Matemática, Programación, etc.)
 */
export interface Sector {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

/**
 * Casa/Equipo del sistema (Quantum, Vertex, Pulsar)
 */
export interface Casa {
  id: string;
  nombre: string;
  color?: string;
  activo: boolean;
}

/**
 * Obtener todos los sectores
 * GET /admin/sectores
 */
export const getSectores = async (): Promise<Sector[]> => {
  try {
    return await axios.get('/admin/sectores');
  } catch (error) {
    console.error('Error al obtener sectores:', error);
    throw error;
  }
};

/**
 * Obtener todas las casas/equipos
 * GET /equipos
 */
export const getCasas = async (): Promise<Casa[]> => {
  try {
    return await axios.get('/equipos');
  } catch (error) {
    console.error('Error al obtener casas:', error);
    throw error;
  }
};

// ============================================================================
// CREAR ESTUDIANTE CON CREDENCIALES
// ============================================================================

/**
 * DTO para crear estudiante con credenciales
 */
export interface CrearEstudianteConCredencialesDto {
  // Datos del estudiante
  nombreEstudiante: string;
  apellidoEstudiante: string;
  edadEstudiante: number;
  nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
  sectorId: string;
  casaId?: string;
  puntosIniciales?: number;
  nivelInicial?: number;
  // Datos del tutor
  nombreTutor: string;
  apellidoTutor: string;
  emailTutor?: string;
  telefonoTutor?: string;
  dniTutor?: string;
}

/**
 * Respuesta al crear estudiante con credenciales
 */
export interface CrearEstudianteConCredencialesResponse {
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    edad: number;
    nivelEscolar: string;
  };
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
  };
  tutorCreado: boolean;
  credencialesTutor: {
    username: string;
    passwordTemporal: string;
  } | null;
  credencialesEstudiante: {
    username: string;
    pin: string;
  };
}

/**
 * Crear estudiante con generación automática de credenciales
 * POST /admin/estudiantes/con-credenciales
 *
 * Genera credenciales para estudiante (username + PIN)
 * y para tutor si es nuevo (username + password temporal)
 */
export const crearEstudianteConCredenciales = async (
  dto: CrearEstudianteConCredencialesDto,
): Promise<CrearEstudianteConCredencialesResponse> => {
  try {
    return await axios.post('/admin/estudiantes/con-credenciales', dto);
  } catch (error) {
    console.error('Error al crear estudiante con credenciales:', error);
    throw error;
  }
};

// ============================================================================
// TAREAS ADMINISTRATIVAS
// ============================================================================

/** Prioridad de tarea (mapea a enum Prisma PrioridadTarea) */
export type TareaPrioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

/** Estado de tarea (mapea a enum Prisma EstadoTarea) */
export type TareaEstado = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';

/** Tarea administrativa del dashboard */
export interface TareaAdmin {
  id: string;
  title: string;
  description: string | null;
  priority: TareaPrioridad;
  status: TareaEstado;
  dueDate: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

/** DTO para crear tarea */
export interface CreateTareaDto {
  title: string;
  description?: string;
  priority?: TareaPrioridad;
  dueDate?: string;
  assignee?: string;
}

/** DTO para actualizar tarea */
export interface UpdateTareaDto {
  title?: string;
  description?: string | null;
  priority?: TareaPrioridad;
  status?: TareaEstado;
  dueDate?: string | null;
  assignee?: string | null;
}

/**
 * Listar todas las tareas administrativas
 * GET /admin/tareas
 */
export const getTareas = async (): Promise<TareaAdmin[]> => {
  try {
    return await axios.get<TareaAdmin[]>('/admin/tareas');
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw error;
  }
};

/**
 * Crear una nueva tarea
 * POST /admin/tareas
 */
export const createTarea = async (dto: CreateTareaDto): Promise<TareaAdmin> => {
  try {
    return await axios.post<TareaAdmin>('/admin/tareas', dto);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
};

/**
 * Actualizar una tarea
 * PUT /admin/tareas/:id
 */
export const updateTarea = async (id: string, dto: UpdateTareaDto): Promise<TareaAdmin> => {
  try {
    return await axios.put<TareaAdmin>(`/admin/tareas/${id}`, dto);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw error;
  }
};

/**
 * Toggle estado de tarea (PENDIENTE <-> COMPLETADA)
 * PATCH /admin/tareas/:id/toggle
 */
export const toggleTarea = async (id: string): Promise<TareaAdmin> => {
  try {
    return await axios.patch<TareaAdmin>(`/admin/tareas/${id}/toggle`);
  } catch (error) {
    console.error('Error al toggle tarea:', error);
    throw error;
  }
};

/**
 * Eliminar una tarea
 * DELETE /admin/tareas/:id
 */
export const deleteTarea = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/admin/tareas/${id}`);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw error;
  }
};
