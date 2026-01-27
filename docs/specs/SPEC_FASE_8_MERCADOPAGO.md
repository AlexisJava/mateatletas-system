# SPEC: FASE 8 - MERCADOPAGO

## Resumen Ejecutivo

Completar los flujos de MercadoPago pendientes: reactivación de suscripciones canceladas y emails de grace period.

**IMPORTANTE**: Este documento es la fuente de verdad para la implementación.

---

## 8.1 REACTIVAR SUSCRIPCIÓN CANCELADA

### Contexto

- MercadoPago NO permite reactivar un PreApproval cancelado
- Se debe crear una NUEVA suscripción
- El tutor puede reactivar si hay cupo disponible

### Reglas de Negocio

| Regla                   | Detalle                                                 |
| ----------------------- | ------------------------------------------------------- |
| Quién reactiva          | Solo el TUTOR (no admin)                                |
| Condición               | Debe haber CUPO en las actividades que quiere           |
| Ventana arrepentimiento | 24hs después de cancelar puede revertir SIN perder nada |
| Después de 24hs         | Pierde TODO (XP, logros, historial, cupo)               |
| Nueva suscripción       | Arranca de CERO como alumno nuevo                       |

### Flujo: Cancelación con Arrepentimiento (< 24hs)

```
1. Tutor cancela suscripción
2. Estado → PENDIENTE_CANCELACION (no CANCELLED todavía)
3. Email: "Cancelaste tu suscripción. Tenés 24hs para arrepentirte."
4. Si revierte en < 24hs:
   - Estado → AUTHORIZED (como si nada)
   - MercadoPago: NO se cancela el PreApproval
   - Conserva todo (XP, logros, cupo)
5. Si NO revierte en 24hs:
   - Estado → CANCELLED
   - MercadoPago: Se cancela el PreApproval
   - Se ejecuta BORRADO TOTAL del estudiante (ver abajo)
```

### Flujo: Reactivar Después de Cancelación Confirmada

```
1. Tutor quiere volver (ya pasaron las 24hs, perdió todo)
2. Tutor va a /tutor/inscripcion (flujo normal de nuevo cliente)
3. Selecciona actividades (si hay cupo)
4. Crea NUEVA suscripción en MercadoPago
5. Estudiante arranca nivel 0, XP 0, sin logros
```

### Borrado Total del Estudiante (al confirmar cancelación)

| Dato                | Acción                               |
| ------------------- | ------------------------------------ |
| XP                  | DELETE → 0                           |
| Nivel               | DELETE → 0                           |
| Logros              | DELETE todos                         |
| Historial lecciones | DELETE todo                          |
| Progreso            | DELETE todo                          |
| Inscripciones       | Estado → CANCELADA (historial admin) |
| Ranking casa        | SALE del ranking                     |

### Endpoints

| Método | Ruta                                             | Descripción                         |
| ------ | ------------------------------------------------ | ----------------------------------- |
| POST   | /tutor/suscripcion-familiar/cancelar             | Inicia cancelación (24hs pendiente) |
| POST   | /tutor/suscripcion-familiar/revertir-cancelacion | Revierte si < 24hs                  |
| CRON   | Cada hora                                        | Procesa cancelaciones > 24hs        |

### Notificaciones

| Momento             | Canal          | Mensaje                                                                                                                |
| ------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Al cancelar         | Email + In-app | "Cancelaste tu suscripción. Tenés 24hs para arrepentirte. Después de eso, se eliminará TODO el progreso de tus hijos." |
| 12hs después        | Email          | "Te quedan 12hs para revertir la cancelación."                                                                         |
| Al confirmar (24hs) | Email + In-app | "Tu suscripción fue cancelada. El progreso de [nombres estudiantes] ha sido eliminado."                                |

---

## 8.2 EMAILS DE GRACE PERIOD (Pago Fallido)

### Contexto

- MercadoPago no pudo cobrar (tarjeta rechazada, sin fondos, etc)
- El tutor tiene 3 días para regularizar
- Si no regulariza, se cancela automáticamente

### Reglas de Negocio

| Regla                 | Detalle                                             |
| --------------------- | --------------------------------------------------- |
| Duración grace period | 3 días                                              |
| Emails                | 1 por día (3 emails total)                          |
| Si regulariza         | Vuelve a AUTHORIZED, sigue normal                   |
| Si NO regulariza      | Se cancela (mismo flujo que 8.1, con borrado total) |

### Flujo

```
Día 0: Pago falla
  └── Estado → EN_GRACIA
  └── Email 1: "Tu pago falló. Tenés 3 días para regularizar."
  └── Notificación in-app (ALTA prioridad)
  └── Alerta admin

Día 1:
  └── Email 2: "Te quedan 2 días para regularizar tu pago."

Día 2:
  └── Email 3: "ÚLTIMO DÍA. Mañana se cancela tu suscripción y se elimina el progreso."

Día 3 (fin grace period):
  └── Si NO regularizó:
      └── Estado → PENDIENTE_CANCELACION
      └── 24hs de arrepentimiento (mismo flujo 8.1)
      └── Si no paga en 24hs → CANCELLED + borrado total
```

### Emails

#### Email Día 1 (Pago Falló)

```
Asunto: ⚠️ Tu pago falló - Tenés 3 días para regularizar

Hola [nombre_tutor],

No pudimos procesar tu pago de Mateatletas.

Tenés hasta el [fecha_limite] para regularizar tu situación.

[BOTÓN: Actualizar medio de pago]

Si no regularizás, la suscripción se cancelará y se eliminará
TODO el progreso de [nombres_estudiantes] (XP, logros, historial).

---
Mateatletas
```

#### Email Día 2

```
Asunto: ⚠️ Te quedan 2 días - Pago pendiente Mateatletas

Hola [nombre_tutor],

Tu pago sigue pendiente. Te quedan 2 días.

[BOTÓN: Regularizar ahora]

Recordá: si no regularizás, [nombres_estudiantes] perderán todo su progreso.
```

#### Email Día 3 (Último)

```
Asunto: 🚨 ÚLTIMO DÍA - Mañana se cancela tu suscripción

Hola [nombre_tutor],

Este es el último día para regularizar tu pago.

Mañana se cancelará tu suscripción y se ELIMINARÁ PERMANENTEMENTE:
- Todo el XP de [nombres_estudiantes]
- Todos los logros desbloqueados
- Todo el historial de progreso

[BOTÓN: Pagar ahora]

Esta acción es IRREVERSIBLE.
```

#### Email Cancelación Confirmada

```
Asunto: Tu suscripción de Mateatletas fue cancelada

Hola [nombre_tutor],

Tu suscripción ha sido cancelada por falta de pago.

El progreso de [nombres_estudiantes] ha sido eliminado de nuestra plataforma.

Si querés volver, podés crear una nueva suscripción (sujeto a disponibilidad de cupos).

[BOTÓN: Ver planes]

Gracias por haber sido parte de Mateatletas.
```

### Endpoints Existentes a Usar

| Endpoint                 | Uso           |
| ------------------------ | ------------- |
| EmailService.sendEmail() | Enviar emails |

### Endpoints/Jobs Nuevos

| Tipo | Nombre                | Descripción                                          |
| ---- | --------------------- | ---------------------------------------------------- |
| CRON | GracePeriodEmailJob   | Corre diario 09:00, envía emails según día de gracia |
| CRON | GracePeriodExpiredJob | Corre diario 00:05, procesa expirados                |

---

## 8.3 UI BAJA DE INSCRIPCIONES

**ESTADO: ✅ COMPLETADO**

Ya implementado en `/tutor/suscripcion/gestionar/page.tsx`

---

## Resumen de Implementación

### Archivos a Crear/Modificar

| Archivo                                   | Cambio                                            |
| ----------------------------------------- | ------------------------------------------------- |
| `email.service.ts`                        | Agregar templates de grace period y cancelación   |
| `suscripcion-familiar-command.service.ts` | Agregar lógica de PENDIENTE_CANCELACION y borrado |
| `suscripcion.events.ts`                   | Agregar CancelacionPendienteEvent                 |
| `grace-period-email.job.ts`               | NUEVO - Cron job emails diarios                   |
| `cancelacion-pendiente.job.ts`            | NUEVO - Procesa cancelaciones > 24hs              |
| `estudiante-borrado.service.ts`           | NUEVO - Lógica de borrado total                   |

### Cambios en Schema Prisma

```prisma
enum EstadoSuscripcionFamiliar {
  PENDING
  AUTHORIZED
  PAUSED
  PENDIENTE_CANCELACION  // NUEVO
  CANCELLED
}

model SuscripcionFamiliar {
  // ... campos existentes
  fechaSolicitudCancelacion DateTime?  // NUEVO - para calcular 24hs
}
```

---

## NO INCLUYE

- UI de admin para forzar cancelación (ya existe)
- Reembolsos (no aplica)
- Múltiples métodos de pago (solo MercadoPago)
