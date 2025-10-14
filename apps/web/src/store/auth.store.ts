import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, RegisterData } from '@/lib/api/auth.api';

/**
 * Interface del usuario (versión simplificada para el store)
 */
export type UserRole = 'tutor' | 'docente' | 'admin' | 'estudiante';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: UserRole;
  dni?: string | null;
  telefono?: string | null;
  fecha_registro?: string;
  ha_completado_onboarding?: boolean;
  titulo?: string | null;
  bio?: string | null;
  // Campos adicionales para estudiantes
  equipo_id?: string | null;
  puntos_totales?: number;
  nivel_actual?: number;
}

/**
 * Interface del estado de autenticación
 */
interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  loginEstudiante: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

/**
 * Store de autenticación con Zustand
 *
 * Características:
 * - Persistencia en localStorage de user y token
 * - Manejo automático de isAuthenticated
 * - Acciones async para login, register, logout
 * - checkAuth para restaurar sesión al cargar la app
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Login: Autentica al usuario y guarda el token
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @throws Error si las credenciales son inválidas
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Limpiar token previo antes de intentar login
        localStorage.removeItem('auth-token');

        try {
          const response = await authApi.login({ email, password });

          // Guardar token en localStorage (para el interceptor de axios)
          localStorage.setItem('auth-token', response.access_token);

          // Actualizar estado
          set({
            user: response.user as User,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error; // Propagar error para manejo en componente
        }
      },

      /**
       * Login Estudiante: Autentica a un estudiante con sus credenciales propias
       * @param email - Email del estudiante
       * @param password - Contraseña del estudiante
       * @throws Error si las credenciales son inválidas
       */
      loginEstudiante: async (email: string, password: string) => {
        set({ isLoading: true });

        // Limpiar token previo antes de intentar login
        localStorage.removeItem('auth-token');

        try {
          const response = await authApi.loginEstudiante({ email, password });

          // Guardar token en localStorage (para el interceptor de axios)
          localStorage.setItem('auth-token', response.access_token);

          // Actualizar estado
          set({
            user: response.user as User,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error; // Propagar error para manejo en componente
        }
      },

      /**
       * Register: Registra un nuevo usuario y hace login automáticamente
       * @param data - Datos del nuevo usuario
       * @throws Error si el email ya existe o los datos son inválidos
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          // Registrar usuario
          await authApi.register(data);

          // Hacer login automáticamente después del registro
          await get().login(data.email, data.password);
        } catch (error) {
          set({ isLoading: false });
          throw error; // Propagar error para manejo en componente
        }
      },

      /**
       * Logout: Cierra la sesión del usuario
       * Limpia el estado y elimina el token de localStorage
       */
      logout: async () => {
        try {
          // Intentar llamar al endpoint de logout del backend
          // (opcional, el token se invalida en el cliente de todos modos)
          await authApi.logout();
        } catch (error) {
          // Ignorar errores del backend en logout
          console.error('Error en logout del backend:', error);
        } finally {
          // Limpiar token de localStorage
          localStorage.removeItem('auth-token');

          // Limpiar estado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /**
       * CheckAuth: Verifica si hay una sesión activa al cargar la app
       * Lee el token de localStorage y obtiene el perfil del usuario
       * Si el token es inválido o expiró, limpia el estado
       */
      checkAuth: async () => {
        const token = localStorage.getItem('auth-token');

        if (!token) {
          // No hay token, usuario no autenticado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        set({ isLoading: true });

        try {
          // Obtener perfil del usuario usando el token
          const profile = await authApi.getProfile();

          // Actualizar estado con los datos del usuario
          set({
            user: profile as User,
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido o expirado
          // Limpiar todo (el interceptor ya redirigió a /login si fue 401)
          localStorage.removeItem('auth-token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /**
       * SetUser: Actualiza los datos del usuario en el estado
       * Útil para actualizar el perfil sin hacer logout/login
       * @param user - Nuevos datos del usuario
       */
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      // Configuración de persistencia
      name: 'auth-storage', // Nombre del key en localStorage
      partialize: (state) => ({
        // Persistir user, token e isAuthenticated
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
