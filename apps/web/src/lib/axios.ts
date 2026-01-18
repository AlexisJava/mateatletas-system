import axios, { AxiosError, AxiosInstance, type AxiosRequestConfig } from 'axios';

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
  get<T = JsonValue, D = RequestData>(_url: string, _config?: AxiosRequestConfig<D>): Promise<T>;
  post<T = JsonValue, D = RequestData>(
    _url: string,
    _data?: D,
    _config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  put<T = JsonValue, D = RequestData>(
    _url: string,
    _data?: D,
    _config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  patch<T = JsonValue, D = RequestData>(
    _url: string,
    _data?: D,
    _config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  delete<T = JsonValue, D = RequestData>(_url: string, _config?: AxiosRequestConfig<D>): Promise<T>;
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
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚠️ UNWRAPPING DE RESPUESTAS - LEER ANTES DE MODIFICAR ⚠️
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * El backend (TransformResponseInterceptor) envuelve TODAS las respuestas en:
 *   { data: <payload>, metadata: { timestamp } }
 *
 * Este interceptor "desenvuelve" automáticamente para que los consumidores
 * reciban solo el payload (sin el wrapper).
 *
 * CASO ESPECIAL - RESPUESTAS PAGINADAS:
 * Las respuestas paginadas tienen metadata CON INFO DE PAGINACIÓN:
 *   { data: [...], metadata: { total, page, limit, totalPages, timestamp } }
 *
 * Estas NO deben ser desenvueltas porque el consumidor necesita acceder
 * a metadata.total, metadata.page, etc.
 *
 * DETECCIÓN DE PAGINACIÓN:
 * - Si metadata tiene: total, page, o totalPages → ES PAGINADA → NO unwrap
 * - Si metadata solo tiene timestamp → NO ES PAGINADA → SÍ unwrap a data
 *
 * ⚠️ BUG HISTÓRICO (2026-01-18):
 * Se introdujo un bug al agregar soporte para 'metadata' sin verificar si tenía
 * propiedades de paginación. Esto causó que TODAS las respuestas retornaran
 * el wrapper completo, rompiendo dashboards que esperaban data directamente.
 * FIX: Ahora se verifica si metadata tiene propiedades de paginación específicas.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
apiClient.interceptors.response.use(
  (response) => {
    // El backend envuelve todas las respuestas en { data: ..., metadata: { timestamp } }
    // Extraemos response.data del axios, y luego .data del wrapper del backend
    const axiosData = response.data;

    // Si la respuesta tiene el formato del backend { data: ... }, extraer data
    if (axiosData && typeof axiosData === 'object' && 'data' in axiosData) {
      // Detectar respuestas PAGINADAS que necesitan conservar metadata de paginación
      // Las respuestas paginadas tienen: { data: [...], metadata: { total, page, limit, totalPages } }
      // Las respuestas normales tienen: { data: {...}, metadata: { timestamp } } - solo timestamp
      const metadata = axiosData.metadata as Record<string, unknown> | undefined;
      const isPaginatedResponse =
        'meta' in axiosData ||
        (metadata && ('total' in metadata || 'page' in metadata || 'totalPages' in metadata));

      if (isPaginatedResponse) {
        // Respuesta paginada: devolver completo { data, metadata }
        return axiosData;
      }
      // Respuesta normal: unwrap y devolver solo data
      return axiosData.data;
    }

    // Si no tiene el formato wrapper, devolver tal cual
    return axiosData;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    // DEBUG: Log completo del error para investigar 400s
    if (error.response?.status === 400) {
      console.error('[DEBUG 400] Full response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
    }

    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const status = error.response?.status ?? 0;
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === '/login' || currentPath === '/register' || currentPath === '/docente-login';

      switch (status) {
        case 401: {
          // Unauthorized - Sesión expirada o inválida
          // NO redirigir automáticamente en rutas protegidas (tienen ProtectedLayout que maneja auth)
          const isProtectedRoute =
            currentPath.startsWith('/docente') ||
            currentPath.startsWith('/admin') ||
            currentPath.startsWith('/estudiante') ||
            currentPath.startsWith('/tutor');

          if (!isAuthPage && !isProtectedRoute) {
            console.warn('🔒 Sesión expirada. Redirigiendo a login...');
            // Guardar la URL actual para redirigir después del login
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = '/login';
          }
          // En rutas protegidas, solo propagar el error para que ProtectedLayout lo maneje
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
