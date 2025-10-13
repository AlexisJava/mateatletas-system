# Slice #6 - Pagos (MercadoPago) - Resumen de Implementación

## Estado: ✅ COMPLETADO

---

## 📋 Resumen General

Se implementó el sistema completo de pagos y membresías con integración a MercadoPago, incluyendo:
- Gestión de suscripciones de tutores (membresías)
- Gestión de pagos de cursos para estudiantes
- Webhooks para procesamiento asíncrono de pagos
- Modo MOCK para desarrollo sin credenciales de MercadoPago

---

## 🗄️ Cambios en Base de Datos

### Nuevos Enums

```prisma
enum EstadoMembresia {
  Pendiente  // Pago iniciado, esperando confirmación de webhook
  Activa     // Pago confirmado por webhook
  Atrasada   // Pago vencido
  Cancelada  // Membresía cancelada manualmente
}

enum EstadoInscripcionCurso {
  PreInscrito // Inscrito antes del inicio del curso
  Activo      // Curso en progreso
  Finalizado  // Curso completado
}
```

### Nuevos Modelos

#### Membresia
- **Propósito**: Vincular tutores con productos de suscripción
- **Campos clave**:
  - `estado`: Estado de la membresía (Pendiente → Activa)
  - `fecha_inicio`: Se llena cuando webhook confirma pago
  - `fecha_proximo_pago`: Se calcula basado en duracion_meses del producto
  - `preferencia_id`: ID de MercadoPago para tracking
- **Relaciones**:
  - `tutor`: Un tutor puede tener varias membresías
  - `producto`: Cada membresía vincula a un producto tipo Suscripcion
- **Índices**: `[tutor_id, estado]`, `[preferencia_id]`

#### InscripcionCurso
- **Propósito**: Vincular estudiantes con productos de curso
- **Campos clave**:
  - `estado`: Estado de inscripción (PreInscrito → Activo → Finalizado)
  - `fecha_inscripcion`: Fecha de creación del registro
  - `preferencia_id`: ID de MercadoPago para tracking
- **Relaciones**:
  - `estudiante`: Relación con estudiante (onDelete: Cascade)
  - `producto`: Cada inscripción vincula a un producto tipo Curso
- **Constraint**: `@@unique([estudiante_id, producto_id])` evita inscripciones duplicadas
- **Índices**: `[estudiante_id, estado]`, `[preferencia_id]`

### Migración
- **Archivo**: `20251012234351_create_membresias_inscripciones`
- **Aplicada**: ✅ Sí

---

## 📦 Nuevos Módulos

### PagosModule

#### Estructura de archivos:
```
src/pagos/
├── dto/
│   ├── iniciar-suscripcion.dto.ts
│   └── iniciar-compra-curso.dto.ts
├── pagos.controller.ts
├── pagos.service.ts
└── pagos.module.ts
```

#### PagosService
**Responsabilidades**:
- Crear preferencias de pago en MercadoPago (o mock)
- Procesar webhooks de notificaciones de pago
- Actualizar estados de membresías e inscripciones
- Consultar estados para polling

**Modo MOCK**:
- Se activa automáticamente si `MERCADOPAGO_ACCESS_TOKEN` contiene "XXXXXXXX"
- Genera preferencias simuladas con URLs mock
- Ignora webhooks (deben testearse manualmente)
- Permite desarrollo sin credenciales reales

**Métodos principales**:
1. `generarPreferenciaSuscripcion(tutorId, productoId?)`
   - Crea membresía en estado Pendiente
   - Genera preferencia de MP (o mock)
   - Retorna `init_point` para redirigir al usuario

2. `generarPreferenciaCurso(tutorId, estudianteId, productoId)`
   - Valida que estudiante pertenezca al tutor
   - Crea inscripción en estado PreInscrito
   - Genera preferencia de MP (o mock)

3. `procesarWebhookMercadoPago(body)`
   - Recibe notificaciones de MercadoPago
   - Obtiene detalles del pago via SDK
   - Actualiza estado según `payment.status`:
     - `approved` → Activa membresía/inscripción
     - `rejected/cancelled` → Cancela/elimina
     - Otros → Mantiene Pendiente

4. `obtenerMembresiaTutor(tutorId)`
   - Retorna membresía activa o pendiente más reciente

5. `obtenerEstadoMembresia(membresiaId, tutorId)`
   - Para polling desde frontend después de pago

6. `obtenerInscripcionesEstudiante(estudianteId, tutorId)`
   - Lista inscripciones de un estudiante

#### PagosController
**Endpoints públicos**:
- `POST /api/pagos/webhook` - Recibe notificaciones de MercadoPago

**Endpoints protegidos** (requieren JWT de tutor):
- `POST /api/pagos/suscripcion` - Inicia pago de suscripción
- `POST /api/pagos/curso` - Inicia pago de curso
- `GET /api/pagos/membresia` - Obtiene membresía del tutor
- `GET /api/pagos/membresia/:id/estado` - Consulta estado (polling)
- `GET /api/pagos/inscripciones?estudianteId=...` - Lista inscripciones

---

## 🔄 Flujo de Pago - Diagrama de Estados

### Flujo de Suscripción (Membresía)

```
1. Frontend: POST /api/pagos/suscripcion { productoId? }
   ↓
2. Backend: Crea Membresia (estado: Pendiente)
   ↓
3. Backend: Crea preferencia en MercadoPago
   ↓
4. Backend: Retorna { init_point, membresiaId }
   ↓
5. Frontend: Redirige usuario a init_point (checkout MP)
   ↓
6. Usuario: Completa pago en MercadoPago
   ↓
7. MercadoPago: POST /api/pagos/webhook { type: 'payment', data: { id } }
   ↓
8. Backend: Obtiene payment desde MP SDK
   ↓
9. Backend: Si payment.status === 'approved':
      - Actualiza Membresia (estado: Activa)
      - Calcula fecha_inicio = now
      - Calcula fecha_proximo_pago = fecha_inicio + duracion_meses
   ↓
10. Frontend (polling): GET /api/pagos/membresia/:id/estado
    - Detecta cambio a 'Activa' → redirige a dashboard
```

### Flujo de Curso (Inscripción)

```
Similar al flujo de suscripción, pero:
- Crea InscripcionCurso (estado: PreInscrito)
- Si pago aprobado → estado: Activo
- Si rechazado → Elimina inscripción (en vez de cancelar)
```

---

## 🔧 Configuración

### Variables de Entorno (.env)
```bash
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN="TEST-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
MERCADOPAGO_PUBLIC_KEY="TEST-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
```

**Nota**: El placeholder "XXXXXXXX" activa el modo MOCK automáticamente.

### Dependencias Instaladas
```bash
npm install mercadopago
```

---

## 📝 Formato de External Reference

Las preferencias de pago incluyen un `external_reference` que codifica información para el webhook:

**Membresía**:
```
membresia-{membresiaId}-tutor-{tutorId}-producto-{productoId}
```

**Inscripción**:
```
inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}
```

El webhook parsea este string para identificar qué entidad actualizar.

---

## 🧪 Testing

### Testing Manual en Modo MOCK

1. **Iniciar suscripción**:
```bash
curl -X POST http://localhost:3001/api/pagos/suscripcion \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Respuesta esperada:
```json
{
  "init_point": "http://localhost:3000/mock-checkout?membresiaId=xxx&tipo=suscripcion",
  "membresiaId": "xxx",
  "preferenciaId": "MOCK-PREF-1234567890"
}
```

2. **Consultar estado**:
```bash
curl http://localhost:3001/api/pagos/membresia/:id/estado \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Simular webhook (modo mock ignora esto, pero en prod funciona)**:
```bash
curl -X POST http://localhost:3001/api/pagos/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": { "id": "12345678" }
  }'
```

### Testing con MercadoPago Real

1. Obtener credenciales TEST en: https://www.mercadopago.com.ar/developers/panel/app
2. Actualizar `.env` con credenciales reales
3. Reiniciar servidor (debería mostrar "✅ MercadoPago SDK initialized successfully")
4. Usar tarjetas de prueba de MercadoPago para simular pagos

---

## 🔒 Seguridad

### Guards Aplicados
- `JwtAuthGuard`: Todos los endpoints excepto webhook
- **Ownership validation**:
  - Solo tutores pueden crear sus propias membresías
  - Solo pueden comprar cursos para sus estudiantes
  - Solo pueden consultar sus propias membresías/inscripciones

### Webhook Security
- **Pendiente**: Implementar validación de firma HMAC de MercadoPago
- **Recomendación**: Agregar `x-signature` validation en producción

---

## 📊 Arquitectura de Decisiones

### ¿Por qué crear entidades en estado Pendiente ANTES del pago?

**Ventajas**:
1. Permite tracking del flujo completo desde inicio
2. Facilita debugging (puedes ver pagos abandonados)
3. El `external_reference` puede incluir IDs reales
4. Simplifica el webhook (solo actualiza, no crea)

**Alternativa descartada**: Crear en webhook
- Problema: Webhook puede fallar/duplicarse
- Problema: Race conditions si usuario abandona y vuelve

### ¿Por qué modo MOCK automático?

**Razones**:
1. Permite desarrollo sin configurar cuenta de MercadoPago
2. Evita crasheos del servidor por credenciales faltantes
3. Facilita testing de frontend con URLs simuladas
4. El switch es automático (basado en placeholders en .env)

---

## 🚀 Estado de Completitud

### ✅ Implementado
- [x] Modelos de base de datos con estados
- [x] Migraciones aplicadas
- [x] PagosService con modo MOCK
- [x] PagosController con todos los endpoints
- [x] Integración con ProductosService
- [x] Webhook handling básico
- [x] Guards de autenticación
- [x] Validación de ownership
- [x] Servidor funcionando sin errores

### 🔜 Pendiente (para futuras iteraciones)
- [ ] Validación de firma HMAC en webhook
- [ ] Manejo de renovaciones automáticas
- [ ] Cronjob para detectar membresías Atrasadas
- [ ] Tests unitarios y E2E
- [ ] Manejo de reembolsos
- [ ] Historial de pagos por tutor

---

## 📚 Relación con Slices Anteriores

**Depende de**:
- Slice #1 (Auth): Usa JWT y guards
- Slice #2 (Estudiantes): Valida ownership de estudiantes
- Slice #5 (Catálogo): Consume ProductosService

**Será usado por**:
- Slice #7 (Clases): Validar que tutor tenga membresía activa
- Slice #8 (Reservas): Validar que estudiante tenga curso activo
- Slice #9 (Asistencia): Similar a #8

---

## 🎯 Endpoints Disponibles

### Productos (Slice #5)
- `GET /api/productos` - Lista todos los productos
- `GET /api/productos/cursos` - Lista solo cursos disponibles
- `GET /api/productos/suscripciones` - Lista solo suscripciones
- `GET /api/productos/:id` - Obtiene un producto
- `POST /api/productos` (protegido) - Crear producto
- `PATCH /api/productos/:id` (protegido) - Actualizar producto
- `DELETE /api/productos/:id` (protegido) - Eliminar producto

### Pagos (Slice #6)
- `POST /api/pagos/suscripcion` (protegido) - Iniciar pago de suscripción
- `POST /api/pagos/curso` (protegido) - Iniciar pago de curso
- `POST /api/pagos/webhook` (público) - Webhook de MercadoPago
- `GET /api/pagos/membresia` (protegido) - Obtener membresía del tutor
- `GET /api/pagos/membresia/:id/estado` (protegido) - Polling de estado
- `GET /api/pagos/inscripciones` (protegido) - Lista inscripciones de estudiante

---

## 🏁 Conclusión

El Slice #6 está **completamente funcional** con:
- ✅ 2 enums para estados
- ✅ 2 nuevos modelos (Membresia, InscripcionCurso)
- ✅ 1 migración aplicada
- ✅ 1 módulo completo (PagosModule)
- ✅ 6 endpoints REST
- ✅ Integración con MercadoPago SDK
- ✅ Modo MOCK para desarrollo
- ✅ Servidor compilando y corriendo sin errores

**Próximo paso**: El usuario puede indicar el siguiente slice a implementar.
