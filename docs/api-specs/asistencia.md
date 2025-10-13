### Asistencia (Registro de Asistencia y Feedback)

#### Prompt de desarrollo
```text
Implement the **Asistencia** sub-slice (marking attendance and feedback by Docente).

**Backend (NestJS)**:
- Use the existing Inscripciones setup.
- **Prisma Schema**: (Inscripcion model already has estadoAsistencia and observacionesDocente fields).
- **InscripcionesService (extend)**:
  - `marcarAsistencia(inscripcionId, dto, docenteId)`: Mark attendance for a specific Inscripcion.
    * Find inscripcion (with clase relation).
    * Verify that the clase.docenteId == docenteId (so the teacher owns this class).
    * Update inscripcion: set estadoAsistencia (to 'Asistio' or 'Ausente') and observacionesDocente (feedback text).
  - Potentially allow partial updates (if teacher only marks a few at a time, maybe one by one).
    * We can implement it per student: teacher submits for each student separately (e.g., a form that updates one Inscripcion at a time).
    * Or teacher could submit all at once – that would be multiple updates; simpler to handle one by one via API calls.
  - `obtenerInscripcion(inscripcionId)` if needed (or just find in method).
- **InscripcionesController (extend)**:
  - `PATCH /api/inscripciones/:id` – (Roles('Docente'))
    * Body: { estadoAsistencia: 'Asistio'|'Ausente', observacionesDocente?: string }.
    * Calls service.marcarAsistencia(id, dto, docenteId from token).
    * Returns updated inscripcion or success status.
  - Could also allow bulk, but not necessary now.
- **Security**:
  - Ensure only the Docente of that class (or Admin) can mark attendance.
  - Admin might want to override attendance, but we can allow Admin by RolesGuard or separate logic (for simplicity, allow Admin as well in guard).
- **After marking**:
  - Potentially trigger gamification:
    * If teacher gave positive feedback or just marking attendance itself might not give points.
    * Points are given via Gamificación endpoints specifically.
    * But teacher might want to give points in same workflow – not automatic, but next they might call Gamificación API to assign points to those who participated well.
    * We keep attendance separate; awarding points will be a separate action via Gamificación slice (likely on the same interface).
  - Possibly, if all absent or some pattern, no direct effect here aside from data.
- **Admin/Alerts integration**:
  - The admin "Alertas Proactivas" feature scans observacionesDocente for negative words to create Alertas (Admin slice).
  - Implementation: Could integrate here:
    * After saving observacionesDocente, do a quick check of content for keywords (like "dificultad", "problema", "no presta atención", etc).
    * If matches, create an Alerta (e.g., via AdminService or direct Prisma).
    * For now, note that this is where such a trigger would happen. Possibly not implement fully if out of scope, but mention hooking point.
    * We can call an AdminService (if accessible) or Prisma to create an Alert model (if model Alerta exists as per Admin slice).
    * Let's say, if we detect words from a predefined list, create prisma.alerta.create({ data: { estudianteId, claseId, ... } }).
  - This integration can be mentioned or done minimally (the list of keywords could be static, e.g., ["dificultad","problema","ausencia grave"] etc).

**Frontend (Next.js)**:
- **Docente - Tomar Asistencia UI** (`/docente/clases/[id]/asistencia`):
  - This page should list the roster (from GET /inscripciones?claseId).
  - Next to each student:
    * A toggle or radio buttons for attendance: e.g., Present (Asistio) or Absent (Ausente).
    * A text area or input for observaciones (feedback).
  - Workflow: teacher fills these for each student and hits "Guardar" (or individually save each).
  - Option A: Save all at once:
    * Could have one form with multiple entries, but then PATCH endpoint is one per inscripcion.
    * We would either do multiple calls or create a bulk endpoint (not implemented).
    * Simpler: allow teacher to click "Guardar" per student line (which sends one PATCH).
    * Or have a "Guardar Todo" that triggers sequential calls for each changed entry.
    * Since class sizes may not be huge, sequential calls could work.
    * Possibly implement per student to reduce complexity:
      - E.g., each row has a Save button. Teacher fills row, hits Save -> calls PATCH for that inscripcion.
      - Moves to next.
    * It's slightly less user-friendly but simpler to implement.
  - We can do per row save for now.
  - After saving one:
    * Show some checkmark or "Saved" indicator.
    * Disable further editing unless allowed to change (but usually once submitted, it's final).
  - Alternatively, teacher marks all then one big "Submit All" button. Without a bulk API, we'd loop calls:
    * Could implement that in front: for each student in state, call PATCH sequentially.
    * That could be done but careful with async; can await each or use Promise.all (but then MP server might handle concurrently, likely fine).
    * It's doable and user gets one action.
    * We'll go for "Submit All" to simulate a real scenario:
      - Write code to iterate each inscripcion and call API. Use toast when all done.
      - If any call fails, show error.
    * For simplicity in code, per row might be easiest to explain, but let's aim user-friendly:
      - We'll implement one Save All, as teacher likely wants to submit once after class.
  - Regardless, use `useMutation(patchInscripcion)` for each update or a custom loop.
  - After marking attendance:
    * Could automatically refresh something or update local state to reflect saved statuses.
    * Possibly inform teacher "Asistencia guardada".
  - **UI**:
    - Radio or checkbox: e.g., a checkbox "Asistió" (if unchecked means Ausente).
      * Or two radio: Present, Absent.
    - Observaciones: a small text input or textarea for any comment.
    - For default, all are Pendiente; teacher will likely mark most as Asistio except those absent.
    - Could have a "Mark all as present" toggle to speed up (optional).
  - Possibly incorporate point-giving triggers:
    - e.g., after marking present, teacher might open Gamification controls (like give +5 points) but that is handled in Gamificación slice manually by teacher.
    - We won't automate it here, teacher will separately use that interface or concurrently.

- **Feedback to Admin**:
  - Admin Alerts: not visible to teacher, but teacher's note might generate an alert behind scenes.

**Types**:
- Request DTO for attendance: `MarcarAsistenciaDto` { estadoAsistencia: 'Asistio'|'Ausente'; observacionesDocente?: string }.
- Could reuse EstadoAsistencia enum in TS.
- Front state for each student:
  - { inscripcionId, asistio: boolean|null (or 'Pendiente'), observaciones: string }.
- Could derive initial state from fetched inscripciones (initially Pendiente, no obs).
- After submit, update state to reflect.

**Orden de implementación (Asistencia)**:
1. **Backend**: Extend InscripcionesService with marcarAsistencia. Include guard check for docente vs inscripcion.
   - Possibly get AdminService for alerts or just implement a simple keyword check inside and create Alerta if needed (if Admin module present).
2. Extend InscripcionesController with PATCH /inscripciones/:id (Docente role).
3. **Admin Alerts integration**: If Alerta model exists (Admin slice likely we add later), implement keyword detection in marcarAsistencia:
   - e.g., const alertWords = ['dificultad','problema','triste','violencia','bullying']; if any present in observacionesDocente (toLowerCase match), create prisma.alerta.create({ data: { estudianteId, claseId, descripcion: observacionesDocente, fecha: now } }).
   - Mark as unresolved by default. (This will be consumed in Admin slice).
4. **Frontend**:
   - Build the attendance form on `/docente/clases/[id]/asistencia`:
     * useQuery to get roster.
     * Manage local state for each entry (present/absent and note).
     * UI elements as described.
     * On "Submit All": iterate entries, for each call patch API.
       - Can do sequential with `for await` or Promise.all if concurrency fine (server handles).
       - After all succeed, show success message.
       - If any fails, show which maybe (simpler: "Some failed, please retry", but likely won't fail if logic correct).
     * Alternatively, Save per row:
       - Each row with a Save button that calls patch for that inscripcion.
       - After saving, maybe disable inputs or mark saved.
       - This is simpler to implement without complex loops.
     * Possibly pick this approach to avoid writing loop logic in explanation:
       - e.g., have `useMutation(updateInscripcion)` and call for each row individually on clicking that row's save.
       - We'll lean to save all at once for brevity in doc though.
     * Let's mention Save All (since more real).
   - After save, maybe redirect back to /docente/clases or keep on same page with fields disabled or marked.
   - Encourage teacher to then maybe go to Gamification to assign points (out of this scope but in usage).
5. **Testing**:
   - Reserve some students in a class.
   - Login as that class's teacher, go to attendance page.
   - Mark some present, some absent with notes containing e.g. "dificultad".
   - Submit: check DB that inscripcion records updated accordingly.
   - If Admin Alerts implemented, check Alerta created for the note containing "dificultad".
   - On front, ensure UI updates or indicates saved (maybe fetch roster again to see that now have Asistio/Ausente recorded).
   - Completed process.

Now, we have covered all slices.

Proceed to finalize Admin slice next, which includes alerts (some of which we touched here), and presumably admin dashboard.

Backend (Asistencia)

    InscripcionesService.marcarAsistencia(inscripcionId, dto, docenteId):

        **MODIFICADO**: Desacoplar detección de alertas usando AlertasService

        Find inscripcion with clase (include clase.docenteId and estudianteId).

        If not found, throw NotFound.

        If clase.docenteId != docenteId and user is not Admin, throw Forbidden.

        Update:
        const updated = await prisma.inscripcion.update({
          where: { id: inscripcionId },
          data: {
            estadoAsistencia: dto.estadoAsistencia,
            observacionesDocente: dto.observacionesDocente
          }
        });

        **NUEVO**: Delegar detección de alertas al AlertasService:

        if (dto.observacionesDocente) {
          await this.alertasService.detectarYCrearAlerta({
            observacion: dto.observacionesDocente,
            estudianteId: inscripcion.estudianteId,
            claseId: inscripcion.claseId,
            docenteId: docenteId
          });
        }

        Return updated inscripcion.

    InscripcionesController.PATCH '/:id' (Roles('Docente','Admin')):

        Use @Body() MarcarAsistenciaDto.

        Get user from token (with role).

        Call service.marcarAsistencia(id, dto, user.role == 'Admin' ? allow as any or treat as doc).

            We can pass userId (docenteId) and also perhaps user.role to let service know to override doc check if admin.

            Alternatively, in service, if docenteId mismatched, check if user has Admin role passed in context (we can attach via guard or send as param).

            Simpler: in controller, if user.role === 'Admin', call service with docenteId = clase.docenteId by first fetching clase or bypass checks:

                Actually easier: service can accept a parameter isAdmin to skip doc match.

            Let's do: service.marcarAsistencia(id, dto, userId, isAdminFlag).

        Return 200 with success.

    Nota: Admin marking attendance is rare, but we allow via guard.

Frontend (Asistencia)

    Docente Asistencia Page (/docente/clases/[id]/asistencia):

        On mount, fetch roster: useQuery(['inscripciones', claseId], api.fetchInscripciones(claseId)).

        This returns list of { id, estudiante: { nombre, apellido }, estadoAsistencia ('Pendiente'), observacionesDocente (null) }.

        Initialize local state list (maybe copy from fetched data, or use uncontrolled form elements referencing them).

        Option 1: use controlled components:

            e.g., state: attendanceRecords = Array of { inscripcionId, attended: boolean | null, observaciones: string }.

            Initialize attended = true for default (assuming present unless marked absent? Or default null until teacher sets).

            But by default, Pendiente, teacher explicitly sets who is absent or confirm present.

            Could pre-fill attended = true for all for convenience, or use null and require action:

                Could have "Mark all present" button to set all to true, then teacher only toggles those absent.

                Or default all true (most likely scenario) and teacher unchecks those who are absent.

            We'll say default to present for all to save time, teacher unchecks those absent and can add notes.

        Provide toggle UI:

            Checkbox "Asistió" default checked.

            If unchecked, we consider Ausente.

            Observaciones: text input.

        "Guardar" button (for all):

            On click, iterate over attendanceRecords:

                For each record, determine estado = attended? 'Asistio' : 'Ausente'; observaciones = text (could be empty string or null).

                Call api.marcarAsistencia(inscripcionId, { estadoAsistencia, observacionesDocente }).

            Use Promise.all or sequential:

                Use Promise.all to send all patch requests concurrently.

                Wait all to finish.

                If all success, show success notification "Asistencia guardada".

                If any fails, show error for that one (maybe just generic error, as failure unlikely unless connection issue).

            Alternatively, use useMutation for single patch and call it multiple times, but better to do custom loop for all.

        After success:

            Optionally disable all inputs or mark them saved (to prevent changes).

            Possibly navigate back to /docente/clases or show something.

        Possibly also have a "Dar puntos" next step (but out of scope).

    Admin usage:

        Not really needed in UI.

---

## AlertasService (Desacoplado para Reutilización)

### Propósito
Centralizar la lógica de detección de keywords y creación de alertas para mantener bajo acoplamiento entre módulos.

### Ubicación
```
src/modules/admin/alertas.service.ts
```

### Implementación

```typescript
// alertas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DetectarAlertaDto {
  observacion: string;
  estudianteId: number;
  claseId: number;
  docenteId: number;
}

@Injectable()
export class AlertasService {
  // Keywords que disparan alertas (configurable)
  private readonly keywords = [
    'dificultad',
    'problema',
    'no entiende',
    'atrasado',
    'desinterés',
    'triste',
    'violencia',
    'bullying',
    'acoso',
    'bajo rendimiento',
    'ausencias frecuentes',
    'no participa'
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Detecta keywords en observación y crea alerta si es necesario
   */
  async detectarYCrearAlerta(dto: DetectarAlertaDto): Promise<boolean> {
    const observacionLower = dto.observacion.toLowerCase();

    // Verificar si alguna keyword está presente
    const tieneKeyword = this.keywords.some(keyword =>
      observacionLower.includes(keyword)
    );

    if (!tieneKeyword) {
      return false; // No se creó alerta
    }

    // Crear alerta
    await this.prisma.alerta.create({
      data: {
        estudianteId: dto.estudianteId,
        claseId: dto.claseId,
        descripcion: dto.observacion,
        fecha: new Date(),
        resuelta: false
      }
    });

    return true; // Alerta creada
  }

  /**
   * Obtener keywords actuales (para admin)
   */
  getKeywords(): string[] {
    return [...this.keywords];
  }

  /**
   * Actualizar keywords (para admin personalizar)
   */
  async updateKeywords(newKeywords: string[]): Promise<void> {
    // En producción, esto podría guardar en DB o config
    // Por ahora es in-memory
    this.keywords.length = 0;
    this.keywords.push(...newKeywords);
  }
}
```

### Uso en InscripcionesModule

```typescript
// inscripciones.module.ts
import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { AlertasService } from '../admin/alertas.service'; // <-- Importar

@Module({
  imports: [PrismaModule],
  controllers: [InscripcionesController],
  providers: [
    InscripcionesService,
    AlertasService // <-- Agregar como provider
  ]
})
export class InscripcionesModule {}
```

```typescript
// inscripciones.service.ts
import { Injectable } from '@nestjs/common';
import { AlertasService } from '../admin/alertas.service';

@Injectable()
export class InscripcionesService {
  constructor(
    private prisma: PrismaService,
    private alertasService: AlertasService // <-- Inyectar
  ) {}

  async marcarAsistencia(inscripcionId, dto, docenteId) {
    // ... lógica de validación ...

    const updated = await this.prisma.inscripcion.update({
      where: { id: inscripcionId },
      data: {
        estadoAsistencia: dto.estadoAsistencia,
        observacionesDocente: dto.observacionesDocente
      }
    });

    // Delegar detección de alertas
    if (dto.observacionesDocente) {
      await this.alertasService.detectarYCrearAlerta({
        observacion: dto.observacionesDocente,
        estudianteId: inscripcion.estudianteId,
        claseId: inscripcion.claseId,
        docenteId
      });
    }

    return updated;
  }
}
```

### Beneficios del Desacoplamiento

1. **Reutilización**: AlertasService puede usarse desde otros módulos (ej: si Admin crea alertas manualmente).
2. **Testing**: Fácil mockear AlertasService en tests de InscripcionesService.
3. **Mantenibilidad**: Keywords centralizados, fácil de actualizar.
4. **Extensibilidad**: Futuramente agregar ML para detección más sofisticada.

### Extensiones Futuras

```typescript
// Posible extensión con Machine Learning
async detectarConIA(observacion: string): Promise<{
  esAlerta: boolean;
  confianza: number;
  categoria: 'academico' | 'emocional' | 'comportamiento';
}> {
  // Llamar a servicio ML/AI
  const resultado = await this.mlService.clasificar(observacion);
  return resultado;
}
```

---

Integrations:

    The admin alerts from negative feedback will appear in Admin panel (to be implemented in Admin slice).

    The points awarding if needed the teacher can navigate to Gamification interface after.

Testing:

    Teacher marks some absent with note "no hizo tarea", rest present no notes, saves.

    DB updates reflect correct states.

    If note had a keyword, check Alert created via AlertasService.

    Verify InscripcionesModule properly injects and uses AlertasService.
