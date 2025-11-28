Catálogo (Productos)

    Propósito: Gestionar el Catálogo de Productos ofrecidos: planes de Suscripción y Cursos individuales. Esto sirve de base para el módulo de Pagos.

    Subslices: No aplica. (Dominio independiente, pero relacionado con Pagos.)

    Relación con otros módulos: Pagos/Membresías utilizan productos de tipo Suscripción; Inscripción a Curso usa productos de tipo Curso. Admin puede crear/editar productos (p. ej. nuevos cursos o modificar precios).

Prompt de desarrollo

Implement the **Catálogo de Productos** vertical slice.

**Backend (NestJS)**:

- Create a `CatalogoModule` with `ProductosController` and `ProductosService`.
- **Prisma Schema**: Add `Producto` model. Fields:
  - `id` (PK), `nombre` (String), `descripcion` (String?), `precio` (Decimal or Int in cents), `tipo` (enum: 'Suscripcion' | 'Curso' | 'RecursoDigital', etc.).
  - If `tipo == 'Curso'`: fields `fechaInicio` (DateTime), `fechaFin` (DateTime), `cupoMaximo` (Int).
  - If `tipo == 'Suscripcion'`: might have `duracionMeses` or billing period info (or assume monthly by default).
  - Example: a monthly subscription product, and potentially other plans or one-time products.
- **ProductosService**:
  - `findAll()` – returns all products (or possibly filter by active).
  - `findById(id)` – get one product.
  - `create(dto)` – create a new product (for admin).
  - `update(id, dto)` – update product info (for admin).
  - `remove(id)` – (optional) delete product.
- **ProductosController**:
  - `GET /api/productos` – Public/unauth or Admin? Likely available to logged-in users (tutor) to fetch available plans/courses.
  - If needed, allow query param like `?tipo=Curso` to filter (or client can filter).
  - `POST /api/productos` – Create new product (Admin only).
  - `PATCH /api/productos/:id` – Update product (Admin only).
  - (Optional) `GET /api/productos/:id` – details of a product (could be same as findAll and filter client-side).
- **Security**:
  - Admin role for mutating endpoints (create/update/delete).
  - GET listing can be open to authenticated users (or even public if needed to show pricing on marketing site).
- Seed initial products: e.g., one subscription plan (monthly subscription) and maybe no courses initially (courses can be added later by admin).
- The service might include logic: e.g., if subscription product is unique or some business rules (like not allowing multiple active subscription products for now).

**Frontend (Next.js)**:

- **Página de Precios/Suscripción** (`/suscripcion`):
  - Display available subscription plans (likely one plan, e.g., "Membresía Mensual"). Show price and description.
  - "Suscribirse" button -> triggers purchase flow (in Pagos slice).
- **Página de Cursos** (`/cursos`):
  - List any available one-time courses (if any exist). Show details (nombre, descripcion, start/end dates).
  - For each, a "Comprar/Inscribirse" button (if user logged in).
  - If clicked, trigger purchase flow for that course (will involve Pagos slice).
- **Admin - Gestión de Productos** (`/admin/productos`):
  - List all products (name, type, price, etc.).
  - Button "Nuevo Producto".
  - **Nuevo Producto** page (`/admin/productos/nuevo`): form to create product (choose type, fill relevant fields).
  - Possibly an edit page for products.
- Note: It's possible to combine with Pagos admin UI, but separate module for clarity.

**API Integration**:

- Client:
  - `useQuery('productos', fetchProductos)` – to get list of all products (for prices page or admin list).
  - `useMutation(createProducto)` – for admin to create (invalidate list).
  - If editing, `useMutation(updateProducto)`.
- If filtering by type, can either filter on frontend or have separate queries (e.g., `useQuery('cursos', ()=>fetchProductos('Curso'))`).

**Types**:

- `Producto`: { id: number; nombre: string; descripcion?: string; precio: number; tipo: 'Suscripcion'|'Curso'|'...'; fechaInicio?: string; fechaFin?: string; cupoMaximo?: number }.
- `CrearProductoDto`: separate DTOs per type or a unified one with optional fields depending on type.
- Could use a union type or interface inheritance: e.g., `ProductoBase` and extend for Curso vs Suscripcion.
- Enums: Define `ProductoTipo` enum with values 'Suscripcion','Curso','RecursoDigital'.
- For front, mirror these types for type safety.

**Orden de implementación**:

1. **Prisma**: Añadir modelo Producto con enum TipoProducto. Migrar DB.
2. **Backend**: Crear CatalogoModule, ProductosService, ProductosController. Implement GET all (public) and Admin-only create/update. Seed a default subscription product (either via migration seed or manually).
3. **Frontend Usuario**: Implementar página `/suscripcion` para mostrar plan(es). Use GET /productos to retrieve. If multiple plans, allow selection.
4. **Frontend Usuario**: Página `/cursos` (si hay cursos disponibles) similar approach.
5. **Frontend Admin**: Implementar `/admin/productos` lista y `/admin/productos/nuevo`. Form should toggle fields based on type (e.g., show date fields if type=Curso). Submit to create product.
6. **Integración con Pagos**: En Pagos slice, use Producto info:
   - For subscribing, likely the tutor selects the subscription product (if only one, it's implicit).
   - For courses, the tutor selects a course product to purchase for a student.
     Ensure Pagos slice can lookup Product by id to know price and type.
7. **Testing**: Verify GET /productos returns expected items. Create a new course via admin form, verify it appears in /cursos page.
8. Continue to **Pagos** slice to implement the purchase flows using these products.

Backend (NestJS)

    Estructura: src/modules/catalogo/

        catalogo.module.ts – Importa PrismaModule, declara ProductosService y ProductosController.

        productos.service.ts – Lógica de productos.

        productos.controller.ts – Endpoints de productos.

    Modelo Prisma Producto:

    enum TipoProducto {
      Suscripcion
      Curso
      RecursoDigital
    }

    model Producto {
      id            Int          @id @default(autoincrement())
      nombre        String
      descripcion   String?
      precio        Decimal      @db.Decimal(10,2)
      tipo          TipoProducto
      // Campos específicos de Curso:
      fechaInicio   DateTime?
      fechaFin      DateTime?
      cupoMaximo    Int?
      // Relaciones:
      membresias    Membresia[]      // si es Suscripcion, las membresías asociadas
      inscripcionesCurso InscripcionCurso[] // si es Curso, inscripciones asociadas
    }

    Nota: Se usa Decimal para precio (o se puede usar Int en centavos). Para Suscripcion, fechaInicio/fin/cupo no se usan (pueden quedar null).

    ProductosService:

        findAll(): Promise<Producto[]>: this.prisma.producto.findMany(). (Posiblemente filtrar por disponibilidad, e.g., fechaInicio > hoy para cursos futuros, pero no obligatorio ahora).

        findAllByTipo(tipo):: filtrar en query where: { tipo } si se desea.

        create(dto: CrearProductoDto): determina tipo, construye data. Ej:

            Si tipo = 'Curso', requiere dto.fechaInicio, fechaFin, cupoMaximo.

            Si tipo = 'Suscripcion', ignora campos de curso.

            Llama prisma.producto.create.

        update(id, dto): similar lógica condicional, prisma.producto.update.

        findById(id): devuelve un producto (puede incluir relaciones si necesario).

        No se requiere borrar productos usualmente (se podrían desactivar mejor).

    ProductosController: (prefijo /api/productos)

        @Get() – Devuelve lista de productos. Sin auth o con auth? Podría estar disponible sin token (para mostrar precios públicamente). Se puede dejar abierto (@Public()), o requerir auth si deseamos solo usuarios logueados. Aquí asumimos abierto o al menos @Roles('Tutor','Docente','Admin') para simplificar.

            Posibilidad de query param: ?tipo=Curso para filtrar cursos (ProductosService puede usarlo).

        @Post() – Crea producto (requiere Roles('Admin')). Body según DTO. Retorna producto creado.

        @Patch(':id') – Actualiza producto (Roles('Admin')). Permite cambiar precio, descripcion, fechas, etc.

        (Opcional) @Get(':id') – Obtener detalles de un producto específico (no estrictamente necesario, lista ya contiene todo).

    Seguridad:

        Aplicar UseGuards(JwtAuthGuard, RolesGuard) en mutaciones.

        Asumimos existe Admin user/role para permitir estas operaciones. Si no, se controlará de otra forma la creación de productos (p.ej., seeding).

    Consideraciones:

        Solo un producto de Suscripción activo (all-you-can-learn). Si definimos uno, no permitir múltiples suscripciones distintas por ahora (podemos simplemente tener uno por seeding).

        Cursos: admin puede crear varios cursos con fechas/cupos distintos.

        RecursoDigital: no entra en scope actual, pero modelo preparado para posibles libros u otros pagos one-time, se ignora en lógica actual.

        Datos iniciales: se puede insertar un Producto Suscripcion por defecto via migración seed o manual.

Prisma (Base de Datos)

    Producto: modelo añadido con enum TipoProducto. Migrar base.

    Relaciones con Pagos:

        Membresía (en Pagos slice) tendrá productId -> referencia al producto de suscripción.

        InscripcionCurso (Pagos slice) tendrá productId -> referencia a producto de curso.

        Asegurar integridad: e.g., si producto eliminado, qué hacer con membresías/inscripciones existentes. En general, probablemente no se borren productos en producción.

    Agregar un valor inicial:

        Ej: Producto Suscripcion Mensual: nombre "Suscripción Mensual", precio X. (Esto se puede hacer con prisma seed script; fuera del scope inmediato del código, pero mencionar).

Frontend (Next.js)

    Página Suscripción (/suscripcion):

        Mostrar detalles del plan de suscripción. Si solo hay uno:

            Nombre (ej. "Membresía Mensual"), descripción (beneficios), precio (ej. "$X/mes").

            Botón "Suscribirme".

        Si hay varios (mensual vs anual), listar opciones.

        Al hacer click en suscribirme:

            Llamar endpoint de Pagos (ej. POST /pagos/suscripcion) para obtener link de pago, o dirigir a flujo de pago (esto en Pagos slice).

            O navegar a un checkout page.

        Esta página accesible para usuarios no suscritos (posiblemente redirigir ahí si no tienen membresía activa).

    Página Cursos (/cursos):

        Lista de cursos disponibles (productos tipo Curso con fechaInicio futura o en curso).

        Para cada curso: nombre, descripcion breve, fecha inicio/fin, precio único, cupoMaximo (y quizá cupos disponibles calculados: se puede mostrar if InscripcionesCurso are counted).

        Botón "Comprar curso" en cada item (if user logged in).

        On click: si tutor tiene varios estudiantes, podría preguntar "¿Para qué estudiante?" (UI: modal con lista de hijos). Luego iniciar flujo de pago (Pagos slice) pasando también el estudiante elegido.

        Si no logueado, pedir login.

    Admin - Productos (/admin/productos):

        Tabla con productos: columnas: Nombre, Tipo, Precio, Activo (podríamos use activo field if added, skip for now).

        Botón "Nuevo Producto" -> /admin/productos/nuevo.

        (Editar inline o separate page if needed.)

    Admin - Nuevo Producto (/admin/productos/nuevo):

        Formulario:

            Campos comunes: Nombre, Descripción, Precio, Tipo (select).

            Si Tipo = 'Curso': mostrar campos FechaInicio, FechaFin, CupoMaximo.

            Si Tipo = 'Suscripcion': quizás campo Duración (meses) si quisieramos, o no (asumir indefinido recurrente mensual).

            Validar: si Curso, fechas requeridas, fechaFin > fechaInicio, cupoMaximo > 0.

        En submit, llamar POST /api/productos.

        Volver a lista tras crear.

    Admin - Editar Producto: (opcional)

        Podría reutilizar mismo form componiendo initial values, calling PATCH /api/productos/:id.

API Clients & State

    API Calls:

        api.getProductos(tipo?) -> GET /productos (pass query param tipo if needed to filter).

        api.createProducto(data) -> POST /productos.

        api.updateProducto(id, data) -> PATCH /productos/:id.

    React Query:

        useQuery('productos', api.getProductos) – fetch all products (admin view or user view).

        Or separate keys: 'productos_all', 'productos_cursos' etc., but not needed unless performance.

        For user pages, can reuse same query and then filter in component (e.g., .filter(p => p.tipo==='Curso')).

        useMutation(api.createProducto) with invalidation of 'productos'.

        useMutation(api.updateProducto) likewise.

    Zustand:

        No specific store needed; data can be fetched on demand. Possibly store selected product temporarily if needed (but not necessary).

Types

    Enums & Interfaces:

        type ProductoTipo = 'Suscripcion' | 'Curso' | 'RecursoDigital';

        interface Producto { id: number; nombre: string; descripcion?: string; precio: number; tipo: ProductoTipo; fechaInicio?: string; fechaFin?: string; cupoMaximo?: number; }

        interface CrearProducto with union or optional fields:

            Could make it discriminated union:

            type CrearProductoDto =
              | { tipo: 'Suscripcion'; nombre: string; descripcion?: string; precio: number; /* campos de suscripcion, e.g. duracionMeses? */ }
              | { tipo: 'Curso'; nombre: string; descripcion?: string; precio: number; fechaInicio: string; fechaFin: string; cupoMaximo: number; };

            Simpler: define all fields optional and validate conditionally on backend.

        Backend DTO class can use class-validator with conditional validation (e.g., @ValidateIf(o=> o.tipo==='Curso') for course-specific fields).

    Uso en otros slices:

        Membresia (Pagos) will reference Producto: define membresia.productoId.

        InscripcionCurso will reference Producto: define inscripcionCurso.productoId.

        Types for those will incorporate linking to Producto minimal info (maybe name).

Orden sugerido de implementación

    Modelo y Migración: Añadir enum TipoProducto y modelo Producto. Migrar DB. Insertar producto suscripción base (puede hacerse tras migración con script).

    Backend Service/Controller: Implementar ProductosService.findAll, create, update. Implementar ProductosController GET (no auth or auth basic) y admin-only POST/PATCH. Testear GET devuelve lista (inicial con suscripción seeded).

    Frontend Usuario Suscripción: Implementar /suscripcion página. useQuery('productos') para obtener plan(es). Mostrar info y botón suscribir (onclick to be handled in Pagos slice - e.g., route to /pagos checkout).

    Frontend Usuario Cursos: Implementar /cursos página (in case courses exist). Filtrar productos tipo 'Curso' del query. Mostrar lista y botón comprar (onClick triggers Pagos slice function, potentially route to /pago?productId=...).

    Frontend Admin Lista: Implementar /admin/productos. useQuery('productos') para listar todos. Render table.

    Frontend Admin Nuevo: Implementar /admin/productos/nuevo. Form with state for type to toggle fields. Submit to create via mutation. On success, invalidate and redirect.

    Frontend Admin Editar (opcional): If needed, implement similar to Nuevo but pre-populated (fetch product by id if needed).

    Testing:

        Check that subscription page displays correct price.

        Create a new "Curso" via admin, see it appear on cursos page.

        Ensure admin needs to be authorized (for now, possibly test via direct API calls or assume an admin user exists).

    Proceed to Pagos slice to implement actual purchase flows using Producto info and linking to Membresía/InscripciónCurso.
