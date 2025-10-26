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
  roles?: UserRole[]; // Array de roles para multi-rol
  debe_cambiar_password?: boolean; // Flag para forzar cambio de contraseña
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
  debe_cambiar_password?: boolean;
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
  selectedRole: UserRole | null; // Rol activo cuando el usuario tiene múltiples roles

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  loginEstudiante: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  setSelectedRole: (role: UserRole) => void;
  cambiarPassword: (
    passwordActual: string,
    nuevaPassword: string,
  ) => Promise<void>;
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
      selectedRole: null,

      /**
       * Login: Autentica al usuario
       * El token se guarda automáticamente como httpOnly cookie en el backend
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @throws Error si las credenciales son inválidas
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, selectedRole: null });

        try {
          const response = await authApi.login({ email, password });

          set({
            user: response.user as User,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            selectedRole: null,
          });
        } catch (error: unknown) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Login Estudiante: Autentica a un estudiante con sus credenciales propias
       * El token se guarda automáticamente como httpOnly cookie en el backend
       * @param email - Email del estudiante
       * @param password - Contraseña del estudiante
       * @throws Error si las credenciales son inválidas
       */
      loginEstudiante: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.loginEstudiante({ email, password });

          // Ya NO guardamos token en localStorage (se usa httpOnly cookie)
          // El backend configura la cookie automáticamente

          // Actualizar estado (sin token)
          set({
            user: response.user as User,
            token: null, // Ya no guardamos el token aquí
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
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
        } catch (error: unknown) {
          set({ isLoading: false });
          throw error; // Propagar error para manejo en componente
        }
      },

      /**
       * Logout: Cierra la sesión del usuario
       * El backend elimina la httpOnly cookie automáticamente
       */
      logout: async () => {
        try {
          // Llamar al endpoint de logout del backend
          // El backend limpia la cookie httpOnly automáticamente
          await authApi.logout();
        } catch (error: unknown) {
          // Ignorar errores del backend en logout
          console.error('Error en logout del backend:', error);
        } finally {
          // Ya NO necesitamos limpiar localStorage (no hay token aquí)

          // Limpiar estado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            selectedRole: null, // Reset selectedRole en logout
          });
        }
      },

      /**
       * CheckAuth: Verifica si hay una sesión activa al cargar la app
       * Intenta obtener el perfil del usuario (el token va en la cookie httpOnly)
       * Si el token es inválido o expiró, limpia el estado
       */
      checkAuth: async () => {
        set({ isLoading: true });

        try {
          // Intentar obtener perfil del usuario
          // El token se envía automáticamente como cookie httpOnly
          const profile = await authApi.getProfile();

          // Actualizar estado con los datos del usuario
          set({
            user: profile as User,
            token: null, // No guardamos token en el store
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido, expirado o no existe
          // El interceptor ya redirigió a /login si fue 401
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

      /**
       * SetSelectedRole: Establece el rol activo cuando el usuario tiene múltiples roles
       * @param role - Rol seleccionado por el usuario
       */
      setSelectedRole: (role: UserRole) => {
        set({ selectedRole: role });
      },

      /**
       * CambiarPassword: Cambia la contraseña del usuario autenticado
       * @param passwordActual - Contraseña actual
       * @param nuevaPassword - Nueva contraseña
       * @throws Error si la contraseña actual es incorrecta
       */
      cambiarPassword: async (
        passwordActual: string,
        nuevaPassword: string,
      ) => {
        set({ isLoading: true });

        try {
          await authApi.cambiarPassword(passwordActual, nuevaPassword);

          // Actualizar flag debe_cambiar_password a false
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                debe_cambiar_password: false,
              },
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: unknown) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      // Configuración de persistencia
      name: 'auth-storage', // Nombre del key en localStorage
      partialize: (state) => ({
        // Solo persistir user y token
        // NO persistir isAuthenticated para evitar bucles de redirección
        user: state.user,
        token: state.token,
      }),
      // Callback después de rehidratar: calcular isAuthenticated basado en user
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Si hay user, marcamos como autenticado
          state.isAuthenticated = !!state.user;

          // IMPORTANTE: Siempre resetear selectedRole al rehidratar
          // El usuario debe elegir el rol cada vez que carga la app
          state.selectedRole = null;
        }
      },
    },
  ),
);
