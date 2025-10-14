# 🔗 Tutor - Análisis Exhaustivo de Conexiones

**Fecha:** 14 de Octubre de 2025
**Propósito:** Documentar TODAS las conexiones del modelo Tutor antes de implementar Slice #17 (Portal Tutor)
**Importancia:** Registro preciso para evitar romper funcionalidades durante modificaciones

---

## 📊 MODELO TUTOR - SCHEMA ACTUAL

```prisma
model Tutor {
  // Identificación
  id                        String   @id @default(cuid())
  email                     String   @unique
  password_hash             String

  // Datos personales
  nombre                    String
  apellido                  String
  dni                       String?
  telefono                  String?

  // Metadata
  fecha_registro            DateTime @default(now())
  ha_completado_onboarding  Boolean  @default(false)

  // RELACIONES (3 tablas conectadas)
  estudiantes               Estudiante[]
  membresias                Membresia[]
  inscripciones_clase       InscripcionClase[]

  // Timestamps
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@map("tutores")
}
```

---

## 🔗 CONEXIONES DIRECTAS (1:N)

### 1. Tutor → Estudiantes (1:N)

**Tabla:** `estudiantes`
**Tipo:** One-to-Many (Cascade)
**Foreign Key:** `tutor_id` en Estudiante

**Relación:**
```prisma
// En Tutor
estudiantes Estudiante[]

// En Estudiante
tutor_id String
tutor Tutor @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
```

**Comportamiento:**
- ✅ Un Tutor puede tener MUCHOS estudiantes (hijos)
- ✅ Un Estudiante pertenece a UN solo Tutor
- ⚠️ **CASCADE DELETE:** Si se elimina Tutor → Se eliminan TODOS sus estudiantes

**Uso en Backend:**
```typescript
// Obtener tutor con sus estudiantes
const tutor = await prisma.tutor.findUnique({
  where: { id: tutorId },
  include: { estudiantes: true }
});
```

**Impacto:**
- Si agregamos/eliminamos estudiante → Afecta al Tutor
- Si eliminamos Tutor → Elimina TODOS los estudiantes (y todo lo que esté conectado a ellos)

---

### 2. Tutor → Membresías (1:N)

**Tabla:** `membresias`
**Tipo:** One-to-Many (Cascade)
**Foreign Key:** `tutor_id` en Membresia

**Relación:**
```prisma
// En Tutor
membresias Membresia[]

// En Membresia
tutor_id String
tutor Tutor @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
estado EstadoMembresia @default(Pendiente)
fecha_inicio DateTime?
fecha_proximo_pago DateTime?
producto_id String
preferencia_id String?
```

**Estados de Membresía:**
```typescript
enum EstadoMembresia {
  Pendiente   // Pago iniciado, esperando webhook
  Activa      // Pago confirmado
  Atrasada    // Pago vencido
  Cancelada   // Cancelada manualmente
}
```

**Comportamiento:**
- ✅ Un Tutor puede tener VARIAS membresías a lo largo del tiempo
- ✅ Una Membresía pertenece a UN solo Tutor
- ⚠️ **CASCADE DELETE:** Si se elimina Tutor → Se eliminan todas sus membresías

**Uso en Backend:**
```typescript
// Obtener membresía activa del tutor
const membresiaActiva = await prisma.membresia.findFirst({
  where: {
    tutor_id: tutorId,
    estado: 'Activa'
  },
  include: { producto: true }
});
```

**Impacto:**
- Control de acceso del Tutor a funcionalidades premium
- Si membresía vence → Tutor pierde acceso a ciertas features
- Conexión con Pagos (MercadoPago)

---

### 3. Tutor → InscripcionesClase (1:N)

**Tabla:** `inscripciones_clase`
**Tipo:** One-to-Many
**Foreign Key:** `tutor_id` en InscripcionClase

**Relación:**
```prisma
// En Tutor
inscripciones_clase InscripcionClase[]

// En InscripcionClase
tutor_id String
tutor Tutor @relation(fields: [tutor_id], references: [id])
clase_id String
estudiante_id String
fecha_inscripcion DateTime @default(now())
observaciones String?
```

**Comportamiento:**
- ✅ Un Tutor puede hacer MUCHAS reservas de clases
- ✅ Cada reserva es para UNO de sus estudiantes
- ✅ La reserva vincula: Tutor + Estudiante + Clase
- ❌ **NO CASCADE:** Si se elimina Tutor → Se mantienen inscripciones (validar)

**Uso en Backend:**
```typescript
// Crear inscripción a clase (hecha por tutor)
const inscripcion = await prisma.inscripcionClase.create({
  data: {
    clase_id: claseId,
    estudiante_id: estudianteId,
    tutor_id: tutorId,  // El tutor que hizo la reserva
    fecha_inscripcion: new Date()
  }
});
```

**Constraint:**
```prisma
@@unique([clase_id, estudiante_id])
```
- Un estudiante NO puede reservar la misma clase 2 veces

**Impacto:**
- Tutor gestiona calendario de clases de sus hijos
- Si Tutor reserva clase → Se ocupa 1 cupo
- Si Tutor cancela → Se libera cupo

---

## 🔗 CONEXIONES INDIRECTAS (A través de Estudiante)

### 4. Tutor → Equipos (1:N → 1:1)

**Path:** Tutor → Estudiante → Equipo

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (1) Equipo
```

**Schema:**
```prisma
// En Estudiante
equipo_id String?
equipo Equipo? @relation(fields: [equipo_id], references: [id], onDelete: SetNull)
```

**Comportamiento:**
- El Tutor NO tiene relación directa con Equipos
- Cada estudiante del Tutor puede estar en un Equipo
- Si se elimina Equipo → `equipo_id` se pone NULL en estudiante

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver equipos de sus estudiantes
const tutor = await prisma.tutor.findUnique({
  where: { id: tutorId },
  include: {
    estudiantes: {
      include: { equipo: true }
    }
  }
});

// tutor.estudiantes[0].equipo.nombre → "ASTROS"
```

**Impacto:**
- Tutor puede ver gamificación de sus hijos
- No puede cambiar equipo directamente (lo hace Admin)

---

### 5. Tutor → InscripcionesCurso (1:N → 1:N)

**Path:** Tutor → Estudiante → InscripcionCurso → Producto (Curso)

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) InscripcionCurso (N) → (1) Producto
```

**Schema:**
```prisma
// En Estudiante
inscripciones_curso InscripcionCurso[]

// En InscripcionCurso
estudiante_id String
producto_id String
estado EstadoInscripcionCurso @default(PreInscrito)
fecha_inscripcion DateTime @default(now())
preferencia_id String?
```

**Estados:**
```typescript
enum EstadoInscripcionCurso {
  PreInscrito  // Inscrito antes del inicio
  Activo       // Curso en progreso
  Finalizado   // Curso completado
}
```

**Comportamiento:**
- El Tutor compra cursos para sus estudiantes
- El pago lo hace el Tutor (con su cuenta de MercadoPago)
- La inscripción se asigna al Estudiante

**Uso en Backend:**
```typescript
// Tutor compra curso para su hijo
const inscripcion = await prisma.inscripcionCurso.create({
  data: {
    estudiante_id: estudianteId,
    producto_id: cursoId,
    estado: 'PreInscrito',
    preferencia_id: mercadoPagoPreferenceId
  }
});
```

**Constraint:**
```prisma
@@unique([estudiante_id, producto_id])
```
- Un estudiante NO puede inscribirse 2 veces al mismo curso

**Impacto:**
- Tutor controla qué cursos compra
- Estudiante ve cursos en su portal
- Conexión con Pagos

---

### 6. Tutor → Asistencias (1:N → 1:N → 1:N)

**Path:** Tutor → Estudiante → Asistencia → Clase

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) Asistencia (N) → (1) Clase
```

**Schema:**
```prisma
// En Estudiante
asistencias Asistencia[]

// En Asistencia
estudiante_id String
clase_id String
estado EstadoAsistencia
observaciones String?
puntos_otorgados Int @default(0)
```

**Estados:**
```typescript
enum EstadoAsistencia {
  Presente     // Estudiante asistió
  Ausente      // No asistió
  Justificado  // Ausencia justificada
}
```

**Comportamiento:**
- El Tutor NO registra asistencia (lo hace Docente)
- El Tutor VE asistencia de sus estudiantes
- Puede ver observaciones del docente

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver asistencias de sus hijos
const estudiante = await prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    asistencias: {
      include: { clase: true },
      orderBy: { fecha_registro: 'desc' }
    }
  }
});
```

**Impacto:**
- Tutor monitorea asistencia de sus hijos
- Ve feedback de docentes
- Ve puntos ganados en clases

---

### 7. Tutor → Alertas (1:N → 1:N → 1:N)

**Path:** Tutor → Estudiante → Alerta → Clase

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) Alerta (N) → (1) Clase
```

**Schema:**
```prisma
// En Estudiante
alertas Alerta[]

// En Alerta
estudiante_id String
clase_id String
descripcion String
fecha DateTime @default(now())
resuelta Boolean @default(false)
```

**Comportamiento:**
- Las Alertas las crea Admin o Docente
- El Tutor DEBE VER alertas de sus estudiantes
- Son notificaciones importantes (problemas de conducta, bajo rendimiento, etc.)

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver alertas abiertas
const alertasAbiertas = await prisma.alerta.findMany({
  where: {
    estudiante: {
      tutor_id: tutorId
    },
    resuelta: false
  },
  include: {
    estudiante: true,
    clase: true
  },
  orderBy: { fecha: 'desc' }
});
```

**Impacto:**
- CRÍTICO para comunicación Docente → Tutor
- Tutor debe recibir notificaciones de alertas nuevas
- Puede comentar o responder (feature futura)

---

### 8. Tutor → PuntosObtenidos (1:N → 1:N → 1:N)

**Path:** Tutor → Estudiante → PuntoObtenido → AccionPuntuable

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) PuntoObtenido (N) → (1) AccionPuntuable
```

**Schema:**
```prisma
// En Estudiante
puntosObtenidos PuntoObtenido[]
puntos_totales Int @default(0)  // Suma acumulada

// En PuntoObtenido
estudiante_id String
docente_id String
accion_id String
clase_id String?
puntos Int
contexto String?
fecha_otorgado DateTime @default(now())
```

**Comportamiento:**
- Docente otorga puntos a estudiante en clase
- Se suma a `puntos_totales` del estudiante
- Se suma a `puntos_totales` del equipo (si tiene equipo)

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver historial de puntos de sus hijos
const estudiante = await prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    puntosObtenidos: {
      include: {
        accion: true,
        docente: true,
        clase: true
      },
      orderBy: { fecha_otorgado: 'desc' },
      take: 10  // Últimos 10 puntos
    }
  }
});
```

**Impacto:**
- Tutor ve progreso gamificado de sus hijos
- Motivación para estudiantes
- Transparencia del sistema de puntos

---

### 9. Tutor → LogrosDesbloqueados (1:N → 1:N → 1:N)

**Path:** Tutor → Estudiante → LogroDesbloqueado → Logro

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) LogroDesbloqueado (N) → (1) Logro
```

**Schema:**
```prisma
// En Estudiante
logrosDesbloqueados LogroDesbloqueado[]

// En LogroDesbloqueado
estudiante_id String
logro_id String
docente_id String?
fecha_obtenido DateTime @default(now())
contexto String?
```

**Constraint:**
```prisma
@@unique([estudiante_id, logro_id])
```
- Un estudiante solo puede desbloquear un logro UNA vez

**Comportamiento:**
- Estudiante desbloquea logros automáticamente o por docente
- Se muestran en perfil del estudiante
- Otorgan puntos extra

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver logros de sus hijos
const estudiante = await prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    logrosDesbloqueados: {
      include: { logro: true },
      orderBy: { fecha_obtenido: 'desc' }
    }
  }
});
```

**Impacto:**
- Tutor ve achievements de sus hijos
- Gamificación visible y motivadora

---

### 10. Tutor → ProgresoLecciones (1:N → 1:N → 1:N → 1:N)

**Path:** Tutor → Estudiante → ProgresoLeccion → Leccion → Modulo → Producto

**Relación:**
```
Tutor (1) → (N) Estudiante (N) → (N) ProgresoLeccion (N) → (1) Leccion (N) → (1) Modulo (N) → (1) Producto
```

**Schema:**
```prisma
// En Estudiante
progresoLecciones ProgresoLeccion[]

// En ProgresoLeccion
estudiante_id String
leccion_id String
completada Boolean @default(false)
progreso Int @default(0)  // 0-100%
fecha_inicio DateTime @default(now())
fecha_completada DateTime?
tiempo_invertido_minutos Int?
calificacion Int?
intentos Int @default(0)
notas_estudiante String?
ultima_respuesta String?
```

**Constraint:**
```prisma
@@unique([estudiante_id, leccion_id])
```
- Un estudiante solo tiene UN progreso por lección

**Comportamiento:**
- Estudiante avanza en cursos asincrónicos
- El Tutor VE el progreso pero NO lo controla
- Tracking granular de aprendizaje

**Uso en Frontend:**
```typescript
// Dashboard Tutor: Ver progreso de curso de su hijo
const progresoCurso = await prisma.progresoLeccion.findMany({
  where: {
    estudiante_id: estudianteId,
    leccion: {
      modulo: {
        producto_id: cursoId
      }
    }
  },
  include: {
    leccion: {
      include: { modulo: true }
    }
  }
});

// Calcular % completado del curso
const totalLecciones = ...;
const leccionesCompletadas = progresoCurso.filter(p => p.completada).length;
const porcentaje = (leccionesCompletadas / totalLecciones) * 100;
```

**Impacto:**
- CRÍTICO para dashboard del Tutor
- Muestra ROI del dinero invertido
- Transparencia del aprendizaje

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### JWT Payload

```typescript
interface JWTPayload {
  sub: string;        // Tutor.id
  email: string;      // Tutor.email
  role: 'tutor';      // Rol fijo
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

### Guards

**Backend:**
```typescript
// Auth Guard (verifica JWT)
@UseGuards(JwtAuthGuard)

// Roles Guard (verifica role = 'tutor')
@Roles(Role.Tutor)
@UseGuards(JwtAuthGuard, RolesGuard)
```

**Endpoints que usa Tutor:**
```
POST   /auth/login                    // Login
POST   /auth/register                 // Registro
GET    /auth/me                       // Perfil

GET    /estudiantes                   // Sus estudiantes
POST   /estudiantes                   // Crear estudiante
GET    /estudiantes/:id               // Ver estudiante
PATCH  /estudiantes/:id               // Editar estudiante

GET    /clases                        // Ver clases disponibles
POST   /clases/:id/inscribir          // Inscribir estudiante

GET    /pagos/suscripciones           // Ver suscripciones
POST   /pagos/suscripcion             // Comprar suscripción
POST   /pagos/curso                   // Comprar curso

GET    /equipos                       // Ver equipos
GET    /equipos/:id/ranking           // Ver ranking

GET    /cursos                        // Ver catálogo cursos
GET    /cursos/:id                    // Ver detalle curso
```

---

## 📊 QUERIES CRÍTICOS PARA PORTAL TUTOR

### 1. Dashboard Principal

```typescript
// Obtener tutor completo con estadísticas
const dashboardData = await prisma.tutor.findUnique({
  where: { id: tutorId },
  include: {
    estudiantes: {
      include: {
        equipo: true,
        asistencias: {
          where: { estado: 'Presente' },
          take: 5,
          orderBy: { fecha_registro: 'desc' }
        },
        alertas: {
          where: { resuelta: false }
        },
        logrosDesbloqueados: {
          include: { logro: true },
          take: 3,
          orderBy: { fecha_obtenido: 'desc' }
        }
      }
    },
    membresias: {
      where: { estado: 'Activa' },
      include: { producto: true }
    },
    inscripciones_clase: {
      include: {
        clase: {
          include: {
            rutaCurricular: true,
            docente: true
          }
        },
        estudiante: true
      },
      where: {
        clase: {
          fecha_hora_inicio: { gte: new Date() }
        }
      },
      orderBy: {
        clase: { fecha_hora_inicio: 'asc' }
      },
      take: 5
    }
  }
});
```

**Datos obtenidos:**
- Lista de estudiantes con sus equipos
- Asistencias recientes
- Alertas abiertas
- Logros recientes
- Membresía activa
- Próximas clases reservadas

---

### 2. Perfil de Estudiante (Vista Detallada)

```typescript
// Ver todo el progreso de un estudiante específico
const estudianteDetalle = await prisma.estudiante.findUnique({
  where: { id: estudianteId },
  include: {
    tutor: {
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true
      }
    },
    equipo: true,
    inscripciones_curso: {
      include: { producto: true }
    },
    inscripciones_clase: {
      include: {
        clase: {
          include: {
            rutaCurricular: true,
            docente: true
          }
        }
      },
      orderBy: {
        clase: { fecha_hora_inicio: 'desc' }
      }
    },
    asistencias: {
      include: {
        clase: {
          include: { rutaCurricular: true }
        }
      },
      orderBy: { fecha_registro: 'desc' },
      take: 10
    },
    alertas: {
      include: { clase: true },
      orderBy: { fecha: 'desc' }
    },
    puntosObtenidos: {
      include: {
        accion: true,
        docente: true,
        clase: true
      },
      orderBy: { fecha_otorgado: 'desc' },
      take: 20
    },
    logrosDesbloqueados: {
      include: { logro: true },
      orderBy: { fecha_obtenido: 'desc' }
    },
    progresoLecciones: {
      include: {
        leccion: {
          include: {
            modulo: {
              include: { producto: true }
            }
          }
        }
      },
      where: { completada: true }
    }
  }
});
```

**Datos obtenidos:**
- Perfil completo del estudiante
- Cursos inscritos
- Historial de clases
- Asistencias (últimas 10)
- Alertas (todas)
- Puntos ganados (últimos 20)
- Logros desbloqueados
- Lecciones completadas

---

### 3. Calendario de Clases

```typescript
// Ver clases disponibles + clases reservadas
const calendario = {
  clasesDisponibles: await prisma.clase.findMany({
    where: {
      fecha_hora_inicio: { gte: new Date() },
      estado: 'Programada',
      cupos_ocupados: { lt: prisma.clase.fields.cupos_maximo }
    },
    include: {
      rutaCurricular: true,
      docente: true
    },
    orderBy: { fecha_hora_inicio: 'asc' }
  }),

  clasesReservadas: await prisma.inscripcionClase.findMany({
    where: {
      tutor_id: tutorId,
      clase: {
        fecha_hora_inicio: { gte: new Date() }
      }
    },
    include: {
      clase: {
        include: {
          rutaCurricular: true,
          docente: true
        }
      },
      estudiante: true
    },
    orderBy: {
      clase: { fecha_hora_inicio: 'asc' }
    }
  })
};
```

---

### 4. Historial de Pagos

```typescript
// Ver todas las membresías y compras
const historialPagos = {
  membresias: await prisma.membresia.findMany({
    where: { tutor_id: tutorId },
    include: { producto: true },
    orderBy: { fecha_inicio: 'desc' }
  }),

  cursos: await prisma.inscripcionCurso.findMany({
    where: {
      estudiante: {
        tutor_id: tutorId
      }
    },
    include: {
      producto: true,
      estudiante: true
    },
    orderBy: { fecha_inscripcion: 'desc' }
  })
};
```

---

## ⚠️ REGLAS DE NEGOCIO CRÍTICAS

### 1. Control de Acceso por Membresía

```typescript
// Verificar si tutor tiene membresía activa
const tieneMembresiaActiva = async (tutorId: string): Promise<boolean> => {
  const membresia = await prisma.membresia.findFirst({
    where: {
      tutor_id: tutorId,
      estado: 'Activa',
      fecha_proximo_pago: { gte: new Date() }
    }
  });

  return !!membresia;
};

// REGLA: Solo con membresía activa puede:
// - Inscribir estudiantes a clases de suscripción
// - Acceder a contenido premium
// - Ver reportes detallados
```

### 2. Límite de Estudiantes

```typescript
// Verificar límite de estudiantes por tutor (si aplicara)
const LIMITE_ESTUDIANTES_POR_TUTOR = 5;  // Ejemplo

const puedeAgregarEstudiante = async (tutorId: string): Promise<boolean> => {
  const count = await prisma.estudiante.count({
    where: { tutor_id: tutorId }
  });

  return count < LIMITE_ESTUDIANTES_POR_TUTOR;
};
```

### 3. Validación de Inscripción a Clase

```typescript
// Validar que tutor puede inscribir estudiante a clase
const validarInscripcionClase = async (
  tutorId: string,
  estudianteId: string,
  claseId: string
): Promise<{ valido: boolean; error?: string }> => {

  // 1. Verificar que estudiante pertenece al tutor
  const estudiante = await prisma.estudiante.findUnique({
    where: { id: estudianteId }
  });

  if (estudiante.tutor_id !== tutorId) {
    return { valido: false, error: 'El estudiante no pertenece a este tutor' };
  }

  // 2. Verificar que clase existe y está disponible
  const clase = await prisma.clase.findUnique({
    where: { id: claseId }
  });

  if (!clase) {
    return { valido: false, error: 'Clase no encontrada' };
  }

  if (clase.estado !== 'Programada') {
    return { valido: false, error: 'Clase cancelada' };
  }

  if (clase.cupos_ocupados >= clase.cupos_maximo) {
    return { valido: false, error: 'Clase llena' };
  }

  // 3. Verificar que no esté ya inscrito
  const yaInscrito = await prisma.inscripcionClase.findUnique({
    where: {
      clase_id_estudiante_id: {
        clase_id: claseId,
        estudiante_id: estudianteId
      }
    }
  });

  if (yaInscrito) {
    return { valido: false, error: 'Estudiante ya inscrito a esta clase' };
  }

  // 4. Si clase es de curso específico, verificar inscripción al curso
  if (clase.producto_id) {
    const inscripcionCurso = await prisma.inscripcionCurso.findFirst({
      where: {
        estudiante_id: estudianteId,
        producto_id: clase.producto_id,
        estado: 'Activo'
      }
    });

    if (!inscripcionCurso) {
      return { valido: false, error: 'Estudiante no inscrito al curso' };
    }
  }

  return { valido: true };
};
```

---

## 🚨 PUNTOS CRÍTICOS PARA IMPLEMENTACIÓN

### 1. CASCADE DELETES

⚠️ **PELIGRO:** Si se elimina un Tutor, se eliminan EN CASCADA:
- Todos sus Estudiantes
- Todas las Membresías
- Por cascada de Estudiante:
  - Todas las InscripcionesClase
  - Todas las InscripcionesCurso
  - Todas las Asistencias
  - Todas las Alertas
  - Todos los PuntosObtenidos
  - Todos los LogrosDesbloqueados
  - Todos los ProgresoLecciones

**SOLUCIÓN:** Implementar soft delete o confirmación doble antes de eliminar Tutor.

---

### 2. Índices Necesarios

```sql
-- Ya existen en schema:
CREATE INDEX idx_membresia_tutor_estado ON membresias(tutor_id, estado);
CREATE INDEX idx_membresia_preferencia ON membresias(preferencia_id);
CREATE INDEX idx_inscripcion_clase_tutor ON inscripciones_clase(tutor_id);
CREATE INDEX idx_inscripcion_clase_estudiante ON inscripciones_clase(estudiante_id);
```

---

### 3. Transacciones Críticas

```typescript
// Al inscribir a clase, actualizar cupos en transacción
const inscribirAClase = async (tutorId, estudianteId, claseId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Crear inscripción
    const inscripcion = await tx.inscripcionClase.create({
      data: {
        tutor_id: tutorId,
        estudiante_id: estudianteId,
        clase_id: claseId
      }
    });

    // 2. Incrementar cupos_ocupados
    await tx.clase.update({
      where: { id: claseId },
      data: {
        cupos_ocupados: { increment: 1 }
      }
    });

    return inscripcion;
  });
};

// Al cancelar inscripción
const cancelarInscripcion = async (inscripcionId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener inscripción
    const inscripcion = await tx.inscripcionClase.findUnique({
      where: { id: inscripcionId }
    });

    // 2. Eliminar inscripción
    await tx.inscripcionClase.delete({
      where: { id: inscripcionId }
    });

    // 3. Decrementar cupos_ocupados
    await tx.clase.update({
      where: { id: inscripcion.clase_id },
      data: {
        cupos_ocupados: { decrement: 1 }
      }
    });
  });
};
```

---

## 📋 CHECKLIST ANTES DE MODIFICAR

Antes de hacer CUALQUIER cambio relacionado con Tutor:

- [ ] ¿Afecta a Estudiante? (relación más crítica)
- [ ] ¿Afecta a Membresías? (control de acceso)
- [ ] ¿Afecta a InscripcionesClase? (cupos y calendarios)
- [ ] ¿Requiere migración de Prisma?
- [ ] ¿Rompe queries existentes?
- [ ] ¿Afecta autenticación/autorización?
- [ ] ¿Requiere actualizar seeds?
- [ ] ¿Requiere actualizar tests?

---

## 📝 NOTAS FINALES

**Complejidad de Conexiones:**
- **Directas:** 3 tablas (Estudiante, Membresia, InscripcionClase)
- **Indirectas:** 10+ tablas (a través de Estudiante)
- **Total afectado:** ~15 tablas

**Modelo Tutor es CRÍTICO:**
- Es el cliente principal (B2C)
- Maneja el dinero (pagos)
- Gestiona a los usuarios finales (estudiantes)
- Punto central de la experiencia

**Recomendación:**
Cualquier cambio debe ser:
1. Documentado aquí ANTES de implementar
2. Testeado exhaustivamente
3. Con rollback plan claro

---

**Última actualización:** 14 de Octubre de 2025
**Estado:** COMPLETO Y PRECISO
