import { PreviewDefinition } from './types';

/**
 * Registry de previews para componentes del Studio
 *
 * Cada componente implementado puede registrar su preview aquí
 * para que se muestre en la biblioteca.
 */

type PreviewRegistryMap = Map<string, PreviewDefinition>;

const previewRegistry: PreviewRegistryMap = new Map();

/**
 * Registra un preview para un tipo de componente
 *
 * @param tipo - Identificador único del componente (ej: 'MultipleChoice')
 * @param definition - Definición del preview incluyendo componente, datos de ejemplo y documentación
 */
export function registerPreview(tipo: string, definition: PreviewDefinition): void {
  if (previewRegistry.has(tipo)) {
    console.warn(`Preview para "${tipo}" ya existe. Sobrescribiendo.`);
  }
  previewRegistry.set(tipo, definition);
}

/**
 * Obtiene el preview para un tipo de componente
 *
 * @param tipo - Identificador del componente
 * @returns La definición del preview o undefined si no existe
 */
export function getPreview(tipo: string): PreviewDefinition | undefined {
  return previewRegistry.get(tipo);
}

/**
 * Verifica si existe un preview para un tipo
 *
 * @param tipo - Identificador del componente
 * @returns true si existe un preview registrado
 */
export function hasPreview(tipo: string): boolean {
  return previewRegistry.has(tipo);
}

/**
 * Lista todos los tipos con preview registrado
 *
 * @returns Array ordenado alfabéticamente de tipos
 */
export function listPreviews(): string[] {
  return Array.from(previewRegistry.keys()).sort();
}

/**
 * Limpia todos los previews registrados
 * Útil para tests
 */
export function clearPreviewRegistry(): void {
  previewRegistry.clear();
}

/**
 * Obtiene la cantidad de previews registrados
 */
export function getPreviewCount(): number {
  return previewRegistry.size;
}
