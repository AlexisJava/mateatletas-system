# Cambio: apps/web/src/store/pagos.store.ts
**Descripción:** Simplifiqué la fábrica de Zustand eliminando get no utilizado.
**Motivo:** Limpiar la firma del store para pasar el type-check.
**Fecha:** 2025-10-13 12:00
```ts
-export const usePagosStore = create<PagosStore>((set, get) => ({
+export const usePagosStore = create<PagosStore>((set) => ({
```
