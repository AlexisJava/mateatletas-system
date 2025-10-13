## Admin (Copiloto)
- **Propósito:** Proveer herramientas al administrador para monitorear la "salud" del sistema: clases, pagos, alertas derivadas de feedback de docentes, etc., y realizar gestión global (crear docentes, productos, etc. ya cubierto en slices anteriores).
- **Subslices:**
  - **Dashboard Admin:** vista general con indicadores clave (suscripciones activas, próximas clases, alertas pendientes).
  - **Alertas Proactivas:** listado de alertas generadas a partir de observaciones docentes (p.ej., estudiantes con posibles problemas) y herramientas para resolverlas con ayuda de IA.
  - **Gestión de Rutas Curriculares:** CRUD para crear y editar las materias/temáticas de las clases (ej: Lógica, Álgebra).
- **Relación con otros módulos:** 
  - Muestra datos de **Pagos** (estado de membresías), **Clases** (asistencia, próximas clases), **Usuarios** (estadísticas), y consume las **Alertas** generadas en Asistencia. Integra con **Tutor IA** para sugerir soluciones a alertas.

### Dashboard Admin e Indicadores

#### Prompt de desarrollo
```text
Implement the **Admin Dashboard** and **Alertas** features.

**Backend (NestJS)**:
- Under AdminModule, create `AdminController` and possibly an `AdminService` for aggregated data.
- **Prisma Schema**: Add `Alerta` model:
  - Fields: `id`, `estudianteId`, `claseId`, `descripcion` (text of concern), `fecha` (DateTime), `resuelta` (Boolean).
  - These are created when a teacher's observacionesDocente triggers an alert.
- **AdminService**:
  - `getDashboardStats()`: Aggregate key metrics:
    * Number of active memberships: `count` of Membresia with estado='Activa'.
    * Number of upcoming classes (today onward) not canceled: `count` of Clase where fechaHoraInicio >= today and estado='Programada'.
    * Number of open alerts: `count` of Alerta where resuelta=false.
    * (Any other relevant counts: total estudiantes, total docentes, etc., optional.)
    * Compile into an object.
  - `listarAlertas()`:
    * Fetch alerts where resuelta=false, include Estudiante (name) and maybe Clase (date, route).
    * Sort by fecha desc.
  - `resolverAlerta(alertaId)`: Mark alert as resuelta=true.
  - `sugerirSolucion(alertaId)`: (Integration with AI Tutor)
    * Fetch the alerta (with descripcion, and maybe related student or class context).
    * Use AI API (OpenAI) to generate a suggestion:
      - E.g., prompt: "Un estudiante muestra: ${descripcion}. Sugerencias para ayudar a este estudiante?"
    * Return the AI response text.
- **AdminController**:
  - `GET /api/admin/dashboard` (Roles('Admin')): returns result of getDashboardStats().
  - `GET /api/admin/alertas` (Roles('Admin')): returns list of open alerts (with details).
  - `PATCH /api/admin/alertas/:id/resolver` (Roles('Admin')): calls resolverAlerta (mark resolved).
  - `GET /api/admin/alertas/:id/sugerencia` (Roles('Admin')): calls sugerirSolucion and returns suggestion text.
- Possibly reuse TutorIA module for suggestion or call OpenAI directly here.
- **Security**: All these Admin endpoints only accessible by Admin role.

**Frontend (Next.js)**:
- **Admin Dashboard Page** (`/admin` or `/admin/dashboard`):
  - On mount, call `GET /api/admin/dashboard` (useQuery 'adminStats').
  - Display metrics: e.g., "Membresías activas: X", "Próximas clases: Y", "Alertas pendientes: Z".
  - Provide navigation links to deeper pages (like to payments, classes, alerts).
- **Admin Alertas Page** (`/admin/alertas`):
  - useQuery('alertas', fetchAlertas) to GET open alerts.
  - List each alert: info like "Alumno Juan P. (Clase Lógica 10/10/25): [descripcion]" (the teacher note).
  - Perhaps highlight key words (optional).
  - Actions:
    * "Ver Sugerencia" button on each alert:
      - Calls `GET /api/admin/alertas/{id}/sugerencia` (could use useQuery with id or a onClick that triggers fetch).
      - Show the returned suggestion (e.g., in a modal or inline below the alert).
    * "Marcar Resuelta" button:
      - Calls PATCH /api/admin/alertas/{id}/resolver (useMutation). On success, remove this alert from list (or refetch).
  - Possibly link to the student's profile or class (not required now).
- **AI Suggestion Integration**:
  - When "Ver Sugerencia" clicked:
    * Could open a modal showing "Generando..." then display suggestion text from API.
    * Or a collapsible area under the alert item that gets populated.
  - Use a loading state during fetch.
- **Flow**:
  - Admin checks alerts, reads suggestion, then marks resolved once handled (maybe after contacting tutor or taking action offline).
  - Suggestion is just a hint; admin still decides.
- **Admin Other**:
  - Already have pages for managing productos, docentes, etc., from earlier slices.

**Types**:
- DashboardStats: { activeMemberships: number; upcomingClasses: number; openAlerts: number; ... }.
- Alerta: { id, descripcion: string; fecha: string; estudiante: { nombre, apellido }; clase?: { fechaHoraInicio, rutaCurricular: { nombre } }; resuelta: boolean }.
- SuggestionResponse: { suggestion: string } or just string.

**Orden de implementación**:
1. **Prisma**: Create `Alerta` model if not already: id, estudianteId, claseId, descripcion, fecha, resuelta (bool). Migrar.
2. **Backend**: Implement AdminService.getDashboardStats (use prisma.membresia.count, prisma.clase.count etc.), listarAlertas (prisma.alerta.findMany where resuelta=false include student+class info), resolverAlerta (update resuelta), sugerirSolucion (call OpenAI API with alert.descripcion context).
   - Integrate OpenAI similar to AI Tutor if available (maybe use same config).
3. **AdminController**: Add endpoints GET dashboard, GET alertas, PATCH resolver, GET sugerencia.
4. **Frontend**:
  - Dashboard page: call GET /admin/dashboard, display metrics nicely (cards or list).
  - Alertas page: call GET /admin/alertas, map through alerts list.
    * For each, have state for suggestion text (initially hidden).
    * On "Ver Sugerencia": call API (or use a cached query per alert id).
      - Could use useQuery with alert id and trigger on click, or simpler, call fetchAlertSuggestion(id) manually.
    * Display suggestion text (maybe in a <blockquote> or styled div).
    * On "Marcar Resuelta": call mutation to PATCH, then remove alert from state or refetch list.
  - Add Admin navigation link to these pages in admin menu.
5. **Testing**:
  - Generate a test alert (through Asistencia: e.g., teacher note with a keyword).
  - Log in as Admin (assuming admin user exists).
  - View dashboard metrics (should reflect at least that openAlerts count).
  - Go to alerts page: see the alert, click suggestion (if OpenAI key configured, it returns something; if not, we simulate or ensure at least call).
  - Mark resolved, verify it's gone and openAlerts count decreases if re-check.
  - Ensure no unauthorized access (non-admin user trying /admin APIs gets 403).
6. Finalize documentation and ensure everything ties together.

Backend (Admin Copiloto)

    Modelo Prisma Alerta:

    model Alerta {
      id           Int @id @default(autoincrement())
      estudianteId Int
      estudiante   Estudiante @relation(fields: [estudianteId], references: [id])
      claseId      Int
      clase        Clase @relation(fields: [claseId], references: [id])
      descripcion  String
      fecha        DateTime @default(now())
      resuelta     Boolean @default(false)
    }

        Migrar DB.

    AdminModule: Ensure exists and imported (with providers if needed).

    AdminService:

        async getDashboardStats():

            const activeSubs = await prisma.membresia.count({ where:{ estado: 'Activa' } });

            const upcomingClasses = await prisma.clase.count({ where: { estado: 'Programada', fechaHoraInicio: { gte: startOfToday } } });

            const openAlerts = await prisma.alerta.count({ where: { resuelta: false } });

            Possibly others (not mandatory).

            Return { activeMemberships: activeSubs, upcomingClasses, openAlerts }.

        async listarAlertas():

            const alertas = await prisma.alerta.findMany({ where:{ resuelta: false }, include:{ estudiante:{ select:{ nombre, apellido }}, clase:{ include:{ rutaCurricular:{ select:{ nombre }}, fechaHoraInicio: true } } }, orderBy:{ fecha: 'desc' } });

            Return alertas.

        async resolverAlerta(id): await prisma.alerta.update({ where:{ id }, data:{ resuelta: true } });

        async sugerirSolucion(alertaId):

            Fetch alerta = prisma.alerta.findUnique({ where:{id}, include:{ estudiante:true, clase:true } });

            Compose prompt for AI:

                e.g., El docente dejó la siguiente observación sobre el estudiante ${alerta.estudiante.nombre}: "${alerta.descripcion}". Sugiere al administrador cómo abordar esta situación con el estudiante y su familia.

            Use OpenAI API (e.g., openai.createCompletion or Chat) with that prompt.

            Return suggestion text.

            This requires an OpenAI API key configured. If none, could return a static suggestion for now.

    AdminController:

        @Get('dashboard') (Roles('Admin')): returns AdminService.getDashboardStats().

        @Get('alertas') (Roles('Admin')): returns AdminService.listarAlertas().

        @Patch('alertas/:id/resolver') (Roles('Admin')): AdminService.resolverAlerta(id), return { success: true } or 204.

        @Get('alertas/:id/sugerencia') (Roles('Admin')): text = AdminService.sugerirSolucion(id), return { sugerencia: text }.

    Nota: The suggestion generation might be slow; we could also generate on alert creation and store in DB to quick display, but we'll do on-demand to use latest AI and not store sensitive notes.

    Integrate AdminModule in app.module (import and providers).

Frontend (Admin Copiloto)

    Dashboard (/admin/dashboard):

        useQuery('adminStats', api.getAdminStats) -> GET /admin/dashboard.

        Display stats:

            Possibly as cards or simple list:

                "Suscripciones activas: X"

                "Clases programadas (desde hoy): Y"

                "Alertas pendientes: Z"

            Could add more if desired (e.g., total alumnos, etc.).

        Include links or buttons:

            "Ver Alertas" -> navigate to /admin/alertas.

            "Ver Clases" (to /admin/clases) etc., as needed.

    Alertas (/admin/alertas):

        useQuery('alertas', api.getAlertas) -> GET /admin/alertas.

        State: maybe track suggestion for each alert if opened.

            Could manage via additional useQuery per alert id or local component state.

            Simpler: local state: an object mapping alertId to suggestion text or loading.

        Render list:

            For each alert:

                Show student name (from alert.estudiante), maybe class info if needed (class date/route).

                Show descripcion (the note).

                Button "Sugerencia AI" -> onClick calls api.getAlertaSugerencia(id):

                    Set state for that alertId as loading.

                    fetch GET /admin/alertas/{id}/sugerencia (maybe using axios directly).

                    On response, set state with suggestion text.

                If suggestion text is present in state, display it below (e.g., <em> suggestion </em>).

                Button "Marcar resuelta" -> onClick triggers api.resolverAlerta(id) (PATCH).

                    On success, remove alert from list (set state by filtering it out or refetch the alert list).

                    Maybe also update dashboard stat (openAlerts count) if showing live (optional).

        UI: Possibly style each alert with border, and suggestion in italic or smaller font.

    Nav:

        Ensure Admin pages are accessible only by admin:

            Possibly add a check that if user.role !== 'Admin', redirect from these pages or hide nav links.

            On backend already protected, but front can also guard (like if store.user.role != 'Admin', push to /).

        Provide link to "Dashboard" and "Alertas" in admin menu or a general menu visible to admin.

    Admin in system:

        We assumed admin as separate role. Possibly implemented by having a specific user flagged or using a default admin account.

        For testing, one might mark a Docente or Tutor as Admin in token. Possibly incorporate a quick way:

            If using roles guard, the user must have role 'Admin'. Our Auth system didn't explicitly handle admin accounts.

            Could handle by manually adding an Admin user in DB and creating a login mechanism, or allow an override if email matches a config.

            Simpler: treat a specific Tutor (like first tutor) as Admin for testing by adding role if email or using environment.

        For doc completeness, we assume an admin user exists with Admin role to access these.

Types

    DashboardStats TS: interface with fields as above.

    Alerta TS: { id: number; descripcion: string; fecha: string; resuelta: boolean; estudiante: { nombre: string; apellido: string }; clase: { fechaHoraInicio: string; rutaCurricular: { nombre: string } } }

    SuggestionResponse: { sugerencia: string } or plain string.

    Add to user.roles union 'Admin'.

Orden sugerido de implementación

    Modelo Alerta: Add to schema, migrate.

    Backend: Implement AdminService and AdminController as specified. Test by manually creating an alert (e.g., via teacher feedback containing keyword) and calling GET endpoints with an admin auth (you might issue a JWT with role 'Admin').

    Integrate AI suggestion: If an OpenAI API key is available, test sugerirSolucion. If not, consider returning a placeholder string for now.

    Frontend Dashboard: Build page to display stats from /admin/dashboard.

    Frontend Alertas: Build page to list alerts, with state management for suggestions and resolution.

        Use dummy data or an actual alert from DB (if any).

        Simulate suggestion fetch by either using a test stub or actual call if API key is set.

    Auth for admin: Possibly create an admin user for test. If none, one hack is to mark an existing tutor as admin in DB and modify RolesGuard to allow that (complex). For now, assume you have an admin token to test.

    Test flow:

        Ensure some alert exists (teacher note triggered).

        Access /admin/alertas (with admin user) -> see it.

        Click "Sugerencia AI" -> see suggestion (test that the endpoint returns something).

        Click "Resuelta" -> it disappears.

        Check /admin/dashboard reflects updated count.

    Final review: All slices integrated: ensure when teacher submits feedback with keywords, an alert is created; admin sees it; suggestions work. Membership gating works; class booking and attendance flows complete.

---

### Gestión de Rutas Curriculares

#### Prompt de desarrollo
```text
Implement **Rutas Curriculares Management** for Admin.

**Backend (NestJS)**:
- Extend `AdminModule` or create `RutasCurricularesModule` with service and controller.
- **Prisma Schema**: `RutaCurricular` model already exists (from Clases slice):
  ```prisma
  model RutaCurricular {
    id     Int    @id @default(autoincrement())
    nombre String @unique
    clases Clase[]
  }
  ```

- **RutasCurricularesService**:
  - `listarTodas()`: Return all rutas (prisma.rutaCurricular.findMany()).
  - `crear(dto)`: Create new ruta (validate nombre unique).
  - `actualizar(id, dto)`: Update ruta nombre.
  - `eliminar(id)`: Soft delete or hard delete (check if has associated clases first).

- **AdminController** (or separate RutasCurricularesController):
  - `GET /api/admin/rutas-curriculares` (Roles('Admin','Docente')): List all rutas (also useful for docente/admin when creating classes).
  - `POST /api/admin/rutas-curriculares` (Roles('Admin')): Create new ruta. Body: { nombre: string }.
  - `PATCH /api/admin/rutas-curriculares/:id` (Roles('Admin')): Update ruta. Body: { nombre: string }.
  - `DELETE /api/admin/rutas-curriculares/:id` (Roles('Admin')): Delete ruta (only if no clases associated).

- **Validation**:
  - Ensure nombre is not empty and unique.
  - On delete, check if clase.rutaCurricularId references this ruta; if yes, throw error ("Cannot delete ruta with existing clases").

**Frontend (Next.js)**:
- **Admin Rutas Page** (`/admin/rutas-curriculares`):
  - List all rutas in a table (nombre).
  - Button "Nueva Ruta" -> opens modal or navigates to form.
  - Each row: "Editar" button (inline edit or modal) and "Eliminar" button (with confirmation).

- **Nueva Ruta Form**:
  - Simple input for nombre.
  - Submit -> POST /api/admin/rutas-curriculares.
  - On success, add to list and close modal.

- **Editar Ruta**:
  - Pre-fill input with current nombre.
  - Submit -> PATCH /api/admin/rutas-curriculares/:id.

- **Eliminar Ruta**:
  - Confirmation dialog: "¿Está seguro? Esta ruta no puede eliminarse si hay clases asociadas."
  - On confirm -> DELETE /api/admin/rutas-curriculares/:id.
  - If error (409 Conflict), show message.

**Types**:
- `RutaCurricular`: { id: number; nombre: string }
- `CrearRutaDto`: { nombre: string }
- `ActualizarRutaDto`: { nombre: string }

**Orden de implementación**:
1. Backend: RutasCurricularesService with CRUD methods.
2. Backend: AdminController endpoints (or separate controller).
3. Frontend: Admin page with list, create/edit/delete UI.
4. Testing:
   - Create new ruta "Trigonometría".
   - Edit "Lógica" to "Lógica Avanzada".
   - Try deleting ruta with associated clases (should fail).
   - Delete ruta without clases (should succeed).
```

#### Backend (Rutas Curriculares)

```typescript
// rutas-curriculares.service.ts
@Injectable()
export class RutasCurricularesService {
  constructor(private prisma: PrismaService) {}

  async listarTodas() {
    return this.prisma.rutaCurricular.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { clases: true }
        }
      }
    });
  }

  async crear(dto: CrearRutaDto) {
    // Check if nombre already exists
    const exists = await this.prisma.rutaCurricular.findUnique({
      where: { nombre: dto.nombre }
    });

    if (exists) {
      throw new ConflictException('Ya existe una ruta con este nombre');
    }

    return this.prisma.rutaCurricular.create({
      data: dto
    });
  }

  async actualizar(id: number, dto: ActualizarRutaDto) {
    // Check if new nombre conflicts with another ruta
    if (dto.nombre) {
      const exists = await this.prisma.rutaCurricular.findFirst({
        where: {
          nombre: dto.nombre,
          id: { not: id }
        }
      });

      if (exists) {
        throw new ConflictException('Ya existe otra ruta con este nombre');
      }
    }

    return this.prisma.rutaCurricular.update({
      where: { id },
      data: dto
    });
  }

  async eliminar(id: number) {
    // Check if has associated clases
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clases: true }
        }
      }
    });

    if (!ruta) {
      throw new NotFoundException('Ruta curricular no encontrada');
    }

    if (ruta._count.clases > 0) {
      throw new ConflictException(
        `No se puede eliminar: hay ${ruta._count.clases} clase(s) asociada(s)`
      );
    }

    return this.prisma.rutaCurricular.delete({
      where: { id }
    });
  }
}

// admin.controller.ts (extending existing)
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private rutasService: RutasCurricularesService
  ) {}

  // ... existing endpoints ...

  // Rutas Curriculares endpoints
  @Get('rutas-curriculares')
  @Roles('Admin', 'Docente') // Docentes can also view for class creation
  async listarRutas() {
    return this.rutasService.listarTodas();
  }

  @Post('rutas-curriculares')
  async crearRuta(@Body() dto: CrearRutaDto) {
    return this.rutasService.crear(dto);
  }

  @Patch('rutas-curriculares/:id')
  async actualizarRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarRutaDto
  ) {
    return this.rutasService.actualizar(id, dto);
  }

  @Delete('rutas-curriculares/:id')
  async eliminarRuta(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.eliminar(id);
  }
}
```

#### Frontend (Rutas Curriculares)

```typescript
// app/admin/rutas-curriculares/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';

export default function RutasCurricularesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<any>(null);
  const [nombre, setNombre] = useState('');

  const { data: rutas, isLoading } = useQuery(['rutas'], api.getRutasCurriculares);

  const crearMutation = useMutation(api.crearRutaCurricular, {
    onSuccess: () => {
      queryClient.invalidateQueries(['rutas']);
      setIsModalOpen(false);
      setNombre('');
      toast.success('Ruta creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear ruta');
    }
  });

  const actualizarMutation = useMutation(api.actualizarRutaCurricular, {
    onSuccess: () => {
      queryClient.invalidateQueries(['rutas']);
      setEditingRuta(null);
      setNombre('');
      toast.success('Ruta actualizada');
    }
  });

  const eliminarMutation = useMutation(api.eliminarRutaCurricular, {
    onSuccess: () => {
      queryClient.invalidateQueries(['rutas']);
      toast.success('Ruta eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se puede eliminar esta ruta');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingRuta) {
      actualizarMutation.mutate({ id: editingRuta.id, nombre });
    } else {
      crearMutation.mutate({ nombre });
    }
  };

  const handleEdit = (ruta: any) => {
    setEditingRuta(ruta);
    setNombre(ruta.nombre);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (confirm(`¿Eliminar la ruta "${nombre}"?`)) {
      eliminarMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rutas Curriculares</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nueva Ruta
        </button>
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Clases Asociadas</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rutas?.map((ruta: any) => (
                <tr key={ruta.id} className="border-t">
                  <td className="px-6 py-4 font-medium">{ruta.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{ruta._count.clases}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(ruta)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ruta.id, ruta.nombre)}
                      disabled={ruta._count.clases > 0}
                      className={`text-red-600 hover:underline ${
                        ruta._count.clases > 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={ruta._count.clases > 0 ? 'No se puede eliminar: tiene clases asociadas' : ''}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva/Editar Ruta */}
      <Modal
        isOpen={isModalOpen || !!editingRuta}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRuta(null);
          setNombre('');
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingRuta ? 'Editar Ruta' : 'Nueva Ruta'}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Nombre de la Ruta
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: Trigonometría"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRuta(null);
                setNombre('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crearMutation.isLoading || actualizarMutation.isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingRuta ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
```

#### Types

```typescript
// types/rutas-curriculares.ts
export interface RutaCurricular {
  id: number;
  nombre: string;
  _count?: {
    clases: number;
  };
}

export interface CrearRutaDto {
  nombre: string;
}

export interface ActualizarRutaDto {
  nombre: string;
}
```

#### Testing
1. Admin accede a `/admin/rutas-curriculares`
2. Crea nueva ruta "Trigonometría"
3. Edita "Lógica" → "Lógica Matemática"
4. Intenta eliminar ruta con clases → Error
5. Elimina ruta sin clases → Éxito
