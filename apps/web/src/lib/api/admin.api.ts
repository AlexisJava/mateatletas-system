/**
 * Admin API Client
 */

import axios from '@/lib/axios';
import { DashboardData, AdminUser, ChangeRoleDto, UpdateRolesDto, SystemStats } from '@/types/admin.types';
import type { ClaseListado } from '@/types/admin-clases.types';
import type { Producto } from '@/types/catalogo.types';
import type { CrearProductoDto } from './catalogo.api';
import { z } from 'zod';

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
  return axios.get<DashboardData>('/admin/dashboard');
};

export const getSystemStats = async (): Promise<SystemStats> => {
  return axios.get<SystemStats>('/admin/estadisticas');
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
  return axios.get<AdminUser[]>('/admin/usuarios');
};

export const changeUserRole = async (userId: string, data: ChangeRoleDto): Promise<AdminUser> => {
  return axios.post<AdminUser>(`/admin/usuarios/${userId}/role`, data);
};

export const updateUserRoles = async (userId: string, data: UpdateRolesDto): Promise<{ message: string; userId: string; roles: string[] }> => {
  return axios.put<{ message: string; userId: string; roles: string[] }>(`/admin/usuarios/${userId}/roles`, data);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`/admin/usuarios/${userId}`);
};

export const getAllClasses = async (): Promise<ClasesResponse> => {
  const response = await axios.get('/clases/admin/todas');
  // Backend retorna { data: [...], meta: {...} }, validar con schema completo
  const parsed = clasesResponseSchema.safeParse(response);

  if (parsed.success) {
    return parsed.data;
  }

  // Fallback: si no tiene meta, extraer solo el array y envolver
  const list = clasesListSchema.parse(response.data);
  return { data: list };
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
  return axios.post('/clases', data);
};

export const cancelarClase = async (claseId: string) => {
  return axios.patch(`/clases/${claseId}/cancelar`);
};

export const eliminarClase = async (claseId: string) => {
  return axios.delete(`/clases/${claseId}`);
};

export const obtenerClase = async (claseId: string) => {
  return axios.get(`/clases/${claseId}`);
};

export const getRutasCurriculares = async () => {
  const response = await axios.get('/clases/metadata/rutas-curriculares');
  // ✅ Validar con schema Zod (interceptor ya extrajo .data)
  return rutasListSchema.parse(response);
};

export const getDocentes = async () => {
  const response = await axios.get('/docentes');
  // ✅ Backend retorna { data: [...], meta: {...} }, extraer solo array
  return docentesListSchema.parse(response.data);
};

export const getSectores = async () => {
  const response = await axios.get('/admin/sectores');
  // ✅ Validar con schema Zod (interceptor ya extrajo .data)
  return sectoresListSchema.parse(response);
};

// Products Management
export const getAllProducts = async (includeInactive = true): Promise<Producto[]> => {
  const response = await axios.get(`/productos?soloActivos=${!includeInactive}`);
  return productosListSchema.parse(response);
};

export const getProductById = async (id: string): Promise<Producto> => {
  const response = await axios.get(`/productos/${id}`);
  return productoSchema.parse(response);
};

export const createProduct = async (data: CrearProductoDto): Promise<Producto> => {
  const response = await axios.post('/productos', data);
  return productoSchema.parse(response);
};

export const updateProduct = async (
  id: string,
  data: Partial<CrearProductoDto>,
): Promise<Producto> => {
  const response = await axios.patch(`/productos/${id}`, data);
  return productoSchema.parse(response);
};

export const deleteProduct = async (id: string, hardDelete = false) => {
  return axios.delete(`/productos/${id}?hardDelete=${hardDelete}`);
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
  // Primero registramos como tutor
  const newUser = await axios.post('/auth/register', data);

  // Luego cambiamos el rol a admin
  const adminUser = await changeUserRole(newUser.user.id, { role: 'admin' });

  return adminUser;
};
