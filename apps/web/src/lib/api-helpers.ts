import type { AxiosRequestConfig } from 'axios';

import type { RequestData } from '@/types/common';
import apiClient from './axios';

/**
 * Helpers para hacer requests con tipos correctos
 * NOTA: El interceptor de axios ya retorna .data directamente, así que NO extraemos .data aquí
 */

export async function apiGet<T>(url: string, config?: AxiosRequestConfig<RequestData>): Promise<T> {
  return await apiClient.get<T>(url, config);
}

export async function apiPost<T>(
  url: string,
  data?: RequestData,
  config?: AxiosRequestConfig<RequestData>,
): Promise<T> {
  return await apiClient.post<T>(url, data, config);
}

export async function apiPut<T>(
  url: string,
  data?: RequestData,
  config?: AxiosRequestConfig<RequestData>,
): Promise<T> {
  return await apiClient.put<T>(url, data, config);
}

export async function apiPatch<T>(
  url: string,
  data?: RequestData,
  config?: AxiosRequestConfig<RequestData>,
): Promise<T> {
  return await apiClient.patch<T>(url, data, config);
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig<RequestData>,
): Promise<T> {
  return await apiClient.delete<T>(url, config);
}
