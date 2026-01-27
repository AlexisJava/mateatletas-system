# Auditoría Fase 2: Conexiones Entre Portales

> Documento generado el 27-01-2026
> Auditoría de flujos entre portales Admin, Docente y Tutor

---

## Resumen Ejecutivo

Esta auditoría verifica las conexiones entre portales para identificar GAPS donde una acción en un portal no genera la notificación correspondiente en otro.

### Resultado General

| Flujo           | Estado           | Cobertura                       |
| --------------- | ---------------- | ------------------------------- |
| Admin → Docente | ✅ Bien cubierto | 6/7 flujos con notificación     |
| Admin → Tutor   | ✅ Excelente     | 8/8 flujos con notificación     |
| Docente → Tutor | ✅ Excelente     | 6/6 flujos con notificación     |
| Docente → Admin | ⚠️ Gap           | 0/3 flujos (sin notificaciones) |
| Tutor → Docente | ⚠️ Gap           | 0/2 flujos (sin notificaciones) |
| WebSockets      | ✅ Completo      | ~35 eventos documentados        |

---

## 1. Flujos Admin → Docente

### 1.1 Tabla de Verificación

| Flujo                                | ¿Endpoint existe?                         | ¿Docente puede leerlo?                  | ¿Hay notificación?                       |
| ------------------------------------ | ----------------------------------------- | --------------------------------------- | ---------------------------------------- |
| Admin asigna docente a comisión      | ✅ SÍ - `POST /admin/comisiones`          | ✅ SÍ - `GET /docentes/mis-comisiones`  | ✅ SÍ - `notificarComisionAsignada`      |
| Admin crea ClaseGrupo con docenteId  | ✅ SÍ - `POST /admin/clase-grupos`        | ✅ SÍ - `GET /docente/mis-clases`       | ✅ SÍ - `notificarClaseAsignada`         |
| Admin modifica horario de ClaseGrupo | ✅ SÍ - `PATCH /admin/clase-grupos/:id`   | ✅ SÍ - mismos endpoints                | ⚠️ PARCIAL - solo si cambia docenteId    |
| Admin cancela clase                  | ✅ SÍ - `PATCH /clases/:id/cancelar`      | ✅ SÍ - estado visible                  | ✅ SÍ - `notificarClaseCancelada`        |
| Admin asigna docente a Casa          | ✅ SÍ - `PATCH /admin/casas/:id/docente`  | ✅ SÍ - `GET /docentes/mi-casa`         | ✅ SÍ - `notificarAsignacionEstrategica` |
| Admin asigna docente a Mundo         | ✅ SÍ - `PATCH /admin/mundos/:id/docente` | ✅ SÍ - `GET /docentes/mi-mundo`        | ✅ SÍ - `notificarAsignacionEstrategica` |
| Admin crea planificación             | ✅ SÍ - `POST /admin/planificaciones`     | ✅ SÍ - `GET /docentes/planificaciones` | ❌ NO - Sin notificación                 |

### 1.2 Código de Notificaciones (Admin → Docente)

**Archivo:** `apps/api/src/notificaciones/notificaciones.service.ts`

```typescript
// Líneas 340-404
notificarClaseAsignada(docenteId, claseGrupoId, nombre, dia, horaInicio, horaFin)
notificarComisionAsignada(docenteId, comisionId, comisionNombre, productoNombre, horario?)
notificarAsignacionEstrategica(docenteId, tipoAsignacion: 'CASA' | 'MUNDO', nombre)
notificarClaseCancelada(docenteId, claseId, claseTitulo, motivo?)
```

### 1.3 Gaps Identificados

| Gap                                            | Severidad | Recomendación                              |
| ---------------------------------------------- | --------- | ------------------------------------------ |
| Admin crea planificación sin notificar docente | 🟡 Media  | Agregar `notificarPlanificacionAsignada()` |
| Cambio de horario no notifica si mismo docente | 🟢 Baja   | El docente ve el cambio en su calendario   |

---

## 2. Flujos Admin → Tutor

### 2.1 Tabla de Verificación

| Flujo                            | ¿Endpoint existe?                                  | ¿Tutor puede leerlo?                | ¿Hay notificación?                          |
| -------------------------------- | -------------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| Admin registra pago manual       | ✅ SÍ - `POST /admin/pagos/registrar-manual`       | ✅ SÍ - `GET /tutor/mis-pagos`      | ✅ SÍ - `notificarPagoManualRegistrado`     |
| Admin asigna beca a estudiante   | ✅ SÍ - `POST /admin/becas/asignar`                | ✅ SÍ - estudiante visible          | ✅ SÍ - `notificarBecaAsignada`             |
| Admin pausa suscripción          | ✅ SÍ - `PATCH /admin/suscripciones/:id/pausar`    | ✅ SÍ - `GET /tutor/mi-suscripcion` | ✅ SÍ - `notificarSuscripcionPausadaATutor` |
| Admin reactiva suscripción       | ✅ SÍ - `PATCH /admin/suscripciones/:id/reactivar` | ✅ SÍ - estado visible              | ✅ SÍ - `notificarSuscripcionReactivada`    |
| Admin cambia tier de suscripción | ✅ SÍ - `PATCH /admin/suscripciones/:id/tier`      | ✅ SÍ - tier visible                | ✅ SÍ - `notificarCambioTier`               |
| Webhook: Pago exitoso            | ✅ SÍ - MercadoPago webhook                        | ✅ SÍ - historial visible           | ✅ SÍ - `notificarPagoExitoso`              |
| Webhook: Pago fallido            | ✅ SÍ - MercadoPago webhook                        | ✅ SÍ - estado visible              | ✅ SÍ - `notificarPagoFallido`              |
| Suscripción próxima a vencer     | ✅ SÍ - Cron job automático                        | ✅ SÍ - fechas visibles             | ✅ SÍ - `notificarSuscripcionProximaVencer` |

### 2.2 Código de Notificaciones (Admin → Tutor)

**Archivo:** `apps/api/src/notificaciones/notificaciones.service.ts`

```typescript
// Líneas 410-601
notificarPagoExitoso(tutorId, monto, descripcion)
notificarPagoFallido(tutorId, monto, razon)
notificarSuscripcionProximaVencer(tutorId, diasRestantes)
notificarPagoManualRegistrado(tutorId, monto, concepto, registradoPor)
notificarBecaAsignada(tutorId, estudianteNombre, estudianteId, tipoBeca, porcentajeDescuento)
notificarCambioTier(tutorId, tierAnterior, tierNuevo, razon?)
notificarSuscripcionReactivada(tutorId, planNombre)
notificarSuscripcionPausadaATutor(tutorId, planNombre, motivo?)
```

### 2.3 Gaps Identificados

**Sin gaps - Flujo completamente cubierto**

---

## 3. Flujos Docente → Tutor

### 3.1 Tabla de Verificación

| Flujo                            | ¿Endpoint existe?                    | ¿Tutor puede leerlo?             | ¿Hay notificación?                         |
| -------------------------------- | ------------------------------------ | -------------------------------- | ------------------------------------------ |
| Docente crea observación URGENTE | ✅ SÍ - `POST /observaciones`        | ⚠️ NO directo - via notificación | ✅ SÍ - `notificarObservacionUrgente`      |
| Docente cancela clase            | ✅ SÍ - `PATCH /clases/:id/cancelar` | ✅ SÍ - calendario del hijo      | ✅ SÍ - `notificarClaseCanceladaATutor`    |
| Docente crea anuncio IMPORTANTE  | ✅ SÍ - `POST /anuncios`             | ✅ SÍ - `GET /tutor/anuncios`    | ✅ SÍ - `notificarAnuncioImportanteATutor` |
| Docente crea anuncio URGENTE     | ✅ SÍ - `POST /anuncios`             | ✅ SÍ - `GET /tutor/anuncios`    | ✅ SÍ - `notificarAnuncioUrgenteATutor`    |
| Docente asigna tarea             | ✅ SÍ - implícito en asignaciones    | ✅ SÍ - tareas del hijo          | ✅ SÍ - `notificarTareaAsignadaATutor`     |
| Estudiante desbloquea logro      | ✅ SÍ - automático en gamificación   | ✅ SÍ - progreso del hijo        | ✅ SÍ - `notificarLogroHijo`               |

### 3.2 Código de Notificaciones (Docente → Tutor)

**Archivo:** `apps/api/src/observaciones/observaciones.service.ts` (líneas 267-289)

```typescript
// Cuando prioridad = URGENTE, se notifica automáticamente
if (dto.prioridad === PrioridadObservacion.Urgente) {
  await this.notificacionesService.notificarObservacionUrgente(...)
}
```

**Archivo:** `apps/api/src/anuncios/anuncios.service.ts` (líneas 81-88)

```typescript
// Anuncios IMPORTANTE o URGENTE disparan notificación
if (anuncio.tipo === TipoAnuncio.IMPORTANTE || anuncio.tipo === TipoAnuncio.URGENTE) {
  await this.notificarAnuncio(anuncio);
}
```

### 3.3 Gaps Identificados

| Gap                                    | Severidad | Recomendación                        |
| -------------------------------------- | --------- | ------------------------------------ |
| Observaciones NO urgentes no notifican | 🟢 Baja   | Por diseño - solo urgentes notifican |
| Anuncios INFORMATIVOS no notifican     | 🟢 Baja   | Por diseño - reducir spam            |

---

## 4. Flujos Docente → Admin

### 4.1 Tabla de Verificación

| Flujo                              | ¿Endpoint existe?                                        | ¿Admin puede leerlo?    | ¿Hay notificación?               |
| ---------------------------------- | -------------------------------------------------------- | ----------------------- | -------------------------------- |
| Docente reporta incidente grave    | ✅ SÍ - `POST /observaciones` con `notificarAdmin: true` | ✅ SÍ - Dashboard admin | ❌ NO - Sin notificación directa |
| Docente solicita cambio de horario | ❌ NO - No existe endpoint                               | N/A                     | ❌ NO                            |
| Docente reporta problema técnico   | ❌ NO - No existe endpoint                               | N/A                     | ❌ NO                            |

### 4.2 Gaps Identificados

| Gap                                                            | Severidad | Recomendación                               |
| -------------------------------------------------------------- | --------- | ------------------------------------------- |
| Observaciones con `notificarAdmin: true` no crean notificación | 🔴 Alta   | Agregar `notificarObservacionGraveAAdmin()` |
| No hay canal Docente → Admin para solicitudes                  | 🟡 Media  | Considerar módulo de tickets/solicitudes    |
| No hay reporte de problemas técnicos                           | 🟡 Media  | Integrar con Sentry o sistema de soporte    |

### 4.3 Código Actual

**Archivo:** `apps/api/src/observaciones/observaciones.service.ts`

```typescript
// El campo notificarAdmin existe pero NO crea notificación a admin
const notificarAdmin =
  dto.prioridad === PrioridadObservacion.Urgente ? true : (dto.notificarAdmin ?? false);

// TODO: Agregar llamada a notificacionesService.createParaAdmin() aquí
```

---

## 5. Flujos Tutor → Docente

### 5.1 Tabla de Verificación

| Flujo                          | ¿Endpoint existe?                     | ¿Docente puede leerlo?                 | ¿Hay notificación?       |
| ------------------------------ | ------------------------------------- | -------------------------------------- | ------------------------ |
| Tutor cancela reserva de clase | ✅ SÍ - `DELETE /clases/reservas/:id` | ✅ SÍ - lista de inscritos actualizada | ❌ NO - Sin notificación |
| Tutor responde observación     | ❌ NO - No existe endpoint            | N/A                                    | N/A                      |
| Tutor envía mensaje a docente  | ❌ NO - No existe endpoint            | N/A                                    | N/A                      |

### 5.2 Gaps Identificados

| Gap                                          | Severidad | Recomendación                                 |
| -------------------------------------------- | --------- | --------------------------------------------- |
| Tutor cancela reserva sin notificar docente  | 🟡 Media  | Agregar `notificarReservaCanceladaADocente()` |
| No hay canal de comunicación Tutor → Docente | 🟡 Media  | Considerar sistema de mensajería              |

---

## 6. Sistema de Notificaciones

### 6.1 Tipos de Notificación Disponibles (Prisma enum)

```prisma
enum TipoNotificacion {
  // Docentes
  DOCENTE_CLASE_PROXIMA
  DOCENTE_ASISTENCIA_PENDIENTE
  DOCENTE_ESTUDIANTE_ALERTA
  DOCENTE_CLASE_CANCELADA
  DOCENTE_LOGRO_ESTUDIANTE
  DOCENTE_CLASE_ASIGNADA
  DOCENTE_COMISION_ASIGNADA
  DOCENTE_ASIGNACION_ESTRATEGICA

  // Tutores
  TUTOR_PAGO_EXITOSO
  TUTOR_PAGO_FALLIDO
  TUTOR_SUSCRIPCION_PROXIMA_VENCER
  TUTOR_SUSCRIPCION_PAUSADA
  TUTOR_SUSCRIPCION_REACTIVADA
  TUTOR_SUSCRIPCION_CANCELADA
  TUTOR_LOGRO_HIJO
  TUTOR_BECA_ASIGNADA
  TUTOR_CAMBIO_TIER
  TUTOR_TAREA_ASIGNADA_HIJO
  TUTOR_CLASE_CANCELADA_HIJO
  TUTOR_MENSAJE_DOCENTE
  TUTOR_ANUNCIO_IMPORTANTE
  TUTOR_ANUNCIO_URGENTE

  // Estudiantes
  ESTUDIANTE_LOGRO_DESBLOQUEADO
  ESTUDIANTE_NIVEL_SUBIDO
  ESTUDIANTE_RACHA_EN_RIESGO
  ESTUDIANTE_BIENVENIDA
  ESTUDIANTE_ANUNCIO_IMPORTANTE
  ESTUDIANTE_ANUNCIO_URGENTE

  // Admins
  ADMIN_NUEVO_PAGO
  ADMIN_ALERTA_SISTEMA
}
```

### 6.2 Prioridades

```prisma
enum PrioridadNotificacion {
  BAJA
  MEDIA
  ALTA
  CRITICA
}
```

### 6.3 Endpoints de Lectura

| Portal     | Endpoint                                    | Descripción                      |
| ---------- | ------------------------------------------- | -------------------------------- |
| Tutor      | `GET /tutor/notificaciones`                 | Lista notificaciones del tutor   |
| Tutor      | `GET /tutor/notificaciones/no-leidas/count` | Contador badge                   |
| Docente    | `GET /notificaciones`                       | Lista notificaciones del docente |
| Docente    | `GET /notificaciones/no-leidas`             | Contador badge                   |
| Estudiante | `GET /estudiantes/notificaciones`           | Lista notificaciones             |

### 6.4 Marcar como Leída

| Portal  | Endpoint                                |
| ------- | --------------------------------------- |
| Tutor   | `PATCH /tutor/notificaciones/:id/leer`  |
| Tutor   | `POST /tutor/notificaciones/leer-todas` |
| Docente | `PATCH /notificaciones/:id/leer`        |
| Docente | `POST /notificaciones/leer-todas`       |

---

## 7. WebSockets (Aula Viva)

### 7.1 Gateway

**Archivo:** `apps/api/src/aula-viva/aula-viva.gateway.ts`
**Namespace:** `/aula-viva`
**Autenticación:** JWT middleware

### 7.2 Eventos de Cliente → Servidor

| Evento                  | Rol Requerido | Descripción                                  |
| ----------------------- | ------------- | -------------------------------------------- |
| `unirse-sala`           | Cualquiera    | Unirse a sala `clase:{id}` o `comision:{id}` |
| `salir-sala`            | Cualquiera    | Salir de una sala                            |
| `enviar-mensaje`        | Cualquiera    | Enviar mensaje de chat                       |
| `levantar-mano`         | ESTUDIANTE    | Levantar mano virtual                        |
| `bajar-mano`            | ESTUDIANTE    | Bajar mano                                   |
| `responder-pulso`       | ESTUDIANTE    | Responder encuesta rápida                    |
| `responder-quiz`        | ESTUDIANTE    | Responder quiz                               |
| `practica:responder`    | ESTUDIANTE    | Responder pregunta de práctica               |
| `toggle-chat`           | DOCENTE       | Habilitar/deshabilitar chat                  |
| `dar-palabra`           | DOCENTE       | Dar la palabra a estudiante                  |
| `mutear-participante`   | DOCENTE       | Mutear a un estudiante                       |
| `expulsar-participante` | DOCENTE       | Expulsar estudiante (24h ban)                |
| `crear-pulso`           | DOCENTE       | Crear encuesta rápida                        |
| `quiz:crear`            | DOCENTE       | Crear quiz estilo Kahoot                     |
| `teoria:iniciar`        | DOCENTE       | Iniciar teoría sincronizada                  |
| `practica:iniciar`      | DOCENTE       | Iniciar práctica en vivo                     |

### 7.3 Eventos de Servidor → Cliente (Broadcast)

| Evento                          | Destino | Descripción                         |
| ------------------------------- | ------- | ----------------------------------- |
| `participante-entro`            | Sala    | Alguien entró a la sala             |
| `participante-salio`            | Sala    | Alguien salió                       |
| `nuevo-mensaje`                 | Sala    | Nuevo mensaje de chat               |
| `chat-toggle`                   | Sala    | Chat habilitado/deshabilitado       |
| `mano-levantada`                | Sala    | Estudiante levantó mano             |
| `mano-bajada`                   | Sala    | Mano bajada                         |
| `palabra-otorgada`              | Sala    | Docente dio la palabra              |
| `participante-muteado`          | Sala    | Estudiante muteado                  |
| `participante-expulsado`        | Usuario | Notificación privada de expulsión   |
| `alguien-expulsado`             | Sala    | Anuncio público (sin motivo)        |
| `reaccion`                      | Sala    | Reacción agregada (emojis)          |
| `pulso-creado`                  | Sala    | Nueva encuesta                      |
| `pulso-actualizado`             | Sala    | Estadísticas actualizadas           |
| `pulso-cerrado`                 | Sala    | Resultados finales                  |
| `quiz:nuevo`                    | Sala    | Nuevo quiz (sin respuesta correcta) |
| `quiz:respuesta-recibida`       | Sala    | Contador de respuestas              |
| `quiz:resultado`                | Sala    | Resultados con ranking              |
| `contador-iniciado`             | Sala    | Temporizador compartido             |
| `contador-pausado`              | Sala    | Temporizador pausado                |
| `contador-terminado`            | Sala    | Tiempo agotado                      |
| `teoria:iniciada`               | Sala    | Sesión de teoría comenzó            |
| `teoria:slide-cambiado`         | Sala    | Cambio de slide                     |
| `teoria:cerrada`                | Sala    | Sesión terminada                    |
| `practica:iniciada`             | Sala    | Práctica en vivo comenzó            |
| `practica:respuesta-registrada` | Usuario | Feedback individual                 |
| `practica:estudiante-completo`  | Docente | Estudiante terminó                  |
| `practica:cerrada`              | Sala    | Resultados finales                  |

### 7.4 Gamificación en Tiempo Real

**Servicio:** `GamificacionRealtimeService`

Eventos especiales:

- Broadcast de puntos a sala de Casa (`casa:{casaId}`)
- Auto-join de estudiantes a su room de Casa al conectarse

---

## 8. Gaps Críticos y Recomendaciones

### 8.1 Gaps de Alta Prioridad

| #   | Gap                                                            | Impacto                                  | Recomendación                                     |
| --- | -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| 1   | Observaciones con `notificarAdmin: true` no crean notificación | Admin no se entera de incidentes graves  | Implementar `notificarObservacionGraveAAdmin()`   |
| 2   | Tutor cancela reserva sin notificar docente                    | Docente no sabe que perdió un estudiante | Implementar `notificarReservaCanceladaADocente()` |

### 8.2 Gaps de Media Prioridad

| #   | Gap                                    | Impacto                                       | Recomendación                       |
| --- | -------------------------------------- | --------------------------------------------- | ----------------------------------- |
| 3   | No hay canal Docente → Admin           | Docentes no pueden reportar problemas         | Módulo de tickets o soporte         |
| 4   | No hay canal Tutor → Docente           | Tutores no pueden responder observaciones     | Sistema de mensajería bidireccional |
| 5   | Admin crea planificación sin notificar | Docente no sabe que tiene nueva planificación | Agregar notificación                |

### 8.3 Gaps de Baja Prioridad (Por Diseño)

| #   | Gap                                         | Justificación                         |
| --- | ------------------------------------------- | ------------------------------------- |
| A   | Observaciones no-urgentes no notifican      | Reduce spam - tutores ven en portal   |
| B   | Anuncios INFORMATIVOS no notifican          | Reduce spam - solo importante/urgente |
| C   | Cambio de horario mismo docente no notifica | Docente ve en su calendario           |

---

## 9. Diagrama de Flujo de Notificaciones

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN                                    │
│  • Registra pagos manuales                                       │
│  • Asigna becas                                                  │
│  • Gestiona suscripciones                                        │
│  • Crea clases/comisiones                                        │
│  • Asigna docentes a Casa/Mundo                                  │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ ✅ 6 tipos                         │ ✅ 8 tipos
         │ notificación                       │ notificación
         ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│      DOCENTE        │              │       TUTOR         │
│  • Crea observaciones│◄────────────│  • Cancela reservas │
│  • Publica anuncios │    ⚠️ Sin   │  • Ve progreso hijos│
│  • Cancela clases   │  notificación│  • Gestiona pagos   │
│  • Asigna tareas    │              │                     │
└─────────────────────┘              └─────────────────────┘
         │                                    ▲
         │ ✅ 6 tipos                         │
         │ notificación                       │
         └────────────────────────────────────┘

         ⚠️ GAPS:
         • Docente → Admin: Sin notificaciones
         • Tutor → Docente: Sin notificaciones
```

---

## 10. Próximos Pasos

### Fase 3 Sugerida: Implementar Gaps Críticos

1. **Ticket #1:** Crear `notificarObservacionGraveAAdmin()` en NotificacionesService
2. **Ticket #2:** Crear `notificarReservaCanceladaADocente()` en NotificacionesService
3. **Ticket #3:** Llamar a las nuevas notificaciones desde los services correspondientes

### Fase 4 Sugerida: Sistema de Mensajería

1. Modelo `Mensaje` con conversaciones Tutor ↔ Docente
2. Endpoints bidireccionales
3. Notificaciones de nuevos mensajes

---

_Documento generado automáticamente por auditoría de código_
_Archivos principales analizados:_

- `apps/api/src/notificaciones/notificaciones.service.ts`
- `apps/api/src/observaciones/observaciones.service.ts`
- `apps/api/src/anuncios/anuncios.service.ts`
- `apps/api/src/clases/services/clase-command.service.ts`
- `apps/api/src/admin/clase-grupos.service.ts`
- `apps/api/src/admin/comisiones.service.ts`
- `apps/api/src/admin/services/admin-pagos.service.ts`
- `apps/api/src/aula-viva/aula-viva.gateway.ts`
