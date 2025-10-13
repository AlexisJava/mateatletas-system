# Schema Prisma Unificado - Mateatletas

Este documento presenta el schema completo de Prisma integrando todos los slices del sistema.

---

## Configuración

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Enums

```prisma
// Estados de Membresía (Pagos)
enum EstadoMembresia {
  Pendiente    // Pago iniciado, esperando webhook
  Activa       // Pago confirmado
  Atrasada     // Pago vencido
  Cancelada    // Cancelada manualmente o pago rechazado
}

// Estados de Inscripción a Curso (Pagos)
enum EstadoInscripcionCurso {
  PreInscrito  // Comprado pero curso no inició
  Activo       // Cursando
  Finalizado   // Curso completado
}

// Estados de Clase (Clases)
enum EstadoClase {
  Programada
  Cancelada
}

// Estados de Asistencia (Asistencia)
enum EstadoAsistencia {
  Pendiente
  Asistio
  Ausente
}

// Tipos de Producto (Catálogo)
enum TipoProducto {
  Suscripcion     // Membresía mensual
  Curso           // Curso de pago único
  RecursoDigital  // Libros, materiales (futuro)
}

// Categorías de Logro (Gamificación)
enum CategoriaLogro {
  Participacion
  Asistencia
  Desafios
  Especial
}
```

---

## Modelos de Usuarios

```prisma
// ============================================
// USUARIOS
// ============================================

// Administrador del Sistema
model Admin {
  id        Int      @id @default(autoincrement())
  nombre    String
  apellido  String
  email     String   @unique
  password  String   // Hash bcrypt
  role      String   @default("Admin")
  creadoEn  DateTime @default(now())
  actualizadoEn DateTime @updatedAt
}

// Tutor (Padre/Responsable que paga)
model Tutor {
  id        Int      @id @default(autoincrement())
  nombre    String
  apellido  String
  email     String   @unique
  password  String   // Hash bcrypt
  telefono  String?

  // Relaciones
  estudiantes Estudiante[]
  membresias  Membresia[]

  creadoEn      DateTime @default(now())
  actualizadoEn DateTime @updatedAt
}

// Estudiante (Hijo del Tutor)
model Estudiante {
  id               Int      @id @default(autoincrement())
  nombre           String
  apellido         String
  fechaNacimiento  DateTime?
  email            String?  @unique  // Opcional para login propio
  password         String?  // Hash bcrypt

  // Relaciones
  tutorId          Int
  tutor            Tutor    @relation(fields: [tutorId], references: [id])

  equipoId         Int?
  equipo           Equipo?  @relation(fields: [equipoId], references: [id])

  // Relaciones inversas
  inscripciones         Inscripcion[]
  inscripcionesCurso    InscripcionCurso[]
  puntos                Punto[]
  logros                EstudianteLogro[]
  alertas               Alerta[]

  creadoEn         DateTime @default(now())
  actualizadoEn    DateTime @updatedAt
}

// Docente (Profesor)
model Docente {
  id        Int      @id @default(autoincrement())
  nombre    String
  apellido  String
  email     String   @unique
  password  String   // Hash bcrypt
  titulo    String?  // "Profesor de Matemática"
  bio       String?  // Descripción

  // Relaciones
  clases    Clase[]
  puntos    Punto[]  // Puntos que otorgó

  creadoEn  DateTime @default(now())
  actualizadoEn DateTime @updatedAt
}
```

---

## Modelos de Catálogo y Pagos

```prisma
// ============================================
// CATÁLOGO
// ============================================

model Producto {
  id            Int          @id @default(autoincrement())
  nombre        String
  descripcion   String?
  precio        Decimal      @db.Decimal(10,2)
  tipo          TipoProducto

  // Campos específicos de Curso
  fechaInicio   DateTime?
  fechaFin      DateTime?
  cupoMaximo    Int?

  // Relaciones
  membresias           Membresia[]
  inscripcionesCurso   InscripcionCurso[]
  clases               Clase[]  // Clases vinculadas a un curso
}

// ============================================
// PAGOS
// ============================================

model Membresia {
  id               Int      @id @default(autoincrement())
  tutorId          Int
  tutor            Tutor    @relation(fields: [tutorId], references: [id])
  productoId       Int
  producto         Producto @relation(fields: [productoId], references: [id])

  estado           EstadoMembresia @default(Pendiente)
  fechaInicio      DateTime?      // Se llena cuando webhook confirma
  fechaProximoPago DateTime?      // Próximo vencimiento
  preferenciaId    String?        // ID de MercadoPago para tracking

  creadoEn         DateTime @default(now())

  @@unique([tutorId, productoId])
}

model InscripcionCurso {
  id               Int      @id @default(autoincrement())
  estudianteId     Int
  estudiante       Estudiante @relation(fields: [estudianteId], references: [id])
  productoId       Int
  producto         Producto   @relation(fields: [productoId], references: [id])

  estado           EstadoInscripcionCurso
  fechaInscripcion DateTime @default(now())

  @@unique([estudianteId, productoId])
}
```

---

## Modelos Académicos

```prisma
// ============================================
// ACADÉMICO
// ============================================

model RutaCurricular {
  id     Int      @id @default(autoincrement())
  nombre String   @unique  // "Lógica", "Álgebra", "Geometría"
  clases Clase[]
}

model Clase {
  id               Int      @id @default(autoincrement())

  rutaCurricularId Int
  rutaCurricular   RutaCurricular @relation(fields: [rutaCurricularId], references: [id])

  docenteId        Int
  docente          Docente @relation(fields: [docenteId], references: [id])

  fechaHoraInicio  DateTime
  duracionMinutos  Int
  estado           EstadoClase
  cuposMaximo      Int
  cuposOcupados    Int      @default(0)

  // Vinculación a curso (opcional)
  productoId       Int?
  producto         Producto? @relation(fields: [productoId], references: [id])

  // Relaciones
  inscripciones    Inscripcion[]
  alertas          Alerta[]
  puntos           Punto[]
}

model Inscripcion {
  id                   Int      @id @default(autoincrement())

  claseId              Int
  clase                Clase    @relation(fields: [claseId], references: [id])

  estudianteId         Int
  estudiante           Estudiante @relation(fields: [estudianteId], references: [id])

  estadoAsistencia     EstadoAsistencia @default(Pendiente)
  observacionesDocente String?

  @@unique([claseId, estudianteId])  // Un estudiante no puede reservar 2 veces la misma clase
}
```

---

## Modelos de Gamificación

```prisma
// ============================================
// GAMIFICACIÓN
// ============================================

model Equipo {
  id          Int      @id @default(autoincrement())
  nombre      String   @unique  // "Los Algoritmos", "Los Fractales"
  color       String   // Código hex: "#3B82F6"
  estudiantes Estudiante[]
}

model Punto {
  id           Int      @id @default(autoincrement())

  estudianteId Int
  estudiante   Estudiante @relation(fields: [estudianteId], references: [id])

  cantidad     Int      // Puntos otorgados (siempre positivo)
  razon        String   // "Participación activa", "Excelente trabajo"

  claseId      Int?
  clase        Clase?   @relation(fields: [claseId], references: [id])

  docenteId    Int
  docente      Docente  @relation(fields: [docenteId], references: [id])

  fecha        DateTime @default(now())

  @@index([estudianteId])
  @@index([fecha])
}

model Logro {
  id               Int      @id @default(autoincrement())
  nombre           String   @unique  // "Primer Paso", "Maestro de la Lógica"
  descripcion      String   // "Obtén tus primeros 10 puntos"
  icono            String   // Emoji o URL: "🌟", "🏆"
  puntosRequeridos Int      // Umbral para desbloquear
  categoria        CategoriaLogro

  estudiantesLogros EstudianteLogro[]
}

model EstudianteLogro {
  id             Int      @id @default(autoincrement())

  estudianteId   Int
  estudiante     Estudiante @relation(fields: [estudianteId], references: [id])

  logroId        Int
  logro          Logro    @relation(fields: [logroId], references: [id])

  fechaObtenido  DateTime @default(now())

  @@unique([estudianteId, logroId])  // Un estudiante no puede obtener el mismo logro 2 veces
}
```

---

## Modelos de Admin

```prisma
// ============================================
// ADMIN
// ============================================

model Alerta {
  id           Int      @id @default(autoincrement())

  estudianteId Int
  estudiante   Estudiante @relation(fields: [estudianteId], references: [id])

  claseId      Int
  clase        Clase    @relation(fields: [claseId], references: [id])

  descripcion  String   // Observación del docente que disparó la alerta
  fecha        DateTime @default(now())
  resuelta     Boolean  @default(false)

  @@index([resuelta])
  @@index([fecha])
}
```

---

## Resumen de Relaciones

### Relaciones One-to-Many (1:N)

| Modelo Padre | Modelo Hijo | Campo FK |
|--------------|-------------|----------|
| **Tutor** | Estudiante | tutorId |
| **Tutor** | Membresia | tutorId |
| **Equipo** | Estudiante | equipoId |
| **Producto** | Membresia | productoId |
| **Producto** | InscripcionCurso | productoId |
| **Producto** | Clase | productoId |
| **RutaCurricular** | Clase | rutaCurricularId |
| **Docente** | Clase | docenteId |
| **Docente** | Punto | docenteId |
| **Clase** | Inscripcion | claseId |
| **Clase** | Alerta | claseId |
| **Clase** | Punto | claseId |
| **Estudiante** | Inscripcion | estudianteId |
| **Estudiante** | InscripcionCurso | estudianteId |
| **Estudiante** | Punto | estudianteId |
| **Estudiante** | EstudianteLogro | estudianteId |
| **Estudiante** | Alerta | estudianteId |
| **Logro** | EstudianteLogro | logroId |

### Relaciones Many-to-Many (M:N)

Implementadas via tablas intermedias:

- **Estudiante ↔ Clase**: via `Inscripcion`
- **Estudiante ↔ Logro**: via `EstudianteLogro`
- **Estudiante ↔ Producto (Curso)**: via `InscripcionCurso`

---

## Índices y Constraints

### Unique Constraints

```prisma
// Emails únicos
Admin.email
Tutor.email
Estudiante.email
Docente.email

// Nombres únicos
Producto.nombre (recomendado)
RutaCurricular.nombre
Equipo.nombre
Logro.nombre

// Combinaciones únicas
Membresia: @@unique([tutorId, productoId])
InscripcionCurso: @@unique([estudianteId, productoId])
Inscripcion: @@unique([claseId, estudianteId])
EstudianteLogro: @@unique([estudianteId, logroId])
```

### Índices de Performance

```prisma
// Búsquedas frecuentes
Punto: @@index([estudianteId])
Punto: @@index([fecha])
Alerta: @@index([resuelta])
Alerta: @@index([fecha])
```

---

## Diagrama de Entidades (Simplificado)

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│  Tutor   │──────▶│ Estudiante  │──────▶│  Equipo  │
└──────────┘       └─────────────┘       └──────────┘
     │                    │
     │                    │
     ▼                    ▼
┌──────────┐       ┌─────────────┐
│Membresia │       │Inscripcion  │
└──────────┘       │   Curso     │
     │             └─────────────┘
     │                    │
     ▼                    ▼
┌──────────┐       ┌─────────────┐
│ Producto │◀──────│    Clase    │◀────────────┐
└──────────┘       └─────────────┘             │
                          │                     │
                          │                ┌──────────┐
                          │                │  Docente │
                          │                └──────────┘
                          ▼
                   ┌─────────────┐
                   │Inscripcion  │
                   │  (a Clase)  │
                   └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Alerta    │
                   └─────────────┘

┌──────────────────────────────────────────┐
│         GAMIFICACIÓN                     │
│                                          │
│  Estudiante ──▶ Punto ◀── Docente       │
│       │                                  │
│       └───▶ EstudianteLogro ◀── Logro   │
└──────────────────────────────────────────┘
```

---

## Comandos Útiles

```bash
# Generar Prisma Client
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones
npx prisma migrate deploy

# Ver base de datos con UI
npx prisma studio

# Resetear base de datos (⚠️ ELIMINA DATOS)
npx prisma migrate reset

# Verificar schema
npx prisma validate

# Formatear schema
npx prisma format
```

---

## Migraciones por Orden

Orden sugerido para crear migraciones (evitar dependencias rotas):

1. **Enums** (todos los enums primero)
2. **Admin** (modelo base)
3. **Tutor** (modelo base)
4. **Equipo** (para vincular con Estudiante)
5. **Estudiante** (depende de Tutor y Equipo)
6. **Docente** (modelo base)
7. **Producto** (modelo base)
8. **RutaCurricular** (para vincular con Clase)
9. **Membresia** (depende de Tutor y Producto)
10. **InscripcionCurso** (depende de Estudiante y Producto)
11. **Clase** (depende de RutaCurricular, Docente, Producto)
12. **Inscripcion** (depende de Clase y Estudiante)
13. **Logro** (modelo base)
14. **Punto** (depende de Estudiante, Docente, Clase)
15. **EstudianteLogro** (depende de Estudiante y Logro)
16. **Alerta** (depende de Estudiante y Clase)

Comando para crear migración única con todo:
```bash
npx prisma migrate dev --name initial_setup
```

---

## Notas de Implementación

### Passwords
Todos los campos `password` deben hashearse con **bcrypt** (salt rounds: 10) antes de guardar en DB.

```typescript
import * as bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(plainPassword, 10);
```

### Decimales
El campo `Producto.precio` usa `Decimal` para evitar errores de punto flotante en cálculos monetarios.

### Timestamps
Todos los modelos principales tienen `creadoEn` y `actualizadoEn` para auditoría.

### Soft Deletes
Actualmente no implementado. Si se necesita, agregar campo `deletedAt DateTime?` y filtrar en queries.

### Email Únicos Globales
Los emails son únicos **por tabla**, no globalmente. Esto permite que un Tutor y un Docente tengan el mismo email (aunque no es recomendado en producción).

---

## Testing del Schema

```bash
# 1. Crear base de datos de prueba
createdb mateatletas_test

# 2. Actualizar .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/mateatletas_test"

# 3. Migrar
npx prisma migrate dev

# 4. Ejecutar seed
npm run seed

# 5. Verificar datos
npx prisma studio
```

---

**Última actualización**: 2025-01-12
**Versión**: 1.0
**Autor**: Sistema Mateatletas
