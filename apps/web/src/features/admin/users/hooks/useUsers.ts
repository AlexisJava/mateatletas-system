import { useUsersStore } from '../store/users.store';

// Selector hooks para optimizar re-renders
export const useUsers = () => useUsersStore((state) => state.users);
export const useUsersLoading = () => useUsersStore((state) => state.isLoading);
export const useUsersError = () => useUsersStore((state) => state.error);

// Action hooks
export const useFetchUsers = () => useUsersStore((state) => state.fetchUsers);
export const useChangeUserRole = () => useUsersStore((state) => state.changeUserRole);
export const useUpdateUserRoles = () => useUsersStore((state) => state.updateUserRoles);
export const useDeleteUser = () => useUsersStore((state) => state.deleteUser);
export const useClearUsersError = () => useUsersStore((state) => state.clearError);
export const useResetUsers = () => useUsersStore((state) => state.reset);
