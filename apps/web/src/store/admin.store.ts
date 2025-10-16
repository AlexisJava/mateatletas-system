import { create } from 'zustand';
import { DashboardData, AdminUser, SystemStats } from '@/types/admin.types';
import * as adminApi from '@/lib/api/admin.api';
import type { Clase } from '@/types/clases.types';
import type { Producto } from '@/types/catalogo.types';
import type { CrearProductoDto } from '@/lib/api/catalogo.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface CrearClaseDto {
  rutaCurricularId: string;
  docenteId: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  cuposMaximo: number;
  productoId?: string;
}

interface AdminStore {
  dashboard: DashboardData | null;
  stats: SystemStats | null;
  users: AdminUser[];
  classes: Clase[];
  products: Producto[];
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchClasses: () => Promise<void>;
  fetchProducts: (includeInactive?: boolean) => Promise<void>;
  createClass: (data: CrearClaseDto) => Promise<boolean>;
  cancelClass: (claseId: string) => Promise<boolean>;
  createProduct: (data: CrearProductoDto) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<CrearProductoDto>) => Promise<boolean>;
  deleteProduct: (id: string, hardDelete?: boolean) => Promise<boolean>;
  changeUserRole: (userId: string, role: 'tutor' | 'docente' | 'admin') => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  dashboard: null,
  stats: null,
  users: [],
  classes: [],
  products: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminApi.getDashboard();
      set({ dashboard: data, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading dashboard'), isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await adminApi.getSystemStats();
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading stats'), isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await adminApi.getAllUsers();
      set({ users, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading users'), isLoading: false });
    }
  },

  changeUserRole: async (userId: string, role: 'tutor' | 'docente' | 'admin'): Promise<boolean> => {
    try {
      await adminApi.changeUserRole(userId, { role });
      await get().fetchUsers();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error changing role') });
      return false;
    }
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await adminApi.deleteUser(userId);
      await get().fetchUsers();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error deleting user') });
      return false;
    }
  },

  fetchClasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const classes = await adminApi.getAllClasses() as unknown as Clase[];
      set({ classes, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading classes'), isLoading: false });
    }
  },

  createClass: async (data: CrearClaseDto): Promise<boolean> => {
    try {
      await adminApi.createClass(data);
      await get().fetchClasses();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error creating class') });
      return false;
    }
  },

  cancelClass: async (claseId: string): Promise<boolean> => {
    try {
      await adminApi.cancelClass(claseId);
      await get().fetchClasses();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error canceling class') });
      return false;
    }
  },

  fetchProducts: async (includeInactive = true) => {
    set({ isLoading: true, error: null });
    try {
      const products = await adminApi.getAllProducts(includeInactive) as unknown as Producto[];
      set({ products, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading products'), isLoading: false });
    }
  },

  createProduct: async (data: CrearProductoDto): Promise<boolean> => {
    try {
      await adminApi.createProduct(data as unknown as Record<string, unknown>);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error creating product') });
      return false;
    }
  },

  updateProduct: async (id: string, data: Partial<CrearProductoDto>): Promise<boolean> => {
    try {
      await adminApi.updateProduct(id, data);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error updating product') });
      return false;
    }
  },

  deleteProduct: async (id: string, hardDelete = false): Promise<boolean> => {
    try {
      await adminApi.deleteProduct(id, hardDelete);
      await get().fetchProducts();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error deleting product') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ dashboard: null, stats: null, users: [], classes: [], products: [], isLoading: false, error: null }),
}));
