# Cambio: apps/api/src/clases/clases.controller.ts
**Descripción:** Tipé requests y añadí verificación de roles por actor.
**Motivo:** Asegurar que cada flujo (tutor, docente, admin) acceda sólo a sus endpoints correspondientes.
**Fecha:** 2025-10-13 12:00
```ts
@Controller('clases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClasesController {
  constructor(private readonly clasesService: ClasesService) {}
```
