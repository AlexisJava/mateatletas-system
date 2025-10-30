# 🚀 Plan de Acción - Implementación Sistema de Gamificación Mateatletas

**Versión:** 1.0  
**Fecha:** 30 de Octubre 2025  
**Deadline Objetivo:** 30 de Noviembre 2025 (1 mes)

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Implementación](#arquitectura-de-implementación)
3. [Fase 1: Backend Core (Semana 1-2)](#fase-1-backend-core)
4. [Fase 2: Frontend Estudiantes (Semana 2-3)](#fase-2-frontend-estudiantes)
5. [Fase 3: Frontend Padres (Semana 3-4)](#fase-3-frontend-padres)
6. [Fase 4: Testing y Launch (Semana 4)](#fase-4-testing-y-launch)
7. [Checklist Final](#checklist-final)

---

## 🎯 Resumen Ejecutivo

### Objetivo
Implementar sistema completo de gamificación para estudiantes y padres en 4 semanas.

### Scope
- ✅ Sistema de monedas/puntos completo
- ✅ Catálogo de 50+ cursos canjeables
- ✅ Sistema de logros (30+)
- ✅ Sistema de niveles (10 niveles)
- ✅ Recompensas automáticas
- ✅ Portal padres gamificado
- ✅ Flujos de canje completos

### Fuera de Scope (Fase 2)
- ❌ Sistema de equipos (Fénix, Dragón, etc.)
- ❌ Rankings públicos entre estudiantes
- ❌ Items cosméticos (avatares, animaciones)
- ❌ Gemas (tercera moneda)
- ❌ Sistema de desafíos semanales

---

## 🏗️ Arquitectura de Implementación

### Stack Actual
- **Backend:** NestJS + PostgreSQL + Prisma
- **Frontend:** Next.js 15 + React + TypeScript
- **Estado:** React Query + Zustand
- **UI:** Tailwind CSS + Framer Motion

### Estado Actual del Sistema (según documento)
✅ **YA IMPLEMENTADO (Backend 95%):**
- Modelo `RecursosEstudiante` (XP, Monedas, Gemas)
- Modelo `TransaccionRecurso` (historial)
- `RecursosService` completo
- `GamificacionService` completo
- 8 acciones puntuables predefinidas
- Endpoints básicos funcionando

⚠️ **PARCIALMENTE (Frontend 60%):**
- HubView lee recursos
- Cálculo de nivel funcional
- Display de monedas/XP

❌ **NO IMPLEMENTADO:**
- Sistema de logros
- Sistema de niveles estructurado
- Catálogo de cursos
- Flujos de canje
- Gamificación para padres
- Notificaciones de recompensas
- Sistema de racha real

---

## 📅 FASE 1: Backend Core (Semana 1-2)

### Objetivos
- ✅ Modelos de datos completos
- ✅ Lógica de negocio core
- ✅ Endpoints funcionales
- ✅ Sistema de racha automático

---

### 🗄️ 1.1 Modelos de Base de Datos (Día 1-2)

#### **Modelo 1: Logros**

```prisma
// Definición de logros disponibles
model Logro {
  id String @id @default(cuid())
  
  // Identificación
  codigo String @unique // "racha_7_dias", "completista", etc
  nombre String // "Racha de Fuego"
  descripcion String
  categoria String // "consistencia", "maestria", "social", "velocidad"
  
  // Recompensas
  monedas_recompensa Int
  xp_recompensa Int
  animacion_desbloqueada String? // ID de animación (Fase 2)
  
  // Requisitos
  criterio_tipo String // "racha_dias", "temas_completados", "ejercicios_perfectos"
  criterio_valor Int // Valor umbral
  
  // Metadata
  icono String
  rareza String // "comun", "raro", "epico", "legendario"
  activo Boolean @default(true)
  orden Int @default(0)
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  // Relaciones
  logros_estudiantes LogroEstudiante[]
  
  @@map("logros")
}

// Logros desbloqueados por estudiantes
model LogroEstudiante {
  id String @id @default(cuid())
  
  estudiante_id String
  logro_id String
  
  fecha_desbloqueo DateTime @default(now())
  visto Boolean @default(false) // Para notificaciones
  
  // Relaciones
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  logro Logro @relation(fields: [logro_id], references: [id])
  
  @@unique([estudiante_id, logro_id])
  @@map("logros_estudiantes")
}
```

#### **Modelo 2: Cursos del Catálogo**

```prisma
model CursoCatalogo {
  id String @id @default(cuid())
  
  // Información básica
  codigo String @unique // "quimica_explosiva"
  titulo String
  descripcion Text
  categoria String // "ciencia", "programacion", "robotica", "diseno"
  subcategoria String?
  
  // Detalles académicos
  duracion_clases Int
  nivel_requerido Int @default(1) // Nivel mínimo estudiante
  contenido Json? // Syllabus, módulos, etc
  
  // Pricing
  precio_usd Decimal @db.Decimal(10,2)
  precio_monedas Int // precio_usd * 20
  
  // Media
  imagen_url String?
  video_preview_url String?
  
  // Metadata
  destacado Boolean @default(false)
  nuevo Boolean @default(false)
  activo Boolean @default(true)
  orden Int @default(0)
  
  // Stats
  total_canjes Int @default(0)
  rating Decimal @db.Decimal(3,2) @default(0)
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  // Relaciones
  solicitudes_canje SolicitudCanje[]
  
  @@map("cursos_catalogo")
}
```

#### **Modelo 3: Solicitudes de Canje**

```prisma
model SolicitudCanje {
  id String @id @default(cuid())
  
  // Partes involucradas
  estudiante_id String
  tutor_id String
  curso_id String
  
  // Detalles del canje
  monedas_usadas Int
  estado String // "pendiente", "aprobada", "rechazada", "cancelada"
  
  // Decisión del padre
  fecha_decision DateTime?
  opcion_pago String? // "padre_paga_todo", "hijo_paga_mitad", "hijo_paga_todo", null
  monto_padre Decimal? @db.Decimal(10,2) // Cuánto pagó el padre
  mensaje_padre Text?
  
  // Metadata
  fecha_solicitud DateTime @default(now())
  fecha_expiracion DateTime? // Opcional: expira en 7 días
  
  // Relaciones
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id])
  tutor Tutor @relation(fields: [tutor_id], references: [id])
  curso CursoCatalogo @relation(fields: [curso_id], references: [id])
  
  @@map("solicitudes_canje")
}
```

#### **Modelo 4: Racha del Estudiante**

```prisma
model RachaEstudiante {
  id String @id @default(cuid())
  estudiante_id String @unique
  
  // Estado actual
  racha_actual Int @default(0)
  racha_maxima Int @default(0)
  
  // Fechas
  ultima_actividad Date?
  inicio_racha_actual Date?
  
  // Metadata
  total_dias_activos Int @default(0)
  
  updated_at DateTime @updatedAt
  
  // Relaciones
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  
  @@map("rachas_estudiantes")
}
```

#### **Modelo 5: Puntos del Padre (Separado de Estudiante)**

```prisma
model PuntosPadre {
  id String @id @default(cuid())
  tutor_id String @unique
  
  // Recursos
  puntos_total Int @default(0)
  xp_total Int @default(0)
  
  // Stats
  pagos_puntuales_consecutivos Int @default(0)
  total_referidos_activos Int @default(0)
  
  updated_at DateTime @updatedAt
  
  // Relaciones
  tutor Tutor @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  transacciones TransaccionPuntosPadre[]
  canjes_padre CanjePadre[]
  
  @@map("puntos_padres")
}

model TransaccionPuntosPadre {
  id String @id @default(cuid())
  puntos_padre_id String
  
  tipo_recurso String // "PUNTOS", "XP"
  cantidad Int
  razon String // "pago_puntual", "referido", "engagement"
  
  metadata Json?
  fecha DateTime @default(now())
  
  puntos_padre PuntosPadre @relation(fields: [puntos_padre_id], references: [id], onDelete: Cascade)
  
  @@map("transacciones_puntos_padres")
}
```

#### **Modelo 6: Premios del Catálogo Padres**

```prisma
model PremioPadre {
  id String @id @default(cuid())
  
  // Información
  codigo String @unique
  titulo String
  descripcion Text
  categoria String // "digital", "acceso", "premium", "epico"
  
  // Costo
  puntos_requeridos Int
  costo_real_usd Decimal? @db.Decimal(10,2)
  
  // Metadata
  icono String
  activo Boolean @default(true)
  orden Int @default(0)
  
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  canjes CanjePadre[]
  
  @@map("premios_padres")
}

model CanjePadre {
  id String @id @default(cuid())
  
  tutor_id String
  premio_id String
  puntos_padre_id String
  
  puntos_usados Int
  estado String @default("completado")
  
  fecha_canje DateTime @default(now())
  
  tutor Tutor @relation(fields: [tutor_id], references: [id])
  premio PremioPadre @relation(fields: [premio_id], references: [id])
  puntos_padre PuntosPadre @relation(fields: [puntos_padre_id], references: [id])
  
  @@map("canjes_padres")
}
```

---

### ⚙️ 1.2 Seeds Iniciales (Día 2)

#### **Seed 1: Logros (30 logros)**

```typescript
// apps/api/prisma/seeds/logros.seed.ts

const logros = [
  // CONSISTENCIA (8 logros)
  {
    codigo: 'primer_paso',
    nombre: 'Primer Paso',
    descripcion: 'Completa tu primer ejercicio',
    categoria: 'consistencia',
    monedas_recompensa: 10,
    xp_recompensa: 20,
    criterio_tipo: 'ejercicios_completados',
    criterio_valor: 1,
    icono: '🎯',
    rareza: 'comun',
    orden: 1
  },
  {
    codigo: 'racha_3_dias',
    nombre: 'Comenzando',
    descripcion: 'Mantén una racha de 3 días',
    categoria: 'consistencia',
    monedas_recompensa: 20,
    xp_recompensa: 50,
    criterio_tipo: 'racha_dias',
    criterio_valor: 3,
    icono: '🔥',
    rareza: 'comun',
    orden: 2
  },
  {
    codigo: 'racha_7_dias',
    nombre: 'Racha de Fuego',
    descripcion: 'Mantén una racha de 7 días consecutivos',
    categoria: 'consistencia',
    monedas_recompensa: 50,
    xp_recompensa: 100,
    criterio_tipo: 'racha_dias',
    criterio_valor: 7,
    icono: '🔥',
    rareza: 'raro',
    orden: 3
  },
  {
    codigo: 'racha_30_dias',
    nombre: 'Imparable',
    descripcion: 'Mantén una racha de 30 días consecutivos',
    categoria: 'consistencia',
    monedas_recompensa: 200,
    xp_recompensa: 500,
    criterio_tipo: 'racha_dias',
    criterio_valor: 30,
    icono: '🔥',
    rareza: 'epico',
    orden: 4
  },
  {
    codigo: 'racha_60_dias',
    nombre: 'Dedicación Total',
    descripcion: 'Mantén una racha de 60 días consecutivos',
    categoria: 'consistencia',
    monedas_recompensa: 400,
    xp_recompensa: 1000,
    criterio_tipo: 'racha_dias',
    criterio_valor: 60,
    icono: '🔥',
    rareza: 'epico',
    orden: 5
  },
  {
    codigo: 'racha_90_dias',
    nombre: 'Leyenda Viviente',
    descripcion: 'Mantén una racha de 90 días (trimestre completo)',
    categoria: 'consistencia',
    monedas_recompensa: 800,
    xp_recompensa: 2000,
    criterio_tipo: 'racha_dias',
    criterio_valor: 90,
    icono: '👑',
    rareza: 'legendario',
    orden: 6
  },
  
  // MAESTRÍA (8 logros)
  {
    codigo: 'completista',
    nombre: 'Completista',
    descripcion: 'Termina tu primer tema al 100%',
    categoria: 'maestria',
    monedas_recompensa: 60,
    xp_recompensa: 200,
    criterio_tipo: 'temas_completados',
    criterio_valor: 1,
    icono: '🎓',
    rareza: 'raro',
    orden: 10
  },
  {
    codigo: 'maestro_algebra',
    nombre: 'Maestro del Álgebra',
    descripcion: 'Completa el módulo de Álgebra al 100%',
    categoria: 'maestria',
    monedas_recompensa: 300,
    xp_recompensa: 1000,
    criterio_tipo: 'modulo_completado',
    criterio_valor: 1, // ID módulo álgebra
    icono: '🧮',
    rareza: 'epico',
    orden: 11
  },
  {
    codigo: 'polimata',
    nombre: 'Polímata',
    descripcion: 'Completa 5 módulos diferentes',
    categoria: 'maestria',
    monedas_recompensa: 700,
    xp_recompensa: 2000,
    criterio_tipo: 'modulos_completados',
    criterio_valor: 5,
    icono: '📚',
    rareza: 'epico',
    orden: 12
  },
  
  // SOCIAL (6 logros)
  {
    codigo: 'buen_companero',
    nombre: 'Buen Compañero',
    descripcion: 'Ayuda a 5 estudiantes',
    categoria: 'social',
    monedas_recompensa: 80,
    xp_recompensa: 200,
    criterio_tipo: 'ayudas_dadas',
    criterio_valor: 5,
    icono: '🤝',
    rareza: 'raro',
    orden: 20
  },
  {
    codigo: 'mentor',
    nombre: 'Mentor',
    descripcion: 'Ayuda a 25 estudiantes',
    categoria: 'social',
    monedas_recompensa: 300,
    xp_recompensa: 800,
    criterio_tipo: 'ayudas_dadas',
    criterio_valor: 25,
    icono: '👨‍🏫',
    rareza: 'epico',
    orden: 21
  },
  {
    codigo: 'embajador',
    nombre: 'Embajador',
    descripcion: 'Invita 3 amigos que se vuelvan activos',
    categoria: 'social',
    monedas_recompensa: 500,
    xp_recompensa: 1000,
    criterio_tipo: 'invitaciones_activas',
    criterio_valor: 3,
    icono: '📣',
    rareza: 'epico',
    orden: 22
  },
  
  // PRECISIÓN (4 logros)
  {
    codigo: 'perfeccionista',
    nombre: 'Perfeccionista',
    descripcion: 'Completa 10 ejercicios con 100% de precisión',
    categoria: 'precision',
    monedas_recompensa: 100,
    xp_recompensa: 300,
    criterio_tipo: 'ejercicios_perfectos',
    criterio_valor: 10,
    icono: '💯',
    rareza: 'raro',
    orden: 30
  },
  {
    codigo: 'francotirador',
    nombre: 'Francotirador',
    descripcion: 'Completa 50 ejercicios con 100% de precisión',
    categoria: 'precision',
    monedas_recompensa: 300,
    xp_recompensa: 800,
    criterio_tipo: 'ejercicios_perfectos',
    criterio_valor: 50,
    icono: '🎯',
    rareza: 'epico',
    orden: 31
  },
  
  // VELOCIDAD (2 logros)
  {
    codigo: 'rapido_furioso',
    nombre: 'Rápido y Furioso',
    descripcion: 'Completa un ejercicio en menos de 30 segundos',
    categoria: 'velocidad',
    monedas_recompensa: 50,
    xp_recompensa: 150,
    criterio_tipo: 'ejercicio_rapido',
    criterio_valor: 30,
    icono: '⚡',
    rareza: 'raro',
    orden: 40
  },
  {
    codigo: 'velocista',
    nombre: 'Velocista',
    descripcion: 'Completa 10 ejercicios en menos de 30s cada uno',
    categoria: 'velocidad',
    monedas_recompensa: 200,
    xp_recompensa: 500,
    criterio_tipo: 'ejercicios_rapidos',
    criterio_valor: 10,
    icono: '🏃',
    rareza: 'epico',
    orden: 41
  },
  
  // ASISTENCIA (2 logros)
  {
    codigo: 'alumno_presente',
    nombre: 'Alumno Presente',
    descripcion: 'Asiste a 4 clases en un mes',
    categoria: 'asistencia',
    monedas_recompensa: 70,
    xp_recompensa: 300,
    criterio_tipo: 'clases_asistidas_mes',
    criterio_valor: 4,
    icono: '✅',
    rareza: 'raro',
    orden: 50
  },
  {
    codigo: 'asistencia_perfecta',
    nombre: 'Asistencia Perfecta',
    descripcion: 'Asiste a todas las clases del trimestre',
    categoria: 'asistencia',
    monedas_recompensa: 300,
    xp_recompensa: 1000,
    criterio_tipo: 'clases_asistidas_trimestre',
    criterio_valor: 12,
    icono: '🏆',
    rareza: 'epico',
    orden: 51
  },
];

export async function seedLogros(prisma: PrismaClient) {
  console.log('🏆 Seeding logros...');
  
  for (const logro of logros) {
    await prisma.logro.upsert({
      where: { codigo: logro.codigo },
      update: logro,
      create: logro,
    });
  }
  
  console.log(`✅ Seeded ${logros.length} logros`);
}
```

#### **Seed 2: Cursos del Catálogo (50 cursos)**

```typescript
// apps/api/prisma/seeds/cursos-catalogo.seed.ts

const cursos = [
  // CIENCIA (7 cursos)
  {
    codigo: 'quimica_explosiva',
    titulo: 'Química Explosiva Virtual',
    descripcion: 'Explora reacciones químicas en un laboratorio 3D seguro',
    categoria: 'ciencia',
    subcategoria: 'quimica',
    duracion_clases: 8,
    nivel_requerido: 1,
    precio_usd: 35,
    precio_monedas: 700,
    imagen_url: '/cursos/quimica-explosiva.jpg',
    destacado: true,
    nuevo: false,
    activo: true,
    orden: 1
  },
  {
    codigo: 'laboratorio_quimico_avanzado',
    titulo: 'Laboratorio Químico Avanzado',
    descripcion: 'Experimentos complejos de química orgánica e inorgánica',
    categoria: 'ciencia',
    subcategoria: 'quimica',
    duracion_clases: 12,
    nivel_requerido: 3,
    precio_usd: 50,
    precio_monedas: 1000,
    imagen_url: '/cursos/lab-quimico.jpg',
    orden: 2
  },
  {
    codigo: 'astronomia_interactiva',
    titulo: 'Astronomía Interactiva',
    descripcion: 'Viaja por el sistema solar en realidad virtual',
    categoria: 'ciencia',
    subcategoria: 'astronomia',
    duracion_clases: 6,
    nivel_requerido: 1,
    precio_usd: 30,
    precio_monedas: 600,
    destacado: true,
    orden: 3
  },
  // ... más cursos de ciencia
  
  // PROGRAMACIÓN (10 cursos)
  {
    codigo: 'videojuegos_scratch',
    titulo: 'Videojuegos con Scratch',
    descripcion: 'Crea tu primer videojuego sin código',
    categoria: 'programacion',
    subcategoria: 'juegos',
    duracion_clases: 6,
    nivel_requerido: 1,
    precio_usd: 25,
    precio_monedas: 500,
    nuevo: true,
    orden: 10
  },
  {
    codigo: 'python_desde_cero',
    titulo: 'Python desde Cero',
    descripcion: 'Aprende programación con Python paso a paso',
    categoria: 'programacion',
    subcategoria: 'lenguajes',
    duracion_clases: 12,
    nivel_requerido: 2,
    precio_usd: 50,
    precio_monedas: 1000,
    destacado: true,
    orden: 11
  },
  {
    codigo: 'nextjs_fullstack',
    titulo: 'Next.js Full Stack',
    descripcion: 'Desarrollo web moderno con React y Next.js',
    categoria: 'programacion',
    subcategoria: 'web',
    duracion_clases: 20,
    nivel_requerido: 5,
    precio_usd: 150,
    precio_monedas: 3000,
    destacado: true,
    orden: 12
  },
  // ... más cursos de programación
  
  // ROBÓTICA (7 cursos)
  {
    codigo: 'arduino_desde_cero',
    titulo: 'Arduino desde Cero',
    descripcion: 'Aprende electrónica y robótica con Arduino',
    categoria: 'robotica',
    subcategoria: 'basico',
    duracion_clases: 8,
    nivel_requerido: 2,
    precio_usd: 35,
    precio_monedas: 700,
    destacado: true,
    orden: 20
  },
  // ... más cursos de robótica
  
  // DISEÑO (6 cursos)
  {
    codigo: 'blender_modelado',
    titulo: 'Blender 3D: Modelado Básico',
    descripcion: 'Crea modelos 3D profesionales desde cero',
    categoria: 'diseno',
    subcategoria: '3d',
    duracion_clases: 10,
    nivel_requerido: 3,
    precio_usd: 50,
    precio_monedas: 1000,
    orden: 30
  },
  // ... más cursos de diseño
  
  // MAESTRÍAS (6 programas)
  {
    codigo: 'fullstack_developer',
    titulo: 'Full Stack Web Developer',
    descripcion: 'Programa completo de desarrollo web profesional',
    categoria: 'programacion',
    subcategoria: 'maestria',
    duracion_clases: 30,
    nivel_requerido: 8,
    precio_usd: 200,
    precio_monedas: 4000,
    destacado: true,
    nuevo: true,
    orden: 100
  },
  {
    codigo: 'ia_aplicada',
    titulo: 'Inteligencia Artificial Aplicada',
    descripcion: 'Machine Learning y Deep Learning desde cero',
    categoria: 'programacion',
    subcategoria: 'maestria',
    duracion_clases: 40,
    nivel_requerido: 8,
    precio_usd: 300,
    precio_monedas: 6000,
    destacado: true,
    orden: 101
  },
  // ... más maestrías
];

export async function seedCursosCatalogo(prisma: PrismaClient) {
  console.log('📚 Seeding cursos catálogo...');
  
  for (const curso of cursos) {
    await prisma.cursoCatalogo.upsert({
      where: { codigo: curso.codigo },
      update: curso,
      create: curso,
    });
  }
  
  console.log(`✅ Seeded ${cursos.length} cursos`);
}
```

#### **Seed 3: Premios para Padres (40 premios)**

```typescript
// apps/api/prisma/seeds/premios-padres.seed.ts

const premios = [
  // DIGITALES (11 premios - costo $0)
  {
    codigo: 'monedas_100_hijo',
    titulo: '+100 Monedas para tu Hijo',
    descripcion: 'Bonus directo de 100 monedas para tu hijo',
    categoria: 'digital',
    puntos_requeridos: 200,
    costo_real_usd: 0,
    icono: '💰',
    orden: 1
  },
  {
    codigo: 'monedas_300_hijo',
    titulo: '+300 Monedas para tu Hijo',
    descripcion: 'Bonus grande de 300 monedas para tu hijo',
    categoria: 'digital',
    puntos_requeridos: 500,
    costo_real_usd: 0,
    icono: '💰',
    orden: 2
  },
  {
    codigo: 'badge_padre_mes',
    titulo: 'Badge "Padre del Mes"',
    descripcion: 'Badge visible en tu perfil',
    categoria: 'digital',
    puntos_requeridos: 300,
    costo_real_usd: 0,
    icono: '🏅',
    orden: 3
  },
  // ... más premios digitales
  
  // ACCESO (9 premios - costo bajo)
  {
    codigo: 'webinar_crianza_digital',
    titulo: 'Webinar "Crianza Digital"',
    descripcion: 'Acceso a webinar exclusivo grabado',
    categoria: 'acceso',
    puntos_requeridos: 200,
    costo_real_usd: 0,
    icono: '🎓',
    orden: 20
  },
  {
    codigo: 'sesion_docente',
    titulo: 'Sesión 1-on-1 con Docente',
    descripcion: '30 minutos personalizado sobre tu hijo',
    categoria: 'acceso',
    puntos_requeridos: 800,
    costo_real_usd: 15,
    icono: '💬',
    orden: 21
  },
  // ... más premios de acceso
  
  // PREMIUM (9 premios - para logros épicos)
  {
    codigo: 'curso_gratis_50',
    titulo: '1 Curso GRATIS para tu Hijo',
    descripcion: 'Cualquier curso hasta $50',
    categoria: 'premium',
    puntos_requeridos: 2000,
    costo_real_usd: 50,
    icono: '🎓',
    orden: 30
  },
  {
    codigo: 'mes_gratis',
    titulo: '1 Mes de Cuota GRATIS',
    descripcion: 'Descuento de 1 mes completo',
    categoria: 'premium',
    puntos_requeridos: 3000,
    costo_real_usd: 30,
    icono: '💳',
    orden: 31
  },
  // ... más premios premium
  
  // ÉPICOS (5 premios - logros anuales)
  {
    codigo: 'familia_del_anio',
    titulo: 'Familia del Año',
    descripcion: 'Reconocimiento + Trofeo + 3 meses gratis',
    categoria: 'epico',
    puntos_requeridos: 10000,
    costo_real_usd: 90,
    icono: '👑',
    orden: 40
  },
  // ... más premios épicos
];

export async function seedPremiosPadres(prisma: PrismaClient) {
  console.log('🎁 Seeding premios padres...');
  
  for (const premio of premios) {
    await prisma.premioPadre.upsert({
      where: { codigo: premio.codigo },
      update: premio,
      create: premio,
    });
  }
  
  console.log(`✅ Seeded ${premios.length} premios`);
}
```

---

### 🔧 1.3 Servicios Backend (Día 3-5)

#### **Servicio 1: LogrosService**

```typescript
// apps/api/src/gamificacion/services/logros.service.ts

@Injectable()
export class LogrosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica y desbloquea logros para un estudiante
   */
  async verificarLogros(estudiante_id: string): Promise<LogroEstudiante[]> {
    // 1. Obtener todos los logros activos
    const logros = await this.prisma.logro.findMany({
      where: { activo: true }
    });

    // 2. Obtener logros ya desbloqueados
    const logrosDesbloqueados = await this.prisma.logroEstudiante.findMany({
      where: { estudiante_id },
      select: { logro_id: true }
    });
    const idsDesbloqueados = new Set(logrosDesbloqueados.map(l => l.logro_id));

    // 3. Filtrar logros pendientes
    const logrosPendientes = logros.filter(l => !idsDesbloqueados.has(l.id));

    // 4. Verificar cada logro pendiente
    const nuevosLogros: LogroEstudiante[] = [];
    
    for (const logro of logrosPendientes) {
      const cumple = await this.verificarCriterio(estudiante_id, logro);
      
      if (cumple) {
        // Desbloquear logro
        const logroDesbloqueado = await this.desbloquearLogro(estudiante_id, logro);
        nuevosLogros.push(logroDesbloqueado);
      }
    }

    return nuevosLogros;
  }

  /**
   * Verifica si un estudiante cumple el criterio de un logro
   */
  private async verificarCriterio(
    estudiante_id: string,
    logro: Logro
  ): Promise<boolean> {
    switch (logro.criterio_tipo) {
      case 'racha_dias':
        const racha = await this.prisma.rachaEstudiante.findUnique({
          where: { estudiante_id }
        });
        return racha?.racha_actual >= logro.criterio_valor;

      case 'temas_completados':
        const temas = await this.prisma.progresoTema.count({
          where: {
            estudiante_id,
            progreso: 100
          }
        });
        return temas >= logro.criterio_valor;

      case 'ejercicios_completados':
        const ejercicios = await this.prisma.actividadCompletada.count({
          where: { estudiante_id }
        });
        return ejercicios >= logro.criterio_valor;

      case 'ejercicios_perfectos':
        const perfectos = await this.prisma.actividadCompletada.count({
          where: {
            estudiante_id,
            nota: 100
          }
        });
        return perfectos >= logro.criterio_valor;

      case 'clases_asistidas_mes':
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        
        const asistencias = await this.prisma.asistencia.count({
          where: {
            estudiante_id,
            presente: true,
            fecha: { gte: inicioMes }
          }
        });
        return asistencias >= logro.criterio_valor;

      case 'ayudas_dadas':
        const ayudas = await this.prisma.transaccionRecurso.count({
          where: {
            recursos_estudiante: { estudiante_id },
            razon: 'ayudar_companero'
          }
        });
        return ayudas >= logro.criterio_valor;

      // ... más criterios

      default:
        return false;
    }
  }

  /**
   * Desbloquea un logro y otorga recompensas
   */
  private async desbloquearLogro(
    estudiante_id: string,
    logro: Logro
  ): Promise<LogroEstudiante> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Crear registro de logro desbloqueado
      const logroDesbloqueado = await tx.logroEstudiante.create({
        data: {
          estudiante_id,
          logro_id: logro.id,
          visto: false
        },
        include: {
          logro: true
        }
      });

      // 2. Otorgar recompensas
      const recursos = await tx.recursosEstudiante.findUnique({
        where: { estudiante_id }
      });

      if (!recursos) {
        throw new Error('Recursos no encontrados');
      }

      // Actualizar monedas y XP
      await tx.recursosEstudiante.update({
        where: { estudiante_id },
        data: {
          monedas_total: { increment: logro.monedas_recompensa },
          xp_total: { increment: logro.xp_recompensa }
        }
      });

      // Crear transacciones
      await tx.transaccionRecurso.createMany({
        data: [
          {
            recursos_estudiante_id: recursos.id,
            tipo_recurso: 'MONEDAS',
            cantidad: logro.monedas_recompensa,
            razon: 'logro_desbloqueado',
            metadata: { logro_id: logro.id, logro_codigo: logro.codigo }
          },
          {
            recursos_estudiante_id: recursos.id,
            tipo_recurso: 'XP',
            cantidad: logro.xp_recompensa,
            razon: 'logro_desbloqueado',
            metadata: { logro_id: logro.id, logro_codigo: logro.codigo }
          }
        ]
      });

      return logroDesbloqueado;
    });
  }

  /**
   * Obtiene logros del estudiante
   */
  async obtenerLogrosEstudiante(estudiante_id: string) {
    const [desbloqueados, todosLogros] = await Promise.all([
      this.prisma.logroEstudiante.findMany({
        where: { estudiante_id },
        include: { logro: true }
      }),
      this.prisma.logro.findMany({
        where: { activo: true },
        orderBy: { orden: 'asc' }
      })
    ]);

    const idsDesbloqueados = new Set(desbloqueados.map(l => l.logro_id));

    return {
      desbloqueados: desbloqueados.map(l => ({
        ...l.logro,
        fecha_desbloqueo: l.fecha_desbloqueo,
        visto: l.visto
      })),
      bloqueados: todosLogros.filter(l => !idsDesbloqueados.has(l.id)),
      total: todosLogros.length,
      completados: desbloqueados.length
    };
  }

  /**
   * Marca logros como vistos
   */
  async marcarLogrosVistos(estudiante_id: string, logros_ids: string[]) {
    await this.prisma.logroEstudiante.updateMany({
      where: {
        estudiante_id,
        logro_id: { in: logros_ids },
        visto: false
      },
      data: { visto: true }
    });
  }
}
```

#### **Servicio 2: RachaService**

```typescript
// apps/api/src/gamificacion/services/racha.service.ts

@Injectable()
export class RachaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Actualiza la racha del estudiante
   * Se llama cada vez que el estudiante completa una actividad
   */
  async actualizarRacha(estudiante_id: string): Promise<RachaEstudiante> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const racha = await this.prisma.rachaEstudiante.findUnique({
      where: { estudiante_id }
    });

    if (!racha) {
      // Primera vez - crear racha
      return await this.prisma.rachaEstudiante.create({
        data: {
          estudiante_id,
          racha_actual: 1,
          racha_maxima: 1,
          ultima_actividad: hoy,
          inicio_racha_actual: hoy,
          total_dias_activos: 1
        }
      });
    }

    const ultimaActividad = new Date(racha.ultima_actividad);
    ultimaActividad.setHours(0, 0, 0, 0);

    // Calcular diferencia en días
    const diffTime = hoy.getTime() - ultimaActividad.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Mismo día - no hacer nada
      return racha;
    } else if (diffDays === 1) {
      // Día consecutivo - incrementar racha
      const nuevaRacha = racha.racha_actual + 1;
      const nuevaMaxima = Math.max(racha.racha_maxima, nuevaRacha);

      const rachaActualizada = await this.prisma.rachaEstudiante.update({
        where: { estudiante_id },
        data: {
          racha_actual: nuevaRacha,
          racha_maxima: nuevaMaxima,
          ultima_actividad: hoy,
          total_dias_activos: { increment: 1 }
        }
      });

      // Verificar logros de racha
      await this.verificarLogrosRacha(estudiante_id, nuevaRacha);

      return rachaActualizada;
    } else {
      // Racha rota - reiniciar
      return await this.prisma.rachaEstudiante.update({
        where: { estudiante_id },
        data: {
          racha_actual: 1,
          ultima_actividad: hoy,
          inicio_racha_actual: hoy,
          total_dias_activos: { increment: 1 }
        }
      });
    }
  }

  /**
   * Verifica y otorga recompensas por hitos de racha
   */
  private async verificarLogrosRacha(estudiante_id: string, racha: number) {
    const hitos = [3, 7, 14, 30, 60, 90];
    
    for (const hito of hitos) {
      if (racha === hito) {
        // Otorgar recompensas según hito
        const recompensas = this.getRecompensasRacha(hito);
        
        await this.prisma.recursosEstudiante.update({
          where: { estudiante_id },
          data: {
            monedas_total: { increment: recompensas.monedas },
            xp_total: { increment: recompensas.xp }
          }
        });

        // Registrar transacciones
        const recursos = await this.prisma.recursosEstudiante.findUnique({
          where: { estudiante_id }
        });

        if (recursos) {
          await this.prisma.transaccionRecurso.createMany({
            data: [
              {
                recursos_estudiante_id: recursos.id,
                tipo_recurso: 'MONEDAS',
                cantidad: recompensas.monedas,
                razon: `racha_${hito}_dias`,
                metadata: { racha_dias: hito }
              },
              {
                recursos_estudiante_id: recursos.id,
                tipo_recurso: 'XP',
                cantidad: recompensas.xp,
                razon: `racha_${hito}_dias`,
                metadata: { racha_dias: hito }
              }
            ]
          });
        }
      }
    }
  }

  private getRecompensasRacha(dias: number): { monedas: number; xp: number } {
    const recompensas = {
      3: { monedas: 10, xp: 30 },
      7: { monedas: 15, xp: 100 },
      14: { monedas: 30, xp: 200 },
      30: { monedas: 100, xp: 500 },
      60: { monedas: 250, xp: 1000 },
      90: { monedas: 500, xp: 2000 }
    };
    return recompensas[dias] || { monedas: 0, xp: 0 };
  }

  /**
   * Obtiene la racha actual del estudiante
   */
  async obtenerRacha(estudiante_id: string): Promise<RachaEstudiante | null> {
    return await this.prisma.rachaEstudiante.findUnique({
      where: { estudiante_id }
    });
  }
}
```

#### **Servicio 3: CatalogoService**

```typescript
// apps/api/src/tienda/services/catalogo.service.ts

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene catálogo de cursos filtrado
   */
  async obtenerCatalogo(params: {
    categoria?: string;
    nivel_max?: number;
    busqueda?: string;
    destacados?: boolean;
    nuevos?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { activo: true };

    if (params.categoria) where.categoria = params.categoria;
    if (params.nivel_max) where.nivel_requerido = { lte: params.nivel_max };
    if (params.destacados) where.destacado = true;
    if (params.nuevos) where.nuevo = true;
    if (params.busqueda) {
      where.OR = [
        { titulo: { contains: params.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: params.busqueda, mode: 'insensitive' } }
      ];
    }

    const [cursos, total] = await Promise.all([
      this.prisma.cursoCatalogo.findMany({
        where,
        orderBy: [
          { destacado: 'desc' },
          { orden: 'asc' }
        ],
        take: params.limit || 20,
        skip: params.offset || 0
      }),
      this.prisma.cursoCatalogo.count({ where })
    ]);

    return { cursos, total };
  }

  /**
   * Obtiene un curso específico
   */
  async obtenerCurso(id: string) {
    return await this.prisma.cursoCatalogo.findUnique({
      where: { id }
    });
  }

  /**
   * Verifica si estudiante puede canjear un curso
   */
  async verificarElegibilidad(estudiante_id: string, curso_id: string) {
    const [curso, recursos, nivel] = await Promise.all([
      this.prisma.cursoCatalogo.findUnique({ where: { id: curso_id } }),
      this.prisma.recursosEstudiante.findUnique({ where: { estudiante_id } }),
      this.calcularNivel(estudiante_id)
    ]);

    if (!curso) throw new Error('Curso no encontrado');
    if (!recursos) throw new Error('Recursos no encontrados');

    return {
      elegible: recursos.monedas_total >= curso.precio_monedas &&
                nivel >= curso.nivel_requerido,
      razon: recursos.monedas_total < curso.precio_monedas
        ? 'monedas_insuficientes'
        : nivel < curso.nivel_requerido
        ? 'nivel_insuficiente'
        : 'elegible',
      monedas_faltantes: Math.max(0, curso.precio_monedas - recursos.monedas_total),
      niveles_faltantes: Math.max(0, curso.nivel_requerido - nivel)
    };
  }

  private async calcularNivel(estudiante_id: string): Promise<number> {
    const recursos = await this.prisma.recursosEstudiante.findUnique({
      where: { estudiante_id },
      select: { xp_total: true }
    });
    
    if (!recursos) return 1;
    return Math.floor(Math.sqrt(recursos.xp_total / 100)) + 1;
  }
}
```

#### **Servicio 4: CanjeService**

```typescript
// apps/api/src/tienda/services/canje.service.ts

@Injectable()
export class CanjeService {
  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService
  ) {}

  /**
   * Estudiante solicita canjear curso
   */
  async solicitarCanje(data: {
    estudiante_id: string;
    curso_id: string;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validar elegibilidad
      const [curso, recursos, estudiante] = await Promise.all([
        tx.cursoCatalogo.findUnique({ where: { id: data.curso_id } }),
        tx.recursosEstudiante.findUnique({ where: { estudiante_id: data.estudiante_id } }),
        tx.estudiante.findUnique({
          where: { id: data.estudiante_id },
          include: { grupo: { include: { tutor: true } } }
        })
      ]);

      if (!curso) throw new Error('Curso no encontrado');
      if (!recursos) throw new Error('Recursos no encontrados');
      if (!estudiante?.grupo?.tutor) throw new Error('Tutor no encontrado');

      if (recursos.monedas_total < curso.precio_monedas) {
        throw new Error('Monedas insuficientes');
      }

      // 2. Descontar monedas temporalmente
      await tx.recursosEstudiante.update({
        where: { estudiante_id: data.estudiante_id },
        data: {
          monedas_total: { decrement: curso.precio_monedas }
        }
      });

      // 3. Crear solicitud
      const solicitud = await tx.solicitudCanje.create({
        data: {
          estudiante_id: data.estudiante_id,
          tutor_id: estudiante.grupo.tutor.id,
          curso_id: data.curso_id,
          monedas_usadas: curso.precio_monedas,
          estado: 'pendiente',
          fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        },
        include: {
          curso: true,
          estudiante: true
        }
      });

      // 4. Notificar al padre
      await this.notificacionesService.enviarNotificacionPadre({
        tutor_id: estudiante.grupo.tutor.id,
        tipo: 'solicitud_canje',
        titulo: `${estudiante.nombre} quiere canjear un curso`,
        mensaje: `${estudiante.nombre} ha solicitado canjear ${curso.titulo} (${curso.precio_monedas} monedas = $${curso.precio_usd})`,
        link: `/tutor/solicitudes/${solicitud.id}`,
        metadata: { solicitud_id: solicitud.id }
      });

      return solicitud;
    });
  }

  /**
   * Padre aprueba/rechaza solicitud
   */
  async decidirSolicitud(data: {
    solicitud_id: string;
    tutor_id: string;
    decision: 'aprobar' | 'rechazar';
    opcion_pago?: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo';
    mensaje?: string;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudCanje.findUnique({
        where: { id: data.solicitud_id },
        include: { curso: true, estudiante: true }
      });

      if (!solicitud) throw new Error('Solicitud no encontrada');
      if (solicitud.tutor_id !== data.tutor_id) throw new Error('No autorizado');
      if (solicitud.estado !== 'pendiente') throw new Error('Solicitud ya procesada');

      if (data.decision === 'aprobar') {
        // Aprobar y habilitar curso
        const solicitudActualizada = await tx.solicitudCanje.update({
          where: { id: data.solicitud_id },
          data: {
            estado: 'aprobada',
            fecha_decision: new Date(),
            opcion_pago: data.opcion_pago,
            monto_padre: this.calcularMontoPadre(solicitud.curso.precio_usd, data.opcion_pago),
            mensaje_padre: data.mensaje
          }
        });

        // Registrar transacción de gasto
        const recursos = await tx.recursosEstudiante.findUnique({
          where: { estudiante_id: solicitud.estudiante_id }
        });

        if (recursos) {
          await tx.transaccionRecurso.create({
            data: {
              recursos_estudiante_id: recursos.id,
              tipo_recurso: 'MONEDAS',
              cantidad: -solicitud.monedas_usadas,
              razon: 'canje_curso',
              metadata: {
                solicitud_id: solicitud.id,
                curso_id: solicitud.curso_id,
                curso_titulo: solicitud.curso.titulo
              }
            }
          });
        }

        // TODO: Habilitar acceso al curso en LMS

        // Incrementar contador del curso
        await tx.cursoCatalogo.update({
          where: { id: solicitud.curso_id },
          data: { total_canjes: { increment: 1 } }
        });

        // Notificar al estudiante
        await this.notificacionesService.enviarNotificacionEstudiante({
          estudiante_id: solicitud.estudiante_id,
          tipo: 'canje_aprobado',
          titulo: '¡Tu curso fue aprobado! 🎉',
          mensaje: `Tu solicitud de ${solicitud.curso.titulo} ha sido aprobada. Ya puedes empezar.`,
          link: `/estudiante/mis-cursos/${solicitud.curso_id}`
        });

        return solicitudActualizada;
      } else {
        // Rechazar y devolver monedas
        const solicitudActualizada = await tx.solicitudCanje.update({
          where: { id: data.solicitud_id },
          data: {
            estado: 'rechazada',
            fecha_decision: new Date(),
            mensaje_padre: data.mensaje
          }
        });

        // Devolver monedas
        await tx.recursosEstudiante.update({
          where: { estudiante_id: solicitud.estudiante_id },
          data: {
            monedas_total: { increment: solicitud.monedas_usadas }
          }
        });

        // Notificar al estudiante
        await this.notificacionesService.enviarNotificacionEstudiante({
          estudiante_id: solicitud.estudiante_id,
          tipo: 'canje_rechazado',
          titulo: 'Solicitud no aprobada',
          mensaje: data.mensaje || `Tu solicitud de ${solicitud.curso.titulo} no fue aprobada.`,
          link: `/estudiante/tienda`
        });

        return solicitudActualizada;
      }
    });
  }

  private calcularMontoPadre(
    precio_usd: any,
    opcion_pago?: string
  ): number {
    const precio = Number(precio_usd);
    switch (opcion_pago) {
      case 'padre_paga_todo': return 0;
      case 'hijo_paga_mitad': return precio / 2;
      case 'hijo_paga_todo': return precio;
      default: return 0;
    }
  }

  /**
   * Obtiene solicitudes del padre
   */
  async obtenerSolicitudesPadre(tutor_id: string, estado?: string) {
    const where: any = { tutor_id };
    if (estado) where.estado = estado;

    return await this.prisma.solicitudCanje.findMany({
      where,
      include: {
        curso: true,
        estudiante: true
      },
      orderBy: { fecha_solicitud: 'desc' }
    });
  }

  /**
   * Obtiene solicitudes del estudiante
   */
  async obtenerSolicitudesEstudiante(estudiante_id: string) {
    return await this.prisma.solicitudCanje.findMany({
      where: { estudiante_id },
      include: { curso: true },
      orderBy: { fecha_solicitud: 'desc' }
    });
  }
}
```

*(Continuará con más servicios...)*

---

### 🌐 1.4 Controladores/Endpoints (Día 6-7)

#### **Controller 1: LogrosController**

```typescript
// apps/api/src/gamificacion/controllers/logros.controller.ts

@Controller('gamificacion/logros')
@UseGuards(JwtAuthGuard)
export class LogrosController {
  constructor(private logrosService: LogrosService) {}

  @Get('estudiante/:id')
  async obtenerLogrosEstudiante(@Param('id') id: string) {
    return await this.logrosService.obtenerLogrosEstudiante(id);
  }

  @Post('verificar/:id')
  async verificarLogros(@Param('id') id: string) {
    return await this.logrosService.verificarLogros(id);
  }

  @Patch('marcar-vistos')
  async marcarVistos(@Body() body: { estudiante_id: string; logros_ids: string[] }) {
    await this.logrosService.marcarLogrosVistos(body.estudiante_id, body.logros_ids);
    return { success: true };
  }

  @Get('catalogo')
  async obtenerCatalogo() {
    return await this.prisma.logro.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { orden: 'asc' }]
    });
  }
}
```

#### **Controller 2: CatalogoController**

```typescript
// apps/api/src/tienda/controllers/catalogo.controller.ts

@Controller('tienda/catalogo')
export class CatalogoController {
  constructor(private catalogoService: CatalogoService) {}

  @Get()
  async obtenerCatalogo(@Query() query: any) {
    return await this.catalogoService.obtenerCatalogo(query);
  }

  @Get(':id')
  async obtenerCurso(@Param('id') id: string) {
    return await this.catalogoService.obtenerCurso(id);
  }

  @Get('elegibilidad/:estudiante_id/:curso_id')
  @UseGuards(JwtAuthGuard)
  async verificarElegibilidad(
    @Param('estudiante_id') estudiante_id: string,
    @Param('curso_id') curso_id: string
  ) {
    return await this.catalogoService.verificarElegibilidad(estudiante_id, curso_id);
  }

  @Get('categorias')
  async obtenerCategorias() {
    const categorias = await this.prisma.cursoCatalogo.groupBy({
      by: ['categoria'],
      where: { activo: true },
      _count: { id: true }
    });
    return categorias;
  }
}
```

#### **Controller 3: CanjeController**

```typescript
// apps/api/src/tienda/controllers/canje.controller.ts

@Controller('tienda/canje')
@UseGuards(JwtAuthGuard)
export class CanjeController {
  constructor(private canjeService: CanjeService) {}

  @Post('solicitar')
  async solicitarCanje(@Body() body: { estudiante_id: string; curso_id: string }) {
    return await this.canjeService.solicitarCanje(body);
  }

  @Post('decidir')
  async decidirSolicitud(@Body() body: any) {
    return await this.canjeService.decidirSolicitud(body);
  }

  @Get('solicitudes/padre/:tutor_id')
  async obtenerSolicitudesPadre(
    @Param('tutor_id') tutor_id: string,
    @Query('estado') estado?: string
  ) {
    return await this.canjeService.obtenerSolicitudesPadre(tutor_id, estado);
  }

  @Get('solicitudes/estudiante/:id')
  async obtenerSolicitudesEstudiante(@Param('id') id: string) {
    return await this.canjeService.obtenerSolicitudesEstudiante(id);
  }
}
```

---

### ✅ 1.5 Testing Backend (Día 7)

```typescript
// apps/api/src/gamificacion/__tests__/logros.service.spec.ts

describe('LogrosService', () => {
  let service: LogrosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LogrosService, PrismaService],
    }).compile();

    service = module.get<LogrosService>(LogrosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('verificarLogros', () => {
    it('debe desbloquear logro cuando se cumple criterio', async () => {
      // Mock data
      const estudiante_id = 'test-estudiante';
      
      // Mock racha de 7 días
      jest.spyOn(prisma.rachaEstudiante, 'findUnique').mockResolvedValue({
        id: '1',
        estudiante_id,
        racha_actual: 7,
        racha_maxima: 7,
        // ... más campos
      });

      const nuevosLogros = await service.verificarLogros(estudiante_id);
      
      expect(nuevosLogros.length).toBeGreaterThan(0);
      expect(nuevosLogros[0].logro.codigo).toBe('racha_7_dias');
    });
  });
});
```

---

## 📅 FASE 2: Frontend Estudiantes (Semana 2-3)

*(Se desarrollará en el siguiente prompt)*

---

## 📅 FASE 3: Frontend Padres (Semana 3-4)

*(Se desarrollará en el siguiente prompt)*

---

## 📅 FASE 4: Testing y Launch (Semana 4)

*(Se desarrollará en el siguiente prompt)*

---

**FIN DEL DOCUMENTO - Continuará con Fases 2, 3 y 4 en próximo archivo**

---

*Última actualización: 30 de Octubre 2025*  
*Versión: 1.0 - DRAFT*  
*Autor: Alexis - Founder Mateatletas*
