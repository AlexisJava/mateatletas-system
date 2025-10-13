Tutores

    Propósito: Gestionar la información de los Tutores (usuarios padres que pagan la suscripción). Incluye perfil del tutor y asociación a sus estudiantes.

    Subslices: No aplica. (Parte del dominio Usuarios.)

    Relación con otros módulos: El tutor está vinculado a Estudiantes (uno a muchos). Cada Tutor posee una Membresía activa (ver Pagos) para acceder a Clases. Las operaciones de crear/actualizar tutor se conectan con Auth (registro) y Pagos (estado de suscripción).

Prompt de desarrollo

Implement the **Tutores** vertical slice within the Usuarios domain.

**Backend (NestJS)**:
- Create a `UsuariosModule` to group user-related submodules (Tutores, Estudiantes, Docentes). Inside, implement a `TutoresModule` with controller and service.
- **Prisma Schema**: Add a `Tutor` model if not present. Fields: `id (Int, PK)`, `nombre`, `apellido`, `email` (String, unique), `password` (String, hashed), `telefono` (String), and timestamps. This represents the parent/guardian account.
- **TutorService**:
  - Method `crearTutor(datos)` to create a new tutor (hash password, save via Prisma). Used by Auth register.
  - Method `actualizarTutor(id, datos)` to update profile (e.g., nombre, telefono).
  - Method `obtenerTutor(id)` to fetch tutor by ID (optionally include suscripción info).
- **TutorController**:
  - `GET /api/tutores/me` – Get profile of logged-in tutor. Use `JwtAuthGuard`. Returns tutor info (excluding password) and possibly related data (e.g., children or membership status).
  - `PATCH /api/tutores/me` – Update logged-in tutor profile (e.g., teléfono). Body DTO with optional fields to change. Use `JwtAuthGuard` + `@Roles('Tutor')`.
- Ensure that fetching/updates are only for the tutor themselves (or an admin, if admin endpoints exist separately).
- The TutorService will also be used by AuthService for registration, so ensure it’s accessible (e.g., UsuariosModule exports TutorService).

**Frontend (Next.js)**:
- Create a **Tutor Dashboard** page (`/tutor/dashboard`): welcome the tutor and show summary (e.g., active subscription status, list of their estudiantes, upcoming classes).
- Create a **Profile Settings** page or section (`/tutor/perfil`): form to edit tutor’s info (nombre, teléfono, etc.). Use `GET /tutores/me` to preload data and `PATCH /tutores/me` to submit changes.
- In the dashboard, display the tutor’s **Membresía** status (from Pagos slice via separate API) and maybe a link to manage subscription if inactive.
- Also include a quick view of **Estudiantes** (children) on the dashboard (names, maybe points – can reuse Estudiantes slice API to fetch them).

**API Integration**:
- Use React Query:
  - `useQuery('tutor', fetchTutorProfile)` to GET tutor profile on dashboard load.
  - `useMutation(updateTutorProfile)` for profile updates, with invalidation of 'tutor' query on success.
- The profile GET response can include the list of child students (or call separate GET /estudiantes).
- Ensure to handle 401 (unauthenticated) globally (redirect to /login if needed).

**Types**:
- `Tutor` interface (id, nombre, apellido, email, telefono, etc.). Align with Prisma model.
- `UpdateTutorDto` for PATCH (possibly partial fields).
- If membership info is returned with tutor (optional), define e.g. `TutorProfile` including membership: e.g., `{ tutor: Tutor; membresia?: { estado: string; proximoPago: Date; } }`.
- Place these in a `usuarios.types.ts` or similar file.

**Orden de implementación**:
1. **Prisma**: Añadir modelo Tutor (si aún no existe). Ejecutar migración.
2. **Backend**: Crear `UsuariosModule` (si no existe) con submódulo `TutoresModule`. Implementar `tutores.service.ts` (métodos crear, actualizar, obtener) y `tutores.controller.ts` (rutas GET/PATCH perfil).
3. **Integración Auth**: Usar `TutorService.crearTutor` dentro de AuthService register (con la lógica ya implementada).
4. **Frontend**: Implementar página dashboard del tutor y sección de perfil. Usar React Query para obtener perfil (GET /tutores/me) al montar.
5. **Pruebas**: Registrar un tutor (via Auth), luego hacer login, acceder a `/tutor/dashboard` (debería mostrar sus datos). Probar actualización de perfil y verificar cambios en base de datos.
6. **Continuar**: luego implementar Estudiantes slice para gestión de hijos, que se relacionará con el tutor creado.

Backend (NestJS)

    Estructura: Dentro de src/modules/usuarios/, crear subcarpeta tutores/:

        tutores.module.ts – Declara TutoresService y TutoresController. Exporta el servicio para uso en AuthModule.

        tutores.service.ts – Lógica de negocio para Tutor.

        tutores.controller.ts – Endpoints REST para tutor (perfil).

    Modelo Prisma Tutor:

    model Tutor {
      id        Int     @id @default(autoincrement())
      nombre    String
      apellido  String
      email     String  @unique
      password  String
      telefono  String?
      // Relaciones:
      estudiantes Estudiante[] // un tutor tiene muchos estudiantes
      membresias  Membresia[]  // un tutor puede tener suscripciones (normalmente 0 o 1 activas)
      creadoEn   DateTime @default(now())
      actualizadoEn DateTime @updatedAt
    }

    (Los campos de timestamp y relaciones pueden ajustarse según convenciones).

    TutoresService:

        crear(datos: CreateTutorDto): Crea un nuevo tutor. Usar this.prisma.tutor.create. Debe hashear la contraseña antes (usar bcrypt en este servicio o en Auth).

        findByEmail(email): Devuelve tutor por email (para Auth).

        findById(id): Devuelve tutor por ID (incluyendo quizás estudiantes o membresía via .include).

        update(id, datos: UpdateTutorDto): Actualiza campos del tutor (nombre, telefono, etc.). No permitir cambiar email fácilmente aquí (podría omitirse o requerir verificación).

    TutoresController: (prefijo /api/tutores)

        @Get('me'): Devuelve el perfil del tutor logueado. Usa @GetUser() decorator para obtener tutor: Tutor desde el token. Retorna el objeto tutor (omitindo password) y podría incluir lista de estudiantes e info de membresía.

        @Patch('me'): Actualiza perfil del tutor logueado. DTO permite campos opcionales nombre, apellido, telefono, etc. Usa @GetUser() para el tutor actual, aplica TutoresService.update(id, dto) y retorna los datos actualizados.

        Nota: Estas rutas usan JwtAuthGuard y Roles('Tutor') para garantizar que solo los tutores acceden. En caso de que se necesite endpoints para admin (ej. listar todos los tutores), se implementarían aparte (posible en AdminModule).

Prisma (Base de Datos)

    Tutor model: Como arriba. Asegurar email único. (En producción considerar index global de email entre tablas de usuarios).

    Relaciones: Tutor a Estudiante: en modelo Estudiante habrá tutorId FK a Tutor. Tutor a Membresia: un tutor puede tener varias membresías históricas, pero solo una activa; modelo Membresia tendrá tutorId.

    Migración: Ejecutar migración después de definir modelos. Verificar que campos opcionales (telefono) permiten null.

Frontend (Next.js)

    Página Dashboard Tutor (/tutor/dashboard):

        Muestra saludo al tutor (e.g., "Bienvenido, [Nombre]").

        Sección Suscripción: mostrar estado actual (ej. "Suscripción Activa hasta 10/12/2025" o "Sin suscripción activa"). Botón "Administrar Suscripción" que lleva a página de Pagos si no activa.

        Sección Mis Hijos: listar nombres de estudiantes asociados. Cada uno con un enlace a ver detalles o progreso (por ejemplo, puntos acumulados – integrará Gamificación).

        Sección Próximas Clases: (opcional) mostrar próximas clases reservadas para sus hijos – requiere combinar datos de Reservas, se puede dejar para integración posterior.

    Página Perfil Tutor (/tutor/perfil):

        Formulario prellenado con nombre, apellido, email (readonly quizás), telefono, etc.

        Permitir editar nombre, teléfono, contraseña (podría implementar cambio de contraseña aparte).

        Botón Guardar -> llama PATCH /api/tutores/me.

        Utilizar componentes de formulario del design system (inputs, etc.). Validar en frontend campos requeridos.

    Navegación: Asegurarse de incluir enlaces a Dashboard, Perfil, Estudiantes, Clases, Suscripción en el menú lateral o header visible para tutor.

    UX: Después de actualizar perfil, mostrar notificación de éxito (ej. "Perfil actualizado").

API Clients & Zustand

    React Query:

        useQuery(['tutor','profile'], api.getTutorProfile) – GET perfil tutor.

        useMutation(api.updateTutorProfile) – PATCH perfil. Invalidate ['tutor','profile'] on success.

        Opcional: useQuery(['tutor','children'], api.getEstudiantes) – para obtener estudiantes (alternativamente, el perfil podría incluirlos para ahorrar llamada).

    Funciones API (axios):

        getTutorProfile() -> GET /tutores/me

        updateTutorProfile(data) -> PATCH /tutores/me

        (Reutilizar config axios con token interceptor, ya configurado en Auth slice).

    Zustand:

        Auth store ya contiene parte del perfil, pero mejor no duplicar. Tras obtener perfil completo vía API, podría sincronizar store (por ejemplo, actualizar nombre en nav).

        No es imprescindible almacenar todo perfil en Zustand, React Query puede servir los datos donde se necesiten.

Types

    DTO Backend: CreateTutorDto, UpdateTutorDto. En frontend, definir interfaz Tutor y TutorUpdatePayload equivalentes.

        Tutor : { id: number; nombre: string; apellido: string; email: string; telefono?: string; estudiantes?: Estudiante[]; }

        CreateTutorDto (backend) se usa solo en registro (Auth) – frontend reutiliza RegisterTutorRequest.

        UpdateTutorDto: campos opcionales nombre, apellido, telefono, etc.

    Otros tipos relacionados:

        Podría definirse PerfilTutor que combine Tutor + info agregada (ej. membresia?: Membresia con estado y proximoPago, estudiantes?: Estudiante[]). Si el endpoint /tutores/me ya devuelve todo eso, tiparlo para uso en front.

        Enum/union para estado membresía (si se incluye, e.g. 'Activa'|'Atrasada'|'Cancelada').

    Ubicación: Las interfaces de usuarios pueden vivir en frontend/src/types/usuarios.ts.

Orden sugerido de implementación

    Modelo Prisma: Definir modelo Tutor y relaciones (si no se hizo en fase inicial). Migrar base de datos.

    Servicios Backend: Implementar TutoresService con métodos create/find/update. Probar en consola la creación de tutor y fetch.

    Controlador Backend: Implementar TutoresController con rutas GET/PATCH perfil. Usar decoradores para seguridad. Verificar con un token de tutor que GET devuelve datos correctos.

    Integración con Auth: Ajustar AuthService.register para usar TutorService.crear (en lugar de acceder prisma directamente) si no se hizo. Verificar que al registrar tutor via Auth, se crea correctamente en DB.

    Frontend Dashboard: Crear página /tutor/dashboard. Usar useQuery al montar para cargar perfil tutor (y quizás estudiantes e info suscripción). Renderizar secciones con datos.

    Frontend Perfil: Crear página /tutor/perfil con formulario editable. Cargar datos existentes (puede reutilizar el query de perfil). Implementar mutate updateProfile.

    Testing UI: Iniciar app, registrar un tutor, navegar por dashboard y perfil, editar datos y confirmar que se actualiza en DB (puede usar Prisma Studio o logs).

    Siguiente: Implementar Estudiantes slice para permitir al tutor añadir/gestionar hijos, que se complementa con esta sección.
