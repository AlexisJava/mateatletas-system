import axios, {
  AxiosError,
  AxiosInstance,
  type AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import type { JsonValue, RequestData } from '@/types/common';

/**
 * Cliente Axios configurado para comunicarse con el backend
 *
 * Características:
 * - Base URL desde variable de entorno
 * - Timeout de 10 segundos
 * - withCredentials: true para enviar cookies httpOnly automáticamente
 * - Interceptor de response: maneja errores 401 (redirección a login)
 */

type ApiClient = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> & {
  get<T = JsonValue, D = RequestData>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  post<T = JsonValue, D = RequestData>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  put<T = JsonValue, D = RequestData>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  patch<T = JsonValue, D = RequestData>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  delete<T = JsonValue, D = RequestData>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
};

const apiClient: ApiClient = axios.create({
  // Desarrollo: usa proxy (/api → localhost:3001) | Producción: usa NEXT_PUBLIC_API_URL (Railway)
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRÍTICO: Envía cookies automáticamente
}) as ApiClient;

/**
 * ✅ SECURITY FIX: NO usar interceptor de Authorization header
 * El token viaja automáticamente en httpOnly cookie con withCredentials: true
 * El backend (JwtStrategy) lee el token de la cookie, no del header Authorization
 *
 * Mantener el fallback a Bearer header en JwtStrategy es solo para:
 * - Tests automatizados
 * - Swagger UI
 * - Herramientas de desarrollo
 */

/**
 * Response Interceptor
 *
 * Manejo de Errores HTTP:
 * - 401 Unauthorized: Redirige a login (sesión expirada)
 * - 403 Forbidden: Muestra mensaje de acceso denegado
 * - 404 Not Found: Recurso no encontrado
 * - 422 Unprocessable Entity: Errores de validación
 * - 500 Internal Server Error: Error del servidor
 *
 * NOTA: Retornamos response.data directamente para simplificar el uso en los archivos API
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const status = error.response?.status ?? 0;
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/docente-login';

      switch (status) {
        case 401: {
          // Unauthorized - Sesión expirada o inválida
          console.warn('🔒 Sesión expirada. Redirigiendo a login...');

          // Redirigir a login solo si no estamos en páginas de auth
          if (!isAuthPage) {
            // Guardar la URL actual para redirigir después del login
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/login';
          }
          break;
        }

        case 403: {
          // Forbidden - Acceso denegado
          console.error('🚫 Acceso denegado:', error.response?.data?.message);

          // Opcional: Mostrar un toast o notificación
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast(
              error.response?.data?.message || 'No tienes permisos para realizar esta acción',
              'error',
            );
          }
          break;
        }

        case 404: {
          // Not Found - Recurso no encontrado
          // Silenciar 404 esperados (endpoints mock o en desarrollo)
          const url = error.config?.url || '';
          const isExpectedMissing = url.includes('/gamificacion/dashboard');

          if (!isExpectedMissing) {
            console.error('❌ Recurso no encontrado:', url);
          }
          break;
        }

        case 422: {
          // Unprocessable Entity - Errores de validación
          const validationErrors = error.response?.data?.errors;
          console.error('⚠️ Errores de validación:', validationErrors);
          break;
        }

        case 500: {
          // Internal Server Error
          console.error('💥 Error del servidor:', error.response?.data?.message);

          // Opcional: Mostrar un toast o notificación
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast(
              'Ocurrió un error en el servidor. Por favor, intenta de nuevo.',
              'error',
            );
          }
          break;
        }

        default: {
          // 304 Not Modified es una respuesta de caché válida, no es un error
          // Solo loguear errores reales (4xx y 5xx), no códigos de éxito (2xx, 3xx)
          if (error.response && status >= 400 && status !== 409) {
            console.error(`❓ Error HTTP ${status}:`, error.response.data);
          } else if (error.request && !error.response) {
            console.error('🌐 Sin respuesta del servidor. Verifica tu conexión.');
          } else if (!error.request && !error.response) {
            console.error('⚙️ Error en la configuración de la petición:', error.message);
          }
          // Si es 304 o cualquier 2xx/3xx (excepto los manejados arriba), no loguear nada
        }
      }
    }

    // Propagar el error para que pueda ser manejado en los componentes
    return Promise.reject(error);
  },
);

export { apiClient };
export default apiClient;
