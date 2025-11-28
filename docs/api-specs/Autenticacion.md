Auth (Autenticación)

    Propósito: Gestionar la autenticación de usuarios (login/logout) y el registro inicial de tutores. Emite JWT con roles para proteger las APIs.

    Subslices: No aplica.

    Relación con otros módulos: Usa los datos de Tutores/Docentes/Estudiantes para validar credenciales. Interactúa con Core/Security (guards JWT, roles) para proteger rutas. El store global de sesión en frontend utiliza Auth.

Prompt de desarrollo

Implement the **Auth** vertical slice. Use NestJS (with Passport JWT) and Next.js 15 conventions. Use Spanish for domain naming (e.g., `Tutor`, `Estudiante`). Include:

**Backend (NestJS)**:

- Create an `AuthModule` with `AuthController` and `AuthService`. The module should import the `UsuariosModule` to use user services.
- **AuthController**:
  - `POST /api/auth/register`: Register a new Tutor account. Accept tutor data (nombre, apellido, email, contraseña, etc.), create a Tutor via UsuariosModule service, and return a JWT.
  - `POST /api/auth/login`: Login for any user (tutor, estudiante, docente). Accept email & password, validate credentials, and return a JWT and basic user info (id, rol).
- **AuthService**:
  - `validateUser(email, password)`: Check email/password against Tutor, then Estudiante, luego Docente tables (in that order). Use Prisma to find the user by email in each table. Compare hashed passwords (use bcrypt).
  - On successful validation, return an object with user id and role.
  - `login(user)`: Use JwtService to sign a JWT payload `{ sub: userId, role: userRole }`.
  - `registerTutor(dto)`: Use TutorService (from UsuariosModule) to create a new Tutor (hash password before save). Then return the JWT via `login()`.
- Use **JWT Strategy** for validating tokens (bearer token containing `userId` and `role`). Configure `JwtAuthGuard` globally.
- Implement a **RolesGuard** and `@Roles()` decorator to restrict endpoints by role. E.g., only `'Tutor'` can hit /api/estudiantes (for creating students), `'Docente'` for class attendance, etc.
- Assume a decorator `@GetUser()` is available to inject the logged-in user entity based on JWT (e.g., returns a Tutor entity if role Tutor).
- Hash passwords with bcrypt on save, and compare on login.

**Prisma**:

- No new models; reuse `Tutor`, `Estudiante`, `Docente` models from Usuarios slice for login. Ensure unique email per table.
- In JWT payload, include role so we know which table to query for user.

**Frontend (Next.js 15)**:

- Create pages for authentication:
  - `/login`: Form for email & password. On submit, call POST `/api/auth/login`.
  - `/register`: Form for tutor registration (nombre, apellido, email, contraseña, teléfono, etc.). On submit, call POST `/api/auth/register`.
- After login, store the JWT (in a HttpOnly cookie or local store) and redirect based on role (e.g., Tutor -> /tutor/dashboard, Docente -> /docente/dashboard, Estudiante -> /estudiante/dashboard).
- Use Axios instance with an interceptor to attach JWT from Zustand store on each request.
- Protect client-side routes based on role (e.g., a route group or conditional rendering if user role matches).

**Zustand Store**:

- Implement an auth store to keep `token` and `user` profile (id, nombre, rol). Provide actions to `setSession(token, user)` on login and `clearSession()` on logout or 401.
- After login API call, decode or use response user info to set the logged-in user and token in the store.
- Persist token in memory (or localStorage if needed for refresh across tabs).

**Types**:

- Define TypeScript interfaces for Auth:
  - `LoginDto` / `RegisterDto` (frontend) matching backend DTOs.
  - `AuthResponse` containing `accessToken: string` and `user: { id: number; role: 'Tutor'|'Docente'|'Estudiante'; nombre: string; ... }`.
  - These types can live in a shared `types.ts` or `interfaces/` directory (e.g., in front and optionally shared in monorepo).
- If using class-validator on backend DTOs, mirror the shape in front-end types.

**Orden de implementación**:

1. **Backend**: Crear AuthModule, controller, service. Configurar JWT strategy y Guards en core/security. Probar registro de tutor y login obteniendo token.
2. **Frontend**: Implementar páginas `/login` y `/register` con formularios. Configurar Axios interceptors y Zustand auth store para manejar la sesión.
3. Asegurar que las rutas protegidas (dashboard, etc.) solo sean accesibles si el usuario está logueado (puede hacerse en componentes o en server-side rendering con token).
4. Probar flujo completo: registro -> login -> acceso autorizado a endpoint protegido.

Backend (NestJS)

    Estructura: AuthModule con:

        auth.controller.ts – Controlador con rutas /auth/register y /auth/login.

        auth.service.ts – Servicio con lógica de validar credenciales y emitir JWT.

    Endpoints:

        POST /api/auth/register – Crea un nuevo Tutor (usando TutorService) y devuelve accessToken + datos básicos tutor.

        POST /api/auth/login – Verifica email/contraseña en tablas de usuarios. Si válido, devuelve JWT y rol.

        (Opcional) GET /api/auth/profile – Retorna perfil del usuario logueado (se puede omitir si frontend lo mantiene localmente o se obtiene de token).

    Lógica de AuthService:

        Verificar credenciales: buscar primero en Tutor por email, luego en Docente, luego Estudiante. Usar bcrypt.compare para contraseña.

        Si coincide, compilar objeto usuario (ej. {id, role, nombre}) y firmar JWT (JwtService.sign(payload)).

        En registro, antes de crear Tutor, hashear contraseña (bcrypt.hash). Tras crear, generar token.

    Integración de seguridad:

        Configurar JwtStrategy para validar token JWT en peticiones (extrayendo Bearer token).

        Usar guard @UseGuards(JwtAuthGuard) globalmente o por controlador protegido.

        Implementar RolesGuard para métodos (como en controllers de otros slices) usando @Roles('Tutor'), etc., comparando user.role en request.

        Decorador @GetUser() obtiene el usuario actual del request (cargado por JwtStrategy, se puede hacer que busque en BD según role si se necesita info fresca).

Prisma (Base de Datos)

    Modelo Usuario: No se introduce un modelo unificado. Se autentica contra las tablas existentes:

        Tutor, Estudiante, Docente – Cada una con campos de credenciales (email único, password hasheada).

    JWT Payload: Se basará en userId + role en vez de una relación en BD.

    Nota: Asegurarse de que los emails sean únicos globalmente (se puede hacer a nivel aplicación: antes de crear tutor, verificar que email no existe en Docente/Estudiante). Alternativamente, garantizar políticas de registro distintas por rol para evitar colisiones.

Frontend (Next.js)

    Páginas:

        /login – Formulario de login. Envía email y contraseña al API. Al éxito, redirige al dashboard según rol.

        /register – Formulario de registro de tutor (nombre, apellido, email, contraseña, teléfono, etc.). Al éxito, loguea automáticamente (token recibido) y redirige al dashboard Tutor.

        Estas páginas estarán probablemente bajo la carpeta pública (ej. app/(public)/login/page.tsx si se usa App Router con segmentación).

    Comportamiento:

        Tras login o registro, guardar token JWT (p.ej. en localStorage o cookie si SSR; aquí se asume SPA, se puede usar localStorage). Actualizar store de auth con perfil y token.

        Configurar redirecciones: según user.role, navegar a /tutor/..., /docente/... o /estudiante/....

    Interceptors (Axios): Una única instancia API (ej. utils/api.ts) con axios.create({ baseURL: '/api' }). Añadir interceptor de request para inyectar Authorization: Bearer <token> en cada llamada (token obtenido de Zustand store). Interceptor de respuesta: si recibe 401, limpiar sesión (logout).

    UI: Usar componentes de formulario reutilizables (input, button) del design system. Mostrar errores si credenciales inválidas (ej. toast o mensaje en el formulario).

API Clients & Store (Estado)

    Zustand AuthStore:

        State: { token: string|null, user: { id, nombre, rol, ...} | null, isAuthenticated: boolean }.

        Actions: setSession(token, user), clearSession().

        Al iniciar la app, puede intentar leer token de almacenamiento para restaurar sesión (opcional).

    API Client Functions:

        api.login(email, password) – wrapper que hace POST /auth/login.

        api.registerTutor(datos) – hace POST /auth/register.

        Estas funciones pueden usar axios directamente o fetch. Como tenemos React Query en stack, podríamos usar useMutation hooks directamente en componentes en lugar de servicios separados. Pero es útil centralizar llamadas en un módulo api.

    React Query:

        Podría no ser necesario para login/register (ya que no es idempotente data fetching, sino acción). Se pueden usar useMutation hooks sin necesidad de definiciones previas.

Types (Interfaces / DTOs)

    Definir tipos que reflejen los DTO del backend:

        LoginRequest { email: string; password: string }

        RegisterTutorRequest { nombre: string; apellido: string; email: string; password: string; telefono?: string; ... }

        AuthResponse { token: string; user: { id: number; role: 'Tutor'|'Docente'|'Estudiante'; nombre: string; apellido: string; email: string } }

        UsuarioPerfil (para datos básicos comunes) – puede crearse una interfaz base con campos compartidos.

    Ubicación: Podría haber un paquete o carpeta compartida packages/shared-types en el monorepo, o duplicar definiciones en frontend por simplicidad pero asegurando consistencia manual con backend DTOs.

    Asegurar que los nombres de roles permitidos sean un union type o enum en TS (ej. type RolUsuario = 'Tutor' | 'Docente' | 'Estudiante').

Orden sugerido de implementación

    Usuarios (Tutores/Docentes): Asegurarse de tener modelos y servicios básicos de usuario (especialmente Tutor) antes de Auth (para poder registrar/login).

    Backend Auth: Implementar AuthModule, controller y service. Configurar JWT y Guards. Probar manualmente con un Tutor creado.

    Frontend Auth: Implementar páginas de login y registro. Configurar axios + store auth.

    Integración: Probar flujo completo registro-login. Usar Developer Tools para verificar token en requests autenticadas.

    Protección de rutas: Implementar redirección en frontend según estado auth (p.ej., si no autenticado y navega a ruta protegida, llevar a /login). Opcional: implementar guard lado servidor en Next (middleware) para rutas /tutor, /docente, etc.

    Una vez autenticación funcionando, continuar con siguientes slices (Usuarios, Pagos, etc.), utilizando el token en llamadas API.
