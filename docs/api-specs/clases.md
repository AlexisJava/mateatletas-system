Clases (Academico)

    Propósito: Gestionar las Clases en vivo: programación de clases por parte de admins, reserva de clases por tutores para sus hijos (inscripciones), y registro de asistencia y feedback por docentes.

    Subslices:

        Programación de Clases: creación, edición y cancelación de clases (por Admin).

        Reservas (Inscripciones a Clase): reserva de cupo en clase para un estudiante (por Tutor).

        Asistencia: registro de asistencia y observaciones tras la clase (por Docente).

    Relación con otros módulos:

        Usuarios/Docentes: cada Clase tiene un Docente asignado.

        Usuarios/Estudiantes & Tutores: los Tutores reservan clases para Estudiantes; se valida membresía activa (Pagos).

        Pagos: cada clase puede estar vinculada a un producto (ej. clases de un Curso específico) para restringir reservas a quienes compraron ese curso; se valida InscripcionCurso.

        Gamificación: tras la clase, en Asistencia, el Docente otorga puntos/logros a Estudiantes (se implementa en Gamificación slice).

        Admin: admin puede ver clases programadas, cancelarlas, y monitorear asistencia (parte de Panel admin).

Programación de Clases
Prompt de desarrollo

Implement the **Programación de Clases** sub-slice.

**Backend (NestJS)**:
- Use the Academico module (if exists) or create a `ClasesModule` within it.
- **Prisma Schema**: Add `Clase` model:
  - Fields: `id (PK)`, `rutaCurricularId` (FK to RutaCurricular table), `docenteId` (FK to Docente), `fechaHoraInicio` (DateTime), `duracionMinutos` (Int), `estado` (enum: 'Programada','Cancelada'), `cuposMaximo` (Int), `cuposOcupados` (Int default 0), `productoId` (Int, FK to Producto, nullable).
  - If `productoId` is null, it’s a regular subscription class; if not null (points to a Curso product), only students with that course can attend.
  - Also define `RutaCurricular` model if not exists (id, nombre) for class category/topic.
- **ClaseService**:
  - `programarClase(dto: CrearClaseDto)`: Admin schedules a new class. Create Clase record (estado 'Programada', cuposOcupados=0).
    * Increase sequence if needed (not required).
  - `cancelarClase(id)`: Mark clase.estado = 'Cancelada'.
    * Optionally notify related reservations (not in scope, but set `cuposOcupados` to 0 or just keep record).
  - `listarClases(params)`: 
    * If admin: list all (optionally filter by upcoming).
    * If tutor/estudiante: list upcoming classes with estado 'Programada' (and maybe not full). Possibly exclude course classes they can't attend (productId not null if they don't have InscripcionCurso).
    * If docente: list classes where docenteId = logged teacher id (upcoming or all for their schedule).
    * Implement logic: based on user role and maybe query filters (e.g., by date or route).
  - `incrementarCuposOcupados(claseId)`: helper to +1 cuposOcupados (ensuring not exceed cuposMaximo).
  - `decrementarCuposOcupados(claseId)`: (for cancellations of reservation, optional).
- **ClaseController**:
  - `POST /api/clases` – Create class (Admin only). Body: { rutaCurricularId, docenteId, fechaHoraInicio, duracionMinutos, cuposMaximo, productoId? }. Returns class data.
  - `GET /api/clases` – List classes. Behavior depends on role:
    * If Admin: all classes (maybe include past).
    * If Tutor/Estudiante: upcoming classes (estado Programada, fecha >= now, not cancelled). Possibly filter out full classes (cuposOcupados >= cuposMaximo).
    * If Docente: classes for that docente (their schedule).
    * This can be handled by service based on user role from JWT.
  - `PATCH /api/clases/:id/cancelar` – Cancel class (Admin or Docente maybe). Sets estado='Cancelada'. If Docente cancels their class, possibly allowed with admin permission; we assume Admin triggers cancellations.
  - (Optional) `GET /api/clases/:id` – get details (maybe including enrolled students, handled in Asistencia subslice).
- **RutaCurricular**:
  - If needed for categorization, create `RutaCurricular` model (id, nombre, maybe color). Seed with some subjects (e.g., "Lógica", "Álgebra").
  - Provide `GET /api/rutas-curriculares` if front needs to list categories for filters or class creation form.
- **Security**:
  - Admin: can create, cancel any class, list all.
  - Docente: can list their classes, possibly cancel with permission (we'll keep cancel admin-only for now).
  - Tutor/Estudiante: can list classes available (read-only).
  - Use roles guard accordingly.

**Frontend (Next.js)**:
- **Admin - Agenda de Clases** (`/admin/clases`):
  - Display calendar or list of all scheduled classes. Possibly group by date or filter by route/docente.
  - Show each class: route, fecha/hora, docente nombre, cupos (e.g., "5/10 inscritos").
  - Allow admin to cancel (button "Cancelar" sets estado).
  - Link or button to "Programar Clase".
- **Admin - Programar Clase** (`/admin/clases/nuevo`):
  - Form: select RutaCurricular (dropdown), select Docente (dropdown), date/time picker, duration, cuposMaximo, and optionally link to a Product (if this class is part of a specific course).
  - Submit -> POST /api/clases. On success, go back to list.
- **Tutor/Estudiante - Ver Clases** (`/tutor/clases` or combined `/clases`):
  - List or calendar of upcoming classes (only Programada, not cancelled).
  - Show key info: date/time, topic (ruta), teacher name, available seats (cupos left).
  - Each class item: if not full, a "Reservar" button. If full or cancelled, indicate as such (disabled).
  - If class is part of a course (productId not null) and the student is not enrolled in that course, either hide it or mark as "Restringida" (to avoid confusion). Alternatively, backend won't list those anyway for tutor, so simpler.
  - Possibly filter by route (e.g., dropdown to filter by subject).
- **Docente - Mis Clases** (`/docente/clases`):
  - List of classes that this docente will teach (from now onwards). Show which ones, maybe allow clicking to manage attendance (link to Asistencia page).
  - Possibly integrated into Docente Dashboard.
- **Interactions**:
  - When Tutor clicks "Reservar" -> goes to Reservas subslice (which will handle the actual booking).
  - Admin cancelling a class might need to also handle any existing reservations (could either automatically remove them or mark something; initially, we can just prevent new ones and leave it).
  - If class canceled, front for tutor should hide or mark as cancelled.

**API Integration**:
- `useQuery('clases', fetchClases)` – will call GET /clases. The backend handles filtering by role.
- Admin might use separate query or same with role check.
- `useMutation(programarClase)` – POST /clases for admin.
- `useMutation(cancelarClase)` – PATCH /clases/:id/cancelar.
- Possibly `useQuery('rutasCurriculares', fetchRutas)` for dropdown options in form.

**Types**:
- `Clase`: { id, rutaCurricularId, docenteId, fechaHoraInicio, duracionMinutos, estado: 'Programada'|'Cancelada', cuposMaximo, cuposOcupados, productoId? }.
- `CrearClaseDto`: { rutaCurricularId, docenteId, fechaHoraInicio (string or Date), duracionMinutos, cuposMaximo, productoId? }.
- `ClaseDetails`: for GET listing, we want to include related info:
  - e.g., docente: { nombre, apellido }, ruta: { nombre } so we can display names without extra calls.
  - We can have service do Prisma include or separate API calls. Better include:
    * Prisma query include: docente { nombre apellido }, rutaCurricular { nombre }.
  - Define front type accordingly: e.g., `ClaseConInfo extends Clase { docente: { nombre, apellido }, ruta: { nombre } }`.
- `RutaCurricular`: { id, nombre }.

**Orden de implementación (Programación)**:
1. **Prisma**: Add `RutaCurricular` model (id, nombre) and `Clase` model with fields and relations (docenteId->Docente, rutaCurricularId->RutaCurricular, productoId->Producto). Add enum for clase estado.
2. **Backend**: Create ClasesModule within Academico (or as separate module imported in AppModule).
3. Implement ClasesService.programarClase, listarClases, cancelarClase. Use logic per role:
   - Identify user role from JWT (could use a decorator or pass user to service).
   - Query classes accordingly.
   - Ensure includes for docente name and ruta name in find.
4. Implement ClasesController:
   - POST /clases (Admin only).
   - GET /clases (Authenticated: returns based on role logic).
   - PATCH /clases/:id/cancelar (Admin only in this version).
   - Possibly GET /rutas-curriculares for admin form (or seed them and code static list).
5. **Frontend Admin**:
   - `/admin/clases`: useQuery('clases') to fetch all. Render list or simple table.
   - `/admin/clases/nuevo`: useQuery('docentes') for teacher options, useQuery('rutasCurriculares') or static list for routes, form to fill details, on submit useMutation(programarClase).
   - After adding, redirect to list.
   - Cancel: incorporate a Cancel button in list row, calling mutation cancelarClase, with confirmation prompt.
6. **Frontend Tutor**:
   - `/tutor/clases`: useQuery('clases') (the same endpoint, but backend returns only relevant classes for tutor).
   - Loop through classes, show info, if class.cuposOcupados < cuposMaximo -> show "Reservar" button that opens reservation (the Reservas subslice will handle calling POST /inscripciones).
   - Possibly filter by topic or search.
7. **Frontend Docente**:
   - `/docente/clases`: useQuery('clases') (backend will filter to only their classes via role check). Show list, highlight if any class canceled, etc.
   - Each item might link to Attendance page (like `/docente/clases/[id]/asistencia`).
8. **Testing**:
   - Create a few classes via admin form, verify they appear in admin list, tutor list (if membership and courses conditions allow).
   - Try canceling a class (admin action), verify its state changes (maybe disappears or marked canceled in tutor/docente view).
   - Ensure a tutor can reserve after membership check (already handled).
   - Ensure teacher sees only their classes.
   - Edge: If a class is full (cuposOcupados == cuposMaximo), tutor view should ideally not show reserve or mark as "Lleno".
   - Could simulate making it full by directly creating Inscripciones (via Reservas actions or DB) and refresh front to see effect.

Now, proceed to Reservas and Asistencia similarly.

Backend (Programación de Clases)

    Modelo Prisma RutaCurricular & Clase:

    model RutaCurricular {
      id    Int    @id @default(autoincrement())
      nombre String
      clases Clase[]
    }

    enum EstadoClase {
      Programada
      Cancelada
    }

    model Clase {
      id              Int          @id @default(autoincrement())
      rutaCurricularId Int
      rutaCurricular   RutaCurricular @relation(fields: [rutaCurricularId], references: [id])
      docenteId       Int
      docente         Docente     @relation(fields: [docenteId], references: [id])
      fechaHoraInicio DateTime
      duracionMinutos Int
      estado          EstadoClase
      cuposMaximo     Int
      cuposOcupados   Int       @default(0)
      productoId      Int?      // nullable; link to Producto if class is part of a course
      producto        Producto? @relation(fields: [productoId], references: [id])
      inscripciones   Inscripcion[]  // reservas de estudiantes a esta clase
    }

        Migrar y seed RutaCurricular (ej. insert algunas rutas predefinidas).

    ClasesModule: Crear clases.module.ts importando PrismaModule, UsuariosModule (por Docente).

    ClasesService:

        programar(dto):

            Valida Docente existe, RutaCurricular existe.

            Crea Clase: prisma.clase.create({ data: {...dto, estado: 'Programada', cuposOcupados: 0} }).

        cancelarClase(id):

            prisma.clase.update({ where:{id}, data:{ estado: 'Cancelada' } }).

            (Opcional: también marcar sus Inscripciones estado_asistencia = 'Cancelada' o similar si definimos, pero no requerido.)

        findAllForAdmin():

            prisma.clase.findMany({ include: { docente: { select: { nombre, apellido }}, rutaCurricular: { select: { nombre }} } }) (no filter = all classes).

        findUpcomingForTutor(tutorId):

            Query classes with estado = Programada and fechaHoraInicio >= now (futuras).

            Exclude classes that are part of a curso the tutor's children are not enrolled in:

                Could get tutor's InscripcionCurso productIds, then filter:
                OR (productoId is null) OR (productoId IN [list of curso ids tutor has]).

                Simpler: fetch classes with either productoId null OR if not null, ensure tutor has an active membership for that course:
                Actually, membership covers subscription classes only. For courses, need InscripcionCurso for any child.
                Possibly heavy logic; maybe allow backend to list all upcoming classes and just rely on booking step to prevent if not eligible. Simpler approach: don't filter out, but the Reservas check will block if not eligible. To avoid confusion, can hide them by filtering:

                    Get tutor's student IDs, then InscripcionCurso where estudianteId in those and estado 'Activo' -> collect productIds of purchased courses.

                    Then filter classes: (productoId == null OR productoId IN purchasedIds).

            Also filter out classes with estado 'Cancelada'.

            Could also filter out full classes (cuposOcupados >= cuposMaximo).

            Return classes with includes for names (docente, ruta).

        findForDocente(docenteId):

            Classes where docenteId = given, estado Programada (optionally include past classes too or not).

            Include ruta.

        Possibly unify in one method listarClases(usuario) that checks role:

            If user.role == 'Admin': call findAllForAdmin.

            If 'Tutor' or 'Estudiante': call findUpcomingForTutor.

            If 'Docente': call findForDocente.

        incrementarCupos(id):

            prisma.clase.update({ where:{id}, data:{ cuposOcupados: { increment: 1} } }) ensuring not above max (should check before call).

        Export these in service.

    ClasesController:

        @Post() (Roles('Admin')): use dto validated for crear clase. Calls service.programarClase. Returns created class (perhaps including expanded names for convenience).

        @Get() (Roles any authenticated):

            Determine role via token (e.g., use request.user).

            Call service.listarClasesByRole(user).

            Return list.

        @Patch(':id/cancelar') (Roles('Admin')): call service.cancelarClase(id). Return updated class or success message.

        @Get(':id') – not needed here (attendance slice will handle details).

    Seguridad & Validación:

        CrearClaseDto: ensure fechaHoraInicio > now, cuposMaximo > 0, duracion > 0, etc.

        Only Admin calls post/cancel, so guard it.

        For Get: allow Tutor, Docente, Estudiante (maybe all roles except none). Use JwtAuthGuard without RolesGuard or with Roles([...]).

    Integración conDocentes/Productos:

        When scheduling class, if associated with a course product, ensure product.tipo == 'Curso'.

        If route or docente not found, throw error.

Frontend (Programación de Clases)

    Admin Clases List (/admin/clases):

        useQuery('clases') -> GET /clases (admin gets all).

        Display as list grouped by date or simple chronological list.

        Show each: e.g., "10/10/2025 14:00 - Lógica con Prof. Ana - 2/5 inscriptos".

        If estado = Cancelada, indicate and maybe style differently.

        Buttons:

            "Cancelar" if estado=Programada -> calls cancelarClase mutation, on success refresh list.

            Possibly "Editar" (not implementing editing here for simplicity).

        "Programar Clase" button -> link to /admin/clases/nuevo.

    Admin Nueva Clase (/admin/clases/nuevo):

        useQuery('docentes') for teacher options, use static or query for rutas (if not many, can also define constant routes if seeded).

        Form fields:

            Fecha y hora (use datetime-local input or separate date & time fields).

            Duración (number input).

            RutaCurricular (select).

            Docente (select).

            Cupo máximo (number).

            Si se vincula a curso: maybe select "Curso (opcional)" drop-down listing product courses (useQuery('productos') filter tipo Curso).

        Submit: call createClase mutation with form data (convert datetime string to ISO).

        On success, redirect to /admin/clases.

    Tutor Clases (/tutor/clases):

        useQuery('clases') -> GET /clases (for tutor gets upcoming availables).

        List upcoming classes:

            Format date/time nicely, show subject and teacher.

            If Cupos disponibles: show e.g. "3 slots left" (cuposMaximo - cuposOcupados).

            If cuposOcupados == cuposMaximo or estado Cancelada: mark "Lleno" or "Cancelada" and disable reserve.

            "Reservar" button: on click, open reservation confirmation (call POST /inscripciones in Reservas slice).

                Could integrate directly: maybe call a function passed from Reservas component/hook.

                Or navigate to a page /tutor/clases/[id]/reservar that handles calling the API (optional).

                Simpler: handle inline with a mutation to Inscripciones API, then possibly update UI (increase cuposOcupados).

                If success, maybe show "Reservado" or remove reserve button.

            We implement reservation formally in Reservas subslice.

        Perhaps allow filtering classes by route or date (not mandatory).

    Docente Mis Clases (/docente/clases):

        useQuery('clases') -> GET /clases (docente gets their classes).

        List classes the teacher will give, sorted by date.

        Show class details (date/time, route, maybe how many students reserved so far).

        Possibly link each to attendance page (like a button "Tomar asistencia" that navigates to /docente/clases/[id]/asistencia).

        If class canceled, indicate it (and likely they'd not take attendance for canceled).

    Cancel flows:

        If Admin cancels a class:

            In admin list, it updates. In tutor list, ideally it should disappear or show canceled:

                Our GET for tutor likely filters out canceled anyway.

                So after cancel, tutor’s query if re-fetched will not list that class.

                If a tutor already reserved it, handling that in reservation cancellation might be needed but skip for now.

            Docente's list: after cancel, that class would show as canceled or might be filtered out too? Could filter out canceled for teacher as they don't need to do anything for canceled classes.

                But maybe teacher should see it's canceled to know.

                For simplicity, filter it out from GET /clases for teacher as well or include but with estado Cancelada indicated.

                Could do either. Let's say we include but in UI style it as canceled.

        No explicit front logic for cancellation beyond calling the API by admin.

Now implement the next subslice: Reservas (Inscripciones a clase).
