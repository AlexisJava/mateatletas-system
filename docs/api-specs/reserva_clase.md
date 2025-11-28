## Reservas (Inscripciones a Clase)

#### Prompt de desarrollo

```text
Implement the **Reservas (Inscripción a Clase)** sub-slice.

**Backend (NestJS)**:
- Likely part of the same Academico domain (InscripcionesModule).
- **Prisma Schema**: Already have `Inscripcion` model if not, define:
  - `Inscripcion` linking Estudiante and Clase, fields: `id`, `claseId`, `estudianteId`, `estadoAsistencia` (enum: 'Pendiente','Asistio','Ausente'), `observacionesDocente` (String?, for feedback).
  - (We can repurpose `Inscripcion` from earlier architecture snippet or define anew.)
- **InscripcionesService**:
  - `crearInscripcion(tutorId, estudianteId, claseId)`:
    * Verify the estudiante belongs to tutor (to avoid booking someone else's child).
    * Verify Clase.estado == 'Programada' && fecha >= now (not in past or canceled).
    * Check class is not full: cuposOcupados < cuposMaximo.
    * **Check membership and course eligibility**:
      - If clase.productoId is null (normal class), ensure tutor has active membership (Pagos slice).
      - If clase.productoId is not null (course class), ensure an InscripcionCurso exists for estudianteId & that product (from Pagos).
    * If all good: create Inscripcion record with estadoAsistencia 'Pendiente', observacionesDocente null.
    * Increment clase.cuposOcupados by 1.
  - Possibly `cancelarInscripcion(id)` if tutor or admin wants to remove reservation (not in req, skip).
  - `listarInscripcionesPorClase(claseId)`:
    * For Docente to view the roster of a class. Return list of Inscripciones for given class, include Estudiante (nombre, apellido) and maybe attendance status.
  - `listarInscripcionesPorEstudiante(estudianteId)` (if needed to see what classes a student is enrolled in; not immediately needed).
- **InscripcionesController**:
  - `POST /api/inscripciones` – (Roles('Tutor')) Reserve a class spot. Body: { estudianteId, claseId }. Uses tutorId from token.
    * Calls crearInscripcion. Returns success or error.
  - `GET /api/inscripciones?claseId=X` – (Roles('Docente') or 'Admin') Get all inscriptions for a class (roster).
    * Ensure the requesting user is either Admin or the Docente of that class (check via claseId -> clase.docenteId).
    * Returns list of { inscripcionId, estudiante: { id, nombre, apellido }, estadoAsistencia, observacionesDocente } for that class.
  - (Optional) `DELETE /api/inscripciones/:id` – allow tutor to cancel a reservation (not specified, skip for now).
- **Security & Validation**:
  - In POST, use JwtAuthGuard + Roles('Tutor'). Service double-checks tutor's ownership of student.
  - In GET roster, Roles('Docente','Admin'), and service verifies if Docente, that class belongs to them.
  - Ensure unique Inscripcion: one student cannot be inscribed twice to same class (add unique index on estudianteId+claseId in Prisma).
  - Use exceptions appropriately (Conflict if full or already enrolled, Forbidden if no membership, etc).
- **Effects**:
  - When a reservation is created, that will be used later in Asistencia to mark attendance.
  - If needed, if class gets canceled, ideally we'd clean related inscripciones or mark them somehow (not implementing now).

**Frontend (Next.js)**:
- **Tutor Reserva UI**:
  - On `/tutor/clases` (from Programación section), when user clicks "Reservar" on a class:
    * Open a modal to choose which student (if tutor has multiple). If one, skip modal.
    * Confirm action -> call POST /api/inscripciones.
    * If success: show success toast ("Reservado correctamente").
      - Update UI: could increment the local cuposOcupados or refetch classes list to reflect it's now reserved or seat count updated.
      - Also perhaps mark that class as reserved: maybe disable further reservation or show "Reservado".
    * If error (403 due to membership or no access, 409 if already full, etc.), display error message.
  - Optionally, maintain a quick list of classes the tutor's kids are enrolled in (like upcoming reservations), but not required.
- **Docente Roster UI**:
  - On `/docente/clases` list, each class could have a button "Ver Inscripciones" or directly "Tomar Asistencia" which includes listing students.
  - Implement a page `/docente/clases/[id]/lista` or similar:
    * useQuery(['inscripciones', claseId], fetchInscripciones(claseId)).
    * Show table of students reserved:
      - Name, maybe something to mark attendance here (or that’s in Asistencia slice).
      - Initially, state would be 'Pendiente' for all.
      - The Asistencia subslice will handle marking 'Asistio/Ausente' and adding observations, perhaps in the same UI or separate step.
    * For now, this listing is mainly used for teacher to see who should attend.
- **No explicit front for cancellation by tutor** (if needed, would be a button to cancel reservation, not asked).
- Possibly integrate in student dashboard showing their upcoming classes, etc., but skip now.

**Types**:
- `Inscripcion`: { id, claseId, estudianteId, estadoAsistencia: 'Pendiente'|'Asistio'|'Ausente', observacionesDocente?: string }
- In front, for roster:
  - `InscripcionConEstudiante`: { id, estadoAsistencia, observacionesDocente, estudiante: { id, nombre, apellido } }
- Request:
  - `CrearInscripcionDto`: { claseId: number; estudianteId: number }

**Orden de implementación (Reservas)**:
1. **Prisma**: Add `Inscripcion` model with relations to Clase and Estudiante, plus estadoAsistencia enum ('Pendiente','Asistio','Ausente'). Unique index on (claseId, estudianteId).
2. **Backend**: Implement InscripcionesService.crearInscripcion:
   - Validate membership via Membresia (PagosService or Prisma query).
   - Validate InscripcionCurso for course classes.
   - Create record and increment cupos.
   - Throw exceptions for various failure conditions.
3. Implement InscripcionesController POST /inscripciones and GET /inscripciones?claseId.
4. Ensure to import PagosService or Prisma in InscripcionesService to check membership and inscripcionCurso.
   - Alternatively, use Prisma to query Membresia and InscripcionCurso directly.
5. **Frontend Tutor**:
   - In class list component, on Reserve click:
     * If >1 student: open student chooser (maybe reuse tutor's students from state or fetch from /estudiantes).
     * On confirm, call mutation `reserveClass({ estudianteId, claseId })`.
     * On success, perhaps set some state indicating reserved (to e.g. disable button).
     * Optionally refetch classes list to update seat count or mark reserved.
   - Provide user feedback (toast).
   - Possibly integrate that reserved state to avoid double booking: the backend will prevent duplicate anyway.
6. **Frontend Docente**:
   - Create roster view: e.g. `/docente/clases/[id]/asistencia` (since we will do attendance together, or separate `/lista` for roster).
   - Initially, just list students. The actual marking UI will come in Asistencia subslice.
   - But the GET /inscripciones provides data needed for that.
   - So implement that page using `useQuery('inscripciones', fetchInscripciones(claseId))`.
   - Display list of students.
7. **Testing**:
   - Use a tutor with active membership, try reserving a class for their child. Check DB: Inscripcion record created, clase.cuposOcupados incremented.
   - Try reserving same class again for same student (should get 409 conflict or appropriate error).
   - Try reserving when class is full (simulate by adjusting cuposOcupados = cuposMaximo then attempt, should get 409).
   - Try reserving class linked to a course without buying the course (should get Forbidden).
   - Teacher: open their class roster page, see the student just reserved listed as Pendiente.
   - Everything ready for marking attendance.

Backend (Reservas de Clase)

    Modelo Prisma Inscripcion:

    enum EstadoAsistencia {
      Pendiente
      Asistio
      Ausente
    }

    model Inscripcion {
      id               Int @id @default(autoincrement())
      claseId          Int
      clase            Clase @relation(fields: [claseId], references: [id])
      estudianteId     Int
      estudiante       Estudiante @relation(fields: [estudianteId], references: [id])
      estadoAsistencia EstadoAsistencia @default(Pendiente)
      observacionesDocente String?
      // Un estudiante solo una vez por clase:
      @@unique([claseId, estudianteId])
    }

        Migrar DB.

    InscripcionesModule: Create inscripciones.module.ts in academico or similar.

    InscripcionesService:

        Inyect PrismaService (and possibly services from PagosModule or just use Prisma for membership checks).

        async crear(dto: CrearInscripcionDto, tutorId: number)::

            Extract estudianteId, claseId.

            Validate Estudiante: find by id and ensure estudiante.tutorId == tutorId (if not, throw Forbidden).

            Find Clase: const clase = prisma.clase.findUnique({ where:{id: claseId}, include:{ producto:true } }).

                If not found or clase.estado != 'Programada' or class date < now -> throw BadRequest/Forbidden accordingly.

                If clase.estado == Cancelada -> throw Conflict("Class canceled").

            Check capacity: if clase.cuposOcupados >= clase.cuposMaximo -> throw Conflict("Class is full").

            Membership check:

                If clase.productoId == null (standard class):

                    find Membresia active for tutorId (prisma.membresia.findFirst where tutorId and estado='Activa').

                    If none -> throw Forbidden("Subscription required").

                If clase.productoId != null (course class):

                    find InscripcionCurso for estudianteId and productoId = clase.productoId and estado='Activo'.

                    If none -> throw Forbidden("Course purchase required").

            Check duplicate: unique index covers duplicate; we could catch prisma unique constraint error or pre-check:

                prisma.inscripcion.findFirst({ where: { claseId, estudianteId }}) -> if exists, throw Conflict("Already enrolled").

            Create Inscripcion:
            await prisma.inscripcion.create({ data:{ claseId, estudianteId, estadoAsistencia: 'Pendiente' } }).

            Update Clase cupos:
            await prisma.clase.update({ where:{ id: claseId}, data:{ cuposOcupados: { increment: 1 } } }).

            Return created record or success.

        (Potential improvement: do both create and update in a transaction to avoid race conditions; Prisma supports transaction, consider using prisma.$transaction([create, update]).)

        async listarPorClase(claseId: number)::

            Fetch inscripciones with that claseId, include estudiante (select nombre, apellido, id).

            Return array.

            Could also filter out or ensure only called by authorized roles (but that check done in controller).

        We may not implement other service methods like remove or list by student now.

    InscripcionesController:

        @Post() (Roles('Tutor')): Body dto with estudianteId, claseId. Use @GetUser() tutor. Calls service.crear(dto, tutor.id).

            If returns success (maybe the Inscripcion created), we can return a simple 201 Created and message or the inscripcion id.

        @Get():

            If query param claseId present:

                Use guard Roles('Docente','Admin').

                If Docente, need to ensure this clase belongs to them: we can enforce via service or manually:

                    Could get clase with prisma to compare clase.docenteId == user.id.

                    Service could take docenteId and claseId to verify too.

                Call service.listarPorClase(claseId). Return list.

            If wanted, could allow query by estudianteId for tutor to see their child's bookings, but not needed for now.

        (No delete endpoint implemented).

    Exceptions: Use appropriate HTTP codes:

        Forbidden (403) for membership or wrong tutor attempts.

        Conflict (409) for already enrolled or class full.

        404 if class or student not found maybe.

        201 for creation success.

Frontend (Reservas)

    Tutor Reserva Flow:

        In Tutor classes list, on "Reservar":

            If tutor has estudiantes.length > 1:

                Show a modal listing children (with name). Possibly a state selectedStudentId.

                Confirm button triggers reserveMutation.mutate({ claseId, estudianteId: selectedStudentId }).

            If only one child, call mutate directly with that id.

        reserveMutation uses POST /inscripciones.

        On success:

            Provide feedback: e.g., an alert or toast "Reserva confirmada".

            Update UI:

                Option 1: refetch 'clases' query to get updated cuposOcupados (and possibly remove class if it was last spot?).

                Option 2: manually increment cupos in state and mark that student is enrolled (complex to mark).

                Simpler: do a refetch. Backend now returns class with increased cupos.

                However, our GET /clases for tutor currently doesn't indicate if the tutor's child is enrolled or not, just shows class info.

                To mark "Reservado", we might either:

                    Not worry: multiple bookings of same student are prevented anyway, and if they attempt again they'd get 409.

                    Or keep track in UI of classes reserved: maybe store classId in a state as reserved to disable button.

                For now, can disable "Reservar" after success, or change text to "Reservado".

            If class full after reserving, it might be removed in next refetch or shown as "Lleno".

        On error:

            If 403 (no membership): redirect to /suscripcion or show modal "Debe tener suscripción activa".

            If 409 (full or duplicate): show message accordingly.

        Manage loading state on button to prevent double-click.

    Student selection modal:

        Use the list of tutor's students (we have in state from /estudiantes or from tutor profile).

        If not readily available, fetch on modal open (GET /estudiantes).

    Docente Roster:

        On teacher side, presumably they click an attendance link which will incorporate listing (this is more in Asistencia but listing is done here).

        But in this slice, at least display the roster:

            In /docente/clases/[id]/asistencia page:

                useQuery(['inscripciones', claseId], fetchInscripcionesForClase).

                Show each student name.

                Possibly show initial placeholder for marking attendance (checkbox or toggle, text area for notes).

                But actual marking is next subslice. We can prepare UI elements here but functionality will come in Asistencia.

                For now, just list the names and a button "Marcar Asistencia" that when clicked, for each student maybe toggles or something (we can handle that in Asistencia).

                It's acceptable to combine listing and marking in one page.

            So essentially, by end of Asistencia implementation, this page becomes the attendance form.

        Ensure teacher cannot see this if not their class: the guard and service cover it.

Now proceed to final subslice: Asistencia (marking attendance and giving feedback).
```
