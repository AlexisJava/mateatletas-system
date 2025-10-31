import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Cliente Axios configurado para comunicarse con el backend
 *
 * Características:
 * - Base URL desde variable de entorno
 * - Timeout de 10 segundos
 * - withCredentials: true para enviar cookies httpOnly automáticamente
 * - Interceptor de response: maneja errores 401 (redirección a login)
 */

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRÍTICO: Envía cookies automáticamente
});

/**
 * Request Interceptor
 * Ya NO es necesario adjuntar el token manualmente.
 * Las cookies httpOnly se envían automáticamente con withCredentials: true
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Las cookies se envían automáticamente, no hay nada que hacer aquí
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

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
 * NOTA: No modificamos la respuesta, mantenemos type safety completo
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';

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
          console.error('❌ Recurso no encontrado:', error.config?.url);
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
