import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, RegisterData } from '@/lib/api/auth.api';

/**
 * Interface del usuario (versión simplificada para el store)
 */
export type UserRole = 'tutor' | 'docente' | 'admin' | 'estudiante';

export interface User {
  id: string;
  sub?: string;
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
  avatar_url?: string | null;
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
  login: (email: string, password: string) => Promise<User>;
  loginEstudiante: (username: string, password: string) => Promise<void>;
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
       * ✅ SECURITY FIX: El token viaja SOLO en httpOnly cookie (no localStorage)
       * El backend configura la cookie automáticamente en la respuesta
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @throws Error si las credenciales son inválidas
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, selectedRole: null });

        try {
          const response = await authApi.login({ email, password });

          // ✅ NO guardar token en localStorage (vulnerabilidad XSS)
          // El token ya está en httpOnly cookie enviada por el backend

          const user = response.user as User;

          set({
            user,
            token: null, // ✅ No almacenar token en memoria/localStorage
            isAuthenticated: true,
            isLoading: false,
            selectedRole: null,
          });

          // Retornar el user para que el componente pueda acceder al rol inmediatamente
          return user;
        } catch (error: unknown) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Login Estudiante: Autentica a un estudiante con sus credenciales propias
       * ✅ SECURITY FIX: El token viaja SOLO en httpOnly cookie (no localStorage)
       * El backend configura la cookie automáticamente en la respuesta
       * @param username - Username del estudiante
       * @param password - Contraseña del estudiante
       * @throws Error si las credenciales son inválidas
       */
      loginEstudiante: async (username: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await authApi.loginEstudiante({ username, password });

          // ✅ NO guardar token en localStorage (vulnerabilidad XSS)
          // El token ya está en httpOnly cookie enviada por el backend

          // Actualizar estado sin token
          set({
            user: response.user as User,
            token: null, // ✅ No almacenar token en memoria/localStorage
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
       * ✅ SECURITY FIX: Solo limpia estado, backend limpia httpOnly cookie
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
          // ✅ NO limpiar localStorage porque no guardamos token ahí

          // Limpiar estado completamente
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            selectedRole: null, // CRÍTICO: Reset selectedRole para próximo login
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
      version: 2, // NUEVO: Versión del schema - incrementar para forzar migración
      partialize: (state) => ({
        // Persistir SOLO user y token
        // NO persistir isAuthenticated para evitar bucles de redirección
        // NO persistir selectedRole - debe ser selección de sesión, no permanente
        user: state.user,
        token: state.token,
      }),
      // Migración automática cuando cambia la versión
      migrate: (persistedState: any, version: number) => {
        // Si la versión persistida es < 2, limpiar selectedRole del localStorage viejo
        if (version < 2) {
          // Eliminar selectedRole si existe en el estado viejo
          if (persistedState && 'selectedRole' in persistedState) {
            delete persistedState.selectedRole;
          }
        }
        return persistedState;
      },
      // Callback después de rehidratar: calcular isAuthenticated basado en user
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Si hay user, marcamos como autenticado
          state.isAuthenticated = !!state.user;

          // IMPORTANTE: selectedRole NO se persiste, siempre empieza en null
          // Esto fuerza al usuario a elegir su rol en cada sesión si tiene múltiples roles
          state.selectedRole = null;
        }
      },
    },
  ),
);
