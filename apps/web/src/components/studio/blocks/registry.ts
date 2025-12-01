import { BloqueComponent } from './types';

type RegistryMap = Map<string, BloqueComponent>;

const registry: RegistryMap = new Map();

export function registrarBloque<TConfig = Record<string, unknown>>(
  tipo: string,
  componente: BloqueComponent<TConfig>,
): void {
  if (registry.has(tipo)) {
    console.warn(`Bloque "${tipo}" ya está registrado. Sobrescribiendo.`);
  }
  registry.set(tipo, componente as BloqueComponent);
}

export function obtenerBloque(tipo: string): BloqueComponent | undefined {
  return registry.get(tipo);
}

export function existeBloque(tipo: string): boolean {
  return registry.has(tipo);
}

export function listarBloques(): string[] {
  return Array.from(registry.keys());
}

export function limpiarRegistry(): void {
  registry.clear();
}
