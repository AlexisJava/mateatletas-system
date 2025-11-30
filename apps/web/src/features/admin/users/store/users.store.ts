import { create } from 'zustand';
import { AdminUser } from '@/types/admin.types';
import * as adminApi from '@/lib/api/admin.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface UsersStore {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  changeUserRole: (_userId: string, _role: 'tutor' | 'docente' | 'admin') => Promise<boolean>;
  updateUserRoles: (
    _userId: string,
    _roles: ('tutor' | 'docente' | 'admin' | 'estudiante')[],
  ) => Promise<boolean>;
  deleteUser: (_userId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

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

  updateUserRoles: async (
    userId: string,
    roles: ('tutor' | 'docente' | 'admin' | 'estudiante')[],
  ): Promise<boolean> => {
    try {
      await adminApi.updateUserRoles(userId, { roles });
      await get().fetchUsers();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error updating roles') });
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
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ users: [], isLoading: false, error: null }),
}));
