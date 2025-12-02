import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  authApi,
  RegisterData,
  LoginMfaRequiredResponse,
  isLoginMfaRequired,
  isLoginSuccess,
} from '@/lib/api/auth.api';

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
 * Resultado del login - puede ser exitoso o requerir MFA
 */
export type LoginResult =
  | { success: true; user: User; roles: UserRole[] }
  | { success: false; mfaRequired: true; mfaToken: string; message: string };

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
  mfaPending: LoginMfaRequiredResponse | null; // Estado MFA pendiente

  // Acciones
  login: (_email: string, _password: string) => Promise<LoginResult>;
  loginEstudiante: (_username: string, _password: string) => Promise<User>;
  register: (_data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (_user: User) => void;
  setSelectedRole: (_role: UserRole) => void;
  clearMfaPending: () => void;
  cambiarPassword: (
    _passwordActual: string,
    _nuevaPassword: string,
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
      mfaPending: null,

      /**
       * Login: Autentica al usuario (tutor/docente/admin)
       * ✅ SECURITY FIX: El token viaja SOLO en httpOnly cookie (no localStorage)
       * El backend configura la cookie automáticamente en la respuesta
       * @param email - Email del usuario
       * @param password - Contraseña del usuario
       * @returns LoginResult - éxito con user/roles o MFA requerido
       * @throws Error si las credenciales son inválidas
       */
      login: async (email: string, password: string): Promise<LoginResult> => {
        set({ isLoading: true, selectedRole: null, mfaPending: null });

        try {
          const response = await authApi.login({ email, password });

          // Verificar si se requiere MFA (solo admins)
          if (isLoginMfaRequired(response)) {
            set({
              isLoading: false,
              mfaPending: response,
            });
            return {
              success: false,
              mfaRequired: true,
              mfaToken: response.mfa_token,
              message: response.message,
            };
          }

          // Login exitoso - usar type guard para acceso seguro
          if (isLoginSuccess(response)) {
            const authUser = response.user;
            const roles = response.roles as UserRole[];

            // Mapear AuthUser a User del store
            const user: User = {
              id: authUser.id,
              email: authUser.email,
              nombre: authUser.nombre,
              apellido: authUser.apellido,
              role: authUser.role as UserRole,
              roles: roles,
              debe_cambiar_password: authUser.debe_cambiar_password,
              dni: authUser.dni,
              telefono: authUser.telefono,
              fecha_registro: authUser.fecha_registro,
              ha_completado_onboarding: authUser.ha_completado_onboarding,
              titulo: authUser.titulo,
              bio: authUser.bio,
              puntos_totales: authUser.puntos_totales,
              nivel_actual: authUser.nivel_actual,
            };

            set({
              user,
              token: null, // ✅ No almacenar token en memoria/localStorage
              isAuthenticated: true,
              isLoading: false,
              selectedRole: null,
              mfaPending: null,
            });

            return { success: true, user, roles };
          }

          // Caso imposible pero TypeScript lo requiere
          throw new Error('Respuesta de login inesperada');
        } catch (error: unknown) {
          set({ isLoading: false, mfaPending: null });
          throw error;
        }
      },

      /**
       * Login Estudiante: Autentica a un estudiante con sus credenciales propias
       * ✅ SECURITY FIX: El token viaja SOLO en httpOnly cookie (no localStorage)
       * El backend configura la cookie automáticamente en la respuesta
       * @param username - Username del estudiante
       * @param password - Contraseña del estudiante
       * @returns User - datos del estudiante autenticado
       * @throws Error si las credenciales son inválidas
       */
      loginEstudiante: async (username: string, password: string): Promise<User> => {
        set({ isLoading: true });

        try {
          const response = await authApi.loginEstudiante({ username, password });

          // Estudiantes no tienen MFA, pero usamos type guard por consistencia
          if (!isLoginSuccess(response)) {
            throw new Error('Respuesta de login inesperada');
          }

          const authUser = response.user;

          // Mapear AuthUser a User del store
          const user: User = {
            id: authUser.id,
            email: authUser.email,
            nombre: authUser.nombre,
            apellido: authUser.apellido,
            role: 'estudiante',
            roles: ['estudiante'],
            debe_cambiar_password: authUser.debe_cambiar_password,
            puntos_totales: authUser.puntos_totales,
            nivel_actual: authUser.nivel_actual,
            avatar_url: authUser.foto_url,
          };

          set({
            user,
            token: null, // ✅ No almacenar token en memoria/localStorage
            isAuthenticated: true,
            isLoading: false,
          });

          return user;
        } catch (error: unknown) {
          set({ isLoading: false });
          throw error;
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
          // Limpiar localStorage para asegurar estado limpio
          localStorage.removeItem('auth-storage');

          // Limpiar estado completamente
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            selectedRole: null,
            mfaPending: null,
          });
        }
      },

      /**
       * CheckAuth: Verifica si hay una sesión activa al cargar la app
       * Intenta obtener el perfil del usuario (el token va en la cookie httpOnly)
       * Si el token es inválido o expiró, llama a logout() para limpiar completamente
       */
      checkAuth: async () => {
        set({ isLoading: true });

        try {
          // Intentar obtener perfil del usuario
          // El token se envía automáticamente como cookie httpOnly
          const profile = await authApi.getProfile();

          // Mapear AuthUser a User del store
          const user: User = {
            id: profile.id,
            email: profile.email,
            nombre: profile.nombre,
            apellido: profile.apellido,
            role: profile.role as UserRole,
            debe_cambiar_password: profile.debe_cambiar_password,
            dni: profile.dni,
            telefono: profile.telefono,
            fecha_registro: profile.fecha_registro,
            ha_completado_onboarding: profile.ha_completado_onboarding,
            titulo: profile.titulo,
            bio: profile.bio,
            puntos_totales: profile.puntos_totales,
            nivel_actual: profile.nivel_actual,
          };

          // Actualizar estado con los datos del usuario
          set({
            user,
            token: null,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Token inválido, expirado o no existe
          // Llamar a logout() para limpiar estado y localStorage completamente
          await get().logout();
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
       * ClearMfaPending: Limpia el estado de MFA pendiente
       * Útil cuando el usuario cancela el flujo MFA
       */
      clearMfaPending: () => {
        set({ mfaPending: null });
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
      migrate: (persistedState: unknown, version: number) => {
        // Si la versión persistida es < 2, limpiar selectedRole del localStorage viejo
        if (version < 2) {
          // Eliminar selectedRole si existe en el estado viejo
          const state = persistedState as Record<string, unknown> | null;
          if (state && 'selectedRole' in state) {
            delete state.selectedRole;
          }
          return state;
        }
        return persistedState as Partial<AuthState>;
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
