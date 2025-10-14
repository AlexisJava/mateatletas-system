import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Cliente Axios configurado para comunicarse con el backend
 *
 * Características:
 * - Base URL desde variable de entorno
 * - Timeout de 10 segundos
 * - Interceptor de request: adjunta token JWT automáticamente
 * - Interceptor de response: maneja errores 401 (redirección a login)
 */

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adjunta automáticamente el token JWT a cada request si existe en localStorage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Verificar si estamos en el navegador (Next.js puede renderizar en el servidor)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * - Extrae data directamente de respuestas exitosas (2xx)
 * - Maneja errores 401: elimina token y redirige a login
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
        // Eliminar token del localStorage
        localStorage.removeItem('auth-token');

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
