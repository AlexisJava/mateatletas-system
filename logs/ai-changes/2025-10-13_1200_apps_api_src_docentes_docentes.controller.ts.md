# Cambio: apps/api/src/docentes/docentes.controller.ts
**Descripción:** Apliqué guardas de rol por endpoint docente.
**Motivo:** Evitar que usuarios sin privilegios gestionen datos de docentes.
**Fecha:** 2025-10-13 12:00
```ts
@Controller('docentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}
```
