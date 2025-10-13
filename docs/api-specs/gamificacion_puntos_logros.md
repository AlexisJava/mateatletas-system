# Gamificación (Puntos y Logros)

## Propósito
Implementar el sistema de gamificación que motiva a los estudiantes mediante puntos, logros y competencia por equipos. Incluye otorgamiento de puntos por docentes, sistema de logros desbloqueables, leaderboard por equipos y ranking individual.

## Subslices
- **Puntos**: Otorgamiento y gestión de puntos para estudiantes
- **Logros**: Sistema de badges/achievements desbloqueables
- **Leaderboards**: Rankings individuales y por equipos

## Relación con otros módulos
- **Estudiantes**: Cada estudiante acumula puntos y logros
- **Equipos**: Los puntos se suman al equipo (Slice #3 ya implementado)
- **Asistencia**: Docentes otorgan puntos después de marcar asistencia
- **Clases**: Puntos se otorgan en contexto de clases específicas
- **Admin**: Monitorea estadísticas de gamificación

---

## Prompt de desarrollo

```text
Implement the **Gamificación** vertical slice with Puntos, Logros and Leaderboards.

**Backend (NestJS)**:
- Create a `GamificacionModule` with `PuntosService`, `LogrosService`, controllers.
- **Prisma Schema**: Add models:
  - `Punto` model: Transaction log of points. Fields: `id`, `estudianteId`, `cantidad` (Int, can be positive), `razon` (String, e.g., "Participación en clase"), `claseId` (FK nullable), `docenteId` (FK, who gave it), `fecha` (DateTime).
  - `Logro` model: Achievement definitions. Fields: `id`, `nombre`, `descripcion`, `icono` (URL or emoji), `puntosRequeridos` (Int, threshold to unlock), `categoria` (enum: 'Participacion', 'Asistencia', 'Desafios').
  - `EstudianteLogro` model: M2M relation. Fields: `id`, `estudianteId`, `logroId`, `fechaObtenido` (DateTime).
  - Note: `Equipo` model already exists from Slice #3.

- **PuntosService**:
  - `otorgarPuntos(dto, docenteId)`: Create a Punto record. DTO: { estudianteId, cantidad, razon, claseId? }.
    * Validate docente can only give points to students in their classes.
    * After creating, check if student unlocked any new logros (call LogrosService).
  - `obtenerPuntosEstudiante(estudianteId)`: Sum all puntos for student (SUM cantidad).
  - `obtenerHistorialPuntos(estudianteId)`: Return all Punto records for a student (ordered by fecha desc).
  - `obtenerPuntosPorEquipo(equipoId)`: Sum puntos of all students in that team.

- **LogrosService**:
  - `verificarLogros(estudianteId)`: Check student's total points and assign any newly unlocked logros.
    * Get total points for student.
    * Find all Logros where puntosRequeridos <= totalPoints.
    * For each, check if EstudianteLogro exists; if not, create one (fecha = now).
    * Return list of newly unlocked logros (if any).
  - `obtenerLogrosEstudiante(estudianteId)`: Return all logros the student has earned (join EstudianteLogro).
  - `listarTodosLogros()`: Return all available Logros (for display to students).

- **GamificacionController**:
  - `POST /api/gamificacion/puntos` – (Roles('Docente')) Otorgar puntos a un estudiante.
    * Body: { estudianteId, cantidad, razon, claseId? }.
    * Calls PuntosService.otorgarPuntos(dto, docente.id).
    * Returns created Punto and any newly unlocked logros.
  - `GET /api/gamificacion/estudiante/:id/puntos` – (Roles('Tutor','Estudiante','Docente','Admin'))
    * Get total points for a student. Authorization: Tutor can only see their children, Estudiante only themselves, Docente/Admin any.
    * Returns { totalPuntos: number }.
  - `GET /api/gamificacion/estudiante/:id/historial` – Get point history.
    * Returns array of Punto records with details (razon, fecha, cantidad, docente nombre).
  - `GET /api/gamificacion/estudiante/:id/logros` – Get logros earned.
    * Returns array of Logro with fechaObtenido.
  - `GET /api/gamificacion/logros` – List all available logros (public or authenticated).
  - `GET /api/gamificacion/leaderboard` – Global leaderboard.
    * Query param: `tipo=individual|equipo`.
    * If individual: Return top 10 students ordered by total puntos (include nombre, puntos).
    * If equipo: Return all equipos ordered by sum of member puntos (include equipo nombre, color, totalPuntos).
  - (Admin only) `POST /api/gamificacion/logros` – Create new logro (Admin can add custom achievements).

- **Authorization**:
  - Docente can only give points to students enrolled in their classes (verify via Inscripcion).
  - Tutor can only view their children's points/logros.
  - Estudiante can only view their own.
  - Admin/Docente can view all.

- **Logros Presets** (seed):
  - Create default logros via migration seed:
    * "Primer Paso" (10 puntos)
    * "Participante Activo" (50 puntos)
    * "Matemático Junior" (100 puntos)
    * "Genio en Entrenamiento" (200 puntos)
    * "Maestro de la Lógica" (500 puntos)

**Frontend (Next.js)**:

- **Docente - Otorgar Puntos UI** (`/docente/clases/[id]/puntos`):
  - After marking attendance, teacher can navigate to this page (or combined in attendance page).
  - List students in class (from roster).
  - Next to each student: input for puntos (default 5?) and dropdown for razon (predefined reasons like "Participación", "Excelente trabajo", "Creatividad", or custom input).
  - "Otorgar" button per student -> calls POST /gamificacion/puntos.
  - On success, show toast "Puntos otorgados" and maybe animate if logro unlocked.
  - Could also implement "Otorgar a todos" to give same points to all present students.

- **Tutor - Ver Progreso de Hijo** (`/tutor/estudiantes/[id]/progreso`):
  - Display student's total points (big number).
  - Show logros earned (grid of badges with icons).
  - Show point history (table: fecha, razon, puntos).
  - Possibly show team ranking position.

- **Estudiante - Mi Dashboard** (`/estudiante/dashboard`):
  - Welcome message with student name.
  - Display total points prominently.
  - Show logros earned (with celebration animation if new).
  - Show their team name and team ranking.
  - Link to leaderboard page.

- **Leaderboard Page** (`/leaderboard` or `/estudiante/leaderboard`):
  - Tabs: "Individual" y "Equipos".
  - Individual tab: List top students (hide full names for privacy if needed, or show only first name + team).
  - Equipos tab: List all teams ordered by total points (show team color, nombre, puntos).
  - Highlight current student's position (or their team).

- **Admin - Gamificación Stats** (`/admin/gamificacion`):
  - Overview: total points given, most active students, team rankings.
  - Ability to create new logros (form: nombre, descripcion, puntosRequeridos, icono, categoria).
  - List all logros with edit options.

**API Integration**:
- `useMutation(otorgarPuntos)` – for docente.
- `useQuery(['puntos', estudianteId], fetchPuntos)` – to get total points.
- `useQuery(['logros', estudianteId], fetchLogros)` – to get earned logros.
- `useQuery('leaderboard', fetchLeaderboard)` – for rankings.
- `useQuery('logrosDisponibles', fetchAllLogros)` – to show all achievements.

**Types**:
- `Punto`: { id, estudianteId, cantidad, razon, claseId?, docenteId, fecha }.
- `Logro`: { id, nombre, descripcion, icono, puntosRequeridos, categoria }.
- `EstudianteLogro`: { estudianteId, logroId, logro: Logro, fechaObtenido }.
- `OtorgarPuntosDto`: { estudianteId, cantidad, razon, claseId? }.
- `LeaderboardEntry`: { estudianteId?, nombre, puntos, equipo?, posicion }.
- `EquipoLeaderboard`: { equipoId, nombre, color, totalPuntos, posicion }.

**Orden de implementación**:
1. **Prisma**: Add `Punto`, `Logro`, `EstudianteLogro` models. Migrate DB.
2. **Seed Logros**: Create migration seed to insert default logros.
3. **Backend PuntosService**: Implement otorgar, obtener, historial methods.
4. **Backend LogrosService**: Implement verificar, listar methods.
5. **Backend Controller**: Implement all endpoints with proper authorization.
6. **Frontend Docente**: Build otorgar puntos UI (can be combined with attendance page).
7. **Frontend Tutor**: Build progreso page for viewing student points/logros.
8. **Frontend Estudiante**: Build dashboard showing their points and team.
9. **Frontend Leaderboard**: Build public/authenticated leaderboard page.
10. **Testing**:
    - Docente gives points, verify Punto created and student total updated.
    - Verify logros auto-unlock when threshold reached.
    - Check leaderboard updates correctly.
    - Ensure tutor can only see their children's data.
```

---

## Backend (NestJS)

### Estructura
```
src/modules/gamificacion/
├── gamificacion.module.ts
├── puntos.service.ts
├── logros.service.ts
├── gamificacion.controller.ts
└── dto/
    ├── otorgar-puntos.dto.ts
    └── crear-logro.dto.ts
```

### Modelo Prisma

```prisma
// Registro de puntos otorgados
model Punto {
  id           Int      @id @default(autoincrement())
  estudianteId Int
  estudiante   Estudiante @relation(fields: [estudianteId], references: [id])
  cantidad     Int      // Puntos otorgados (positivo)
  razon        String   // "Participación activa", "Excelente trabajo"
  claseId      Int?
  clase        Clase?   @relation(fields: [claseId], references: [id])
  docenteId    Int
  docente      Docente  @relation(fields: [docenteId], references: [id])
  fecha        DateTime @default(now())

  @@index([estudianteId])
  @@index([fecha])
}

// Definiciones de logros
enum CategoriaLogro {
  Participacion
  Asistencia
  Desafios
  Especial
}

model Logro {
  id               Int      @id @default(autoincrement())
  nombre           String   // "Primer Paso", "Genio en Entrenamiento"
  descripcion      String   // "Obtén tus primeros 10 puntos"
  icono            String   // URL o emoji (🌟, 🏆, 🎯)
  puntosRequeridos Int      // Umbral para desbloquear
  categoria        CategoriaLogro
  estudiantesLogros EstudianteLogro[]
}

// Relación M2M: Estudiante ↔ Logro
model EstudianteLogro {
  id             Int      @id @default(autoincrement())
  estudianteId   Int
  estudiante     Estudiante @relation(fields: [estudianteId], references: [id])
  logroId        Int
  logro          Logro    @relation(fields: [logroId], references: [id])
  fechaObtenido  DateTime @default(now())

  @@unique([estudianteId, logroId]) // Un estudiante no puede obtener el mismo logro dos veces
}
```

### PuntosService

```typescript
@Injectable()
export class PuntosService {
  constructor(
    private prisma: PrismaService,
    private logrosService: LogrosService,
  ) {}

  async otorgarPuntos(dto: OtorgarPuntosDto, docenteId: number) {
    // 1. Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      include: { equipo: true }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 2. Si se especifica claseId, validar que el docente dicta esa clase
    if (dto.claseId) {
      const clase = await this.prisma.clase.findFirst({
        where: { id: dto.claseId, docenteId }
      });

      if (!clase) {
        throw new ForbiddenException('No puedes otorgar puntos en esta clase');
      }
    }

    // 3. Crear registro de puntos
    const punto = await this.prisma.punto.create({
      data: {
        estudianteId: dto.estudianteId,
        cantidad: dto.cantidad,
        razon: dto.razon,
        claseId: dto.claseId,
        docenteId,
      },
      include: {
        estudiante: { select: { nombre: true, apellido: true } },
        docente: { select: { nombre: true, apellido: true } }
      }
    });

    // 4. Verificar si se desbloquearon nuevos logros
    const nuevosLogros = await this.logrosService.verificarLogros(dto.estudianteId);

    return { punto, nuevosLogros };
  }

  async obtenerPuntosEstudiante(estudianteId: number): Promise<number> {
    const result = await this.prisma.punto.aggregate({
      where: { estudianteId },
      _sum: { cantidad: true }
    });

    return result._sum.cantidad || 0;
  }

  async obtenerHistorialPuntos(estudianteId: number) {
    return this.prisma.punto.findMany({
      where: { estudianteId },
      include: {
        clase: { select: { fechaHoraInicio: true, rutaCurricular: { select: { nombre: true } } } },
        docente: { select: { nombre: true, apellido: true } }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async obtenerPuntosPorEquipo(equipoId: number): Promise<number> {
    const result = await this.prisma.punto.aggregate({
      where: {
        estudiante: { equipoId }
      },
      _sum: { cantidad: true }
    });

    return result._sum.cantidad || 0;
  }
}
```

### LogrosService

```typescript
@Injectable()
export class LogrosService {
  constructor(private prisma: PrismaService) {}

  async verificarLogros(estudianteId: number): Promise<Logro[]> {
    // 1. Obtener puntos totales del estudiante
    const totalPuntos = await this.prisma.punto.aggregate({
      where: { estudianteId },
      _sum: { cantidad: true }
    });

    const puntos = totalPuntos._sum.cantidad || 0;

    // 2. Obtener logros ya obtenidos
    const logrosObtenidos = await this.prisma.estudianteLogro.findMany({
      where: { estudianteId },
      select: { logroId: true }
    });

    const idsObtenidos = logrosObtenidos.map(el => el.logroId);

    // 3. Encontrar logros desbloqueables
    const logrosDesbloqueables = await this.prisma.logro.findMany({
      where: {
        puntosRequeridos: { lte: puntos },
        id: { notIn: idsObtenidos }
      }
    });

    // 4. Asignar nuevos logros
    const nuevosLogros: Logro[] = [];

    for (const logro of logrosDesbloqueables) {
      await this.prisma.estudianteLogro.create({
        data: {
          estudianteId,
          logroId: logro.id
        }
      });

      nuevosLogros.push(logro);
    }

    return nuevosLogros;
  }

  async obtenerLogrosEstudiante(estudianteId: number) {
    return this.prisma.estudianteLogro.findMany({
      where: { estudianteId },
      include: { logro: true },
      orderBy: { fechaObtenido: 'desc' }
    });
  }

  async listarTodosLogros() {
    return this.prisma.logro.findMany({
      orderBy: { puntosRequeridos: 'asc' }
    });
  }

  async crearLogro(dto: CrearLogroDto) {
    return this.prisma.logro.create({
      data: dto
    });
  }
}
```

### GamificacionController

```typescript
@Controller('gamificacion')
@UseGuards(JwtAuthGuard)
export class GamificacionController {
  constructor(
    private puntosService: PuntosService,
    private logrosService: LogrosService,
  ) {}

  @Post('puntos')
  @Roles('Docente')
  async otorgarPuntos(
    @Body() dto: OtorgarPuntosDto,
    @GetUser() docente: Docente
  ) {
    return this.puntosService.otorgarPuntos(dto, docente.id);
  }

  @Get('estudiante/:id/puntos')
  async obtenerPuntos(
    @Param('id', ParseIntPipe) estudianteId: number,
    @GetUser() user: any
  ) {
    // Validar autorización (simplificado)
    // TODO: Implementar lógica completa de ownership

    const totalPuntos = await this.puntosService.obtenerPuntosEstudiante(estudianteId);
    return { totalPuntos };
  }

  @Get('estudiante/:id/historial')
  async obtenerHistorial(@Param('id', ParseIntPipe) estudianteId: number) {
    return this.puntosService.obtenerHistorialPuntos(estudianteId);
  }

  @Get('estudiante/:id/logros')
  async obtenerLogros(@Param('id', ParseIntPipe) estudianteId: number) {
    return this.logrosService.obtenerLogrosEstudiante(estudianteId);
  }

  @Get('logros')
  async listarLogros() {
    return this.logrosService.listarTodosLogros();
  }

  @Get('leaderboard')
  async obtenerLeaderboard(@Query('tipo') tipo: 'individual' | 'equipo' = 'individual') {
    if (tipo === 'equipo') {
      return this.obtenerLeaderboardEquipos();
    }
    return this.obtenerLeaderboardIndividual();
  }

  private async obtenerLeaderboardIndividual() {
    const estudiantes = await this.prisma.estudiante.findMany({
      include: {
        equipo: { select: { nombre: true, color: true } },
        puntos: true
      }
    });

    const ranking = estudiantes.map(est => ({
      estudianteId: est.id,
      nombre: `${est.nombre} ${est.apellido}`,
      equipo: est.equipo,
      totalPuntos: est.puntos.reduce((sum, p) => sum + p.cantidad, 0)
    }))
    .sort((a, b) => b.totalPuntos - a.totalPuntos)
    .slice(0, 10) // Top 10
    .map((entry, index) => ({ ...entry, posicion: index + 1 }));

    return ranking;
  }

  private async obtenerLeaderboardEquipos() {
    const equipos = await this.prisma.equipo.findMany({
      include: {
        estudiantes: {
          include: { puntos: true }
        }
      }
    });

    const ranking = equipos.map(equipo => {
      const totalPuntos = equipo.estudiantes.reduce((sum, est) =>
        sum + est.puntos.reduce((pSum, p) => pSum + p.cantidad, 0), 0
      );

      return {
        equipoId: equipo.id,
        nombre: equipo.nombre,
        color: equipo.color,
        totalPuntos,
        cantidadEstudiantes: equipo.estudiantes.length
      };
    })
    .sort((a, b) => b.totalPuntos - a.totalPuntos)
    .map((entry, index) => ({ ...entry, posicion: index + 1 }));

    return ranking;
  }

  @Post('logros')
  @Roles('Admin')
  async crearLogro(@Body() dto: CrearLogroDto) {
    return this.logrosService.crearLogro(dto);
  }
}
```

---

## Frontend (Next.js)

### Docente - Otorgar Puntos (`/docente/clases/[id]/puntos`)

```typescript
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function OtorgarPuntosPage({ params }: { params: { id: string } }) {
  const claseId = parseInt(params.id);
  const queryClient = useQueryClient();

  const { data: inscripciones } = useQuery(['inscripciones', claseId], () =>
    api.fetchInscripciones(claseId)
  );

  const otorgarMutation = useMutation(api.otorgarPuntos, {
    onSuccess: (data) => {
      toast.success(`Puntos otorgados! ${data.nuevosLogros.length > 0 ? '🏆 ¡Logro desbloqueado!' : ''}`);
      queryClient.invalidateQueries(['inscripciones', claseId]);
    }
  });

  const [puntosForm, setPuntosForm] = useState<Record<number, { cantidad: number; razon: string }>>({});

  const handleOtorgar = (estudianteId: number) => {
    const form = puntosForm[estudianteId] || { cantidad: 5, razon: 'Participación activa' };

    otorgarMutation.mutate({
      estudianteId,
      cantidad: form.cantidad,
      razon: form.razon,
      claseId
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Otorgar Puntos</h1>

      <div className="space-y-4">
        {inscripciones?.map(insc => (
          <div key={insc.id} className="flex items-center gap-4 p-4 border rounded">
            <div className="flex-1">
              <p className="font-medium">{insc.estudiante.nombre} {insc.estudiante.apellido}</p>
              <p className="text-sm text-gray-500">{insc.estudiante.equipo?.nombre}</p>
            </div>

            <input
              type="number"
              min="1"
              max="20"
              defaultValue={5}
              className="w-20 border rounded px-2 py-1"
              onChange={(e) => setPuntosForm(prev => ({
                ...prev,
                [insc.estudianteId]: { ...prev[insc.estudianteId], cantidad: parseInt(e.target.value) }
              }))}
            />

            <select
              className="border rounded px-3 py-1"
              onChange={(e) => setPuntosForm(prev => ({
                ...prev,
                [insc.estudianteId]: { ...prev[insc.estudianteId], razon: e.target.value }
              }))}
            >
              <option>Participación activa</option>
              <option>Excelente trabajo</option>
              <option>Creatividad</option>
              <option>Ayuda a compañeros</option>
              <option>Superación personal</option>
            </select>

            <button
              onClick={() => handleOtorgar(insc.estudianteId)}
              disabled={otorgarMutation.isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Otorgar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Estudiante - Dashboard (`/estudiante/dashboard`)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

export default function EstudianteDashboard() {
  const user = useAuthStore(state => state.user);
  const estudianteId = user?.id;

  const { data: puntos } = useQuery(['puntos', estudianteId], () =>
    api.getPuntosEstudiante(estudianteId!)
  );

  const { data: logros } = useQuery(['logros', estudianteId], () =>
    api.getLogrosEstudiante(estudianteId!)
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">¡Hola, {user?.nombre}!</h1>
      <p className="text-gray-600 mb-8">Sigue sumando puntos y desbloqueando logros</p>

      {/* Puntos Totales */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 text-white mb-8">
        <p className="text-lg opacity-90">Puntos Totales</p>
        <p className="text-6xl font-bold">{puntos?.totalPuntos || 0}</p>
        <p className="text-sm opacity-75 mt-2">🏆 Posición en tu equipo: #3</p>
      </div>

      {/* Logros */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Mis Logros ({logros?.length || 0})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {logros?.map(el => (
            <div key={el.id} className="border rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">{el.logro.icono}</div>
              <p className="font-medium text-sm">{el.logro.nombre}</p>
              <p className="text-xs text-gray-500">{new Date(el.fechaObtenido).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos Logros */}
      <div>
        <h2 className="text-xl font-bold mb-4">Próximos Desafíos</h2>
        {/* Lista de logros por desbloquear */}
      </div>
    </div>
  );
}
```

### Leaderboard (`/leaderboard`)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function LeaderboardPage() {
  const [tipo, setTipo] = useState<'individual' | 'equipo'>('equipo');

  const { data: ranking } = useQuery(['leaderboard', tipo], () =>
    api.getLeaderboard(tipo)
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tabla de Posiciones</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTipo('equipo')}
          className={`px-6 py-2 rounded ${tipo === 'equipo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Por Equipos
        </button>
        <button
          onClick={() => setTipo('individual')}
          className={`px-6 py-2 rounded ${tipo === 'individual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Individual
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tipo === 'equipo' ? (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Pos</th>
                <th className="px-6 py-3 text-left">Equipo</th>
                <th className="px-6 py-3 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking?.map((entry: any) => (
                <tr key={entry.equipoId} className="border-t">
                  <td className="px-6 py-4 font-bold">{entry.posicion}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-medium">{entry.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-lg">{entry.totalPuntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Pos</th>
                <th className="px-6 py-3 text-left">Estudiante</th>
                <th className="px-6 py-3 text-left">Equipo</th>
                <th className="px-6 py-3 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking?.map((entry: any) => (
                <tr key={entry.estudianteId} className="border-t">
                  <td className="px-6 py-4 font-bold">{entry.posicion}</td>
                  <td className="px-6 py-4">{entry.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{entry.equipo?.nombre}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-lg">{entry.totalPuntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

---

## Seed de Logros Iniciales

```typescript
// prisma/seeds/logros.seed.ts
const logrosIniciales = [
  {
    nombre: "Primer Paso",
    descripcion: "Obtén tus primeros 10 puntos",
    icono: "🌟",
    puntosRequeridos: 10,
    categoria: "Participacion"
  },
  {
    nombre: "Participante Activo",
    descripcion: "Acumula 50 puntos",
    icono: "⭐",
    puntosRequeridos: 50,
    categoria: "Participacion"
  },
  {
    nombre: "Matemático Junior",
    descripcion: "Alcanza los 100 puntos",
    icono: "🎯",
    puntosRequeridos: 100,
    categoria: "Desafios"
  },
  {
    nombre: "Asistencia Perfecta",
    descripcion: "Asiste a 10 clases seguidas",
    icono: "📚",
    puntosRequeridos: 150,
    categoria: "Asistencia"
  },
  {
    nombre: "Genio en Entrenamiento",
    descripcion: "Consigue 200 puntos",
    icono: "🧠",
    puntosRequeridos: 200,
    categoria: "Desafios"
  },
  {
    nombre: "Maestro de la Lógica",
    descripcion: "Alcanza los 500 puntos",
    icono: "🏆",
    puntosRequeridos: 500,
    categoria: "Desafios"
  },
  {
    nombre: "Leyenda Matemática",
    descripcion: "Supera los 1000 puntos",
    icono: "👑",
    puntosRequeridos: 1000,
    categoria: "Especial"
  }
];

export async function seedLogros(prisma: PrismaClient) {
  for (const logro of logrosIniciales) {
    await prisma.logro.upsert({
      where: { nombre: logro.nombre },
      update: {},
      create: logro
    });
  }

  console.log('✅ Logros iniciales creados');
}
```

---

## Types (TypeScript)

```typescript
// types/gamificacion.ts

export interface Punto {
  id: number;
  estudianteId: number;
  cantidad: number;
  razon: string;
  claseId?: number;
  docenteId: number;
  fecha: string;
}

export interface Logro {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  puntosRequeridos: number;
  categoria: 'Participacion' | 'Asistencia' | 'Desafios' | 'Especial';
}

export interface EstudianteLogro {
  id: number;
  estudianteId: number;
  logroId: number;
  logro: Logro;
  fechaObtenido: string;
}

export interface OtorgarPuntosDto {
  estudianteId: number;
  cantidad: number;
  razon: string;
  claseId?: number;
}

export interface LeaderboardIndividual {
  posicion: number;
  estudianteId: number;
  nombre: string;
  equipo?: {
    nombre: string;
    color: string;
  };
  totalPuntos: number;
}

export interface LeaderboardEquipo {
  posicion: number;
  equipoId: number;
  nombre: string;
  color: string;
  totalPuntos: number;
  cantidadEstudiantes: number;
}
```

---

## Testing

1. **Docente otorga puntos**:
   - Login como docente
   - Ir a `/docente/clases/[id]/puntos`
   - Otorgar 15 puntos a un estudiante
   - Verificar: Punto creado en DB, total del estudiante incrementado

2. **Desbloqueo automático de logros**:
   - Estudiante con 8 puntos
   - Docente otorga 5 puntos más → total 13
   - Verificar: Logro "Primer Paso" (10 pts) se desbloquea automáticamente
   - Frontend muestra notificación de logro

3. **Leaderboard por equipos**:
   - Crear 3 equipos con estudiantes
   - Otorgar puntos variados
   - Verificar ranking correcto en `/leaderboard`

4. **Autorización**:
   - Tutor intenta ver puntos de estudiante ajeno → 403
   - Estudiante solo ve sus propios datos
   - Admin puede ver todos

---

## Orden de Implementación

1. ✅ Modelos Prisma + Migración
2. ✅ Seed de logros iniciales
3. ✅ PuntosService + LogrosService
4. ✅ GamificacionController con endpoints
5. ✅ Frontend Docente (otorgar puntos)
6. ✅ Frontend Estudiante (dashboard)
7. ✅ Frontend Leaderboard
8. ✅ Testing completo
9. ✅ Integración con Asistencia (botón "Otorgar puntos" después de marcar asistencia)
