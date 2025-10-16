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
 * - Extrae data directamente de respuestas exitosas (2xx)
 * - Maneja errores 401: redirige a login (la cookie se limpia en el backend)
 * - Propaga otros errores para manejo en componentes
 */
apiClient.interceptors.response.use(
  (response) => {
    // Retornar solo la data para simplificar el uso en componentes
    return response.data;
  },
  (error: AxiosError) => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      // Si es 401 Unauthorized, el token es inválido o expiró
      if (error.response?.status === 401) {
        // Ya NO necesitamos eliminar de localStorage (usamos cookies httpOnly)
        // La cookie se limpia automáticamente en el backend al hacer logout

        // Redirigir a login solo si no estamos ya en la página de login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
    }

    // Propagar el error para que pueda ser manejado en los componentes
    return Promise.reject(error);
  },
);

export default apiClient;
