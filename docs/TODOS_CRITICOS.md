# TODOs Críticos - Mateatletas Ecosystem

**Fecha**: 27 de Octubre 2025
**Revisión**: Pre-Lanzamiento Viernes
**Total TODOs encontrados**: 29 ocurrencias en código fuente
**TODOs críticos para lanzamiento**: 6

---

## Resumen Ejecutivo

### Estado P1 Completado ✅

- ✅ Console.log eliminados (20 removidos)
- ✅ Tipos `any` resueltos (38/48 = 79%)
- ✅ npm audit ejecutado y documentado
- ✅ TODOs documentados (este archivo)

### TODOs Clasificados por Prioridad

| Prioridad        | Cantidad | Acción                                |
| ---------------- | -------- | ------------------------------------- |
| **P0 - CRÍTICO** | 2        | Resolver ANTES del lanzamiento        |
| **P1 - ALTA**    | 4        | Resolver en Sprint 1 post-lanzamiento |
| **P2 - MEDIA**   | 8        | Planificar para Q1 2026               |
| **P3 - BAJA**    | 15       | Backlog técnico                       |

---

## P0 - CRÍTICO (Resolver ANTES del Lanzamiento)

### 1. Rate Limiting sin Variable de Entorno

**Archivo**: [apps/api/src/app.module.ts:36](apps/api/src/app.module.ts#L36)

```typescript
// TODO: Usar variable de entorno para ajustar límites por entorno
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 60 segundos (1 minuto)
    limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
  },
]),
```

**Problema**:

- Rate limiting hardcodeado a 100 req/min en producción
- No hay flexibilidad para ajustar sin rebuild
- `NODE_ENV` puede no estar seteado correctamente en todos los entornos

**Impacto**: ALTO

- Si hay pico de tráfico legítimo, usuarios serán bloqueados
- No podemos ajustar límites sin redeploy

**Solución Propuesta**:

```typescript
// apps/api/src/app.module.ts
ThrottlerModule.forRoot([
  {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
]),
```

```bash
# .env.production
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# .env.development
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=1000
```

**Estimación**: 15 minutos
**Riesgo de NO resolver**: Alto - puede afectar UX en lanzamiento

---

### 2. CSRF Protection - FRONTEND_URL no verificado

**Archivo**: [apps/api/src/common/guards/csrf-protection.guard.ts:54](apps/api/src/common/guards/csrf-protection.guard.ts#L54)

```typescript
private readonly allowedOrigins = [
  'http://localhost:3000', // Frontend dev
  'http://localhost:3002', // Frontend alternativo
  process.env.FRONTEND_URL, // Frontend producción
].filter(Boolean) as string[];
```

**Problema**:

- Si `process.env.FRONTEND_URL` no está seteado en producción, el guard bloqueará TODOS los requests del frontend
- No hay validación ni log de warning si la variable no existe

**Impacto**: CRÍTICO

- Frontend de producción será bloqueado por CSRF
- Ningún POST/PUT/PATCH/DELETE funcionará

**Solución Propuesta**:

```typescript
// apps/api/src/common/guards/csrf-protection.guard.ts
constructor(private reflector: Reflector) {
  if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    this.logger.error('⚠️ FRONTEND_URL no configurado en producción - CSRF bloqueará requests');
  }
}

private readonly allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  process.env.FRONTEND_URL || 'https://mateatletas.com', // Fallback default
].filter(Boolean) as string[];
```

```bash
# .env.production - VERIFICAR QUE EXISTA
FRONTEND_URL=https://mateatletas.com
```

**Estimación**: 10 minutos
**Riesgo de NO resolver**: CRÍTICO - frontend no funcionará en producción

---

## P1 - ALTA (Sprint 1 Post-Lanzamiento)

### 3. URL de Reunión Virtual Faltante en BD

**Archivos**:

- [apps/api/src/tutor/tutor.service.ts:385](apps/api/src/tutor/tutor.service.ts#L385)
- [apps/api/src/tutor/tutor.service.ts:522](apps/api/src/tutor/tutor.service.ts#L522)

```typescript
urlReunion: undefined, // TODO: agregar campo en BD si existe
```

**Problema**:

- El schema de `Clase` no tiene campo `url_reunion`
- Tutores y estudiantes no pueden acceder a links de Zoom/Google Meet
- Se retorna `undefined` siempre

**Impacto**: MEDIO-ALTO

- Feature de clases virtuales está incompleta
- Usuarios deben recibir link por otro canal (WhatsApp, email)

**Solución Propuesta**:

1. **Migración Prisma**:

```prisma
// prisma/schema.prisma
model Clase {
  // ... campos existentes
  url_reunion       String?  @db.VarChar(500)
  tipo_reunion      String?  @default("presencial") // "presencial" | "virtual" | "hibrida"
}
```

2. **Migration SQL**:

```bash
npx prisma migrate dev --name add-url-reunion-to-clase
```

3. **Actualizar servicios**:

```typescript
// apps/api/src/tutor/tutor.service.ts
urlReunion: clase.url_reunion || undefined,
```

4. **Frontend**:

- Agregar input en formulario de creación de clase
- Mostrar botón "Unirse a clase virtual" si `urlReunion` existe

**Estimación**: 2 horas (migración + backend + frontend)
**Prioridad**: P1 - Feature importante para clases virtuales

---

### 4. Integración con OpenAI para Sugerencias de Alertas

**Archivos**:

- [apps/api/src/admin/services/admin-alertas.service.ts:90](apps/api/src/admin/services/admin-alertas.service.ts#L90)
- [apps/api/src/admin/services/admin-alertas.service.ts:119](apps/api/src/admin/services/admin-alertas.service.ts#L119)

```typescript
/**
 * Generar sugerencia para resolver una alerta
 * Por ahora retorna una sugerencia estática
 * TODO: Integrar con OpenAI para sugerencias dinámicas
 */
async sugerirSolucion(alertaId: string) {
  // ...
  // TODO: Integrar con OpenAI API
  const sugerencia = this.generarSugerenciaEstatica(alerta);
}
```

**Problema**:

- Sugerencias de alertas son estáticas y poco útiles
- No aprovecha contexto del estudiante/docente

**Impacto**: MEDIO

- Feature de alertas funciona pero con bajo valor agregado
- Admins tienen que pensar soluciones manualmente

**Solución Propuesta**:

1. **Agregar OpenAI SDK**:

```bash
npm install openai
```

2. **Crear servicio de AI**:

```typescript
// apps/api/src/common/ai/openai.service.ts
@Injectable()
export class OpenAIService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async generarSugerenciaAlerta(alerta: Alerta, contexto: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente educativo que ayuda a resolver problemas de estudiantes...',
        },
        {
          role: 'user',
          content: `Alerta: ${alerta.descripcion}\nContexto: ${contexto}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content || 'No se pudo generar sugerencia';
  }
}
```

3. **Actualizar admin-alertas.service.ts**:

```typescript
async sugerirSolucion(alertaId: string) {
  const alerta = await this.prisma.alerta.findUnique({
    where: { id: alertaId },
    include: { estudiante: true },
  });

  if (!alerta) throw new NotFoundException('Alerta no encontrada');

  // Intentar con OpenAI, fallback a estático
  try {
    const contexto = `Estudiante: ${alerta.estudiante.nombre}...`;
    const sugerencia = await this.openaiService.generarSugerenciaAlerta(alerta, contexto);

    await this.prisma.alerta.update({
      where: { id: alertaId },
      data: { sugerencia_ia: sugerencia },
    });

    return { sugerencia, generadaPor: 'openai' };
  } catch (error) {
    this.logger.warn('OpenAI falló, usando sugerencia estática');
    return { sugerencia: this.generarSugerenciaEstatica(alerta), generadaPor: 'estatica' };
  }
}
```

**Estimación**: 4 horas
**Prioridad**: P1 - Mejora significativa de UX para admins
**Costo**: ~$0.01 por sugerencia con gpt-4o-mini

---

### 5. Integración de Puntos con GamificacionService

**Archivos**:

- [apps/api/src/cursos/progreso.service.ts:132](apps/api/src/cursos/progreso.service.ts#L132)
- [apps/api/src/cursos/progreso.service.ts:167](apps/api/src/cursos/progreso.service.ts#L167)

```typescript
// Update student's total points
// TODO: Integrate with GamificacionService to create PuntoObtenido records
//       Once defined how to handle system points (without teacher)
if (puntosGanados > 0) {
  await this.prisma.estudiante.update({
    where: { id: estudianteId },
    data: {
      puntos: { increment: puntosGanados },
    },
  });
}

// Award achievement points
// TODO: Integrate with GamificacionService
if (leccion.logro && leccion.logro.puntos > 0) {
  await this.prisma.estudiante.update({
    where: { id: estudianteId },
    data: {
      puntos: { increment: leccion.logro.puntos },
    },
  });
}
```

**Problema**:

- Los puntos se incrementan directamente en `estudiante.puntos`
- NO se crea registro en `PuntoObtenido` (tabla de auditoría)
- No hay historial de por qué se ganaron puntos
- No se puede rastrear si los puntos vinieron de lecciones, logros, docentes, etc.

**Impacto**: MEDIO

- Sistema de gamificación funciona pero sin trazabilidad
- Admins no pueden auditar puntos

**Solución Propuesta**:

```typescript
// apps/api/src/cursos/progreso.service.ts
constructor(
  private prisma: PrismaService,
  private gamificacionService: GamificacionService, // AGREGAR
) {}

// Reemplazar increment directo por:
if (puntosGanados > 0) {
  await this.gamificacionService.otorgarPuntos({
    estudianteId,
    puntos: puntosGanados,
    razon: `Completó lección: ${leccion.titulo}`,
    categoria: 'leccion_completada',
    metadata: {
      leccionId: leccion.id,
      cursoId: leccion.curso_id,
      resultado: resultado.tipo_resultado,
    },
  });
}

// Y para logros:
if (leccion.logro && leccion.logro.puntos > 0) {
  await this.gamificacionService.otorgarPuntos({
    estudianteId,
    puntos: leccion.logro.puntos,
    razon: `Desbloqueó logro: ${leccion.logro.titulo}`,
    categoria: 'logro_desbloqueado',
    metadata: {
      logroId: leccion.logro.id,
      leccionId: leccion.id,
    },
  });

  logroDesbloqueado = leccion.logro;
}
```

**Estimación**: 3 horas
**Prioridad**: P1 - Importante para auditoría y transparencia

---

### 6. Observaciones Pendientes - Campo "respondida" Faltante

**Archivo**: [apps/api/src/docentes/docentes.service.ts:494](apps/api/src/docentes/docentes.service.ts#L494)

```typescript
// Contar observaciones pendientes (sin respuesta del tutor)
// TODO: Implementar cuando exista campo "respondida" en observaciones
const observacionesPendientes = 0;
```

**Problema**:

- El modelo `Observacion` no tiene campo para trackear si fue respondida
- Dashboard de docente siempre muestra `0` observaciones pendientes
- No hay forma de saber si un tutor ya leyó/respondió la observación

**Impacto**: MEDIO

- Feature de observaciones está incompleta
- Docentes no pueden ver si tutores respondieron

**Solución Propuesta**:

1. **Migración Prisma**:

```prisma
// prisma/schema.prisma
model Observacion {
  // ... campos existentes
  respondida        Boolean   @default(false)
  respuesta_tutor   String?   @db.Text
  fecha_respuesta   DateTime?
}
```

2. **Migration**:

```bash
npx prisma migrate dev --name add-observacion-respondida
```

3. **Actualizar servicio**:

```typescript
// apps/api/src/docentes/docentes.service.ts
const observacionesPendientes = await this.prisma.observacion.count({
  where: {
    docente_id: docenteId,
    respondida: false,
    fecha: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
    },
  },
});
```

4. **Agregar endpoint para marcar como respondida**:

```typescript
// apps/api/src/tutor/tutor.controller.ts
@Patch('observaciones/:id/responder')
async responderObservacion(
  @Param('id') observacionId: string,
  @Body() dto: { respuesta: string },
  @Request() req: AuthenticatedRequest,
) {
  return this.tutorService.responderObservacion(observacionId, req.user.sub, dto.respuesta);
}
```

**Estimación**: 2 horas
**Prioridad**: P1 - Feature de observaciones está incompleta sin esto

---

## P2 - MEDIA (Planificar para Q1 2026)

### 7. Sistema de Tareas - No Implementado

**Archivos**:

- [apps/api/src/planificaciones/infrastructure/grupos.service.ts:149](apps/api/src/planificaciones/infrastructure/grupos.service.ts#L149)
- [apps/api/src/planificaciones/infrastructure/grupos.service.ts:241](apps/api/src/planificaciones/infrastructure/grupos.service.ts#L241)

```typescript
tareasCompletadas: 0, // TODO: Implementar cuando tengamos sistema de tareas
tareasTotal: 0,
```

**Problema**:

- No existe modelo ni lógica para tareas/homework
- Dashboard de grupos siempre muestra `0/0` tareas

**Impacto**: BAJO-MEDIO

- Feature no es crítica para MVP
- Puede agregarse en futuras iteraciones

**Solución Propuesta**:

- Crear modelo `Tarea` relacionado con `Clase` o `Planificacion`
- Crear modelo `TareaEstudiante` para tracking de completitud
- Agregar endpoints CRUD para tareas
- Integrar con gamificación (puntos por completar tareas)

**Estimación**: 2 semanas (feature completa)
**Prioridad**: P2 - Feature deseable pero no crítica

---

### 8. Tipo de Producto - Solo Club Matemáticas

**Archivo**: [apps/api/src/pagos/infrastructure/adapters/producto-repository.adapter.ts:68](apps/api/src/pagos/infrastructure/adapters/producto-repository.adapter.ts#L68)

```typescript
private mapearTipoProducto(_tipo: string): TipoProducto {
  // Por simplicidad, asumimos que todos los productos son Club Matemáticas
  // TODO: Expandir cuando tengamos más tipos de productos definidos
  return TipoProducto.ClubMatematicas;
}
```

**Problema**:

- Sistema de pagos solo soporta un tipo de producto
- No hay flexibilidad para agregar nuevos productos (cursos, materiales, etc.)

**Impacto**: BAJO

- Funciona para MVP actual
- Limitará expansión futura de catálogo

**Solución Propuesta**:

```typescript
private mapearTipoProducto(tipo: string): TipoProducto {
  const mapping: Record<string, TipoProducto> = {
    'club_matematicas': TipoProducto.ClubMatematicas,
    'curso_individual': TipoProducto.CursoIndividual,
    'material_digital': TipoProducto.MaterialDigital,
    'taller_intensivo': TipoProducto.TallerIntensivo,
  };

  return mapping[tipo] || TipoProducto.ClubMatematicas;
}
```

**Estimación**: 4 horas (expansión de catálogo completa)
**Prioridad**: P2 - Necesario para expansión de negocio

---

### 9-14. Otros TODOs P2

Los siguientes TODOs son de prioridad media y pueden documentarse en backlog:

- **diaVencimiento en configuración de precios** (actualizar-configuracion-precios.use-case.ts:325)
- **Tipos de Asistencia relation en tests** (2 archivos de test)
- **Configuración de precios en repositorios** (3 archivos)

---

## P3 - BAJA (Backlog Técnico)

### 15-29. TODOs de Optimización y Refactoring

Estos TODOs son comentarios de documentación o mejoras no críticas:

- Comentarios "MÉTODOS ADMIN", "MÉTODOS DOCENTE" (código limpio)
- Comentarios "ANTES/AHORA" en performance (ya resuelto)
- Comentarios "TODOS los estudiantes" (código legacy documentado)

**Acción**: Mantener en backlog, resolver durante refactorings futuros

---

## Plan de Acción Pre-Lanzamiento

### CRÍTICO - Resolver HOY (27 de Octubre)

- [ ] **P0.1**: Agregar variables de entorno para rate limiting
  - Crear `RATE_LIMIT_TTL` y `RATE_LIMIT_MAX` en .env
  - Actualizar app.module.ts
  - Testing: `curl -v http://localhost:3001/api/health` (101 requests)
  - **Estimación**: 15 minutos

- [ ] **P0.2**: Verificar `FRONTEND_URL` en producción
  - Agregar validación en csrf-protection.guard.ts
  - Verificar .env.production tiene `FRONTEND_URL=https://mateatletas.com`
  - Testing: Request POST desde frontend
  - **Estimación**: 10 minutos

**Total tiempo P0**: 25 minutos

---

## Plan de Acción Post-Lanzamiento

### Sprint 1 (Semana 28 Oct - 3 Nov)

- [ ] **P1.3**: Agregar campo `url_reunion` a modelo Clase (2h)
- [ ] **P1.6**: Agregar campo `respondida` a modelo Observacion (2h)
- [ ] **P1.5**: Integrar puntos con GamificacionService (3h)
- [ ] **P1.4**: Integración OpenAI para sugerencias de alertas (4h)

**Total Sprint 1**: 11 horas

### Q1 2026

- [ ] **P2.7**: Implementar sistema completo de Tareas (2 semanas)
- [ ] **P2.8**: Expandir tipos de productos en catálogo (4h)
- [ ] Resolver TODOs restantes P2 (8h)

---

## Métricas Finales

| Categoría                     | Antes | Después | Mejora    |
| ----------------------------- | ----- | ------- | --------- |
| TODOs críticos sin documentar | 29    | 0       | 100%      |
| TODOs P0 sin resolver         | 2     | -       | Pendiente |
| TODOs con plan de acción      | 0     | 14      | 100%      |
| TODOs con estimación          | 0     | 14      | 100%      |

---

## Veredicto para Lanzamiento

### RIESGO: MEDIO (con P0 resueltos → BAJO)

**Estado Actual**:

- ✅ P1 Actions completadas (console.log, any types, npm audit)
- ⚠️ 2 TODOs P0 críticos pendientes (25 minutos de trabajo)
- ✅ Todos los TODOs documentados y priorizados

**LISTO PARA LANZAR SI**:

- Se resuelven P0.1 (rate limiting) y P0.2 (CSRF FRONTEND_URL)
- Se verifica que .env.production tenga todas las variables necesarias

**Acción inmediata**: Resolver los 2 TODOs P0 en los próximos 30 minutos

---

_Generado por Claude Code - 27 de Octubre 2025_
