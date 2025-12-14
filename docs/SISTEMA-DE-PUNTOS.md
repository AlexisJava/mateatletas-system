# Sistema de Puntos - Mateatletas

> Documentación completa del sistema de gamificación, recursos y recompensas.

---

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Tipos de Recursos](#tipos-de-recursos)
3. [Sistema de XP y Niveles](#sistema-de-xp-y-niveles)
4. [Sistema de Monedas](#sistema-de-monedas)
5. [Puntos por Clases (Docentes)](#puntos-por-clases-docentes)
6. [Sistema de Logros](#sistema-de-logros)
7. [Sistema de Rachas](#sistema-de-rachas)
8. [Tienda Virtual](#tienda-virtual)
9. [Puntos para Padres](#puntos-para-padres)
10. [Puntos por Casa](#puntos-por-casa)
11. [Flujos de Obtención](#flujos-de-obtencion)
12. [Servicios y APIs](#servicios-y-apis)
13. [Modelos de Datos](#modelos-de-datos)

---

## Arquitectura General

El sistema de puntos de Mateatletas tiene **múltiples dimensiones** que trabajan en conjunto:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE GAMIFICACIÓN                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │     XP      │    │  MONEDAS    │    │   PUNTOS    │        │
│   │  (Niveles)  │    │  (Tienda)   │    │  (Docentes) │        │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│          │                  │                  │                │
│          └──────────┬───────┴──────────────────┘                │
│                     │                                           │
│              ┌──────▼──────┐                                    │
│              │   LOGROS    │                                    │
│              │ (67 tipos)  │                                    │
│              └──────┬──────┘                                    │
│                     │                                           │
│   ┌─────────────────┼─────────────────┐                        │
│   │                 │                 │                        │
│   ▼                 ▼                 ▼                        │
│ ┌─────┐       ┌─────────┐       ┌─────────┐                    │
│ │RACHA│       │ TIENDA  │       │  CASAS  │                    │
│ │ 🔥  │       │   🛒    │       │Quantum  │                    │
│ └─────┘       └─────────┘       │Vertex   │                    │
│                                 │Pulsar   │                    │
│                                 └─────────┘                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                   PUNTOS PADRES (separado)                      │
│              Pagos puntuales → Premios canjeables               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tipos de Recursos

### Recursos del Estudiante

El sistema usa **2 tipos de recursos** (simplificado de 3):

| Recurso     | Símbolo | Propósito            | Cómo se obtiene                 |
| ----------- | ------- | -------------------- | ------------------------------- |
| **XP**      | ⭐      | Progresión y niveles | Ejercicios, logros, actividades |
| **Monedas** | 🪙      | Compras en tienda    | Logros, rachas, clases          |

> **Nota**: Las "Gemas" fueron eliminadas del MVP para simplificar el sistema.

### Modelo de Datos: `RecursosEstudiante`

```prisma
model RecursosEstudiante {
  id                   String   @id @default(cuid())
  estudiante_id        String   @unique
  xp_total            Int      @default(0)
  monedas_total       Int      @default(0)
  ultima_actualizacion DateTime @updatedAt

  estudiante    Estudiante           @relation(...)
  transacciones TransaccionRecurso[]
  compras       CompraItem[]
}
```

---

## Sistema de XP y Niveles

### Fórmula de Niveles

```typescript
// Calcular nivel basado en XP
calcularNivel(xp_total: number): number {
  return Math.floor(Math.sqrt(xp_total / 100)) + 1;
}

// XP requerido para un nivel específico
xpParaNivel(nivel: number): number {
  return Math.pow(nivel - 1, 2) * 100;
}
```

### Tabla de Niveles

| Nivel | XP Mínimo | XP Máximo | XP para siguiente |
| ----- | --------- | --------- | ----------------- |
| 1     | 0         | 99        | 100               |
| 2     | 100       | 399       | 400               |
| 3     | 400       | 899       | 900               |
| 4     | 900       | 1,599     | 1,600             |
| 5     | 1,600     | 2,499     | 2,500             |
| 6     | 2,500     | 3,599     | 3,600             |
| 7     | 3,600     | 4,899     | 4,900             |
| 8     | 4,900     | 6,399     | 6,400             |
| 9     | 6,400     | 8,099     | 8,100             |
| 10    | 8,100     | 9,999     | 10,000            |
| 15    | 19,600    | 22,499    | 22,500            |

### Cálculo de Progreso

```typescript
// Obtener progreso detallado del nivel
async obtenerRecursosConNivel(estudianteId: string) {
  const recursos = await this.obtenerRecursos(estudianteId);
  const nivel = this.calcularNivel(recursos.xp_total);
  const xpParaSiguienteNivel = this.xpParaNivel(nivel + 1);
  const xpNivelActual = this.xpParaNivel(nivel);
  const xpProgreso = recursos.xp_total - xpNivelActual;
  const xpNecesario = xpParaSiguienteNivel - xpNivelActual;

  return {
    ...recursos,
    nivel,
    xp_progreso: xpProgreso,
    xp_necesario: xpNecesario,
    porcentaje_nivel: Math.floor((xpProgreso / xpNecesario) * 100),
  };
}
```

### Configuración de Niveles (Base de Datos)

```prisma
model NivelConfig {
  nivel          Int      @id       // Número del nivel
  nombre         String             // "Explorador Numérico"
  descripcion    String             // Descripción del nivel
  puntos_minimos Int                // XP mínimo requerido
  puntos_maximos Int                // XP máximo antes de subir
  color          String   @default("#6366F1")  // Color UI
  icono          String   @default("🌟")       // Emoji/icono
}
```

---

## Sistema de Monedas

### Obtención de Monedas

| Fuente           | Monedas  | Frecuencia |
| ---------------- | -------- | ---------- |
| Logro Común      | 5-30     | Por logro  |
| Logro Raro       | 50-200   | Por logro  |
| Logro Épico      | 200-600  | Por logro  |
| Logro Legendario | 500-2000 | Por logro  |
| Racha 7 días     | 50       | Semanal    |
| Racha 30 días    | 200      | Mensual    |

### Uso de Monedas

- **Tienda Virtual**: Comprar avatares, skins, accesorios
- **Power-ups**: Comprar multiplicadores temporales
- **Cosméticos**: Efectos visuales, marcos, fondos

### Operaciones con Monedas

```typescript
// Agregar monedas
async agregarMonedas(
  estudianteId: string,
  cantidad: number,
  razon: string,
  metadata?: Prisma.InputJsonValue
) {
  // 1. Obtener recursos actuales
  // 2. Actualizar total
  // 3. Registrar transacción
}

// Gastar monedas
async gastarMonedas(
  estudianteId: string,
  cantidad: number,
  razon: string,
  metadata?: Prisma.InputJsonValue
) {
  // Validar saldo suficiente
  // Descontar y registrar
}
```

---

## Puntos por Clases (Docentes)

### Sistema de Puntos Docente → Estudiante

Los docentes pueden otorgar puntos directamente a estudiantes durante las clases.

### Acciones Puntuables (8 predefinidas)

| Acción                   | Puntos | Descripción                               |
| ------------------------ | ------ | ----------------------------------------- |
| Asistencia a clase       | 10     | Asistió puntualmente                      |
| Participación activa     | 15     | Respondió preguntas, hizo consultas       |
| Ejercicios completados   | 20     | Completó todos los ejercicios             |
| Ayudó a un compañero     | 25     | Explicó conceptos a otro estudiante       |
| Excelencia en ejercicios | 30     | Sin errores, forma destacada              |
| Mejora destacada         | 35     | Mejora significativa vs clases anteriores |
| Desafío superado         | 40     | Completó desafío adicional                |
| Racha semanal            | 50     | Asistió a todas las clases de la semana   |

### Modelo: `AccionPuntuable`

```prisma
model AccionPuntuable {
  id          String  @id @default(cuid())
  nombre      String  @unique    // "Asistencia a clase"
  descripcion String             // Descripción detallada
  puntos      Int                // 10, 15, 20, etc.
  activo      Boolean @default(true)

  puntosObtenidos PuntoObtenido[]
}
```

### Modelo: `PuntoObtenido`

```prisma
model PuntoObtenido {
  id             String   @id @default(cuid())
  estudiante_id  String              // Quien recibe
  docente_id     String              // Quien otorga
  accion_id      String              // Qué acción
  clase_id       String?             // En qué clase (opcional)
  puntos         Int                 // Cantidad otorgada
  contexto       String?             // Razón adicional
  fecha_otorgado DateTime @default(now())

  accion     AccionPuntuable @relation(...)
  clase      Clase?          @relation(...)
  docente    Docente         @relation(...)
  estudiante Estudiante      @relation(...)
}
```

### Flujo de Otorgamiento

```typescript
async otorgarPuntos(
  docenteId: string,
  estudianteId: string,
  accionId: string,
  claseId?: string,
  contexto?: string,
) {
  // 1. Validar acción existe y activa
  // 2. Validar estudiante existe
  // 3. Validar docente existe
  // 4. Si hay clase, validar inscripción
  // 5. TRANSACCIÓN ATÓMICA:
  //    - Crear PuntoObtenido
  //    - Incrementar puntos_totales del estudiante
  // 6. Retornar resultado
}
```

> **Seguridad**: El otorgamiento usa transacciones para garantizar atomicidad.

---

## Sistema de Logros

### Estructura de Logros (73 totales)

Los logros están organizados en **10 categorías**:

| Categoría              | Cantidad | Descripción                   |
| ---------------------- | -------- | ----------------------------- |
| **Consistencia**       | 10       | Rachas y días activos         |
| **Maestría**           | 12       | Temas y módulos completados   |
| **Precisión**          | 8        | Ejercicios perfectos          |
| **Velocidad**          | 6        | Ejercicios rápidos            |
| **Social**             | 8        | Ayuda y referidos             |
| **Asistencia**         | 6        | Clases asistidas              |
| **Desafíos Semanales** | 5        | Logros por día/horario        |
| **Especialización**    | 4        | Maestría en temas específicos |
| **Niveles**            | 4        | Alcanzar niveles              |
| **Secretos**           | 10       | Logros ocultos                |

### Distribución por Rareza

| Rareza         | Cantidad | % del total | Monedas  | XP        |
| -------------- | -------- | ----------- | -------- | --------- |
| **Común**      | ~20      | 27%         | 5-50     | 10-100    |
| **Raro**       | ~25      | 34%         | 50-300   | 100-1000  |
| **Épico**      | ~18      | 25%         | 200-1000 | 500-3000  |
| **Legendario** | ~10      | 14%         | 500-2000 | 1000-5000 |

### Ejemplos de Logros por Categoría

#### Consistencia (Rachas)

```javascript
{ codigo: 'primer_paso', nombre: 'Primer Paso',
  criterio: 'ejercicios_completados >= 1', monedas: 10, xp: 20, rareza: 'comun' }

{ codigo: 'racha_fuego', nombre: 'Racha de Fuego',
  criterio: 'racha_dias >= 7', monedas: 50, xp: 100, rareza: 'raro' }

{ codigo: 'leyenda_viviente', nombre: 'Leyenda Viviente',
  criterio: 'racha_dias >= 90', monedas: 800, xp: 2000, rareza: 'legendario' }
```

#### Maestría

```javascript
{ codigo: 'maestro_algebra', nombre: 'Maestro del Álgebra',
  criterio: 'modulo_completado = algebra', monedas: 300, xp: 1000, rareza: 'raro' }

{ codigo: 'enciclopedia_viviente', nombre: 'Enciclopedia Viviente',
  criterio: 'todos_modulos_grado = 100%', monedas: 2000, xp: 5000, rareza: 'legendario' }
```

#### Secretos

```javascript
{ codigo: 'error_404', nombre: 'Error 404',
  criterio: 'error_ejercicio_facil >= 1', monedas: 50, xp: 100,
  secreto: true, mensaje: 'Hasta los genios se equivocan 😉' }

{ codigo: 'buho_astronomico', nombre: 'Búho Astronómico',
  criterio: '20 ejercicios entre 20:00-23:00', monedas: 300, xp: 500,
  secreto: true, titulo: 'Búho Nocturno' }
```

### Modelo: `Logro`

```prisma
model Logro {
  id                 String  @id @default(cuid())
  codigo             String  @unique   // "racha_7_dias"
  nombre             String            // "Racha de Fuego"
  descripcion        String
  categoria          String            // "consistencia", "maestria", etc.

  // Recompensas
  monedas_recompensa Int
  xp_recompensa      Int

  // Criterios de desbloqueo
  criterio_tipo      String  // "racha_dias", "temas_completados"
  criterio_valor     String  // JSON con valores

  // Metadata visual
  icono              String  // "🔥🔥🔥"
  rareza             String  // "comun", "raro", "epico", "legendario"
  secreto            Boolean @default(false)
  animacion          String? // "aura_fuego", "explosion_mental"
  titulo             String? // Título que otorga al perfil
  badge              String? // Badge visual
  mensaje_desbloqueo String? // Mensaje especial
  extras             Json?   // ["Avatar con llamas", "Hall of Fame"]

  orden              Int     @default(0)
  activo             Boolean @default(true)
}
```

### Modelo: `LogroEstudiante`

```prisma
model LogroEstudiante {
  id               String   @id @default(cuid())
  estudiante_id    String
  logro_id         String
  fecha_desbloqueo DateTime @default(now())
  visto            Boolean  @default(false)  // Para notificaciones

  @@unique([estudiante_id, logro_id])
}
```

### Flujo de Desbloqueo

```typescript
async desbloquearLogro(estudianteId: string, codigoLogro: string) {
  // 1. Buscar logro por código
  // 2. Verificar si ya desbloqueado
  // 3. Crear LogroEstudiante
  // 4. Otorgar monedas de recompensa
  // 5. Otorgar XP de recompensa
  // 6. Detectar si subió de nivel
  // 7. Retornar resultado con animación
}
```

---

## Sistema de Rachas

### Modelo: `RachaEstudiante`

```prisma
model RachaEstudiante {
  id              String   @id @default(cuid())
  estudiante_id   String   @unique
  racha_actual    Int      @default(0)   // Días consecutivos actuales
  racha_maxima    Int      @default(0)   // Récord histórico
  ultimo_dia      DateTime?              // Última actividad

  estudiante Estudiante @relation(...)
}
```

### Reglas de Racha

1. **Incremento**: +1 día si hay actividad y el `ultimo_dia` fue ayer
2. **Reset**: Racha = 0 si pasan más de 24h sin actividad
3. **Récord**: `racha_maxima` se actualiza si `racha_actual > racha_maxima`

### Recompensas por Racha

| Racha   | Logro                   | Monedas | XP   |
| ------- | ----------------------- | ------- | ---- |
| 1 día   | Un Día a la Vez         | 5       | 10   |
| 3 días  | Tres son Multitud       | 20      | 50   |
| 7 días  | Racha de Fuego 🔥       | 50      | 100  |
| 14 días | Dos Semanas Imparables  | 80      | 200  |
| 30 días | Imparable 🔥🔥          | 200     | 500  |
| 60 días | Dedicación de Hierro ⚡ | 400     | 1000 |
| 90 días | Leyenda Viviente 👑🔥   | 800     | 2000 |

---

## Tienda Virtual

### Categorías de Items

| Categoría     | Descripción                | Precio típico |
| ------------- | -------------------------- | ------------- |
| **AVATAR**    | Avatares 3D completos      | 500-2000 🪙   |
| **SKIN**      | Outfits para avatar        | 200-1000 🪙   |
| **ACCESORIO** | Sombreros, gafas, etc.     | 50-500 🪙     |
| **POWERUP**   | Multiplicadores temporales | 100-300 🪙    |
| **COSMETICO** | Partículas, auras          | 200-800 🪙    |
| **TITULO**    | Badges personalizados      | 100-500 🪙    |
| **EMOJI**     | Stickers personalizados    | 20-100 🪙     |
| **FONDO**     | Fondos de perfil           | 100-400 🪙    |
| **MARCO**     | Marcos de avatar           | 150-600 🪙    |

### Rareza de Items

| Rareza     | Color   | Multiplicador precio |
| ---------- | ------- | -------------------- |
| COMUN      | Gris    | x1                   |
| RARO       | Azul    | x2-3                 |
| EPICO      | Púrpura | x4-6                 |
| LEGENDARIO | Dorado  | x8-15                |

### Modelo: `ItemTienda`

```prisma
model ItemTienda {
  id                     String     @id @default(cuid())
  nombre                 String
  descripcion            String?
  categoria_id           String
  tipo_item              TipoItem   // AVATAR, SKIN, etc.
  precio_monedas         Int        @default(0)
  precio_gemas           Int        @default(0)  // Reservado para futuro
  imagen_url             String?
  rareza                 RarezaItem @default(COMUN)
  edicion_limitada       Boolean    @default(false)
  fecha_inicio           DateTime?  // Disponibilidad temporal
  fecha_fin              DateTime?
  nivel_minimo_requerido Int        @default(1)
  disponible             Boolean    @default(true)
  veces_comprado         Int        @default(0)  // Estadísticas
  metadata               Json?      // Stats, efectos, duración
}
```

### Inventario del Estudiante

```prisma
model ItemObtenido {
  id              String   @id @default(cuid())
  estudiante_id   String
  item_id         String
  fecha_obtencion DateTime @default(now())
  equipado        Boolean  @default(false)  // Si está activo
  cantidad        Int      @default(1)      // Para consumibles
  metadata        Json?    // usos_restantes, etc.

  @@unique([estudiante_id, item_id])
}
```

---

## Puntos para Padres

Sistema **separado** de puntos para tutores/padres.

### Modelo: `PuntosPadre`

```prisma
model PuntosPadre {
  id           String @id @default(cuid())
  tutor_id     String @unique

  // Recursos
  puntos_total Int @default(0)
  xp_total     Int @default(0)

  // Stats
  pagos_puntuales_consecutivos Int @default(0)
  total_referidos_activos      Int @default(0)

  tutor         Tutor                    @relation(...)
  transacciones TransaccionPuntosPadre[]
  canjes        CanjePadre[]
}
```

### Cómo ganan puntos los padres

| Acción                       | Puntos | Frecuencia   |
| ---------------------------- | ------ | ------------ |
| Pago puntual                 | 100    | Mensual      |
| Pago anticipado              | 150    | Mensual      |
| Referido activo              | 500    | Por referido |
| Engagement (asistencia hijo) | 50     | Mensual      |

### Premios canjeables

```prisma
model PremioPadre {
  id                String  @id @default(cuid())
  codigo            String  @unique  // "descuento_10"
  titulo            String           // "10% de descuento"
  descripcion       String
  categoria         String           // "digital", "acceso", "premium", "epico"
  puntos_requeridos Int
  costo_real_usd    Decimal?
  icono             String
  activo            Boolean @default(true)
}
```

| Categoría | Ejemplos               | Puntos    |
| --------- | ---------------------- | --------- |
| Digital   | Wallpapers, e-books    | 100-500   |
| Acceso    | Clase extra, mentoria  | 500-1500  |
| Premium   | Mes gratis, descuentos | 1500-3000 |
| Épico     | Año gratis, hardware   | 5000+     |

---

## Puntos por Casa

Cada estudiante pertenece a una **Casa** según su edad:

| Casa        | Edad       | Color        | Emoji |
| ----------- | ---------- | ------------ | ----- |
| **Quantum** | 6-9 años   | Rosa/Magenta | 🌟    |
| **Vertex**  | 10-12 años | Celeste      | 🚀    |
| **Pulsar**  | 13-17 años | Violeta      | ⚡    |

### Acumulación de Puntos

```prisma
model Casa {
  tipo          CasaTipo  // QUANTUM, VERTEX, PULSAR
  nombre        String
  puntosTotales Int @default(0)  // Suma de todos los estudiantes
  // ...
}
```

Los puntos individuales de cada estudiante contribuyen al ranking de su casa.

### Competencia entre Casas

- Rankings semanales/mensuales
- Premios colectivos para la casa ganadora
- Logros de equipo

---

## Flujos de Obtención

### Flujo 1: Completar ejercicio

```
Estudiante completa ejercicio
         │
         ▼
┌────────────────────┐
│ +XP por ejercicio  │
│ (10-50 XP)         │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Verificar logros   │
│ de precisión       │
└────────┬───────────┘
         │
    ┌────┴────┐
    │Perfecto?│
    └────┬────┘
     Sí  │  No
    ┌────┘    └────┐
    ▼              ▼
+Logro          Solo XP
+Monedas
+XP extra
```

### Flujo 2: Logro desbloqueado

```
Criterio cumplido
        │
        ▼
┌───────────────────────┐
│ LogrosService         │
│ .desbloquearLogro()   │
└───────────┬───────────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
 Crear   Agregar  Agregar
 Logro   Monedas    XP
Estudiante  │       │
            │       │
            └───┬───┘
                │
           ┿────┴────┿
           │Subió    │
           │nivel?   │
           └────┬────┘
            Sí  │  No
           ┌────┘    └────┐
           ▼              ▼
        Animación      Solo
        especial     notificación
```

### Flujo 3: Docente otorga puntos

```
Docente en clase
       │
       ▼
┌──────────────────┐
│ Selecciona       │
│ estudiante       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Elige acción     │
│ puntuable        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ PuntosService    │
│ .otorgarPuntos() │
└────────┬─────────┘
         │
    TRANSACCIÓN
    ┌────┴────┐
    │         │
    ▼         ▼
  Crear    Incrementar
  Punto    puntos_totales
  Obtenido  estudiante
```

---

## Servicios y APIs

### RecursosService

```typescript
class RecursosService {
  // Consultas
  obtenerRecursos(estudianteId: string);
  obtenerRecursosConNivel(estudianteId: string);
  obtenerHistorial(estudianteId: string, limite?: number);

  // Mutaciones
  agregarMonedas(estudianteId, cantidad, razon, metadata?);
  agregarXP(estudianteId, cantidad, razon, metadata?);
  gastarMonedas(estudianteId, cantidad, razon, metadata?);

  // Utilidades
  calcularNivel(xp_total: number): number;
  xpParaNivel(nivel: number): number;
}
```

### LogrosService

```typescript
class LogrosService {
  // Consultas
  obtenerLogros(params?: { categoria?; rareza?; activo? });
  obtenerLogrosEstudiante(estudianteId: string);
  obtenerProgresoLogros(estudianteId: string);
  obtenerLogrosPorCategoria(estudianteId: string);
  obtenerEstadisticasRareza(estudianteId: string);
  obtenerLogrosNoVistos(estudianteId: string);

  // Mutaciones
  desbloquearLogro(estudianteId, codigoLogro);
  marcarLogroVisto(estudianteId, logroId);
}
```

### PuntosService

```typescript
class PuntosService {
  // Consultas
  getAccionesPuntuables();
  getHistorialPuntos(estudianteId: string);
  getPuntosEstudiante(estudianteId: string);

  // Mutaciones
  otorgarPuntos(docenteId, estudianteId, accionId, claseId?, contexto?);
}
```

---

## Modelos de Datos

### Diagrama de Relaciones

```
┌─────────────────┐     ┌─────────────────┐
│   Estudiante    │────▶│RecursosEstudiante│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
┌─────────────────┐  ┌──────────┐  ┌──────────┐
│ LogroEstudiante │  │Transaccion│  │CompraItem│
└────────┬────────┘  │ Recurso   │  └────┬─────┘
         │           └───────────┘       │
         ▼                               ▼
   ┌──────────┐                   ┌──────────┐
   │  Logro   │                   │ItemTienda│
   └──────────┘                   └──────────┘

┌─────────────────┐
│   Estudiante    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ PuntoObtenido   │────▶│AccionPuntuable  │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│    Docente      │
└─────────────────┘
```

### Índices Importantes

```prisma
// RecursosEstudiante
@@index([estudiante_id])

// TransaccionRecurso
@@index([recursos_estudiante_id])
@@index([tipo_recurso])
@@index([fecha])

// PuntoObtenido
@@index([estudiante_id])
@@index([docente_id])
@@index([accion_id])
@@index([fecha_otorgado])

// LogroEstudiante
@@unique([estudiante_id, logro_id])

// ItemObtenido
@@unique([estudiante_id, item_id])
@@index([equipado])
```

---

## Resumen

| Sistema            | Estado      | Tablas                                 | Servicios       |
| ------------------ | ----------- | -------------------------------------- | --------------- |
| **XP + Niveles**   | ✅ Completo | RecursosEstudiante, NivelConfig        | RecursosService |
| **Monedas**        | ✅ Completo | RecursosEstudiante, TransaccionRecurso | RecursosService |
| **Logros**         | ✅ Completo | Logro, LogroEstudiante                 | LogrosService   |
| **Rachas**         | ✅ Completo | RachaEstudiante                        | (integrado)     |
| **Puntos Docente** | ✅ Completo | AccionPuntuable, PuntoObtenido         | PuntosService   |
| **Tienda**         | ✅ Completo | ItemTienda, ItemObtenido, CompraItem   | TiendaService   |
| **Puntos Padres**  | ✅ Completo | PuntosPadre, PremioPadre, CanjePadre   | (pendiente)     |
| **Casas**          | ✅ Completo | Casa                                   | CasasService    |

---

## Referencias

- [Schema Prisma](../apps/api/prisma/schema.prisma)
- [Seed de Logros](../apps/api/prisma/seeds/logros.seed.ts)
- [Seed de Acciones](../apps/api/prisma/seeds/acciones-puntuables.seed.ts)
- [RecursosService](../apps/api/src/gamificacion/services/recursos.service.ts)
- [LogrosService](../apps/api/src/gamificacion/services/logros.service.ts)
- [PuntosService](../apps/api/src/gamificacion/puntos.service.ts)
