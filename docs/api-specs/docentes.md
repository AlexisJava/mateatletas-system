Docentes

    Propósito: Gestionar los Docentes (profesores). Incluye creación y listado de docentes (por un admin) y manejo de perfil del docente. Los docentes son usuarios que pueden iniciar sesión para dictar clases y registrar asistencia/puntos.

    Subslices: No aplica. (Parte del dominio Usuarios.)

    Relación con otros módulos: Cada Docente dicta Clases (Clases tienen docenteId). Los docentes otorgan puntos/logros (Gamificación) y escriben observaciones (utilizado en Admin/Alertas). La creación/gestión de docentes la realiza típicamente un Admin, ya que no hay registro público de docentes.

Prompt de desarrollo

Implement the **Docentes** vertical slice within Usuarios.

**Backend (NestJS)**:
- Extend `UsuariosModule` with a `DocentesModule` (controller, service).
- **Prisma Schema**: Add `Docente` model if not exists. Fields: `id (PK)`, `nombre`, `apellido`, `email` (unique), `password` (hashed), plus any extra fields (e.g., tituloProfesional, bio, etc., optional). A Docente is essentially a user account similar to Tutor but with different role.
- **DocenteService**:
  - `crear(dto: CreateDocenteDto)`: Create a new teacher. Hash password, save via Prisma.
  - `findAll()`: Return list of all docentes (for admin usage).
  - `findByEmail(email)`: Find docente by email (for Auth login).
  - `update(id, dto: UpdateDocenteDto)`: Update teacher profile info (if needed, for admin or self-service).
- **DocenteController**:
  - `POST /api/docentes` – Create new docente (accessible by Admin role only). Body: new docente data. Returns created docente.
  - `GET /api/docentes` – List all docentes (Admin only). Could support query params for filtering (not needed now).
  - `GET /api/docentes/:id` – (Optional) Get detail of a docente (Admin or the docente themselves).
  - `PATCH /api/docentes/:id` – Update docente info (Admin can update any, or a Docente could update their own profile via a different endpoint or same with proper auth).
- **Auth Integration**: Auth login must allow docentes. Ensure `DocenteService.findByEmail` is used in AuthService.validateUser flow.
- **Security**: Protect these endpoints:
  - Admin-only endpoints with `Roles('Admin')`.
  - If allowing docente to update their profile: `@Roles('Docente')` and ensure `:id` matches their own id (or simply have `/docentes/me` for self).
- The service methods should ensure uniqueness of email on create. If additional fields (bio, etc.) included, handle accordingly.

**Frontend (Next.js)**:
- Likely an **Admin Panel** will manage docentes:
  - **Página Lista de Docentes** (`/admin/docentes`): Shows all teachers with basic info (nombre, email, etc.). Provide a button to "Agregar Docente".
  - **Página Nuevo Docente** (`/admin/docentes/nuevo`): Form for admin to input teacher’s nombre, apellido, email, password (or generate one) and any other details. Submit calls POST /docentes. On success, navigate back to list.
  - The list could also allow editing or toggling active status if needed (not mentioned yet, skip).
- **Docente self-service**:
  - If a Docente logs in, they should see a **Docente Dashboard** (`/docente/dashboard`): listing their upcoming classes, etc. (This will be elaborated in Clases slice).
  - **Perfil Docente** (`/docente/perfil`): allow teacher to update their info (except email maybe). This could reuse a similar form component.
  - Implement `/docente/perfil` page, with GET `/docentes/me` and PATCH `/docentes/me` (if we implement that route similarly to tutor).
- Note: Admin interface is considered in Admin slice, but basic pages for teacher management are included here for completeness.

**API Integration**:
- Admin side:
  - `useQuery('docentes', fetchDocentes)` – GET all teachers.
  - `useMutation(createDocente)` – POST new teacher (invalidar lista on success).
- Docente side:
  - `useQuery('docenteProfile', fetchDocenteProfile)` – GET teacher’s own profile.
  - `useMutation(updateDocenteProfile)` – PATCH their profile.
  - Their class list will use Clases slice endpoints.

**Types**:
- `Docente` interface: { id, nombre, apellido, email, password?: string (only for create), ... }.
- Possibly include fields like `titulo` (degree) or `bio` if needed, else just basic info.
- `CreateDocenteDto` / `UpdateDocenteDto` align with the above.
- Role 'Docente' is distinct, ensure it's accounted for in Auth.
- Could define separate types for Admin view (without password) vs create payload.

**Orden de implementación**:
1. **Prisma**: Añadir modelo Docente (similar to Tutor). Migrar.
2. **Backend**: Crear DocentesService (create, findAll, findByEmail). Integrar en AuthService (check docente login).
3. **Controller**: Implementar POST /docentes y GET /docentes con guard Admin. (If admin user exists; assume an 'Admin' role user or define in RolesGuard).
4. **Optional Self Endpoints**: Implement /docentes/me GET/PATCH for docente updating own profile (Roles('Docente')).
5. **Frontend Admin**: Crear página `/admin/docentes` (lista). Crear página `/admin/docentes/nuevo`.
6. **Frontend Docente**: Crear página `/docente/perfil` para que el docente vea/edite sus datos.
7. **Testing**: Crear un Docente via admin page, luego login con ese docente credenciales, acceder a `/docente/dashboard` (which will be implemented in Clases slice), pero `/docente/perfil` should show their info. Update profile to test PATCH.
8. **Continuar**: Implementar Clases slice para manejar la asignación de clases a docentes y que el docente pueda ver sus clases.

Backend (NestJS)

    Estructura: src/modules/usuarios/docentes/

        docentes.module.ts – Declara DocentesService y DocentesController.

        docentes.service.ts – Lógica de docentes.

        docentes.controller.ts – Rutas CRUD de docentes.

    Modelo Prisma Docente:

    model Docente {
      id        Int     @id @default(autoincrement())
      nombre    String
      apellido  String
      email     String  @unique
      password  String
      // Campos adicionales:
      titulo    String?    // p.ej. "Profesor de Matemática"
      bio       String?    // descripción o perfil público
      // Relaciones:
      clases    Clase[]    // clases que este docente dicta
      creadoEn   DateTime @default(now())
      actualizadoEn DateTime @updatedAt
    }

    Campos como titulo y bio son opcionales.

    DocentesService:

        create(dto: CreateDocenteDto): Crea un nuevo docente. Hashear contraseña. prisma.docente.create({ data: {...} }).

        findAll(): prisma.docente.findMany({}) – lista todos los docentes (con campos básicos, quizás omitir password).

        findByEmail(email): devuelve un docente por email (para Auth).

        findById(id): devuelve un docente (para perfil).

        update(id, dto): actualiza campos del docente. Por ejemplo, permitir cambiar nombre, apellido, titulo, bio, y contraseña (si se implementa cambio de pass, se haría por separado).

        Consideración: Un docente podría ser desactivado en futuro (campo estado), pero no en alcance ahora.

    DocentesController: (prefijo /api/docentes)

        Admin endpoints (requieren rol Admin):

            @Post() – Crea docente. Body: CreateDocenteDto (nombre, apellido, email, password, titulo?, bio?). Retorna nuevo docente (sin password).

            @Get() – Lista todos los docentes. Devuelve array de docentes (posiblemente solo campos públicos).

            @Get(':id') – Obtiene detalles de un docente específico (puede incluir clases impartidas, etc., si se necesitara).

            @Patch(':id') – Actualiza info de un docente (admin podría editar).

            Usar @Roles('Admin') en estas rutas. (Asumimos existe rol Admin en sistema; si no, este módulo solo accesible por desarrollador/DB direct.)

        Docente self-service:

            @Get('me') – (Roles('Docente')) Retorna perfil del docente logueado (usando @GetUser()).

            @Patch('me') – (Roles('Docente')) Actualiza su propio perfil. Body: UpdateDocenteDto (ej. actualizar bio o telefono si hubiera).

            En service, asegurar que update(id) llamado con id del propio docente.

    Auth y Roles:

        Incluir DocentesService.findByEmail en AuthService.validateUser (similar a Tutor/Estudiante).

        Asegurar que RolesGuard reconoce 'Docente' y 'Admin'.

        La existencia de rol 'Admin': Podría haber un Admin user separado o designar ciertos Tutor/Docente con admin privileges. En este contexto, supondremos un rol Admin y un usuario admin creado manualmente. Para simplicidad, no implementamos su model (podría ser table or config).

        Alternatively, consider an esAdmin flag on Tutor to grant admin rights. Pero dado alcance, asumimos un Admin seeding or skip actual admin login implementation beyond guard usage.

    Integración con Clases: Docente relate to Clase via clases relation. Clases se implementan en slice siguiente, pero aquí definimos la relation. Asegurar en Clase modelo hay docenteId (lo agregaremos en Clases slice).

    Seguridad de datos:

        Ocultar password en respuestas. Podría usar class-transformer Exclude or simply not select it in queries.

        En listar docentes para admin, password no se envía.

        Un docente al obtener su perfil tampoco debe ver su hash, sólo campos públicos.

Prisma (Base de Datos)

    Docente: Agregado. Similar a Tutor structure. Email unique.

    Relación con Clase: en modelo Clase (definido en Clases slice) habrá docenteId. Prisma setup se completará allí.

    Si se añade rol Admin: podríamos tener un simple boolean en Docente o Tutor, pero omitido; conceptualmente podríamos manejarlo fuera de DB (ex: list of admin emails).

    Realizar migración tras modelo Docente.

Frontend (Next.js)

    Admin - Lista Docentes (/admin/docentes):

        Usar useQuery('docentes', api.fetchDocentes) para obtener todos.

        Mostrar tabla: Nombre completo, email, quizás título.

        Botón "Agregar Docente" -> link /admin/docentes/nuevo.

        (Opcional: botón Editar en cada fila -> /admin/docentes/[id]/editar si se implementa edición admin).

    Admin - Nuevo Docente (/admin/docentes/nuevo):

        Formulario para ingresar nombre, apellido, email, contraseña (obligatoria para primera vez), título (opcional), bio (opcional).

        Enviar con useMutation(api.createDocente) a POST /api/docentes.

        Tras éxito, redirect back to lista y mostrar notificación.

    Admin - Editar Docente: Podría omitirse si no necesario ahora; si se desea:

        /admin/docentes/[id]/editar prellenando datos (requiere endpoint GET docente).

        Permitir admin cambiar email, nombre, título, etc. Contraseña quizá reset manual si fuera.

    Docente - Dashboard (/docente/dashboard):

        Mostrará próximas clases asignadas al docente (se implementará en Clases slice). Aquí se menciona para contexto: usar GET /api/clases?mis=true para obtener clases del docente.

        Un saludo y posiblemente resumen (ej. "Clases esta semana: X").

        Este dashboard se hará en Clases slice; en esta sección, asegurarse ruta existe protegida.

    Docente - Perfil (/docente/perfil):

        Similar a Tutor Perfil. Mostrar info del docente y permitir editar campos como nombre (si se quiere), título, bio, contraseña cambio (posible separate flow).

        Use GET /api/docentes/me para cargar datos. PATCH /api/docentes/me para guardar.

        Si email no editable, mostrar en texto.

        Actualizar Zustand store if name changed (for display).

    Navegación:

        Admin UI: link a "Docentes" management.

        Docente UI: link a "Mi Perfil".

    Condicional rendering: Only show /admin routes if user is Admin, etc. Possibly skip as admin may not have a standard login in this system (unless we create one).

API Clients & Store

    Admin API:

        api.fetchDocentes() -> GET /docentes (admin).

        api.createDocente(data) -> POST /docentes.

        api.updateDocente(id, data) -> PATCH /docentes/:id (if edit admin).

        api.fetchDocente(id) -> GET /docentes/:id (for edit form).

    Docente API:

        api.fetchDocenteProfile() -> GET /docentes/me.

        api.updateDocenteProfile(data) -> PATCH /docentes/me.

    React Query:

        Admin: useQuery('docentes'), useMutation for create (invalidate 'docentes').

        Docente: useQuery('docenteProfile'), useMutation for update.

    Zustand:

        Auth store holds role and maybe name. If Docente updates name, update the store's user name as well so UI reflects it (like in navbar greeting).

        Possibly maintain an Admin flag in store if needed to toggle admin menu.

Types

    Docente interfaces:

        Docente: { id: number; nombre: string; apellido: string; email: string; titulo?: string; bio?: string; }

        CreateDocente (for form): { nombre; apellido; email; password; titulo?; bio? }.

        UpdateDocente: { nombre?; apellido?; email?; password?; titulo?; bio? } (admin might change email, docente self likely not).

    Union Roles: ensure 'Admin' and 'Docente' are part of role types if using union.

    If implementing Admin as separate entity not done; perhaps treat Admin as just a role without separate table (like an admin could be a Tutor flagged, but skip).

    Admin user: If needed, define an Admin interface (id, email, password) or just assume an admin user created in Docente or Tutor table with that role.

Orden sugerido de implementación

    Modelo y Migración: Añadir Docente modelo en Prisma, migrar.

    Service Backend: Implementar DocentesService (create, findAll, findByEmail). Añadir DocentesModule en UsuariosModule. Export service if Auth needs it.

    AuthService: Actualizar validateUser para consultar DocentesService.findByEmail.

    Controller Backend: Implementar DocentesController:

        Fase 1: endpoints admin (POST, GET) – test con un token de admin (si no hay login admin, se puede probar internamente).

        Fase 2: endpoints docente self (GET/PATCH me) – test simulando login docente (obtener token via login API).

    Frontend Admin: Crear páginas /admin/docentes y /admin/docentes/nuevo. Hook up queries/mutations. (Note: Admin login mechanism: quizás crear manualmente un admin token for dev testing, o considerar habilitar login for admin if we had implemented e.g. an Admin user. Possibly use an admin Tutor with role 'Admin' for testing by manually editing DB.)

    Frontend Docente: Crear página /docente/perfil, conectar GET/PATCH.

    Testing Docente: Registrar un docente via admin, luego usar endpoint login (Auth) con ese docente's email/password para obtener JWT (simulate teacher login). Acceder a /docente/perfil en front (with token in store) para ver y editar. Ensure updates persist.

    Docente Dashboard: Planificar que /docente/dashboard mostrará clases – implementaremos en Clases slice.

    Refinamiento: Ensure all roles are handled (Auth guard, Navbar shows correct menu for Docente vs Tutor vs maybe Admin).

    Continuar con Clases slice para scheduling classes and linking docentes.
