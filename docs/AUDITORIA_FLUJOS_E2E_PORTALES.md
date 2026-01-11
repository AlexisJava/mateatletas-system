# AUDITORÍA: Flujos E2E Entre Portales

> Documento de auditoría para tests de integración cross-portal.
> Fecha: 2026-01-11
> Estado: PENDIENTE DE IMPLEMENTACIÓN

---

## PORTALES DEL SISTEMA

| Portal         | Usuarios            | Función Principal                         |
| -------------- | ------------------- | ----------------------------------------- |
| **Admin**      | Administradores     | Gestión completa del sistema              |
| **Docente**    | Profesores          | Gestión de clases y estudiantes asignados |
| **Tutor**      | Padres/Responsables | Gestión de hijos, pagos, seguimiento      |
| **Estudiante** | Alumnos             | Aprendizaje, juegos, progreso             |

---

## FLUJOS CRÍTICOS E2E

### 1. FLUJO DE INSCRIPCIÓN COMPLETO

```
TUTOR → ADMIN → ESTUDIANTE
```

| Paso | Acción                           | Portal      | Verificación E2E                        |
| ---- | -------------------------------- | ----------- | --------------------------------------- |
| 1.1  | Tutor crea cuenta                | Tutor       | Cuenta activa, puede loguearse          |
| 1.2  | Tutor registra estudiante        | Tutor       | Estudiante visible en su dashboard      |
| 1.3  | Tutor selecciona plan/producto   | Tutor       | Inscripción creada con estado Pendiente |
| 1.4  | Tutor realiza pago (MP/Manual)   | Tutor/Admin | Estado pasa a Pagado                    |
| 1.5  | Sistema activa acceso            | Sistema     | Estudiante puede loguearse              |
| 1.6  | Estudiante accede a contenido    | Estudiante  | Ve contenido según su plan              |
| 1.7  | Admin ve inscripción en Finanzas | Admin       | Inscripción visible, estado correcto    |

**Tests requeridos:**

- [ ] `inscripcion-completa-mercadopago.e2e.ts`
- [ ] `inscripcion-completa-pago-manual.e2e.ts`
- [ ] `inscripcion-rechazada-sin-pago.e2e.ts`

---

### 2. FLUJO DE ASIGNACIÓN A COMISIÓN

```
ADMIN → DOCENTE → ESTUDIANTE
```

| Paso | Acción                               | Portal     | Verificación E2E                        |
| ---- | ------------------------------------ | ---------- | --------------------------------------- |
| 2.1  | Admin crea comisión                  | Admin      | Comisión visible en listado             |
| 2.2  | Admin asigna docente a comisión      | Admin      | Docente ve comisión en su portal        |
| 2.3  | Admin inscribe estudiante a comisión | Admin      | Estudiante aparece en lista de comisión |
| 2.4  | Docente ve estudiante en su comisión | Docente    | Lista de estudiantes correcta           |
| 2.5  | Estudiante ve clase en "Mis Clases"  | Estudiante | Comisión visible con horario            |
| 2.6  | Tutor ve clase del hijo              | Tutor      | Información de comisión visible         |

**Tests requeridos:**

- [ ] `asignacion-comision-completa.e2e.ts`
- [ ] `docente-ve-estudiantes-asignados.e2e.ts`
- [ ] `estudiante-ve-clases-asignadas.e2e.ts`

---

### 3. FLUJO DE CLASE EN VIVO

```
ADMIN → DOCENTE → ESTUDIANTE (tiempo real)
```

| Paso | Acción                               | Portal     | Verificación E2E                |
| ---- | ------------------------------------ | ---------- | ------------------------------- |
| 3.1  | Admin programa clase                 | Admin      | Clase aparece en calendario     |
| 3.2  | Docente ve clase programada          | Docente    | Clase en su agenda              |
| 3.3  | Docente inicia clase (LiveKit)       | Docente    | Sala creada, token válido       |
| 3.4  | Estudiante recibe notificación       | Estudiante | Notificación de clase activa    |
| 3.5  | Estudiante ingresa a clase           | Estudiante | Conexión a sala exitosa         |
| 3.6  | Docente ve asistencia en tiempo real | Docente    | Lista de conectados actualizada |
| 3.7  | Clase finaliza, registro guardado    | Sistema    | Asistencia persistida en DB     |
| 3.8  | Tutor ve asistencia del hijo         | Tutor      | Historial de clases visible     |

**Tests requeridos:**

- [ ] `clase-vivo-flujo-completo.e2e.ts`
- [ ] `clase-vivo-asistencia-registrada.e2e.ts`
- [ ] `clase-vivo-reconexion.e2e.ts`

---

### 4. FLUJO DE PROGRESO Y GAMIFICACIÓN

```
ESTUDIANTE → SISTEMA → TUTOR/DOCENTE
```

| Paso | Acción                          | Portal     | Verificación E2E                 |
| ---- | ------------------------------- | ---------- | -------------------------------- |
| 4.1  | Estudiante completa lección     | Estudiante | Progreso guardado                |
| 4.2  | Sistema otorga XP               | Sistema    | XP sumado correctamente          |
| 4.3  | Sistema otorga monedas          | Sistema    | Monedas sumadas                  |
| 4.4  | Sistema verifica logros         | Sistema    | Logro desbloqueado si aplica     |
| 4.5  | Actividad aparece en feed       | Estudiante | Feed actualizado                 |
| 4.6  | Tutor ve progreso del hijo      | Tutor      | Dashboard con stats actualizados |
| 4.7  | Docente ve progreso en reportes | Docente    | Métricas de estudiante correctas |
| 4.8  | Admin ve analytics globales     | Admin      | Agregados correctos              |

**Tests requeridos:**

- [ ] `progreso-leccion-xp-monedas.e2e.ts`
- [ ] `logro-desbloqueado-notificacion.e2e.ts`
- [ ] `progreso-visible-tutor.e2e.ts`
- [ ] `progreso-visible-docente.e2e.ts`

---

### 5. FLUJO DE PAGOS Y FINANZAS

```
TUTOR → SISTEMA → ADMIN
```

| Paso | Acción                             | Portal  | Verificación E2E                  |
| ---- | ---------------------------------- | ------- | --------------------------------- |
| 5.1  | Sistema genera inscripción mensual | Sistema | Inscripción con fecha vencimiento |
| 5.2  | Tutor recibe notificación de pago  | Tutor   | Email/Notificación enviada        |
| 5.3  | Tutor paga por MercadoPago         | Tutor   | Webhook procesado                 |
| 5.4  | Sistema actualiza estado           | Sistema | Estado = Pagado                   |
| 5.5  | Admin ve pago en Finanzas          | Admin   | Pago registrado correctamente     |
| 5.6  | Si no paga: estado → Vencido       | Sistema | Transición automática             |
| 5.7  | Admin registra pago manual         | Admin   | Estado actualizado                |
| 5.8  | Pagos parciales acumulan           | Admin   | monto_pagado acumulativo          |

**Tests requeridos:**

- [ ] `pago-mercadopago-webhook.e2e.ts`
- [ ] `pago-manual-admin.e2e.ts` ✅ (IMPLEMENTADO)
- [ ] `inscripcion-vence-automaticamente.e2e.ts`
- [ ] `pagos-parciales-acumulan.e2e.ts` ✅ (IMPLEMENTADO)

---

### 6. FLUJO DE GESTIÓN DE USUARIOS

```
ADMIN → TODOS LOS PORTALES
```

| Paso | Acción                        | Portal | Verificación E2E           |
| ---- | ----------------------------- | ------ | -------------------------- |
| 6.1  | Admin crea docente            | Admin  | Docente puede loguearse    |
| 6.2  | Admin crea estudiante directo | Admin  | Estudiante puede loguearse |
| 6.3  | Admin suspende usuario        | Admin  | Usuario no puede loguearse |
| 6.4  | Admin reactiva usuario        | Admin  | Usuario puede loguearse    |
| 6.5  | Admin cambia rol              | Admin  | Permisos actualizados      |
| 6.6  | Admin elimina usuario         | Admin  | Usuario no existe          |

**Tests requeridos:**

- [ ] `crud-docente-login.e2e.ts`
- [ ] `crud-estudiante-login.e2e.ts`
- [ ] `suspension-bloquea-acceso.e2e.ts`
- [ ] `reactivacion-permite-acceso.e2e.ts`

---

### 7. FLUJO DE CONTENIDO Y PLANIFICACIONES

```
ADMIN → DOCENTE → ESTUDIANTE
```

| Paso | Acción                                | Portal     | Verificación E2E           |
| ---- | ------------------------------------- | ---------- | -------------------------- |
| 7.1  | Admin crea contenido (libro/lección)  | Admin      | Contenido en catálogo      |
| 7.2  | Admin crea planificación              | Admin      | Planificación disponible   |
| 7.3  | Admin asigna planificación a comisión | Admin      | Planificación vinculada    |
| 7.4  | Docente ve planificación asignada     | Docente    | Puede ver y seguir plan    |
| 7.5  | Docente marca clase como dada         | Docente    | Progreso de planificación  |
| 7.6  | Estudiante ve contenido asignado      | Estudiante | Acceso según planificación |
| 7.7  | Admin ve progreso de planificación    | Admin      | Métricas de avance         |

**Tests requeridos:**

- [ ] `contenido-visible-segun-plan.e2e.ts`
- [ ] `planificacion-asignada-docente.e2e.ts`
- [ ] `progreso-planificacion-tracking.e2e.ts`

---

### 8. FLUJO DE SISTEMA CASA/MUNDO 2026

```
ADMIN → DOCENTE (asignación automática)
```

| Paso | Acción                          | Portal  | Verificación E2E      |
| ---- | ------------------------------- | ------- | --------------------- |
| 8.1  | Admin activa docente Casa       | Admin   | Badge Casa visible    |
| 8.2  | Admin activa docente Mundo      | Admin   | Badge Mundo visible   |
| 8.3  | Sistema filtra por tipo         | Sistema | Queries correctos     |
| 8.4  | Docente Casa ve sus comisiones  | Docente | Solo comisiones Casa  |
| 8.5  | Docente Mundo ve sus comisiones | Docente | Solo comisiones Mundo |

**Tests requeridos:**

- [ ] `sistema-casa-mundo-badges.e2e.ts` ✅ (IMPLEMENTADO)
- [ ] `filtro-docentes-por-tipo.e2e.ts`

---

## MATRIZ DE DEPENDENCIAS ENTRE PORTALES

```
                 ADMIN    DOCENTE    TUTOR    ESTUDIANTE
ADMIN              -         W         W          W
DOCENTE            R         -         R          RW
TUTOR              R         R         -          RW
ESTUDIANTE         R         R         R          -

R = Lee datos generados por
W = Escribe datos que afectan a
```

---

## CASOS EDGE QUE DEBEN FUNCIONAR

### Concurrencia

- [ ] Dos admins editando mismo usuario simultáneamente
- [ ] Docente y admin modificando misma comisión
- [ ] Múltiples estudiantes completando misma lección

### Race Conditions

- [ ] Webhook de pago llega antes que usuario termine checkout
- [ ] Estudiante intenta entrar a clase que acaba de terminar
- [ ] Pago parcial + pago completo en rápida sucesión

### Estados Inconsistentes

- [ ] Estudiante con plan vencido intenta acceder contenido
- [ ] Docente sin comisión asignada ve dashboard vacío
- [ ] Tutor sin hijos ve mensaje apropiado

### Permisos Cross-Portal

- [ ] Tutor NO puede ver estudiantes de otro tutor
- [ ] Docente NO puede ver comisiones de otro docente
- [ ] Estudiante NO puede ver progreso de otro estudiante
- [ ] Admin SÍ puede ver todo

---

## PRIORIDAD DE IMPLEMENTACIÓN

### P0 - CRÍTICOS (Bloquean operación)

1. Flujo de inscripción completo
2. Flujo de pagos (manual ya implementado)
3. Login/Auth cross-portal

### P1 - IMPORTANTES (Afectan experiencia)

4. Asignación a comisión
5. Progreso y gamificación
6. Clase en vivo

### P2 - NECESARIOS (Funcionalidad completa)

7. Gestión de usuarios
8. Contenido y planificaciones
9. Sistema Casa/Mundo

---

## NOTAS PARA IMPLEMENTACIÓN

1. **Base de datos de test**: Usar Docker con PostgreSQL en puerto 5433
2. **Aislamiento**: Cada test debe limpiar sus datos (truncate entre tests)
3. **Auth real**: No mockear autenticación, probar flujo completo con cookies
4. **Tiempo real**: Para LiveKit, usar mocks del SDK pero probar tokens reales
5. **Webhooks**: Simular llamadas de MercadoPago con firmas válidas

---

## CHECKLIST PRE-PRODUCCIÓN

- [ ] Todos los flujos P0 tienen tests E2E pasando
- [ ] Coverage > 80% en código crítico de pagos
- [ ] Tests corren en < 5 minutos
- [ ] No hay tests flaky (correr 3 veces sin fallos)
- [ ] Documentación de cada flujo actualizada

---

_Documento generado para auditoría. Implementar tests según prioridad._
