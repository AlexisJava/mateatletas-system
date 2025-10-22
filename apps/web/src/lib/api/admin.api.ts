/**
 * Admin API Client
 */

import axios from '@/lib/axios';
import { DashboardData, AdminUser, ChangeRoleDto, UpdateRolesDto, SystemStats } from '@/types/admin.types';
import type { ClaseListado } from '@/types/admin-clases.types';
import type { Producto } from '@/types/catalogo.types';
import { z } from 'zod';

// Schemas Zod para validación runtime
import { clasesListSchema, clasesResponseSchema } from '@/lib/schemas/clase.schema';
import { docentesListSchema } from '@/lib/schemas/docente.schema';
import { rutasListSchema } from '@/lib/schemas/ruta.schema';
import { sectoresListSchema } from '@/lib/schemas/sector.schema';
import {
  productosListSchema,
  productoSchema,
  createProductoSchema,
  updateProductoSchema,
  type CreateProductoDto,
  type UpdateProductoDto,
} from '@mateatletas/contracts';

export const getDashboard = async (): Promise<DashboardData> => {
  return axios.get('/admin/dashboard') as Promise<DashboardData>;
};

export const getSystemStats = async (): Promise<SystemStats> => {
  return axios.get('/admin/estadisticas') as Promise<SystemStats>;
};

export const getAllUsers = async (): Promise<AdminUser[]> => {
  return axios.get('/admin/usuarios') as Promise<AdminUser[]>;
};

export const changeUserRole = async (userId: string, data: ChangeRoleDto): Promise<AdminUser> => {
  return axios.post(`/admin/usuarios/${userId}/role`, data) as Promise<AdminUser>;
};

export const updateUserRoles = async (userId: string, data: UpdateRolesDto): Promise<{ message: string; userId: string; roles: string[] }> => {
  return axios.put(`/admin/usuarios/${userId}/roles`, data) as Promise<{ message: string; userId: string; roles: string[] }>;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axios.delete(`/admin/usuarios/${userId}`);
};

const clasesListOrResponseSchema = z.union([clasesListSchema, clasesResponseSchema]);

export const getAllClasses = async (): Promise<ClaseListado[]> => {
  const response = await axios.get('/clases/admin/todas');
  const parsed = clasesListOrResponseSchema.parse(response);
  return (Array.isArray(parsed) ? parsed : parsed.data) as ClaseListado[];
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

export const cancelClass = async (claseId: string) => {
  return axios.patch(`/clases/${claseId}/cancelar`);
};

export const getRutasCurriculares = async () => {
  const response = await axios.get('/clases/metadata/rutas-curriculares');
  // ✅ Validar con schema Zod
  return rutasListSchema.parse(response);
};

export const getDocentes = async () => {
  const response = await axios.get('/docentes');
  // ✅ Validar con schema Zod
  return docentesListSchema.parse(response);
};

export const getSectores = async () => {
  const response = await axios.get('/admin/sectores');
  // ✅ Validar con schema Zod
  return sectoresListSchema.parse(response);
};

// Products Management
export const getAllProducts = async (includeInactive = true): Promise<Producto[]> => {
  const response = await axios.get(`/productos?soloActivos=${!includeInactive}`);
  return productosListSchema.parse(response) as Producto[];
};

export const getProductById = async (id: string): Promise<Producto> => {
  const response = await axios.get(`/productos/${id}`);
  return productoSchema.parse(response) as Producto;
};

export const createProduct = async (data: CreateProductoDto): Promise<Producto> => {
  const payload = createProductoSchema.parse(data);
  const response = await axios.post('/productos', payload);
  return productoSchema.parse(response) as Producto;
};

export const updateProduct = async (id: string, data: UpdateProductoDto): Promise<Producto> => {
  const payload = updateProductoSchema.parse(data);
  const response = await axios.patch(`/productos/${id}`, payload);
  return productoSchema.parse(response) as Producto;
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
