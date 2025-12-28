import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of the callback.
 * The callback will only be invoked after `delay` ms have passed
 * since the last call.
 *
 * Limpia el timeout automáticamente al desmontar el componente
 * para evitar llamadas sobre componentes desmontados.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup: cancelar timeout pendiente al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay],
  );
}
