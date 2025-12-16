/**
 * RequestContext
 *
 * Wrapper sobre AsyncLocalStorage para propagar contexto de request
 * a través de operaciones async sin pasar parámetros explícitamente.
 *
 * Uso:
 * - El middleware inicia el contexto con RequestContext.run()
 * - Cualquier código async dentro puede acceder con RequestContext.getRequestId()
 * - LoggerService lo usa automáticamente para incluir requestId en logs
 *
 * @module observability/context
 */

import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface RequestContextData {
  requestId: string;
  userId?: string;
  [key: string]: string | undefined;
}

// Singleton de AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  /**
   * Ejecuta una función dentro de un contexto de request.
   * Si no se provee requestId, genera uno nuevo (UUIDv4).
   *
   * @param fn - Función a ejecutar dentro del contexto
   * @param initialData - Datos iniciales del contexto (opcional)
   * @returns Promise con el resultado de la función
   */
  static run<T>(
    fn: () => T | Promise<T>,
    initialData?: Partial<RequestContextData>,
  ): Promise<T> {
    const contextData: RequestContextData = {
      requestId: initialData?.requestId ?? randomUUID(),
      ...initialData,
    };

    return new Promise((resolve, reject) => {
      asyncLocalStorage.run(contextData, () => {
        Promise.resolve()
          .then(() => fn())
          .then(resolve)
          .catch((error: unknown) => {
            reject(error instanceof Error ? error : new Error(String(error)));
          });
      });
    });
  }

  /**
   * Obtiene el requestId del contexto actual.
   * @returns requestId o undefined si no hay contexto activo
   */
  static getRequestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  }

  /**
   * Obtiene el userId del contexto actual.
   * @returns userId o undefined si no está establecido
   */
  static getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  /**
   * Establece el userId en el contexto actual.
   * @param userId - ID del usuario autenticado
   */
  static setUserId(userId: string): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  /**
   * Establece un valor arbitrario en el contexto actual.
   * @param key - Clave del valor
   * @param value - Valor a almacenar
   */
  static set(key: string, value: string): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  /**
   * Obtiene un valor del contexto actual.
   * @param key - Clave del valor
   * @returns Valor o undefined si no existe
   */
  static get(key: string): string | undefined {
    return asyncLocalStorage.getStore()?.[key];
  }

  /**
   * Obtiene una copia del contexto completo.
   * @returns Copia del contexto o undefined si no hay contexto activo
   */
  static getContext(): RequestContextData | undefined {
    const store = asyncLocalStorage.getStore();
    return store ? { ...store } : undefined;
  }

  /**
   * Sale del contexto actual (limpia el store).
   * Principalmente útil para tests.
   */
  static exit(): void {
    // AsyncLocalStorage se limpia automáticamente al salir del run()
    // Este método es un no-op pero existe para consistencia en tests
  }
}
