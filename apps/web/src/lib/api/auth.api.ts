import apiClient from '../axios';

/**
 * Tipos para los requests de autenticación
 */

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginEstudianteData {
  username: string;
  password: string;
}

/**
 * Tipos para las responses de autenticación
 */

export type AuthRole = 'tutor' | 'docente' | 'admin' | 'estudiante';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: AuthRole;
  dni?: string | null;
  telefono?: string | null;
  fecha_registro?: string;
  ha_completado_onboarding?: boolean;
  titulo?: string | null;
  bio?: string | null;
  edad?: number;
  nivel_escolar?: string;
  foto_url?: string | null;
  puntos_totales?: number;
  nivel_actual?: number;
  debe_cambiar_password?: boolean;
  equipo?: {
    id: string;
    nombre: string;
    color_primario: string;
  } | null;
  tutor?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

/**
 * Response de login exitoso (sin MFA)
 */
export interface LoginSuccessResponse {
  user: AuthUser;
  roles: AuthRole[];
}

/**
 * Response cuando MFA es requerido
 */
export interface LoginMfaRequiredResponse {
  requires_mfa: true;
  mfa_token: string;
  message: string;
}

/**
 * Union type para todas las posibles respuestas de login
 */
export type LoginResponse = LoginSuccessResponse | LoginMfaRequiredResponse;

/**
 * Type guard para verificar si la respuesta requiere MFA
 */
export function isLoginMfaRequired(
  response: LoginResponse,
): response is LoginMfaRequiredResponse {
  return 'requires_mfa' in response && response.requires_mfa === true;
}

/**
 * Type guard para verificar si el login fue exitoso
 */
export function isLoginSuccess(
  response: LoginResponse,
): response is LoginSuccessResponse {
  return 'user' in response && !('requires_mfa' in response);
}

export interface LogoutResponse {
  message: string;
  description: string;
}

export interface ChangePasswordPayload {
  passwordActual: string;
  nuevaPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * API de autenticación
 * Funciones para comunicarse con los endpoints de auth del backend
 */
export const authApi = {
  /**
   * Registra un nuevo tutor en la plataforma
   * @param data - Datos del tutor a registrar
   * @returns Promise con el tutor creado
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.post<RegisterResponse>('/auth/register', data);
    } catch (error) {
      console.error('Error en el registro de usuario:', error);
      throw error;
    }
  },

  /**
   * Autentica un tutor existente
   * El token se guarda automáticamente como httpOnly cookie en el backend
   * @param data - Credenciales del tutor (email, password)
   * @returns Promise con los datos del usuario (sin token)
   */
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.post<LoginResponse>('/auth/login', data);
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      throw error;
    }
  },

  /**
   * Obtiene el perfil del tutor autenticado
   * El token se envía automáticamente como httpOnly cookie
   * @returns Promise con los datos del tutor
   */
  getProfile: async (): Promise<AuthUser> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.get<AuthUser>('/auth/profile');
    } catch (error) {
      console.error('Error al obtener el perfil de autenticación:', error);
      throw error;
    }
  },

  /**
   * Autentica un estudiante con sus credenciales propias
   * El token se guarda automáticamente como httpOnly cookie en el backend
   * @param data - Credenciales del estudiante (username, password)
   * @returns Promise con los datos del estudiante (sin token)
   */
  loginEstudiante: async (data: LoginEstudianteData): Promise<LoginResponse> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.post<LoginResponse>('/auth/estudiante/login', data);
    } catch (error) {
      console.error('Error en el inicio de sesión del estudiante:', error);
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario
   * El backend elimina la httpOnly cookie automáticamente
   * @returns Promise con mensaje de confirmación
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.post<LogoutResponse>('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  /**
   * Cambia la contraseña del usuario autenticado
   * @param data - Contraseñas actual y nueva
   * @returns Mensaje de confirmación
   */
  changePassword: async (
    data: ChangePasswordPayload,
  ): Promise<ChangePasswordResponse> => {
    try {
      // El interceptor ya retorna response.data directamente
      return await apiClient.post<ChangePasswordResponse>('/auth/change-password', data);
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw error;
    }
  },

  /**
   * Alias para cambiarPassword (usado en el store)
   */
  cambiarPassword: async (
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<ChangePasswordResponse> => {
    return authApi.changePassword({ passwordActual, nuevaPassword });
  },
};
