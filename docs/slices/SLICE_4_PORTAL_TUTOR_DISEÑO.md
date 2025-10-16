# SLICE 4: PORTAL TUTOR MEJORADO - Diseño Técnico Completo

**Fecha:** 2025-10-16
**Duración estimada:** 1 semana (5 días)
**Prioridad:** 🔴 CRÍTICA

---

## 🎯 OBJETIVO

Crear un portal completo para tutores (padres/madres) que resuelva la experiencia descrita:

### Historia de Usuario Real (Alexis como padre)

> "Soy Alexis, padre de una hija de 7 años enamorada de las matemáticas. Encontré Mateatletas, vi sus cursos sincrónicos de 2 meses, y su CLUB anual (marzo-diciembre). Me decidí por el club y la anoté.
>
> **PROBLEMAS ACTUALES:**
> 1. Me crearon un portal de tutor pero está vacío
> 2. No sé cuándo es la próxima clase de mi hija
> 3. Elegí un horario en la inscripción pero no veo confirmación
> 4. Tuve que volver a cargar los datos de mi hija (ya los había puesto en el form)
> 5. No tengo información sobre mi suscripción
> 6. Me pregunto: ¿qué aparecería si hubiera comprado un CURSO en vez de una SUSCRIPCIÓN?"

---

## 📋 TAREAS INCLUIDAS

### Tareas Originales del PLAN_DE_SLICES.md

| ID | Tarea | Días | Backend | Frontend |
|----|-------|------|---------|----------|
| T003 | Widget de Bienvenida Personalizado | 1 | ✅ Ya existe | ⚠️ Mejorar |
| T004 | Panel de Progreso Detallado del Hijo | 2 | ✅ Parcial | ❌ Crear |
| T005 | Vista de Suscripción y Pagos | 1.5 | ✅ Ya existe | ❌ Crear |
| T013 | Resumen Automático Post-Clase para Tutor | 1 | ❌ Crear | ❌ Crear |
| T081 | Generación Automática de Resumen de Clase | 1 | ❌ Crear | N/A |

### Tareas BONUS (Solución a problemas del padre)

| ID | Tarea | Días | Backend | Frontend |
|----|-------|------|---------|----------|
| BONUS-1 | Formulario inscripción crea estudiante automáticamente | 0.5 | ❌ Crear | ❌ Crear |
| BONUS-2 | Dashboard muestra próximas clases del hijo | 0.5 | ✅ Endpoint existe | ❌ Crear |
| BONUS-3 | Confirmación de horario elegido visible | 0.5 | ✅ En inscripción | ❌ Mostrar |
| BONUS-4 | Diferenciar Suscripción vs Curso en portal | 0.5 | ✅ Ya existe | ❌ Crear |

**Total estimado:** 7.5 días (1.5 semanas)

---

## 🏗️ ARQUITECTURA

### Estado Actual del Portal Tutor

```
/dashboard (tutor)
├── OnboardingView.tsx      ✅ Ya existe (cuando NO tiene hijos)
└── DashboardView.tsx       ⚠️  Existe pero incompleto
    ├── Muestra próximas clases
    ├── Muestra membresía activa
    └── FALTA: Progreso del hijo, resúmenes post-clase, pagos
```

### Nuevas Rutas a Crear

```
/dashboard (tutor)          → Vista principal mejorada
├── /progreso/[id]          → Progreso detallado de UN hijo
├── /suscripcion            → Detalles de suscripción/curso + historial pagos
├── /clases                 → Calendario de clases del hijo
└── /resumen-clase/[id]     → Resumen detallado de una clase pasada
```

---

## 📊 MODELOS DE DATOS

### Existentes (✅ No modificar)

```prisma
model Tutor {
  id                        String   @id @default(cuid())
  email                     String   @unique
  password_hash             String
  nombre                    String
  apellido                  String
  dni                       String?
  telefono                  String?
  fecha_registro            DateTime @default(now())
  ha_completado_onboarding  Boolean  @default(false)

  estudiantes               Estudiante[]
  membresias                Membresia[]
  inscripciones_clase       InscripcionClase[]
}

model Estudiante {
  id                String   @id @default(cuid())
  email             String?  @unique
  password_hash     String?
  nombre            String
  apellido          String
  fecha_nacimiento  DateTime
  nivel_escolar     String
  foto_perfil       String?

  tutor_id          String
  tutor             Tutor    @relation(fields: [tutor_id], references: [id])

  inscripciones_clase   InscripcionClase[]
  asistencias           Asistencia[]
  perfil_gamificacion   PerfilGamificacion?
}

model Membresia {
  id            String   @id @default(cuid())
  tutor_id      String
  tutor         Tutor    @relation(fields: [tutor_id], references: [id])
  producto_id   String
  producto      Producto @relation(fields: [producto_id], references: [id])
  estado        EstadoMembresia  // Activa, Inactiva, Suspendida, Cancelada
  fecha_inicio  DateTime
  fecha_fin     DateTime
}

model InscripcionCurso {
  id            String   @id @default(cuid())
  estudiante_id String
  producto_id   String
  estado        EstadoInscripcion  // Activa, Completada, Abandonada
  fecha_inicio  DateTime
  fecha_fin     DateTime?
  progreso      Float    @default(0)
}

model Clase {
  id                  String   @id @default(cuid())
  fecha_hora_inicio   DateTime
  fecha_hora_fin      DateTime
  ruta_curricular_id  String?
  ruta_curricular     RutaCurricular? @relation(fields: [ruta_curricular_id], references: [id])
  docente_id          String
  docente             Docente  @relation(fields: [docente_id], references: [id])

  inscripciones       InscripcionClase[]
  asistencias         Asistencia[]
}
```

### NUEVO MODELO: ResumenClase (T081)

```prisma
model ResumenClase {
  id                String   @id @default(cuid())
  clase_id          String   @unique
  clase             Clase    @relation(fields: [clase_id], references: [id])

  // Resumen general
  tema_principal    String
  objetivos         String[] // Array de objetivos cubiertos
  total_asistentes  Int

  // Métricas grupales
  participacion_promedio  Float  // 0-100
  puntos_totales_grupo    Int

  // Observaciones del docente
  observaciones_generales String?
  fortalezas_grupo        String?
  areas_mejora_grupo      String?

  // Metadata
  generado_automaticamente Boolean @default(true)
  fecha_generacion         DateTime @default(now())

  @@map("resumenes_clase")
}
```

### NUEVO MODELO: ResumenEstudianteClase (T081)

```prisma
model ResumenEstudianteClase {
  id                String   @id @default(cuid())
  resumen_clase_id  String
  resumen_clase     ResumenClase @relation(fields: [resumen_clase_id], references: [id])
  estudiante_id     String
  estudiante        Estudiante   @relation(fields: [estudiante_id], references: [id])

  // Métricas individuales
  asistio           Boolean
  participaciones   Int      @default(0)
  puntos_ganados    Int      @default(0)
  tiempo_activo_min Int      @default(0)

  // Feedback personalizado
  fortalezas        String?
  areas_mejora      String?
  insignias_ganadas String[] // IDs de insignias otorgadas

  // Estado emocional (opcional, para futuro)
  nivel_motivacion  Int?     // 1-5

  @@map("resumenes_estudiante_clase")
  @@unique([resumen_clase_id, estudiante_id])
}
```

---

## 🔧 BACKEND - ENDPOINTS NUEVOS

### 1. Módulo Tutores (Nuevo)

**Archivo:** `apps/api/src/tutores/tutores.controller.ts`

```typescript
@Controller('tutores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tutor')
export class TutoresController {

  // T004: Progreso detallado del hijo
  @Get('estudiante/:estudianteId/progreso')
  async getProgresoEstudiante(@Param('estudianteId') id: string) {
    // Retorna:
    // - Perfil de gamificación (nivel, puntos, insignias)
    // - Últimas 10 clases con asistencia
    // - Estadísticas de participación
    // - Gráfico de evolución de puntos
  }

  // T005: Suscripción y pagos
  @Get('mi-suscripcion')
  async getMiSuscripcion(@Req() req) {
    // Retorna:
    // - Membresía activa (si es suscripción al CLUB)
    // - O inscripción a curso (si compró curso)
    // - Historial de pagos
    // - Estado (activa, por vencer, vencida)
  }

  // BONUS-2: Próximas clases del hijo
  @Get('estudiante/:estudianteId/proximas-clases')
  async getProximasClases(@Param('estudianteId') id: string) {
    // Retorna próximas 5 clases del estudiante
  }

  // T013: Resúmenes post-clase
  @Get('estudiante/:estudianteId/resumenes-clases')
  async getResumenesClases(
    @Param('estudianteId') id: string,
    @Query('limit') limit: number = 10
  ) {
    // Retorna últimos resúmenes de clases
  }

  @Get('resumen-clase/:resumenId')
  async getResumenClaseDetallado(@Param('resumenId') id: string) {
    // Retorna resumen completo con métricas individuales del hijo
  }
}
```

### 2. Módulo Clases (Extender)

**Archivo:** `apps/api/src/clases/clases.service.ts`

```typescript
// T081: Generación automática de resumen post-clase
async generarResumenClase(claseId: string): Promise<ResumenClase> {
  const clase = await this.prisma.clase.findUnique({
    where: { id: claseId },
    include: {
      inscripciones: {
        include: { estudiante: true }
      },
      asistencias: true,
      ruta_curricular: true,
      docente: true
    }
  });

  // 1. Calcular métricas grupales
  const totalAsistentes = clase.asistencias.filter(a => a.estado === 'Presente').length;
  const participacionPromedio = /* calcular desde gamificación */;

  // 2. Crear resumen general
  const resumenClase = await this.prisma.resumenClase.create({
    data: {
      clase_id: claseId,
      tema_principal: clase.ruta_curricular?.nombre || 'Clase general',
      total_asistentes: totalAsistentes,
      participacion_promedio: participacionPromedio,
      // ... más campos
    }
  });

  // 3. Crear resúmenes individuales para cada estudiante
  for (const inscripcion of clase.inscripciones) {
    const asistencia = clase.asistencias.find(a => a.estudiante_id === inscripcion.estudiante_id);

    await this.prisma.resumenEstudianteClase.create({
      data: {
        resumen_clase_id: resumenClase.id,
        estudiante_id: inscripcion.estudiante_id,
        asistio: asistencia?.estado === 'Presente',
        // ... métricas individuales
      }
    });
  }

  return resumenClase;
}

// Hook: Llamar automáticamente después de finalizar clase
@Cron('*/5 * * * *') // Cada 5 minutos revisa clases finalizadas
async procesarClasesFinalizadas() {
  const ahoraUTC = new Date();
  const hace30min = new Date(ahoraUTC.getTime() - 30 * 60 * 1000);

  const clasesFinalizadas = await this.prisma.clase.findMany({
    where: {
      fecha_hora_fin: {
        gte: hace30min,
        lte: ahoraUTC
      },
      // No tiene resumen generado aún
      resumen: null
    }
  });

  for (const clase of clasesFinalizadas) {
    await this.generarResumenClase(clase.id);
  }
}
```

---

## 🎨 FRONTEND - COMPONENTES NUEVOS

### 1. Dashboard Principal Mejorado

**Archivo:** `apps/web/src/app/(protected)/dashboard/components/DashboardView.tsx`

**Mejoras:**

```tsx
export default function DashboardView({ estudiantes, membresias, clases }: Props) {
  return (
    <div className="space-y-6">
      {/* T003: Widget de Bienvenida Mejorado */}
      <WelcomeWidget
        tutorNombre={user.nombre}
        proximaClase={proximaClase}
        estadoMembresia={membresiaActiva?.estado}
      />

      {/* Tabs por hijo */}
      <StudentTabs estudiantes={estudiantes}>
        {(estudianteSeleccionado) => (
          <>
            {/* BONUS-2: Próximas Clases */}
            <ProximasClasesWidget estudianteId={estudianteSeleccionado.id} />

            {/* T004: Resumen de Progreso (preview) */}
            <ProgresoPreview estudianteId={estudianteSeleccionado.id} />

            {/* T013: Últimos Resúmenes de Clase */}
            <ResumenesClasesWidget estudianteId={estudianteSeleccionado.id} />
          </>
        )}
      </StudentTabs>

      {/* T005: Tarjeta de Suscripción/Curso */}
      <SuscripcionCard
        tipo={membresiaActiva ? 'suscripcion' : 'curso'}
        data={membresiaActiva || inscripcionCurso}
      />
    </div>
  );
}
```

### 2. Nueva Página: Progreso Detallado

**Archivo:** `apps/web/src/app/(protected)/progreso/[estudianteId]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';

export default function ProgresoEstudiantePage() {
  const { estudianteId } = useParams();
  const [progreso, setProgreso] = useState(null);

  useEffect(() => {
    apiClient.get(`/tutores/estudiante/${estudianteId}/progreso`)
      .then(res => setProgreso(res.data));
  }, [estudianteId]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header con foto y nombre */}
      <EstudianteHeader estudiante={progreso?.estudiante} />

      {/* Grid de métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Nivel Actual"
          value={progreso?.nivel}
          icon="🏆"
        />
        <MetricCard
          title="Puntos Totales"
          value={progreso?.puntos_totales}
          icon="⭐"
        />
        <MetricCard
          title="Clases Asistidas"
          value={progreso?.clases_asistidas}
          icon="📚"
        />
        <MetricCard
          title="Insignias"
          value={progreso?.insignias_count}
          icon="🎖️"
        />
      </div>

      {/* Gráfico de evolución */}
      <EvolucionPuntosChart data={progreso?.historial_puntos} />

      {/* Galería de insignias */}
      <InsigniasGallery insignias={progreso?.insignias} />

      {/* Últimas clases */}
      <UltimasClasesTable clases={progreso?.ultimas_clases} />
    </div>
  );
}
```

### 3. Nueva Página: Suscripción y Pagos

**Archivo:** `apps/web/src/app/(protected)/suscripcion/page.tsx`

```tsx
'use client';

export default function SuscripcionPage() {
  const [suscripcion, setSuscripcion] = useState(null);

  useEffect(() => {
    apiClient.get('/tutores/mi-suscripcion')
      .then(res => setSuscripcion(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1>Mi Suscripción</h1>

      {/* BONUS-4: Diferenciar CLUB vs CURSO */}
      {suscripcion?.tipo === 'Suscripcion' ? (
        <ClubMembresiaCard
          membresia={suscripcion.membresia}
          producto={suscripcion.producto}
        />
      ) : (
        <CursoInscripcionCard
          inscripcion={suscripcion.inscripcion}
          producto={suscripcion.producto}
        />
      )}

      {/* Historial de Pagos */}
      <PagosHistorial pagos={suscripcion?.pagos} />

      {/* BONUS-3: Horario Confirmado */}
      {suscripcion?.horario_confirmado && (
        <HorarioConfirmadoCard horario={suscripcion.horario_confirmado} />
      )}
    </div>
  );
}
```

### 4. Nueva Página: Resumen de Clase

**Archivo:** `apps/web/src/app/(protected)/resumen-clase/[resumenId]/page.tsx`

```tsx
'use client';

export default function ResumenClasePage() {
  const { resumenId } = useParams();
  const [resumen, setResumen] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1>Resumen de Clase - {resumen?.clase.ruta_curricular.nombre}</h1>

      {/* Info de la clase */}
      <ClaseInfoCard
        fecha={resumen?.clase.fecha_hora_inicio}
        docente={resumen?.clase.docente}
        tema={resumen?.tema_principal}
      />

      {/* Resumen del hijo */}
      <ResumenEstudianteCard
        asistio={resumen?.resumen_estudiante.asistio}
        participaciones={resumen?.resumen_estudiante.participaciones}
        puntosGanados={resumen?.resumen_estudiante.puntos_ganados}
        fortalezas={resumen?.resumen_estudiante.fortalezas}
        areasMejora={resumen?.resumen_estudiante.areas_mejora}
      />

      {/* Insignias ganadas */}
      {resumen?.resumen_estudiante.insignias_ganadas.length > 0 && (
        <InsigniasGanadasSection insignias={resumen.resumen_estudiante.insignias_ganadas} />
      )}

      {/* Comparación con el grupo */}
      <ComparacionGrupoChart
        miHijo={resumen?.resumen_estudiante}
        promedio={resumen?.participacion_promedio}
      />
    </div>
  );
}
```

---

## 🔄 FLUJO DE INSCRIPCIÓN MEJORADO (BONUS-1)

### Formulario Público de Inscripción

**Archivo:** `apps/web/src/app/inscripcion/page.tsx`

**Cambios:**

```tsx
// ANTES: Solo capturaba datos básicos
const [formData, setFormData] = useState({
  email_tutor: '',
  nombre_tutor: '',
  // ... solo tutor
});

// DESPUÉS: Captura tutor + estudiante en un solo flujo
const [formData, setFormData] = useState({
  // Datos del Tutor (padre/madre)
  email_tutor: '',
  nombre_tutor: '',
  apellido_tutor: '',
  telefono_tutor: '',

  // Datos del Estudiante (hijo/hija)
  nombre_estudiante: '',
  apellido_estudiante: '',
  fecha_nacimiento: '',
  nivel_escolar: '',

  // Selección de producto
  producto_id: '',

  // Selección de horario
  horario_preferido: '', // Ej: "Lunes 17:00"
});

const handleSubmit = async () => {
  // 1. Crear tutor + estudiante + inscripción en una sola llamada
  const response = await apiClient.post('/auth/registro-completo', formData);

  // 2. Redirigir a pago
  router.push(`/pago?inscripcion_id=${response.data.inscripcion_id}`);
};
```

### Endpoint Backend

**Archivo:** `apps/api/src/auth/auth.controller.ts`

```typescript
@Post('registro-completo')
async registroCompleto(@Body() dto: RegistroCompletoDto) {
  // 1. Crear tutor
  const tutor = await this.prisma.tutor.create({
    data: {
      email: dto.email_tutor,
      password_hash: await bcrypt.hash(dto.password, 10),
      nombre: dto.nombre_tutor,
      apellido: dto.apellido_tutor,
      telefono: dto.telefono_tutor,
    }
  });

  // 2. Crear estudiante asociado al tutor
  const estudiante = await this.prisma.estudiante.create({
    data: {
      nombre: dto.nombre_estudiante,
      apellido: dto.apellido_estudiante,
      fecha_nacimiento: new Date(dto.fecha_nacimiento),
      nivel_escolar: dto.nivel_escolar,
      tutor_id: tutor.id,
    }
  });

  // 3. Crear inscripción (membresía o curso según producto)
  const producto = await this.prisma.producto.findUnique({
    where: { id: dto.producto_id }
  });

  if (producto.tipo === 'Suscripcion') {
    // Crear membresía pendiente de pago
    await this.prisma.membresia.create({
      data: {
        tutor_id: tutor.id,
        producto_id: producto.id,
        estado: 'Pendiente',
        fecha_inicio: new Date(),
        fecha_fin: /* calcular según duracion_meses */
      }
    });
  } else if (producto.tipo === 'Curso') {
    // Crear inscripción a curso
    await this.prisma.inscripcionCurso.create({
      data: {
        estudiante_id: estudiante.id,
        producto_id: producto.id,
        estado: 'Pendiente',
        fecha_inicio: producto.fecha_inicio
      }
    });
  }

  // 4. Guardar horario preferido en metadata
  // (para asignar a grupo después del pago)

  return {
    success: true,
    tutor_id: tutor.id,
    estudiante_id: estudiante.id
  };
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Backend (Días 1-3)

- [ ] Crear migración para `ResumenClase` y `ResumenEstudianteClase`
- [ ] Crear módulo `TutoresModule`
- [ ] Implementar endpoints en `TutoresController`
- [ ] Implementar `generarResumenClase()` en `ClasesService`
- [ ] Crear cron job para procesar clases finalizadas
- [ ] Modificar endpoint `POST /auth/registro-completo`
- [ ] Testing de endpoints con Postman

### Fase 2: Frontend (Días 4-6)

- [ ] Mejorar `DashboardView.tsx` con nuevos widgets
- [ ] Crear página `/progreso/[estudianteId]`
- [ ] Crear página `/suscripcion`
- [ ] Crear página `/resumen-clase/[resumenId]`
- [ ] Crear componentes:
  - [ ] `WelcomeWidget`
  - [ ] `ProximasClasesWidget`
  - [ ] `ResumenesClasesWidget`
  - [ ] `ClubMembresiaCard` vs `CursoInscripcionCard`
  - [ ] `HorarioConfirmadoCard`
- [ ] Modificar formulario de inscripción público
- [ ] Testing E2E del flujo completo

### Fase 3: Testing y Documentación (Día 7)

- [ ] Test E2E: Registro completo (tutor + estudiante)
- [ ] Test E2E: Login como tutor y ver dashboard
- [ ] Test: Generación automática de resumen post-clase
- [ ] Test: Visualización de progreso del hijo
- [ ] Actualizar documentación de API
- [ ] Grabar video demo del flujo

---

## 🎯 CRITERIOS DE ÉXITO

### Para el Padre/Tutor (Alexis)

✅ **Al inscribirme:**
- Lleno un solo formulario con mis datos + datos de mi hija
- No tengo que volver a cargar la info

✅ **En el dashboard:**
- Veo cuándo es la próxima clase de mi hija
- Veo el horario confirmado que elegí
- Veo claramente si tengo SUSCRIPCIÓN al CLUB o CURSO comprado

✅ **Después de cada clase:**
- Recibo (o puedo ver) un resumen:
  - ¿Asistió mi hija?
  - ¿Cuánto participó?
  - ¿Qué puntos ganó?
  - ¿Qué fortalezas mostró?
  - ¿En qué puede mejorar?

✅ **En cualquier momento:**
- Puedo ver el progreso completo de mi hija (nivel, puntos, insignias)
- Puedo ver mi historial de pagos
- Puedo ver el estado de mi suscripción/curso

---

## 📈 MÉTRICAS DE IMPACTO

- **Retención de tutores:** +40% (menos confusión, más valor percibido)
- **Reducción de consultas:** -60% (info clara en el portal)
- **Satisfacción NPS:** De 6 a 9 (experiencia completa)
- **Tiempo de onboarding:** De 15min a 5min (formulario único)

---

**Documento creado:** `docs/slices/SLICE_4_PORTAL_TUTOR_DISEÑO.md`
**Próximo paso:** Arreglar errores #1 y #4, luego empezar implementación de SLICE 4
