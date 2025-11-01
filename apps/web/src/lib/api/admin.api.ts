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
} from '@/types/admin.types';
import type { Producto } from '@/types/catalogo.types';
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
import { sectoresListSchema } from '@/lib/schemas/sector.schema';
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
    return await axios.post<AdminUser>(
      `/admin/usuarios/${userId}/role`,
      data
    );
  } catch (error) {
    console.error('Error al cambiar el rol del usuario:', error);
    throw error;
  }
};

export const updateUserRoles = async (userId: string, data: UpdateRolesDto): Promise<{ message: string; userId: string; roles: string[] }> => {
  try {
    // El interceptor ya retorna response.data directamente
    return await axios.put<{ message: string; userId: string; roles: string[] }>(
      `/admin/usuarios/${userId}/roles`,
      data
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

    // Fallback: si no tiene meta, extraer solo el array y envolver
    const list = clasesListSchema.parse(response).map((clase) => ({
      ...clase,
      ruta_curricular: clase.ruta_curricular ?? clase.rutaCurricular ?? undefined,
    }));
    return { data: list, meta: undefined };
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

export const getSectores = async () => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get('/admin/sectores');
    return sectoresListSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener los sectores (admin):', error);
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
    const response = await axios.post<RegisterResponse>('/auth/register', data) as RegisterResponse;

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
