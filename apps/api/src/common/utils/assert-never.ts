/**
 * Exhaustive check helper para switches
 *
 * Si TypeScript permite llamar esta función, significa que hay un caso
 * no manejado en el switch. El error aparece en COMPILE TIME, no en runtime.
 *
 * @example
 * switch (status) {
 *   case 'active': return handleActive();
 *   case 'cancelled': return handleCancelled();
 *   default:
 *     // Si se agrega un nuevo status, TypeScript marca error aquí
 *     return assertNever(status, 'Estado no soportado');
 * }
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(
    message ?? `Valor inesperado: ${JSON.stringify(value as unknown)}`,
  );
}
