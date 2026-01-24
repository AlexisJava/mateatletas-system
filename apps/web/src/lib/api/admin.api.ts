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
import { docentesResponseSchema } from '@/lib/schemas/docente.schema';
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
  nivelEscolar?: string;
  nivelActual: number | null;
  xpTotal: number;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  casa: {
    nombre: string;
    colorPrimary: string;
  } | null;
  plan?: {
    id: string;
    nombre: string;
  } | null;
  estadoAcceso?: string | null;
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

export interface DocenteAdmin {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  titulo?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  // Plan de suscripción (opcional)
  planId?: string;
  estadoAcceso?: 'ACTIVO' | 'SUSPENDIDO' | 'VENCIDO' | 'BECA';
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

/**
 * Resetear credenciales de un usuario
 * POST /api/admin/credenciales/:usuarioId/reset
 */
export interface ResetCredencialesResponse {
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    username?: string;
  };
  nuevaPassword: string;
  tipoUsuario: 'tutor' | 'estudiante' | 'docente';
}

export const resetCredenciales = async (
  usuarioId: string,
  tipoUsuario: 'tutor' | 'estudiante' | 'docente',
): Promise<ResetCredencialesResponse> => {
  try {
    return await axios.post(`/admin/credenciales/${usuarioId}/reset`, { tipoUsuario });
  } catch (error) {
    console.error('Error al resetear credenciales:', error);
    throw error;
  }
};

// =============================================================================
// ACTUALIZAR PERSONAS
// =============================================================================

export interface UpdateEstudianteDto {
  nombre?: string;
  apellido?: string;
  edad?: number;
  nivelEscolar?: 'Primaria' | 'Secundaria' | 'Universidad';
}

export interface UpdateDocenteDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  titulo?: string;
  telefono?: string;
  especialidades?: string[];
}

/**
 * Actualizar un estudiante (Admin)
 * PATCH /api/admin/estudiantes/:id
 *
 * Usa el endpoint de admin para evitar el ownership guard
 */
export const updateEstudiante = async (
  estudianteId: string,
  dto: UpdateEstudianteDto,
): Promise<EstudianteAdmin> => {
  try {
    return await axios.patch(`/admin/estudiantes/${estudianteId}`, dto);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    throw error;
  }
};

/**
 * Actualizar un docente
 * PATCH /api/docentes/:id
 */
export const updateDocente = async (
  docenteId: string,
  dto: UpdateDocenteDto,
): Promise<DocenteAdmin> => {
  try {
    return await axios.patch(`/docentes/${docenteId}`, dto);
  } catch (error) {
    console.error('Error al actualizar docente:', error);
    throw error;
  }
};

// =============================================================================
// PLANES DE SUSCRIPCIÓN
// =============================================================================

/**
 * Plan de suscripción disponible
 */
export interface PlanSuscripcion {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioBase: number | string;
}

/**
 * DTO para asignar plan a un estudiante
 */
export interface AsignarPlanEstudianteDto {
  planId?: string | null;
  estadoAcceso?: 'ACTIVO' | 'SUSPENDIDO' | 'VENCIDO' | 'BECA';
  fechaVencimientoPlan?: string | null;
  notasPlan?: string | null;
}

/**
 * Respuesta al asignar plan
 */
export interface AsignarPlanResponse {
  success: boolean;
  message: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    plan: PlanSuscripcion | null;
    estadoAcceso: string;
    fechaVencimientoPlan: string | null;
    notasPlan: string | null;
    tutor: {
      id: string;
      nombre: string;
      apellido: string;
    };
  };
}

/**
 * Obtener todos los planes de suscripción disponibles
 * GET /api/admin/planes-suscripcion
 */
export const getPlanesSuscripcion = async (): Promise<PlanSuscripcion[]> => {
  try {
    return await axios.get('/admin/planes-suscripcion');
  } catch (error) {
    console.error('Error al obtener planes de suscripción:', error);
    throw error;
  }
};

/**
 * Asignar plan directamente a un estudiante
 * PATCH /api/admin/estudiantes/:id/plan
 */
export const asignarPlanEstudiante = async (
  estudianteId: string,
  dto: AsignarPlanEstudianteDto,
): Promise<AsignarPlanResponse> => {
  try {
    return await axios.patch(`/admin/estudiantes/${estudianteId}/plan`, dto);
  } catch (error) {
    console.error('Error al asignar plan a estudiante:', error);
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
        rutaCurricular: clase.rutaCurricular ?? clase.rutaCurricular ?? undefined,
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
        rutaCurricular: clase.rutaCurricular ?? clase.rutaCurricular ?? undefined,
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
    const parsed = docentesResponseSchema.parse(response);
    return parsed.data;
  } catch (error) {
    console.error('Error al obtener los docentes (admin):', error);
    throw error;
  }
};

/**
 * Obtener conteo de clases asignadas a un docente
 * GET /api/docentes/:id/clases-count
 */
export interface DocenteClasesCount {
  claseGrupos: number;
  comisiones: number;
  total: number;
}

export const getDocenteClasesCount = async (docenteId: string): Promise<DocenteClasesCount> => {
  try {
    return await axios.get<DocenteClasesCount>(`/docentes/${docenteId}/clases-count`);
  } catch (error) {
    console.error('Error al obtener conteo de clases del docente:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de clases de TODOS los docentes en una sola query
 * Evita el problema N+1
 */
export const getDocentesClasesCountBatch = async (): Promise<
  Record<string, DocenteClasesCount>
> => {
  try {
    return await axios.get<Record<string, DocenteClasesCount>>('/docentes/clases-count-batch');
  } catch (error) {
    console.error('Error al obtener conteo de clases batch:', error);
    throw error;
  }
};

/**
 * Estadísticas de contenidos leídos/completados
 * GET /api/admin/analytics/libros-leidos
 */
export interface LibrosLeidosStats {
  total: number;
  porEstudiante: number;
  completadosEsteMes: number;
  tiempoPromedioMinutos: number;
  tendencia: Array<{ month: string; completados: number }>;
}

export const getLibrosLeidos = async (): Promise<LibrosLeidosStats> => {
  try {
    return await axios.get<LibrosLeidosStats>('/admin/analytics/libros-leidos');
  } catch (error) {
    console.error('Error al obtener estadísticas de libros leídos:', error);
    throw error;
  }
};

// Products Management
export interface ProductoVentasCount {
  total: number;
  pagadas: number;
  pendientes: number;
}

export const getProductoVentasCount = async (productoId: string): Promise<ProductoVentasCount> => {
  try {
    return await axios.get<ProductoVentasCount>(`/productos/${productoId}/ventas-count`);
  } catch (error) {
    console.error('Error al obtener ventas del producto:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de ventas de TODOS los productos en una sola query
 * Evita el problema N+1
 */
export const getProductosVentasCountBatch = async (): Promise<
  Record<string, ProductoVentasCount>
> => {
  try {
    return await axios.get<Record<string, ProductoVentasCount>>('/productos/ventas-count-batch');
  } catch (error) {
    console.error('Error al obtener ventas batch:', error);
    throw error;
  }
};

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

/** Distribución de estados de pago */
export interface PaymentStatusDistribution {
  estado: string;
  cantidad: number;
  monto: number;
  porcentaje: number;
}

/**
 * Obtener distribución de estados de pago
 * GET /pagos/dashboard/metricas (extrae distribucionEstados)
 */
export const getPaymentStatusDistribution = async (): Promise<PaymentStatusDistribution[]> => {
  try {
    const response = await axios.get<FinanceMetricsResponse>('/pagos/dashboard/metricas');
    return response.distribucionEstados.map((item) => ({
      estado: item.estado,
      cantidad: item.cantidad,
      monto: parseFloat(item.monto),
      porcentaje: parseFloat(item.porcentaje),
    }));
  } catch (error) {
    console.error('Error al obtener distribución de estados de pago:', error);
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

// ─────────────────────────────────────────────────────────────────────────────
// DISTRIBUCIÓN POR TIER
// ─────────────────────────────────────────────────────────────────────────────

/** Distribución de estudiantes por tier/plan */
export interface DistribucionTiers {
  STEAM_LIBROS: number;
  STEAM_ASINCRONICO: number;
  STEAM_SINCRONICO: number;
  SIN_PLAN: number;
  total: number;
}

/**
 * Obtener distribución de estudiantes por tier
 * GET /admin/estadisticas/distribucion-tiers
 */
export const getDistribucionTiers = async (): Promise<DistribucionTiers> => {
  try {
    return await axios.get<DistribucionTiers>('/admin/estadisticas/distribucion-tiers');
  } catch (error) {
    console.error('Error al obtener distribución por tiers:', error);
    throw error;
  }
};

export const getCombinedDashboardStats = async (): Promise<DashboardStats> => {
  const [dashboard, estadisticas, casas, retention] = await Promise.all([
    axios.get<AdminDashboardResponse>('/admin/dashboard'),
    getSystemStats(),
    getCasasEstadisticas(),
    getRetentionStats(2), // Solo últimos 2 meses para calcular crecimiento
  ]);

  // Calcular tasa de cobro
  const totalFacturado = estadisticas.ingresosTotal + estadisticas.pagosPendientes;
  const tasaCobro =
    totalFacturado > 0 ? Math.round((estadisticas.ingresosTotal / totalFacturado) * 1000) / 10 : 0;

  // Calcular crecimiento mensual desde datos de retención
  let crecimientoMensual = 0;
  if (retention.length >= 2) {
    const mesActual = retention[retention.length - 1];
    const mesAnterior = retention[retention.length - 2];
    if (mesActual && mesAnterior && mesAnterior.activos > 0) {
      crecimientoMensual = Math.round(
        ((mesActual.activos - mesAnterior.activos) / mesAnterior.activos) * 100,
      );
    }
  }

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
    estudiantesActivos: dashboard.activeMemberships,
    inscripcionesActivas: estadisticas.inscripcionesActivas,
    ingresosMes: estadisticas.ingresosTotal,
    ingresosPendientes: estadisticas.pagosPendientes,
    tasaCobro,
    crecimientoMensual,
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
  productoId: string;
  casaId: string | null;
  docenteId: string | null;
  cupoMaximo: number | null;
  horario: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  /** Override de planificación específica para esta comisión */
  planificacionId: string | null;
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
  /** Planificación asignada (si tiene override) */
  planificacion?: {
    id: string;
    titulo: string;
    cantidadClases: number;
  } | null;
  totalInscriptos?: number;
  cuposDisponibles?: number | null;
}

/** Inscripción en comisión */
export interface InscripcionComision {
  id: string;
  comisionId: string;
  estudianteId: string;
  estado: EstadoInscripcionComision;
  fechaInscripcion: string;
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
  productoId: string;
  casaId?: string | null;
  docenteId?: string | null;
  cupoMaximo?: number | null;
  horario?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  activo?: boolean;
  /** Override de planificación específica para esta comisión */
  planificacionId?: string | null;
}

/** DTO para inscribir estudiantes */
export interface InscribirEstudiantesDto {
  estudiantesIds: string[];
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
  productoId?: string;
  casaId?: string;
  docenteId?: string;
  activo?: boolean;
}): Promise<Comision[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.productoId) queryParams.append('productoId', params.productoId);
    if (params?.casaId) queryParams.append('casaId', params.casaId);
    if (params?.docenteId) queryParams.append('docenteId', params.docenteId);
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
 * GET /admin/comisiones?productoId=xxx
 */
export const getComisionesByProducto = async (productoId: string): Promise<Comision[]> => {
  return getComisiones({ productoId: productoId });
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
    fechaInscripcion: string;
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
 * Casa/Equipo del sistema (Quantum, Vertex, Pulsar)
 */
export interface Casa {
  id: string;
  nombre: string;
  emoji?: string;
  colorPrimary?: string;
}

/**
 * Obtener todas las casas/equipos
 * GET /casas
 */
export const getCasas = async (): Promise<Casa[]> => {
  try {
    return await axios.get('/casas');
  } catch (error) {
    console.error('Error al obtener casas:', error);
    throw error;
  }
};

// ============================================================================
// SISTEMA CASA/MUNDO 2026 - ASIGNACIONES DE DOCENTES
// ============================================================================

/** Tipos de Casa del sistema 2026 */
export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

/** Tipos de Mundo del sistema 2026 */
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';

/** Tipos de asignación de docente */
export type TipoAsignacionDocente = 'CLASE_GRUPOS' | 'COMISIONES' | 'AMBOS';

/** Asignación de docente a casa */
export interface DocenteCasa {
  id: string;
  docenteId: string;
  casaTipo: CasaTipo;
  asignadoEn: string;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    tipoAsignacion: TipoAsignacionDocente;
  };
}

/** Asignación de docente a mundo */
export interface DocenteMundo {
  id: string;
  docenteId: string;
  mundoTipo: MundoTipo;
  asignadoEn: string;
  docente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    tipoAsignacion: TipoAsignacionDocente;
  };
}

/** Perfil completo de asignaciones de docente */
export interface DocenteAsignacionesPerfil {
  id: string;
  nombre: string;
  apellido: string;
  tipoAsignacion: TipoAsignacionDocente;
  casas: DocenteCasa[];
  mundos: DocenteMundo[];
}

/** Filtros para listar docentes */
export interface FiltrosDocentes {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  tipoAsignacion?: TipoAsignacionDocente;
}

/**
 * Asignar una casa a un docente
 * POST /admin/docentes/:docenteId/casas
 */
export const asignarCasaDocente = async (
  docenteId: string,
  casaTipo: CasaTipo,
): Promise<DocenteCasa> => {
  try {
    return await axios.post(`/admin/docentes/${docenteId}/casas`, { casaTipo: casaTipo });
  } catch (error) {
    console.error('Error al asignar casa a docente:', error);
    throw error;
  }
};

/**
 * Remover una casa de un docente
 * DELETE /admin/docentes/:docenteId/casas/:casaTipo
 */
export const removerCasaDocente = async (
  docenteId: string,
  casaTipo: CasaTipo,
): Promise<{ mensaje: string }> => {
  try {
    return await axios.delete(`/admin/docentes/${docenteId}/casas/${casaTipo}`);
  } catch (error) {
    console.error('Error al remover casa de docente:', error);
    throw error;
  }
};

/**
 * Obtener casas asignadas a un docente
 * GET /admin/docentes/:docenteId/casas
 */
export const obtenerCasasDocente = async (docenteId: string): Promise<DocenteCasa[]> => {
  try {
    return await axios.get(`/admin/docentes/${docenteId}/casas`);
  } catch (error) {
    console.error('Error al obtener casas del docente:', error);
    throw error;
  }
};

/**
 * Listar docentes de una casa
 * GET /admin/casas/:casaTipo/docentes
 */
export const listarDocentesPorCasa = async (casaTipo: CasaTipo): Promise<DocenteCasa[]> => {
  try {
    return await axios.get(`/admin/casas/${casaTipo}/docentes`);
  } catch (error) {
    console.error('Error al listar docentes por casa:', error);
    throw error;
  }
};

/**
 * Asignar un mundo a un docente
 * POST /admin/docentes/:docenteId/mundos
 */
export const asignarMundoDocente = async (
  docenteId: string,
  mundoTipo: MundoTipo,
): Promise<DocenteMundo> => {
  try {
    return await axios.post(`/admin/docentes/${docenteId}/mundos`, { mundoTipo: mundoTipo });
  } catch (error) {
    console.error('Error al asignar mundo a docente:', error);
    throw error;
  }
};

/**
 * Remover un mundo de un docente
 * DELETE /admin/docentes/:docenteId/mundos/:mundoTipo
 */
export const removerMundoDocente = async (
  docenteId: string,
  mundoTipo: MundoTipo,
): Promise<{ mensaje: string }> => {
  try {
    return await axios.delete(`/admin/docentes/${docenteId}/mundos/${mundoTipo}`);
  } catch (error) {
    console.error('Error al remover mundo de docente:', error);
    throw error;
  }
};

/**
 * Obtener mundos asignados a un docente
 * GET /admin/docentes/:docenteId/mundos
 */
export const obtenerMundosDocente = async (docenteId: string): Promise<DocenteMundo[]> => {
  try {
    return await axios.get(`/admin/docentes/${docenteId}/mundos`);
  } catch (error) {
    console.error('Error al obtener mundos del docente:', error);
    throw error;
  }
};

/**
 * Listar docentes de un mundo
 * GET /admin/mundos/:mundoTipo/docentes
 */
export const listarDocentesPorMundo = async (mundoTipo: MundoTipo): Promise<DocenteMundo[]> => {
  try {
    return await axios.get(`/admin/mundos/${mundoTipo}/docentes`);
  } catch (error) {
    console.error('Error al listar docentes por mundo:', error);
    throw error;
  }
};

/**
 * Actualizar tipo de asignación del docente
 * PATCH /admin/docentes/:docenteId/tipo-asignacion
 */
export const actualizarTipoAsignacionDocente = async (
  docenteId: string,
  tipoAsignacion: TipoAsignacionDocente,
): Promise<{
  id: string;
  nombre: string;
  apellido: string;
  tipoAsignacion: TipoAsignacionDocente;
}> => {
  try {
    return await axios.patch(`/admin/docentes/${docenteId}/tipo-asignacion`, {
      tipoAsignacion: tipoAsignacion,
    });
  } catch (error) {
    console.error('Error al actualizar tipo de asignación:', error);
    throw error;
  }
};

/**
 * Obtener perfil completo de asignaciones del docente
 * GET /admin/docentes/:docenteId/asignaciones
 */
export const obtenerPerfilAsignacionesDocente = async (
  docenteId: string,
): Promise<DocenteAsignacionesPerfil> => {
  try {
    return await axios.get(`/admin/docentes/${docenteId}/asignaciones`);
  } catch (error) {
    console.error('Error al obtener perfil de asignaciones:', error);
    throw error;
  }
};

/**
 * Listar docentes con filtros de Casa/Mundo
 * GET /admin/docentes/filtrados
 */
export const listarDocentesFiltrados = async (
  filtros: FiltrosDocentes,
): Promise<DocenteAsignacionesPerfil[]> => {
  try {
    const params = new URLSearchParams();
    if (filtros.casaTipo) params.append('casaTipo', filtros.casaTipo);
    if (filtros.mundoTipo) params.append('mundoTipo', filtros.mundoTipo);
    if (filtros.tipoAsignacion) params.append('tipoAsignacion', filtros.tipoAsignacion);

    const url = params.toString()
      ? `/admin/docentes/filtrados?${params}`
      : '/admin/docentes/filtrados';
    return await axios.get(url);
  } catch (error) {
    console.error('Error al listar docentes filtrados:', error);
    throw error;
  }
};

// ============================================================================
// SISTEMA CASA/MUNDO 2026 - GRUPOS PEDAGÓGICOS
// ============================================================================

/** Grupo pedagógico con estadísticas */
export interface GrupoPedagogico {
  id: string;
  codigo: string;
  nombre: string | null;
  descripcion: string | null;
  casaTipo: CasaTipo | null;
  mundoTipo: MundoTipo | null;
  activo: boolean;
  edadMinima: number | null;
  edadMaxima: number | null;
  _count?: {
    claseGrupos: number;
    comisionesProducto: number;
  };
}

/** Filtros para grupos pedagógicos */
export interface FiltrosGrupoPedagogico {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  activo?: boolean;
}

/** DTO para actualizar grupo pedagógico */
export interface ActualizarGrupoPedagogicoDto {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  nombre?: string;
  descripcion?: string;
}

/** Estadísticas de grupos */
export interface EstadisticasGrupos {
  totalGrupos: number;
  porCasa: Array<{ casa: string; cantidad: number }>;
  porMundo: Array<{ mundo: string; cantidad: number }>;
}

/**
 * Listar grupos pedagógicos
 * GET /admin/grupos-pedagogicos
 */
export const listarGruposPedagogicos = async (
  filtros?: FiltrosGrupoPedagogico,
): Promise<GrupoPedagogico[]> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.casaTipo) params.append('casaTipo', filtros.casaTipo);
    if (filtros?.mundoTipo) params.append('mundoTipo', filtros.mundoTipo);
    if (filtros?.activo !== undefined) params.append('activo', String(filtros.activo));

    const url = params.toString()
      ? `/admin/grupos-pedagogicos?${params}`
      : '/admin/grupos-pedagogicos';
    return await axios.get(url);
  } catch (error) {
    console.error('Error al listar grupos pedagógicos:', error);
    throw error;
  }
};

/**
 * Obtener grupo pedagógico por ID
 * GET /admin/grupos-pedagogicos/:id
 */
export const obtenerGrupoPedagogico = async (id: string): Promise<GrupoPedagogico> => {
  try {
    return await axios.get(`/admin/grupos-pedagogicos/${id}`);
  } catch (error) {
    console.error('Error al obtener grupo pedagógico:', error);
    throw error;
  }
};

/**
 * Actualizar grupo pedagógico
 * PATCH /admin/grupos-pedagogicos/:id
 */
export const actualizarGrupoPedagogico = async (
  id: string,
  dto: ActualizarGrupoPedagogicoDto,
): Promise<GrupoPedagogico> => {
  try {
    return await axios.patch(`/admin/grupos-pedagogicos/${id}`, dto);
  } catch (error) {
    console.error('Error al actualizar grupo pedagógico:', error);
    throw error;
  }
};

/**
 * Migrar grupos legacy a Casa/Mundo
 * POST /admin/grupos-pedagogicos/migrar-legacy
 */
export const migrarGruposLegacy = async (): Promise<{
  mensaje: string;
  migrados: number;
  detalles?: Array<{
    id: string;
    codigo: string;
    casaTipo: CasaTipo | null;
    mundoTipo: MundoTipo | null;
  }>;
}> => {
  try {
    return await axios.post('/admin/grupos-pedagogicos/migrar-legacy');
  } catch (error) {
    console.error('Error al migrar grupos legacy:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de grupos
 * GET /admin/grupos-pedagogicos/estadisticas
 */
export const obtenerEstadisticasGrupos = async (): Promise<EstadisticasGrupos> => {
  try {
    return await axios.get('/admin/grupos-pedagogicos/estadisticas');
  } catch (error) {
    console.error('Error al obtener estadísticas de grupos:', error);
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
  /** @deprecated Sistema Sectores eliminado en Casa/Mundo 2026 */
  sectorId?: string;
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

// ============================================================================
// EXPORTACIÓN DE REPORTES CSV
// ============================================================================

/** Response de exportación CSV */
export interface ExportCSVResponse {
  filename: string;
  content: string;
  contentType: string;
}

/**
 * Exportar inscripciones como CSV
 * GET /admin/export/inscripciones
 */
export const exportInscripcionesCSV = async (filters?: {
  periodo?: string;
  estado?: string;
}): Promise<ExportCSVResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.estado) params.append('estado', filters.estado);

    const url = params.toString()
      ? `/admin/export/inscripciones?${params}`
      : '/admin/export/inscripciones';
    return await axios.get<ExportCSVResponse>(url);
  } catch (error) {
    console.error('Error al exportar inscripciones CSV:', error);
    throw error;
  }
};

/**
 * Exportar métricas financieras como CSV
 * GET /admin/export/metricas
 */
export const exportMetricasCSV = async (meses = 12): Promise<ExportCSVResponse> => {
  try {
    return await axios.get<ExportCSVResponse>(`/admin/export/metricas?meses=${meses}`);
  } catch (error) {
    console.error('Error al exportar métricas CSV:', error);
    throw error;
  }
};

/**
 * Descarga un archivo CSV en el navegador
 * Helper function para usar después de obtener el contenido
 */
export const downloadCSV = (response: ExportCSVResponse): void => {
  const blob = new Blob([response.content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = response.filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ============================================================================
// EXPORTACIÓN DE REPORTES PDF
// ============================================================================

/** Response de exportación PDF (base64) */
export interface ExportPDFResponse {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
}

/**
 * Exportar inscripciones como PDF
 * GET /admin/export/inscripciones/pdf
 */
export const exportInscripcionesPDF = async (filters?: {
  periodo?: string;
  estado?: string;
}): Promise<ExportPDFResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.periodo) params.append('periodo', filters.periodo);
    if (filters?.estado) params.append('estado', filters.estado);

    const url = params.toString()
      ? `/admin/export/inscripciones/pdf?${params}`
      : '/admin/export/inscripciones/pdf';
    return await axios.get<ExportPDFResponse>(url);
  } catch (error) {
    console.error('Error al exportar inscripciones PDF:', error);
    throw error;
  }
};

/**
 * Exportar métricas financieras como PDF
 * GET /admin/export/metricas/pdf
 */
export const exportMetricasPDF = async (meses = 12): Promise<ExportPDFResponse> => {
  try {
    return await axios.get<ExportPDFResponse>(`/admin/export/metricas/pdf?meses=${meses}`);
  } catch (error) {
    console.error('Error al exportar métricas PDF:', error);
    throw error;
  }
};

/**
 * Descarga un archivo PDF en el navegador
 * Helper function para usar después de obtener el contenido base64
 */
export const downloadPDF = (response: ExportPDFResponse): void => {
  // Decode base64 to binary
  const binaryString = atob(response.content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = response.filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ============================================================================
// PAGOS MANUALES
// ============================================================================

/** Inscripción pendiente de pago */
export interface InscripcionPendiente {
  id: string;
  periodo: string;
  estudiante: {
    id: string;
    nombre: string;
  };
  tutor: {
    id: string;
    nombre: string;
    email: string | null;
  };
  producto: string;
  precioFinal: number;
  estadoPago: string;
  fechaVencimiento: string | null;
}

/** Response paginada de inscripciones pendientes */
export interface InscripcionesPendientesResponse {
  data: InscripcionPendiente[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** DTO para registrar pago manual */
export interface RegistrarPagoManualDto {
  inscripcionId: string;
  monto: number;
  metodoPago: string;
  observaciones?: string;
  comprobante?: string;
}

/** Resultado de pago manual */
export interface PagoManualResult {
  success: boolean;
  inscripcion: {
    id: string;
    periodo: string;
    estudiante: string;
    montoOriginal: number;
    montoPagado: number;
    estadoAnterior: string;
    estadoNuevo: string;
  };
}

/**
 * Obtener inscripciones pendientes de pago
 * GET /admin/pagos/pendientes
 */
export const getInscripcionesPendientes = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<InscripcionesPendientesResponse> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    const url = params.toString() ? `/admin/pagos/pendientes?${params}` : '/admin/pagos/pendientes';
    return await axios.get<InscripcionesPendientesResponse>(url);
  } catch (error) {
    console.error('Error al obtener inscripciones pendientes:', error);
    throw error;
  }
};

/**
 * Registrar pago manual
 * POST /admin/pagos/registrar
 */
export const registrarPagoManual = async (
  dto: RegistrarPagoManualDto,
): Promise<PagoManualResult> => {
  try {
    return await axios.post<PagoManualResult>('/admin/pagos/registrar', dto);
  } catch (error) {
    console.error('Error al registrar pago manual:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ALERTAS ADMIN
// ─────────────────────────────────────────────────────────────────────────────

export interface AlertaAdmin {
  id: string;
  descripcion: string;
  fecha: string;
  resuelta: boolean;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    nivelEscolar: string;
  };
  clase: {
    id: string;
    nombre: string;
    fechaHoraInicio: string;
    duracionMinutos: number;
  };
  createdAt: string;
}

/**
 * Listar alertas pendientes
 * GET /admin/alertas
 */
export const getAlertas = async (): Promise<AlertaAdmin[]> => {
  try {
    return await axios.get<AlertaAdmin[]>('/admin/alertas');
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw error;
  }
};

/**
 * Resolver (marcar como resuelta) una alerta
 * PATCH /admin/alertas/:id/resolver
 */
export const resolverAlerta = async (
  id: string,
): Promise<{ message: string; alertaId: string }> => {
  try {
    return await axios.patch<{ message: string; alertaId: string }>(
      `/admin/alertas/${id}/resolver`,
    );
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    throw error;
  }
};

/**
 * Obtener sugerencia de solución para una alerta
 * GET /admin/alertas/:id/sugerencia
 */
export const getSugerenciaAlerta = async (
  id: string,
): Promise<{ alertaId: string; estudiante: string; problema: string; sugerencia: string }> => {
  try {
    return await axios.get<{
      alertaId: string;
      estudiante: string;
      problema: string;
      sugerencia: string;
    }>(`/admin/alertas/${id}/sugerencia`);
  } catch (error) {
    console.error('Error al obtener sugerencia de alerta:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLANIFICACIONES
// ─────────────────────────────────────────────────────────────────────────────

export interface Planificacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  cantidadClases: number;
  casaTipo: 'QUANTUM' | 'VERTEX' | 'PULSAR';
  mundoTipo: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
  createdAt: string;
  updatedAt: string;
}

export interface PlanificacionesResponse {
  data: Planificacion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Listar planificaciones con filtros
 * GET /admin/planificaciones
 */
export const getPlanificaciones = async (params?: {
  page?: number;
  limit?: number;
  estado?: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
  casaTipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR';
  mundoTipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
}): Promise<PlanificacionesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.casaTipo) queryParams.append('casaTipo', params.casaTipo);
    if (params?.mundoTipo) queryParams.append('mundoTipo', params.mundoTipo);

    const url = queryParams.toString()
      ? `/admin/planificaciones?${queryParams.toString()}`
      : '/admin/planificaciones';

    return await axios.get<PlanificacionesResponse>(url);
  } catch (error) {
    console.error('Error al obtener planificaciones:', error);
    throw error;
  }
};

/**
 * Obtener planificación por ID
 * GET /admin/planificaciones/:id
 */
export const getPlanificacionById = async (id: string): Promise<Planificacion> => {
  try {
    return await axios.get<Planificacion>(`/admin/planificaciones/${id}`);
  } catch (error) {
    console.error('Error al obtener planificación:', error);
    throw error;
  }
};

/**
 * Asignar planificación a un producto (Club)
 * PUT /productos/:id/planificacion
 */
export interface AsignarPlanificacionResponse {
  success: boolean;
  message: string;
  data: Producto & {
    planificacion?: Planificacion;
  };
}

export const asignarPlanificacionProducto = async (
  productoId: string,
  planificacionId: string,
): Promise<AsignarPlanificacionResponse> => {
  try {
    return await axios.put<AsignarPlanificacionResponse>(`/productos/${productoId}/planificacion`, {
      planificacionId,
    });
  } catch (error) {
    console.error('Error al asignar planificación al producto:', error);
    throw error;
  }
};

/**
 * Quitar planificación de un producto
 * DELETE /productos/:id/planificacion
 */
export const quitarPlanificacionProducto = async (
  productoId: string,
): Promise<{ success: boolean; message: string; data: Producto }> => {
  try {
    return await axios.delete<{ success: boolean; message: string; data: Producto }>(
      `/productos/${productoId}/planificacion`,
    );
  } catch (error) {
    console.error('Error al quitar planificación del producto:', error);
    throw error;
  }
};

/**
 * Obtener producto con planificación y ClaseGrupos
 * GET /productos/:id/detalle
 */
export interface ProductoConPlanificacion extends Producto {
  planificacion?: Planificacion | null;
  claseGrupos?: Array<{
    id: string;
    nombre: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    docente?: {
      id: string;
      nombre: string;
      apellido: string;
    };
  }>;
}

export const getProductoConPlanificacion = async (
  id: string,
): Promise<ProductoConPlanificacion> => {
  try {
    return await axios.get<ProductoConPlanificacion>(`/productos/${id}/detalle`);
  } catch (error) {
    console.error('Error al obtener producto con planificación:', error);
    throw error;
  }
};

// ============================================================================
// DEAD LETTER QUEUE (DLQ) - WEBHOOKS FALLIDOS
// ============================================================================

/** Estado de webhook en DLQ */
export type DlqStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'ABANDONED';

/** Item de webhook fallido */
export interface WebhookFailedItem {
  id: string;
  paymentId: string;
  webhookType: string;
  payload: Record<string, unknown>;
  errorMessage: string;
  errorStack: string | null;
  retries: number;
  status: DlqStatus;
  lastRetryAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Estadísticas de DLQ */
export interface DlqStats {
  byStatus: Record<DlqStatus, number>;
  totalPending: number;
  oldestPending: {
    id: string;
    createdAt: string;
    paymentId: string;
  } | null;
}

/** Respuesta paginada de DLQ */
export interface DlqListResponse {
  items: WebhookFailedItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Filtros para listar DLQ */
export interface DlqFilters {
  status?: DlqStatus;
  paymentId?: string;
  webhookType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Obtener estadísticas de webhooks en DLQ
 * GET /admin/webhooks/dlq/stats
 */
export const getDlqStats = async (): Promise<DlqStats> => {
  try {
    return await axios.get<DlqStats>('/admin/webhooks/dlq/stats');
  } catch (error) {
    console.error('Error al obtener estadísticas de DLQ:', error);
    throw error;
  }
};

/**
 * Listar webhooks en DLQ con filtros
 * GET /admin/webhooks/dlq
 */
export const getDlqList = async (filters?: DlqFilters): Promise<DlqListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentId) params.append('paymentId', filters.paymentId);
    if (filters?.webhookType) params.append('webhookType', filters.webhookType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const url = params.toString() ? `/admin/webhooks/dlq?${params}` : '/admin/webhooks/dlq';
    return await axios.get<DlqListResponse>(url);
  } catch (error) {
    console.error('Error al obtener lista de DLQ:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un webhook fallido
 * GET /admin/webhooks/dlq/:id
 */
export const getDlqById = async (id: string): Promise<WebhookFailedItem> => {
  try {
    return await axios.get<WebhookFailedItem>(`/admin/webhooks/dlq/${id}`);
  } catch (error) {
    console.error('Error al obtener detalle de webhook:', error);
    throw error;
  }
};

/**
 * Marcar webhook como resuelto
 * POST /admin/webhooks/dlq/:id/resolve
 */
export const resolveDlqWebhook = async (
  id: string,
  resolutionNotes?: string,
): Promise<WebhookFailedItem> => {
  try {
    return await axios.post<WebhookFailedItem>(`/admin/webhooks/dlq/${id}/resolve`, {
      resolutionNotes,
    });
  } catch (error) {
    console.error('Error al resolver webhook:', error);
    throw error;
  }
};

/**
 * Marcar webhook como abandonado
 * POST /admin/webhooks/dlq/:id/abandon
 */
export const abandonDlqWebhook = async (
  id: string,
  resolutionNotes?: string,
): Promise<WebhookFailedItem> => {
  try {
    return await axios.post<WebhookFailedItem>(`/admin/webhooks/dlq/${id}/abandon`, {
      resolutionNotes,
    });
  } catch (error) {
    console.error('Error al abandonar webhook:', error);
    throw error;
  }
};

/**
 * Limpiar webhooks antiguos resueltos/abandonados
 * POST /admin/webhooks/dlq/cleanup
 */
export const cleanupDlq = async (): Promise<{ deletedCount: number; message: string }> => {
  try {
    return await axios.post<{ deletedCount: number; message: string }>(
      '/admin/webhooks/dlq/cleanup',
    );
  } catch (error) {
    console.error('Error al limpiar DLQ:', error);
    throw error;
  }
};

// ============================================================================
// MÉTRICAS DE SUSCRIPCIONES (Mercado Pago)
// ============================================================================

/** Métricas de suscripciones */
export interface SuscripcionesMetricas {
  totalActivas: number;
  totalMorosas: number;
  totalEnGracia: number;
  totalCanceladasMes: number;
  ingresosMes: number;
  tasaCancelacion: number;
}

/**
 * Obtener métricas de suscripciones
 * GET /suscripciones/admin/metricas
 */
export const getSuscripcionesMetricas = async (): Promise<SuscripcionesMetricas> => {
  try {
    return await axios.get<SuscripcionesMetricas>('/suscripciones/admin/metricas');
  } catch (error) {
    console.error('Error al obtener métricas de suscripciones:', error);
    throw error;
  }
};

/** Suscripción morosa */
export interface SuscripcionMorosa {
  id: string;
  tutorNombre: string;
  tutorEmail: string | null;
  montoMensual: number;
  diasMorosos: number;
  enGracia: boolean;
  fechaUltimoPago: string | null;
}

/** Response de suscripciones morosas */
export interface MorosasResponse {
  morosas: SuscripcionMorosa[];
  total: number;
}

/**
 * Obtener suscripciones morosas
 * GET /suscripciones/admin/morosas
 */
export const getSuscripcionesMorosas = async (): Promise<MorosasResponse> => {
  try {
    return await axios.get<MorosasResponse>('/suscripciones/admin/morosas');
  } catch (error) {
    console.error('Error al obtener suscripciones morosas:', error);
    throw error;
  }
};

// ============================================================================
// QUEUE METRICS (BullMQ)
// ============================================================================

/** Estado de salud de la cola */
export type QueueHealth = 'healthy' | 'degraded' | 'critical';

/** Estadísticas de cola BullMQ */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  health: QueueHealth;
  failedRate: string;
  timestamp: string;
}

/** Job fallido */
export interface FailedJob {
  id: string;
  name: string;
  data: Record<string, unknown>;
  failedReason: string;
  attemptsMade: number;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
}

/**
 * Obtener estadísticas de colas BullMQ
 * GET /queues/metrics/stats
 */
export const getQueueStats = async (): Promise<QueueStats> => {
  try {
    return await axios.get<QueueStats>('/queues/metrics/stats');
  } catch (error) {
    console.error('Error al obtener estadísticas de cola:', error);
    throw error;
  }
};

/**
 * Obtener últimos jobs fallidos
 * GET /queues/metrics/failed
 */
export const getFailedJobs = async (limit = 50): Promise<FailedJob[]> => {
  try {
    return await axios.get<FailedJob[]>(`/queues/metrics/failed?limit=${limit}`);
  } catch (error) {
    console.error('Error al obtener jobs fallidos:', error);
    throw error;
  }
};

// ============================================================================
// AUDIT LOGS
// ============================================================================

/** Severidad de audit log */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/** Categoría de audit log */
export type AuditCategory =
  | 'auth'
  | 'payment'
  | 'user_management'
  | 'data_modification'
  | 'security'
  | 'system';

/** Item de audit log */
export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string | null;
  userType: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  severity: AuditSeverity;
  category: AuditCategory;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
}

/** Estadísticas de audit logs */
export interface AuditLogsStats {
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  topActions: Record<string, number>;
  total: number;
  totalCritical: number;
  mostRecent: {
    id: string;
    timestamp: string;
    action: string;
  } | null;
}

/** Respuesta paginada de audit logs */
export interface AuditLogsListResponse {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Filtros para listar audit logs */
export interface AuditLogsFilters {
  userId?: string;
  userEmail?: string;
  action?: string;
  entityType?: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Obtener estadísticas de audit logs
 * GET /admin/audit-logs/stats
 */
export const getAuditLogsStats = async (): Promise<AuditLogsStats> => {
  try {
    return await axios.get<AuditLogsStats>('/admin/audit-logs/stats');
  } catch (error) {
    console.error('Error al obtener estadísticas de audit logs:', error);
    throw error;
  }
};

/**
 * Listar audit logs con filtros
 * GET /admin/audit-logs
 */
export const getAuditLogsList = async (
  filters?: AuditLogsFilters,
): Promise<AuditLogsListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.userEmail) params.append('userEmail', filters.userEmail);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const url = params.toString() ? `/admin/audit-logs?${params}` : '/admin/audit-logs';
    return await axios.get<AuditLogsListResponse>(url);
  } catch (error) {
    console.error('Error al obtener lista de audit logs:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un audit log
 * GET /admin/audit-logs/:id
 */
export const getAuditLogById = async (id: string): Promise<AuditLogItem> => {
  try {
    return await axios.get<AuditLogItem>(`/admin/audit-logs/${id}`);
  } catch (error) {
    console.error('Error al obtener detalle de audit log:', error);
    throw error;
  }
};

/**
 * Obtener historial de una entidad
 * GET /admin/audit-logs/entity/:entityType/:entityId
 */
export const getAuditLogEntityHistory = async (
  entityType: string,
  entityId: string,
): Promise<AuditLogItem[]> => {
  try {
    return await axios.get<AuditLogItem[]>(`/admin/audit-logs/entity/${entityType}/${entityId}`);
  } catch (error) {
    console.error('Error al obtener historial de entidad:', error);
    throw error;
  }
};

/**
 * Obtener logs de un usuario
 * GET /admin/audit-logs/user/:userId
 */
export const getAuditLogUserHistory = async (userId: string): Promise<AuditLogItem[]> => {
  try {
    return await axios.get<AuditLogItem[]>(`/admin/audit-logs/user/${userId}`);
  } catch (error) {
    console.error('Error al obtener logs de usuario:', error);
    throw error;
  }
};
