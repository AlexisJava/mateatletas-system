# Checklist de Testing Pre-Producción

**Fecha objetivo:** 2026-01-16
**Preparado:** 2026-01-15

---

## Resumen de Endpoints

| Portal        | Endpoints | Estado  |
| ------------- | --------- | ------- |
| Auth          | 14        | Crítico |
| Admin         | 60+       | Alto    |
| Pagos         | 12        | Crítico |
| Estudiantes   | 35+       | Crítico |
| Docentes      | 30+       | Alto    |
| Tutores       | 4         | Medio   |
| Gamificación  | 15+       | Alto    |
| Suscripciones | 10        | Alto    |
| Clases        | 15        | Alto    |
| LiveKit       | 6         | Crítico |

---

## 🔴 CRÍTICO - Debe funcionar al 100%

### 1. Autenticación (bloquea todo si falla)

| Test               | Endpoint                 | Método  | Validar              |
| ------------------ | ------------------------ | ------- | -------------------- |
| Login tutor        | `/auth/login`            | POST    | JWT + refresh cookie |
| Login estudiante   | `/auth/estudiante/login` | POST    | JWT + refresh cookie |
| Refresh token      | `/auth/refresh`          | POST    | Nuevo access token   |
| Logout             | `/auth/logout`           | POST    | Cookies eliminadas   |
| Rate limit login   | `/auth/login`            | POST x6 | 429 al 6to intento   |
| Perfil autenticado | `/auth/profile`          | GET     | Datos usuario        |

**Casos edge:**

- [ ] Login con credenciales incorrectas → 401
- [ ] Login con usuario inexistente → 401
- [ ] Refresh con token expirado → 401
- [ ] Acceso a ruta protegida sin token → 401

---

### 2. Webhook MercadoPago (ingresos)

| Test                   | Endpoint         | Método           | Validar            |
| ---------------------- | ---------------- | ---------------- | ------------------ |
| Webhook válido         | `/pagos/webhook` | POST             | 200 + job encolado |
| Webhook sin firma      | `/pagos/webhook` | POST             | 401                |
| Webhook firma inválida | `/pagos/webhook` | POST             | 401                |
| Idempotencia           | `/pagos/webhook` | POST x2 mismo ID | No duplica         |

**Headers requeridos:**

```
x-signature: ts=TIMESTAMP,v1=HMAC
x-request-id: UUID
```

**Verificar en logs:**

- [ ] Job encolado en BullMQ
- [ ] Procesamiento async < 5s
- [ ] Estado actualizado en DB

---

### 3. Acceso a Plataforma (estudiantes)

| Test                        | Endpoint                          | Método | Validar                       |
| --------------------------- | --------------------------------- | ------ | ----------------------------- |
| Verificar acceso (con plan) | `/estudiantes/verificar-acceso`   | GET    | `{ tieneAcceso: true }`       |
| Verificar acceso (sin plan) | `/estudiantes/verificar-acceso`   | GET    | `{ tieneAcceso: false }`      |
| Verificar acceso (moroso)   | `/estudiantes/verificar-acceso`   | GET    | `{ tieneAcceso: false }`      |
| Puede entrar clase          | `/estudiantes/puede-entrar-clase` | GET    | `{ puedeEntrar: true/false }` |

**Escenarios de acceso:**

- [ ] Estudiante con suscripción activa del tutor → acceso
- [ ] Estudiante con plan directo → acceso
- [ ] Estudiante con comisión activa → acceso
- [ ] Estudiante con override admin → acceso
- [ ] Estudiante sin nada → sin acceso
- [ ] Estudiante moroso (>2 meses) → sin acceso

---

### 4. LiveKit - Clases en Vivo

| Test             | Endpoint                    | Método | Validar                        |
| ---------------- | --------------------------- | ------ | ------------------------------ |
| Token docente    | `/livekit/token/docente`    | POST   | JWT LiveKit + canPublish:true  |
| Token estudiante | `/livekit/token/estudiante` | POST   | JWT LiveKit + canPublish:false |
| Dar palabra      | `/livekit/dar-palabra`      | POST   | Estudiante puede hablar        |
| Quitar palabra   | `/livekit/quitar-palabra`   | POST   | Estudiante silenciado          |

**Body requerido:**

```json
{
  "claseGrupoId": "xxx" | "comisionId": "xxx"
}
```

---

## 🟡 ALTA PRIORIDAD - Flujo de negocio

### 5. Aula Virtual (contenido)

| Test               | Endpoint                                     | Método | Validar                   |
| ------------------ | -------------------------------------------- | ------ | ------------------------- |
| Mi aula            | `/estudiantes/mi-aula`                       | GET    | Planificaciones asignadas |
| Contenido teoría   | `/estudiantes/aula/contenido/:a/:c/teoria`   | GET    | Contenido JSON            |
| Contenido práctica | `/estudiantes/aula/contenido/:a/:c/practica` | GET    | Contenido JSON            |
| Completar lección  | `/estudiantes/aula/completar-leccion`        | POST   | XP otorgado               |

**Flujo completo:**

1. [ ] GET mi-aula → lista asignaciones
2. [ ] GET contenido teoría → renderiza
3. [ ] POST completar-leccion → progreso guardado
4. [ ] GET mi-progreso → refleja avance

---

### 6. Docente - Activar Clases

| Test             | Endpoint                                                      | Método | Validar               |
| ---------------- | ------------------------------------------------------------- | ------ | --------------------- |
| Mis asignaciones | `/docentes/me/asignaciones`                                   | GET    | Lista planificaciones |
| Activar clase    | `/docentes/asignaciones/:id/clases/:claseId/activar`          | POST   | Estado = activa       |
| Desactivar clase | `/docentes/asignaciones/:id/clases/:claseId/desactivar`       | POST   | Estado = inactiva     |
| Activar teoría   | `/docentes/asignaciones/:id/clases/:claseId/teoria/activar`   | POST   | Teoría visible        |
| Activar práctica | `/docentes/asignaciones/:id/clases/:claseId/practica/activar` | POST   | Práctica visible      |

**Flujo cross-portal:**

1. [ ] Docente activa clase
2. [ ] Estudiante ve contenido en mi-aula
3. [ ] Docente desactiva
4. [ ] Estudiante ya no ve contenido

---

### 7. Gamificación

| Test             | Endpoint                         | Método | Validar           |
| ---------------- | -------------------------------- | ------ | ----------------- |
| Dashboard        | `/gamificacion/dashboard/:id`    | GET    | XP, nivel, racha  |
| Otorgar puntos   | `/gamificacion/puntos`           | POST   | Puntos sumados    |
| Asignar insignia | `/gamificacion/asignar-insignia` | POST   | Insignia otorgada |
| Ranking          | `/gamificacion/ranking/:id`      | GET    | Posición en casa  |

**Body otorgar puntos:**

```json
{
  "estudianteId": "xxx",
  "accionTipoId": "xxx",
  "puntos": 10,
  "descripcion": "Participación en clase"
}
```

---

### 8. Pagos Manuales (Admin)

| Test            | Endpoint                       | Método | Validar             |
| --------------- | ------------------------------ | ------ | ------------------- |
| Pendientes      | `/admin/pagos/pendientes`      | GET    | Lista inscripciones |
| Registrar pago  | `/admin/pagos/registrar`       | POST   | Estado = Pagado     |
| Anular vencidas | `/admin/pagos/anular-vencidas` | POST   | Anulaciones día 13+ |

**Regla de negocio día 13:**

- [ ] Inscripción vencida día 1-12 → sigue pendiente
- [ ] Inscripción vencida día 13+ → se anula automáticamente

---

### 9. Suscripciones

| Test              | Endpoint                           | Método | Validar             |
| ----------------- | ---------------------------------- | ------ | ------------------- |
| Listar planes     | `/suscripciones/planes`            | GET    | Planes públicos     |
| Crear suscripción | `/suscripciones`                   | POST   | Link MP generado    |
| Mis suscripciones | `/suscripciones/mis-suscripciones` | GET    | Lista suscripciones |
| Cancelar          | `/suscripciones/:id/cancelar`      | POST   | Estado = cancelled  |

---

## 🟢 PRIORIDAD NORMAL

### 10. Admin - CRUD Básico

| Test               | Endpoint                              | Método | Validar                |
| ------------------ | ------------------------------------- | ------ | ---------------------- |
| Dashboard          | `/admin/dashboard`                    | GET    | Estadísticas           |
| Listar estudiantes | `/admin/estudiantes`                  | GET    | Paginación             |
| Crear estudiante   | `/admin/estudiantes/con-credenciales` | POST   | Credenciales generadas |
| Listar comisiones  | `/admin/comisiones`                   | GET    | Lista                  |
| Crear comisión     | `/admin/comisiones`                   | POST   | Comisión creada        |

---

### 11. Feed Social

| Test              | Endpoint                         | Método | Validar           |
| ----------------- | -------------------------------- | ------ | ----------------- |
| Feed global       | `/estudiantes/feed`              | GET    | Actividades       |
| Feed mi casa      | `/estudiantes/feed/mi-casa`      | GET    | Solo mi casa      |
| Reaccionar        | `/estudiantes/feed/:id/reaccion` | POST   | Reacción guardada |
| Límite reacciones | -                                | -      | Max 20/día        |

---

## Configuración de Test

### Variables de entorno requeridas

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
MERCADOPAGO_WEBHOOK_SECRET=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
REDIS_URL=... (opcional)
```

### Usuarios de prueba

| Rol        | Email            | Password  |
| ---------- | ---------------- | --------- |
| Admin      | admin@test.com   | (generar) |
| Docente    | docente@test.com | (generar) |
| Tutor      | tutor@test.com   | (generar) |
| Estudiante | -                | PIN: 1234 |

---

## Checklist Final Pre-Deploy

### Infraestructura

- [ ] Railway API healthcheck passing
- [ ] Vercel Web build OK
- [ ] PostgreSQL conexión OK
- [ ] Redis conexión OK (o fallback memory)
- [ ] BullMQ workers corriendo

### Seguridad

- [ ] CORS configurado para dominio prod
- [ ] Rate limiting activo
- [ ] CSRF tokens funcionando
- [ ] JWT refresh rotation OK

### Monitoreo

- [ ] Logs estructurados
- [ ] Métricas de circuit breakers
- [ ] Alertas configuradas

---

## Notas

- **Webhook es ASYNC**: Responde 200 inmediato, procesa en background
- **Multi-rol**: Algunos usuarios tienen ADMIN + DOCENTE
- **Ownership**: Tutores solo ven sus estudiantes
- **Rate limits**: Login 5/min, Refresh 10/min, Webhook 300/min
