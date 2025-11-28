## Pagos (Membresías y Pagos)

- **Propósito:** Implementar la lógica de pagos: creación de **Membresías** de suscripción, inscripción a cursos de pago único, e integración con la pasarela de pago (MercadoPago). Permite a los tutores comprar una suscripción y mantener el estado de pago, y comprar cursos individuales para sus hijos.
- **Subslices:** _No aplica._ (Incluye tanto suscripciones como pagos individuales.)
- **Relación con otros módulos:** Usa **Productos** del Catálogo (suscripción o curso). Crea **Membresía** para un Tutor al suscribirse. Crea **InscripciónCurso** para un Estudiante al comprar un curso. Interactúa con **MercadoPago** (o API externa) para procesar pagos. **Clases** y **Reservas** verifican la membresía activa. **Admin** monitorea estados de pago.

### Prompt de desarrollo

````text
Implement the **Pagos** vertical slice for subscriptions and one-time purchases.

**Backend (NestJS)**:
- Create a `PagosModule` with `PagosService` and `PagosController`.
- **Prisma Schema**: Add:
  - `Membresia` model: links a Tutor to a Product (subscription). Fields: `id`, `tutorId`, `productoId`, `estado` (enum: 'Activa','Atrasada','Cancelada'), `fechaInicio`, `fechaProximoPago` (DateTime).
  - `InscripcionCurso` model: links an Estudiante to a Product (course). Fields: `id`, `estudianteId`, `productoId`, `estado` (enum: 'PreInscrito','Activo','Finalizado').
  - Possibly `Pago` model to log transactions (id, tutorId, productoId, monto, fecha, estado), but can omit if using external reference via webhooks.
- **PagosService**:
  - `generarCheckoutSuscripcion(tutorId, productoId)`: Interact with MercadoPago SDK to create a payment preference for the subscription product. Set `external_reference` with tutorId and productoId.
  - `generarCheckoutCurso(tutorId, estudianteId, productoId)`: Similar to above but for a course purchase. Include estudianteId in external_reference or metadata so we know which student.
  - `procesarNotificacionPago(data)`: Handle webhook from MercadoPago. Verify payment status and external_reference, then:
    - If subscription payment approved: create or update Membresia for tutor:
      * If tutor has no membership yet, create one (estado 'Activa', fechaInicio = now, fechaProximoPago = now + 1 month).
      * If tutor had a membership 'Cancelada' or new, set Activa and fechaProximoPago accordingly.
    - If course payment approved: create InscripcionCurso linking student & product (estado 'Activo').
    - Possibly handle other statuses (pending, etc.) – not mandatory to implement fully now.
- **PagosController**:
  - `POST /api/pagos/suscripcion` – (Auth: Tutor) Initiates subscription checkout. Body might take `productoId` if multiple plans, but if one, can be fixed. Uses PagosService.generarCheckoutSuscripcion. Returns a preference URL or ID from MercadoPago.
  - `POST /api/pagos/curso` – (Auth: Tutor) Initiates course purchase checkout. Body: { productoId, estudianteId }. Uses PagosService.generarCheckoutCurso. Returns MP preference URL/ID.
  - `POST /api/pagos/webhook` – Endpoint to receive MercadoPago notifications (no auth). It will parse events:
    * Confirm it's a payment (e.g., topic 'payment').
    * Fetch detailed payment info from MP API if needed (MP often sends only an ID).
    * Call PagosService.procesarNotificacionPago with relevant data.
    * Respond 200.
  - `GET /api/membresia` – (Auth: Tutor) Returns the tutor's current membership status (estado, fechaProximoPago).
  - (Optional) `GET /api/inscripcion-curso?estudianteId=X` – returns the active course enrollments for that student or all if needed.
- **MercadoPago Integration**:
  - Use Official SDK or REST calls. Provide MP credentials via env.
  - In generarCheckout, create preference with:
    * item: { title: product.nombre, unit_price: product.precio, quantity: 1 }
    * payer: could include tutor email.
    * external_reference: a string encoding tutorId (and estudianteId if course, plus productId).
    * notification_url: URL of /api/pagos/webhook (publicly accessible) for MP to POST status updates.
    * success/failure URLs for front-end redirect (not strictly needed if using webhooks).
  - Possibly save the preference ID in a temp table or log (not necessary, can trust MP to call webhook).
- **Membresía logic**:
  - A tutor can have at most one active Membresía. If a payment is missed (fechaProximoPago passed without renewal), could mark 'Atrasada' via a cron job or next login check.
  - For simplicity, marking 'Atrasada' can be manual or future work. For now, focus on setting 'Activa' on purchase and perhaps updating estado to 'Cancelada' on explicit cancel (not implemented).
- **InscripcionCurso**:
  - When a course purchase is done, set estado 'Activo'. Possibly the course might have a start date; if purchase before start, maybe 'PreInscrito' initially then 'Activo' when started – could implement or skip.
  - Teacher or admin might later mark InscripcionCurso 'Finalizado' after course done (out of scope now).
- Ensure Clases reservation logic checks membership:
  - In Inscripciones (Reservas) slice, before allowing booking, verify tutor has Membresia.estado == 'Activa'. If not, throw Forbidden.
  - If class is tied to a course product (productoId on Clase), verify that estudiante has an 'Activo' InscripcionCurso for that product (else forbid booking).
  - (These checks can be integrated now that Pagos models exist).

**Frontend (Next.js)**:
- **Suscripción Compra Flujo**:
  - On `/suscripcion` page, clicking "Suscribirme":
    * Call `POST /api/pagos/suscripcion` to get preference.
    * Response: either a redirect URL or preferenceId.
    * If URL given (MercadoPago checkout URL), do `window.location.href = url` to redirect user to payment.
    * Alternatively, if using MP checkout widget, use preferenceId with their script to open modal (advanced).
  - After payment:
    * User is redirected to a return URL (could be our `/suscripcion/exito` or `/suscripcion/error` depending).
    * Implement pages:
      - `/suscripcion/exito`: show "¡Pago recibido! Su suscripción está activa." (But rely on webhook to actually activate).
      - `/suscripcion/error`: show error message.
    * In `exito` page, we can call `GET /api/membresia` to confirm status. Or just instruct user that it may take a moment.
    * Also update front-end state (maybe set something in tutor store like hasActiveMembership = true).
- **Cursos Compra Flujo**:
  - On `/cursos` page, clicking "Comprar":
    * If tutor has one student -> proceed. If multiple -> open a modal to select one.
    * After selecting student, call `POST /api/pagos/curso` with productoId and estudianteId.
    * Get preference URL, redirect to MP.
    * Return URL can be `/curso/exito?productoId=X`:
      - Show confirmation "Inscripción realizada". Possibly automatically enroll the student in any relevant class if needed (maybe not, course might have own schedule).
      - The InscripcionCurso should now exist (via webhook). We can call (optional) an API to get student's course enrollments to verify or just trust it.
- **Membresía Status UI**:
  - In Tutor Dashboard or Nav, indicate if subscription is active or not.
  - Use `GET /api/membresia` on app load or dashboard to get status. If 'Activa', show something (or nothing if normal). If not, maybe highlight "Sin suscripción".
- **Restriction**:
  - If no active membership, perhaps the app should restrict access to booking classes or AI Tutor usage. (Check membership on those actions anyway).
  - We can implement a client-side check: e.g., if membership inactive, redirect from /clases to /suscripcion.
  - But primarily rely on backend checks for security.

**API Integration**:
- `useMutation(startSubscription)` – calls POST /pagos/suscripcion (returns url).
- `useMutation(startCoursePurchase)` – calls POST /pagos/curso.
- Possibly no React Query needed for webhook; that's backend only.
- `useQuery('membresia', fetchMembresia)` – to get membership status on demand.

**Types**:
- Prisma will define `EstadoMembresia` enum ('Activa','Atrasada','Cancelada') and `EstadoInscripcionCurso` ('PreInscrito','Activo','Finalizado').
- Define TS types:
  - `Membresia`: { id, tutorId, productoId, estado: 'Activa'|'Atrasada'|'Cancelada', fechaInicio: string, fechaProximoPago: string }
  - `InscripcionCurso`: { id, estudianteId, productoId, estado: 'PreInscrito'|'Activo'|'Finalizado' }
  - `CheckoutPreferenceResponse`: backend might return { init_point: string } or similar (MP’s URL).
  - Data in external_reference: maybe format "tutor-{tutorId}-student-{studentId}-product-{productId}", parse accordingly. Not a type but mention parsing logic.

**Orden de implementación**:
1. **Prisma**: Añadir modelos `Membresia` y `InscripcionCurso`, con enums de estado. Migrar.
2. **Backend Pagos**: Configurar MercadoPago SDK with credentials in PagosService.
3. Implement `PagosService.generarCheckoutSuscripcion/Curso`:
   - Retrieve product (ensure type matches use).
   - Use MP SDK to create preference (test with sandbox credentials).
4. Implement `PagosController POST /suscripcion` y `/curso`: calls service, returns { init_point } URL.
5. Implement `PagosController POST /webhook`: parse and handle payment notifications. For dev, simulate by calling directly with dummy data if needed.
6. Implement membership check API: GET /membresia (returns membership or none).
7. **Backend Integration**: Update InscripcionesService (from Clases slice) to:
   - Check tutor’s Membresia.estado === 'Activa' before allowing class reservation.
   - If Clase.productoId is not null (means it's a course class), check InscripcionCurso exists for that student+producto (estado Activo).
8. **Frontend**:
   - On Suscripcion page, integrate mutation to get checkout URL and redirect.
   - Create success/cancel pages to handle MP return (these pages mainly for user feedback; the actual activation is via webhook).
   - On Cursos page, integrate purchase flow similarly.
   - On Dashboard, use useQuery('membresia') to conditionally render subscription warning or status.
   - Possibly automatically refresh membership status after payment success (maybe use polling or user re-login).
9. **Testing**:
   - Use MercadoPago test mode: try subscription purchase flow through sandbox (requires MP test account config).
   - Simulate webhook: after a successful test payment, MP will hit our webhook endpoint (if running and publicly reachable, else simulate by manual POST with sample JSON).
   - Verify Membresia created/updated in DB.
   - Verify membership check prevents/allows class booking accordingly.
   - For course purchase: simulate similarly.
   - Ensure no booking allowed without active subscription now.
10. **Finalize**: Tutor can now subscribe, and once subscribed, proceed to book classes; course purchase adds course enrollment records.

Backend (NestJS)

    Estructura: src/modules/pagos/

        pagos.module.ts – Importa CatalogoModule (para usar Producto), PrismaModule, declara PagosService y PagosController.

        pagos.service.ts – Lógica de integración pagos.

        pagos.controller.ts – Endpoints para iniciar pago y recibir webhooks.

    Modelo Prisma:

    enum EstadoMembresia {
      Pendiente    // Pago iniciado, esperando confirmación de webhook
      Activa       // Pago confirmado por webhook
      Atrasada     // Pago vencido
      Cancelada    // Membresía cancelada manualmente
    }
    enum EstadoInscripcionCurso {
      PreInscrito
      Activo
      Finalizado
    }

    model Membresia {
      id             Int @id @default(autoincrement())
      tutorId        Int
      tutor          Tutor @relation(fields: [tutorId], references: [id])
      productoId     Int
      producto       Producto @relation(fields: [productoId], references: [id])
      estado         EstadoMembresia @default(Pendiente) // Inicia como Pendiente
      fechaInicio    DateTime?       // Se llena cuando webhook confirma
      fechaProximoPago DateTime?      // Se llena cuando webhook confirma
      preferenciaId  String?          // ID de preferencia de MercadoPago (para tracking)
      creadoEn       DateTime @default(now())
    }

    model InscripcionCurso {
      id            Int @id @default(autoincrement())
      estudianteId  Int
      estudiante    Estudiante @relation(fields: [estudianteId], references: [id])
      productoId    Int
      producto      Producto @relation(fields: [productoId], references: [id])
      estado        EstadoInscripcionCurso
      fechaInscripcion DateTime @default(now())
    }

        Relaciona Membresia con Tutor y Producto (tipo Suscripcion), InscripcionCurso con Estudiante y Producto (tipo Curso).

        fechaProximoPago: próximo vencimiento (solo para suscripciones).

    PagosService:

        Inyectar PrismaService y quizás ConfigService para keys MP.

        Incluir MercadoPago SDK (ej: import * as mercadopago from 'mercadopago'; mercadopago.configure({ access_token: '...' });).

        async generarPreferenceSuscripcion(tutorId: number, productoId: number):

            Obtener producto = prisma.producto.findUnique(productoId). Debe ser tipo 'Suscripcion'.

            **NUEVO**: Crear registro Membresia en estado "Pendiente" ANTES de redirigir a MP:

                membresia = await prisma.membresia.create({
                  tutorId,
                  productoId,
                  estado: 'Pendiente',  // <-- Estado inicial
                  fechaInicio: null,    // Se llenará con el webhook
                  fechaProximoPago: null
                });

            Usar mercadopago.preferences.create({...}) con:

                items: [{ title: producto.nombre, unit_price: Number(producto.precio), quantity: 1 }]

                payer: { email: tutor.email } (opcional)

                external_reference: formatear ej. "membresia-${membresia.id}-tutor-${tutorId}-producto-${productoId}".

                notification_url: ${BASE_URL}/api/pagos/webhook (URL pública deploy, en dev usar ngrok).

                back_urls: { success: ${FRONT_URL}/suscripcion/exito?membresiaId=${membresia.id}, failure: ${FRONT_URL}/suscripcion/error }.

            **NUEVO**: Guardar preferenceId en la membresía para tracking:

                await prisma.membresia.update({
                  where: { id: membresia.id },
                  data: { preferenciaId: preference.id }
                });

            Recibir respuesta, return { init_point, membresiaId: membresia.id }.

        async generarPreferenceCurso(tutorId: number, estudianteId: number, productoId: number):

            Obtener producto = prisma.producto.findUnique(productoId), verificar tipo 'Curso'.

            Obtener estudiante (para info, e.g., name or just ID).

            Similar a suscripcion, pero external_reference: "tutor-${tutorId}-estudiante-${estudianteId}-producto-${productoId}".

            Crear preference con item title e.g. Curso: ${producto.nombre}.

            Return URL.

        async procesarPagoNotificacion(notif: any):

            MercadoPago enviará id de pago y quizá type/action.

            **IMPORTANTE**: Puede requerir hacer mercadopago.payment.findById(notif.id) para obtener detalles completos.

            Verificar status:

            **if status == 'approved'** (pago confirmado):

                Parse external_reference: e.g., split by '-' to get membresiaId/tutorId/productoId/estudianteId.

                Obtener producto para ver tipo.

                **Si producto.tipo == 'Suscripcion'**:

                    **CAMBIO**: Actualizar la membresía existente (creada en estado Pendiente):

                    await prisma.membresia.update({
                      where: { id: membresiaId }, // Obtenido del external_reference
                      data: {
                        estado: 'Activa',  // <-- Activar la membresía
                        fechaInicio: new Date(),
                        fechaProximoPago: addMonths(new Date(), 1) // +30 días
                      }
                    });

                **Si producto.tipo == 'Curso'**:

                    Crear prisma.inscripcionCurso.create({ estudianteId, productoId, estado: 'Activo', fechaInscripcion = now }).

            **if status == 'pending' o 'in_process'** (pago en proceso):

                No hacer nada, la membresía permanece en 'Pendiente'.

                Opcionalmente loguear para debugging.

            **if status == 'rejected' o 'cancelled'** (pago rechazado):

                Actualizar membresía a 'Cancelada' (o eliminarla):

                await prisma.membresia.update({
                  where: { id: membresiaId },
                  data: { estado: 'Cancelada' }
                });

            (In real usage, also verify amount matches producto.precio, etc.).

    PagosController:

        @Post('suscripcion') (Roles('Tutor')):

            Llama service.generarPreferenceSuscripcion(tutorId, productoId). (If only one subscription product, productoId se puede obtener buscándolo por tipo).

            Devuelve { init_point: string } o { url: string }.

        @Post('curso') (Roles('Tutor')):

            Body: { productoId, estudianteId }. Llama service.generarPreferenceCurso(tutorId from token, estudianteId, productoId).

            Devuelve URL similar.

        @Post('webhook') (Public, no auth):

            @Body() MP sends JSON. Handle verifying origin if needed via headers.

            Parse body: MP might send { action: 'payment.created', data: { id: '123' } } or similar.

            For simplicity, accept body, call service.procesarPagoNotificacion(body or data.id).

            Respond 200 immediately. (Important: MP requires a 200 quickly).

        @Get('membresia') (Roles('Tutor')):

            Busca la membresía activa del tutor (findFirst where tutorId and estado != Cancelada order by fechaInicio desc).

            Si hallada, devolver { estado, fechaProximoPago } (y quizá product info si needed).

            Si no, devolver { estado: 'SinMembresia' } o 204 No Content.

    Chequeo en Reservas (Inscripciones a Clase):

        En InscripcionesService.crearInscripcion(...) (Clases slice):

            Antes de crear:

                Verificar membresía: prisma.membresia.findFirst({ where: { tutorId: tutor.id, estado: 'Activa' }}) – si no hay activa, lanzar ForbiddenException("Membresía inactiva").

                Verificar clase.productoId:

                    Si != null (clase de curso), verificar prisma.inscripcionCurso.findFirst({ where: { estudianteId, productoId: clase.productoId, estado: 'Activo' } }). Si no existe, ForbiddenException("No inscrito en el curso de esta clase").

        Estos requisitos garantizan solo usuarios con suscripción activa reservan clases generales, y solo estudiantes inscritos en ese curso reservan clases de un curso.

Prisma (Base de Datos)

    Membresia: relación N:1 con Tutor y 1:1 con Producto (Suscripcion). Podría restringirse a un registro activo por tutor-producto.

    InscripcionCurso: relación N:1 con Estudiante y Producto (Curso).

    Agregar índices:

        Unique index en Membresia en [tutorId, productoId] si un tutor no puede tener duplicada para mismo producto.

        Unique en InscripcionCurso [estudianteId, productoId] para evitar duplicado.

    Migrar DB.

Frontend (Next.js)

    Suscripción flujo:

        En /suscripcion página:

            useMutation to POST /pagos/suscripcion.

            On mutate success, get { init_point } (URL to MP checkout).

            Redirect user: window.location.href = init_point.

        Crear páginas /suscripcion/exito y /suscripcion/error:

            Exito: Mostrar mensaje de éxito ("Gracias por suscribirse...").

                Optionally trigger refetchMembresia to update status.

                Possibly instruct user to re-login or refresh.

            Error: Mostrar mensaje de error ("Pago no completado...").

        Note: Even if user closes the MP window, webhook will still arrive. We rely on user going to exito or checking later.

    Curso compra flujo:

        En /cursos página:

            For "Comprar" button:

                If tutor.tiene múltiples estudiantes: abrir modal para elegir uno (list children).

                    On select, call POST /pagos/curso.

                If only one student, call directly with that estudianteId.

                Receive checkout URL, redirect similarly.

        Crear páginas /curso/exito & /curso/error (or reuse one for any product purchase):

            Exito: "Compra confirmada, el estudiante ha sido inscrito en el curso."

            Could show course name for confirmation.

            Perhaps link to class schedule or further instructions if any.

        Possibly also add in Estudiante's view (or tutor) a way to see which courses the student is enrolled in.

            Could use GET InscripcionCurso if needed to list purchased courses.

    Membresía en UI:

        En Tutor Dashboard, usar useQuery('membresia', api.getMembresia):

            Si resultado.estado === 'Activa', mostrar algo como "Suscripción activa. Próximo pago: 10/11/2025".

            Si no hay activa, mostrar alerta/boton "Suscribirse ahora" (link a /suscripcion).

        Este query también se puede usar on login to quickly know. Podría guardarse en Zustand (e.g., auth store add hasMembership).

        En rutas protegidas (clases, AI tutor), front puede opcionalmente checar store.membresiaEstado antes de permitir y redirigir a /suscripcion si inactiva (mejora UX).

    Estado InscripcionCurso en UI:

        Podría haber en Estudiante perfil una sección "Cursos Inscritos" – fuera de scope actual pero la data está lista si se necesitara.

        En Classes UI: si clase es de un curso no inscrito, backend ya impide reservar; front-end podría filtrar esas clases out or mark them (requires more info on classes: class might include productId, so front can know it's a course class).

        Para simplicidad, no implementar filtrado en front, dejar que backend error maneje (y mostrar mensaje "Debe inscribirse al curso para reservar esta clase").

API Clients & Store

    API calls:

        api.startSubscription() -> POST /pagos/suscripcion -> returns { init_point }.

        api.startCoursePurchase(estudianteId, productoId) -> POST /pagos/curso.

        api.getMembresia() -> GET /membresia.

        (If needed) api.getCursoInscripciones(estudianteId) -> GET /inscripcion-curso?estudianteId.

    React Query/Mutation:

        Use useMutation for startSubscription and startCoursePurchase (no caching needed).

        useQuery('membresia', api.getMembresia) for membership status.

        Possibly useQuery('cursosComprados', ()=>api.getCursoInscripciones(estId)) if implementing listing purchases.

    Zustand:

        Could extend auth store with membershipStatus or store the membership expiration, but since we have a query it's optional.

        Perhaps update store on successful subscription: after webhook or after next reload. Better rely on query to avoid stale.

Types

    Interfaces:

        Membresia: { estado: 'Activa'|'Atrasada'|'Cancelada'; fechaProximoPago: string|null; productoId: number; }

        InscripcionCurso: { estudianteId: number; productoId: number; estado: string; }

        Response from POST /pagos: { init_point: string; }.

        Possibly define shapes for MP webhook JSON if needed (not mandatory to expose to front).

    Enum usage:

        Reuse EstadoMembresia and EstadoInscripcionCurso in TS as string union or replicate as needed for type safety.

    External Reference format:

        **ACTUALIZADO**: "external_reference format: membresia-<membresiaId>-tutor-<id>-producto-<id>" para suscripciones.

        Para cursos: "inscripcion-<inscripcionId>-estudiante-<id>-producto-<id>".

        The code will parse accordingly:

            split by '-' -> find indices of keywords and parse numbers.

---

## Flujo Completo con Estado Pendiente (Asincronía de Webhooks)

### Problema Resuelto

Anteriormente, el usuario podía pagar y el webhook de MercadoPago tardaba segundos/minutos en llegar. Durante ese tiempo:
- La membresía no existía en DB
- El usuario intentaba reservar clase → Error "Sin membresía activa"
- Mala experiencia de usuario

### Solución Implementada

**1. Al iniciar pago (POST /pagos/suscripcion)**:
```typescript
// Backend crea membresía en estado "Pendiente" inmediatamente
const membresia = await prisma.membresia.create({
  data: {
    tutorId,
    productoId,
    estado: 'Pendiente', // <-- Estado inicial
    fechaInicio: null,
    fechaProximoPago: null
  }
});

// Redirige a MercadoPago con membresiaId en el external_reference
return { init_point, membresiaId };
````

**2. Usuario completa pago en MercadoPago**:

- Usuario es redirigido a `/suscripcion/exito?membresiaId=123`
- Frontend puede mostrar: "Procesando pago..." y polling del estado

**3. Webhook llega (asyncrono, 1-60 segundos después)**:

```typescript
// Webhook actualiza la membresía de Pendiente → Activa
await prisma.membresia.update({
  where: { id: membresiaId },
  data: {
    estado: 'Activa',
    fechaInicio: new Date(),
    fechaProximoPago: addMonths(new Date(), 1),
  },
});
```

**4. Frontend verifica estado**:

```typescript
// Página de éxito hace polling cada 2 segundos
const { data: membresia } = useQuery(
  ['membresia', membresiaId],
  () => api.getMembresia(membresiaId),
  {
    refetchInterval: (data) => (data?.estado === 'Pendiente' ? 2000 : false),
    refetchIntervalInBackground: true,
  },
);

if (membresia.estado === 'Activa') {
  // Mostrar "¡Pago confirmado! Ya podés reservar clases"
  router.push('/tutor/clases');
}
```

### Validación en Reservas

**Antes** (solo permitía 'Activa'):

```typescript
const membresia = await prisma.membresia.findFirst({
  where: { tutorId, estado: 'Activa' },
});

if (!membresia) {
  throw new ForbiddenException('Sin membresía activa');
}
```

**Ahora** (permite 'Pendiente' con advertencia):

```typescript
const membresia = await prisma.membresia.findFirst({
  where: { tutorId, estado: { in: ['Activa', 'Pendiente'] } },
});

if (!membresia) {
  throw new ForbiddenException('Sin membresía');
}

if (membresia.estado === 'Pendiente') {
  throw new ConflictException('Tu pago está siendo procesado. Intentá reservar en 1-2 minutos.');
}
```

### Estados de Membresía

| Estado        | Descripción                            | Permite Reservar Clases              |
| ------------- | -------------------------------------- | ------------------------------------ |
| **Pendiente** | Pago iniciado, esperando webhook       | ❌ No (mostrar mensaje "procesando") |
| **Activa**    | Pago confirmado                        | ✅ Sí                                |
| **Atrasada**  | Pago vencido                           | ❌ No                                |
| **Cancelada** | Cancelada manualmente o pago rechazado | ❌ No                                |

### Endpoint Adicional para Polling

```typescript
// GET /api/pagos/membresia/:id/estado
async getEstadoMembresia(
  @Param('id') membresiaId: number,
  @GetUser() tutor: Tutor
) {
  const membresia = await this.prisma.membresia.findFirst({
    where: { id: membresiaId, tutorId: tutor.id }
  });

  if (!membresia) {
    throw new NotFoundException();
  }

  return {
    estado: membresia.estado,
    fechaInicio: membresia.fechaInicio,
    fechaProximoPago: membresia.fechaProximoPago
  };
}
```

### Tiempo Esperado de Webhooks

| Ambiente                 | Tiempo Típico     |
| ------------------------ | ----------------- |
| **Sandbox (Test)**       | 5-30 segundos     |
| **Producción**           | 1-10 segundos     |
| **Con problemas de red** | Hasta 60 segundos |

**Timeout**: Si después de 2 minutos sigue en 'Pendiente', mostrar:

> "El pago está demorando más de lo esperado. Contactá a soporte con el código: MEMB-123"

Orden sugerido de implementación

    Modelo y Migración: Añadir Membresia, InscripcionCurso modelos, con enums. Migrar.

    MercadoPago Config: Integrar MP SDK in PagosService with test credentials.

    Implementar PagosService: generarPreferenceSuscripcion/Curso y webhook processing. Use console logs or MP sandbox to test output.

    Implementar PagosController: POST /suscripcion, /curso, /webhook, GET /membresia. Use dummy data to simulate (e.g., call /suscripcion, get URL, ensure it's valid (maybe open it manually), simulate webhook by POSTing sample).

    Integrar con otras lógicas: Update Inscripciones (clase booking) service to add membership and course checks.

    Frontend Suscripcion: Use dummy link or actual MP sandbox:

        Test clicking Suscribirse -> redirect to MP sandbox checkout -> after fake payment, ensure webhook logic runs (need public endpoint or simulate).

        For testing, consider using MP sandbox webhook by exposing your dev URL or simulate by calling local endpoint with a sample structure including tutorId etc.

        After simulating success, check DB: Membresia created, estado Activa.

        Then call GET /membresia in front to verify it shows active.

    Frontend Cursos: Similar approach: set up a course product, simulate purchase.

        Check InscripcionCurso created in DB.

        Possibly simulate by direct call to webhook with appropriate external_ref.

    UI adjustments: Show/hide appropriate info based on membership. Try booking a class without membership to see error (should get 403, handle it by showing message to user).

        Then subscribe, then try booking again (should succeed).

    Finalize: The payment system now gates class booking properly and allows adding paid courses.

    Admin/Monitoring: Admin can list membresías or transactions in future via admin panel (not implemented, maybe future Admin slice extension).
