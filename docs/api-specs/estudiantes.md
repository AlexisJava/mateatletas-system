Estudiantes

    Propósito: Administrar las cuentas de Estudiantes (hijos/alumnos asociados a un Tutor). Permitir a un tutor crear/editar los perfiles de sus hijos y listarlos.

    Subslices: No aplica. (Parte del dominio Usuarios.)

    Relación con otros módulos: Cada Estudiante pertenece a un Tutor (FK tutorId). Los estudiantes se inscriben en Clases (ver Reservas) y acumulan puntos/logros (Gamificación). También pueden autenticarse (rol Estudiante) para ver su panel, aunque normalmente la inscripción a clases la realiza el tutor.

Prompt de desarrollo

Implement the **Estudiantes** vertical slice within Usuarios.

**Backend (NestJS)**:

- Extend `UsuariosModule` with an `EstudiantesModule` (controller, service). Ensure `UsuariosModule` imports/exports it as needed.
- **Prisma Schema**: Add `Estudiante` model if not exists. Fields: `id (PK)`, `nombre`, `apellido`, `fechaNacimiento (Date)`, `email` (unique, for student’s login), `password` (hashed), and `tutorId` (Int, FK to Tutor). Also any gamification fields like `equipoId` (team assignment, can be null initially).
- **EstudianteService**:
  - `crear(dto, tutorId)`: Create a new student linked to the given tutor. Hash password if the student will log in (or generate a default password and email if needed).
  - `findByTutor(tutorId)`: List all students for a tutor.
  - `update(id, dto, tutorId)`: Update a student’s profile (only if belongs to that tutor). For example, update nombre, fechaNacimiento. (Email/password changes could be separate or not allowed by tutor in MVP.)
  - Possibly `remove(id, tutorId)`: if deletion of student is allowed (could be rare, maybe not needed initially).
- **EstudianteController**:
  - `GET /api/estudiantes` – Lista los estudiantes del tutor logueado. Use `JwtAuthGuard` + `Roles('Tutor')`. The tutorId is derived from token; service returns an array of Estudiantes.
  - `POST /api/estudiantes` – Crea un nuevo estudiante vinculado al tutor logueado. Body includes nombre, apellido, fechaNacimiento, email (optional if student will login) y contraseña (opcional). Use Tutor from token for tutorId.
  - `PATCH /api/estudiantes/:id` – Actualiza datos de un estudiante específico. Only allowed for the tutor who owns the student.
  - (Optional) `DELETE /api/estudiantes/:id` – Elimina un estudiante (if needed).
- In service methods, enforce that the student’s `tutorId` matches the requesting tutor (to prevent one tutor accessing another’s child). This can be done by checking the `tutorId` from token against the student record’s tutorId.
- Ensure to exclude or nullify `password` field when returning student(s) to the client.
- If **Team assignment** exists (from Gamificación), include `equipoId` or team name in response (can join on Team model if needed).

**Frontend (Next.js)**:

- **Página Listado de Estudiantes** (`/tutor/estudiantes`):
  - Display tutor’s children in a list/table with basic info (nombre, edad o fecha nacimiento).
  - Provide a button "Agregar Estudiante".
  - Each list item could have an "Editar" button to edit details if needed (and possibly "Eliminar").
- **Página Nuevo Estudiante** (`/tutor/estudiantes/nuevo`):
  - Form to add a student: nombre, apellido, fecha de nacimiento, email (or username) and password (if the student will log in; could also auto-generate password and send by email in future).
  - On submit, calls POST `/api/estudiantes`. After creation, navigate back to list.
- **Página Editar Estudiante** (`/tutor/estudiantes/[id]/editar`):
  - Similar form pre-filled, allow editing nombre, fechaNacimiento, maybe email.
  - Submit via PATCH `/api/estudiantes/:id`.
- Navigation: add link from Tutor Dashboard or menu to "Mis Estudiantes" page.

**API Integration**:

- Use React Query:
  - `useQuery('estudiantes', fetchEstudiantes)` – GET lista de estudiantes.
  - `useMutation(crearEstudiante)` – POST nuevo estudiante (invalidate 'estudiantes' on success).
  - `useMutation(actualizarEstudiante)` – PATCH estudiante.
- After adding or editing, refresh the list query or optimistically update UI.
- If delete functionality is allowed, similar useMutation for delete.

**Types**:

- `Estudiante` interface: { id, nombre, apellido, fechaNacimiento: string|Date, email?: string, tutorId: number, equipoId?: number }.
- DTOs/Forms:
  - `CreateEstudianteDto` / `UpdateEstudianteDto` to mirror backend. Perhaps password optional on create (if not setting, could generate).
  - If Gamificación assigns team on creation, the backend might do that – include `equipoId` in model (optional).
- Possibly define a lighter type for listing (excluding sensitive info).
- Place these types in usuarios or estudiantes types file.

**Orden de implementación**:

1. **Prisma**: Añadir modelo Estudiante (si no existe) con relación tutorId. Ejecutar migración.
2. **Backend**: Crear `EstudiantesService` y `EstudiantesController` bajo `UsuariosModule`. Implementar métodos listar (por tutor), crear (link al tutor), actualizar.
3. **Seguridad**: En controller, usar guard de JWT + Roles('Tutor'). En service, validar propiedad (e.g., check tutorId en `findByTutor` y en `update` comparando con ID del contexto).
4. **Frontend**: Implementar páginas `/tutor/estudiantes` (lista), `/tutor/estudiantes/nuevo`, `/tutor/estudiantes/[id]/editar`. Reutilizar componentes de formulario. Manejar la navegación de vuelta tras crear/editar.
5. **Integración**: Probar end-to-end: Tutor logueado crea un Estudiante, verifica en listado. Editar un estudiante y comprobar cambios. Asegurar que no puede editar uno que no es suyo (probando manualmente con IDs manipulados via devtools or unit tests).
6. **Relación con demás**: Una vez estudiantes existen, integrar su uso en Clases (reservar clase para un estudiante) y Gamificación (ver puntos de cada estudiante).

Backend (NestJS)

    Estructura: src/modules/usuarios/estudiantes/

        estudiantes.module.ts – Declara EstudiantesService y EstudiantesController. Importa PrismaModule si existe para DB access.

        estudiantes.service.ts – Contiene métodos CRUD de estudiantes.

        estudiantes.controller.ts – Define rutas para listar/crear/editar estudiantes.

    Modelo Prisma Estudiante:

    model Estudiante {
      id         Int      @id @default(autoincrement())
      nombre     String
      apellido   String
      fechaNacimiento DateTime?
      email      String?  @unique
      password   String?
      tutorId    Int
      tutor      Tutor    @relation(fields: [tutorId], references: [id])
      // Gamificación
      equipoId   Int?
      equipo     Equipo?  @relation(fields: [equipoId], references: [id])
      // Inscripciones a clases
      inscripciones Inscripcion[]
      creadoEn   DateTime @default(now())
      actualizadoEn DateTime @updatedAt
    }

    (Nota: email/password pueden ser opcionales si el estudiante no usará login propio. equipoId depende de Gamificación; se puede dejar null inicialmente.)

    EstudiantesService:

        findAllByTutor(tutorId: number): this.prisma.estudiante.findMany({ where: { tutorId } }) – devuelve arreglo de estudiantes de ese tutor.

        create(dto: CrearEstudianteDto, tutorId: number): valida datos, hace prisma.estudiante.create({ data: { ...dto, tutorId, password: hashedPassword? } }). Si dto.password existe, hashearla antes; sino, podría generar una contraseña aleatoria (opcional, para futuro envío por correo).

        update(id: number, dto: ActualizarEstudianteDto, tutorId: number): busca estudiante where { id, tutorId } (esto asegura pertenencia). Si no existe, lanzar Forbidden/NotFound. Si existe, actualizar campos permitidos (nombre, fechaNacimiento, email). No actualizar tutorId ni puntos aquí.

        No permitir cambiar equipoId aquí (lo asigna Gamificación). No manejar puntos aquí (Gamificación).

    EstudiantesController: (prefijo /api/estudiantes)

        @Get() – Lista estudiantes del tutor actual. Usa @Roles('Tutor') y @GetUser() para obtener tutor. Llama service.findAllByTutor(tutor.id). Retorna lista de estudiantes (podemos omitir campo password en respuesta vía select o usando class-transformer Exclude).

        @Post() – Crea estudiante. Usa @Roles('Tutor'). Body: CrearEstudianteDto (requiere nombre, apellido, fechaNacimiento, email?, password?). Obtiene tutor logueado, llama service.create(dto, tutor.id). Retorna estudiante creado (p.ej. con id).

        @Patch(':id') – Actualiza estudiante. Usa @Roles('Tutor'). Obtiene tutor logueado y estudiante id de params. Llama service.update(id, dto, tutor.id). Retorna estudiante actualizado.

        (Opcional) @Delete(':id') – Si se implementa, similar patrón (buscar por id+tutorId y borrar).

    Validación y Seguridad:

        DTOs con class-validator: nombre, apellido no vacíos; email válido si provisto; quizás requisitos de contraseña.

        En métodos service se comprueba que el tutorId del estudiante coincide con el del usuario activo (usando condición en query o comparando resultado). Así, un tutor no puede ver/editar estudiantes ajenos.

        Si un Admin necesitara listar o manipular estudiantes globalmente, serían endpoints separados en AdminModule (no implementados aquí).

    Relaciones en respuestas:

        Por simplicidad, GET /estudiantes devuelve estudiantes con sus campos básicos. Si se quisiera incluir info adicional (ej. equipo.nombre o puntos totales), podría hacerse join en Gamificación slice.

        Retornar una estructura limpia (quizás a través de DTO de respuesta) sin password. Ejemplo: definir EstudianteEntity class con @Exclude('password').

Prisma (Base de Datos)

    Estudiante: agregado como arriba.

        Clave foránea: tutorId con índice. Prisma se encargará de integridad referencial (no se puede crear estudiante sin tutor existente).

        email: optional unique. Esto permite estudiantes sin email (por ej, muy pequeños que no usan login). Para estudiantes mayores con acceso, se llenará.

        Relación con Equipo: si Gamificación implementa equipos, aquí está preparada (Equipo model vendrá en Gamificación slice).

    Migración: Ejecutar prisma migrate dev tras añadir modelo. Verificar en base los campos y relación.

Frontend (Next.js)

    Lista de Estudiantes (/tutor/estudiantes):

        Usa useQuery('estudiantes') para obtener lista vía GET /api/estudiantes.

        Muestra una tabla o tarjetas con nombre completo y quizá edad (calc desde fechaNacimiento).

        Botón "Agregar Estudiante" -> link a /tutor/estudiantes/nuevo.

        Cada estudiante: botón "Editar" -> /tutor/estudiantes/[id]/editar. (Y si se quiere, botón "Eliminar" con confirmación).

    Formulario Agregar/Editar (/tutor/estudiantes/nuevo y /tutor/estudiantes/[id]/editar):

        Inputs: Nombre, Apellido, Fecha de Nacimiento (usar date picker o text), Email (opcional), Contraseña (opcional, visible solo si email dado; o generar automáticamente).

        En Agregar: todos los campos vacíos inicialmente.

        En Editar: cargar datos existentes via useQuery(['estudiante', id], fetchEstudiante(id)) – podría obtenerlos de la lista cacheada por estudiantes query o llamar a un endpoint GET /estudiantes/:id (no implementado actualmente). Alternativamente, pasar datos via route state from list.

        Submit:

            En Nuevo: llama API POST /api/estudiantes. En success, invalidate 'estudiantes' query and navigate back to lista.

            En Editar: llama API PATCH /api/estudiantes/:id. En success, invalidate 'estudiantes' and navigate back.

    UI/UX:

        Validar formulario (nombre/apellido requeridos, email bien formateado si presente, contraseña min longitud si presente).

        Si contraseña no se provee para nuevo estudiante con email, puede generar una aleatoria y mostrarla para anotar (o forzar tutor a ingresar una). Simplicidad: requerir tutor set a password if adding email.

        Notificar al usuario tras agregar/editar (mensaje de éxito).

        Si implementa eliminar: en lista, add icono eliminar -> on click, pedir confirm ("¿Seguro?"), luego call DELETE and refresh list. No implementar sin confirm para evitar errores.

    Visibilidad para Estudiante (rol):

        Un estudiante podría loguearse (usando Auth login con su email/pass) y acceder a su propio dashboard (por ejemplo /estudiante/dashboard to be implemented in future). En esta slice nos centramos en manejo por tutor. El acceso del estudiante a su perfil sería mediante otras rutas/permiso (podría reutilizar misma API pero restringiendo a su id via role guard).

        En este punto, no se implementa el panel de estudiante; se puede anotar para futuro (por ejemplo, estudiante podría ver sus puntos y clases propias).

API Clients & Zustand

    API calls (frontend):

        api.fetchEstudiantes(): GET /estudiantes -> devuelve Array<Estudiante>.

        api.createEstudiante(datos): POST /estudiantes -> devuelve Estudiante creado.

        api.updateEstudiante(id, datos): PATCH /estudiantes/{id}.

        (Si del endpoint GET individual) api.fetchEstudiante(id): GET /estudiantes/{id}.

        api.deleteEstudiante(id): DELETE /estudiantes/{id}.

    React Query hooks:

        useQuery('estudiantes', api.fetchEstudiantes) for list.

        useMutation(api.createEstudiante, { onSuccess: ()=> queryClient.invalidateQueries('estudiantes') }).

        useMutation(api.updateEstudiante, { onSuccess: ()=> queryClient.invalidateQueries('estudiantes') }).

        If delete: similar invalidation.

    Zustand:

        No additional store needed; data handled via React Query. The Auth store might hold currently selected student if needed (e.g., tutor toggling which child’s view to see in class schedule). For now, not needed because tutor explicitly chooses student when booking a class.

        If later, a global state for "active student context" can be introduced to filter classes or gamification view, but can also be route-based.

Types

    Interfaces:

        Estudiante : { id: number; nombre: string; apellido: string; fechaNacimiento: string; email?: string; tutorId: number; equipoId?: number }.

        CrearEstudianteDto : { nombre: string; apellido: string; fechaNacimiento?: string; email?: string; password?: string } – email/password opcionales.

        ActualizarEstudianteDto : { nombre?: string; apellido?: string; fechaNacimiento?: string; email?: string; password?: string } (puede que no se permita cambiar email en edit por simplicidad).

    Relaciones: Si se quiere mostrar nombre del tutor en alguna vista (poco probable en tutor UI), se podría tener tipo EstudianteConTutor extends Estudiante con tutor: { nombre, apellido }.

    Placement: In types/usuarios.ts or types/estudiantes.ts. The backend DTO classes ensure shape; keep frontend in sync.

Orden sugerido de implementación

    Modelo y Migración: Definir Estudiante en schema.prisma con relación tutorId. Incluir índices únicos necesarios (email). Migrar DB.

    Service Backend: Implementar findAllByTutor, create, update en EstudiantesService. Probar manualmente crear estudiante via service (in a seed script or temporary call).

    Controller Backend: Implementar EstudiantesController con GET/POST/PATCH. Testear con HTTP (usar un JWT de tutor):

        Crear estudiante y listar estudiantes para verificar que solo devuelve los del tutor.

        Probar actualizar (cambiando nombre, etc.).

    Frontend Lista: Construir página /tutor/estudiantes. Consumir GET /estudiantes. Mostrar resultados.

    Frontend Form Nuevo: Construir página formulario nuevo. Enviar POST, manejar respuesta. Verificar en UI que aparece en lista después de agregar (gracias a invalidate de query).

    Frontend Form Editar: Construir similar a nuevo, pero prellenando datos. Submit PATCH. Verificar cambios reflejados (tal vez simplemente re-consultar lista).

    Validación extra: Intentar acceder a/editar estudiantes de otro tutor (por API) para confirmar que está prohibido (debería dar 403/404).

    Refinamiento: Integrar vistas: por ejemplo, en Dashboard tutor mostrar también la lista de estudiantes (o al menos conteo) con link a gestión. Asegurar flujos de navegación cómodos.

    Tras esto, continuar con slices de Clases (para permitir inscribir estos estudiantes en clases).
