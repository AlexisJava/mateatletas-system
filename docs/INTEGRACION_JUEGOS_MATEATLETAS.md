# INTEGRACIÓN DE JUEGOS - SISTEMA DE GAMIFICACIÓN MATEATLETAS

> **Guía completa para desarrolladores** - Cómo integrar juegos educativos con el sistema de recompensas, logros y progreso de Mateatletas.

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Sistema de Puntos y Recompensas](#sistema-de-puntos-y-recompensas)
3. [Endpoints de Integración](#endpoints-de-integración)
4. [Sistema de Logros](#sistema-de-logros)
5. [Mecánicas Sociales](#mecánicas-sociales)
6. [Ejemplo Práctico Completo](#ejemplo-práctico-completo)
7. [Modelos de Base de Datos](#modelos-de-base-de-datos)

---

## RESUMEN EJECUTIVO

Mateatletas implementa un **sistema de gamificación dual completo** que incentiva a estudiantes mediante:

- **2 monedas principales**: XP (experiencia) y Monedas (canjeables)
- **67 logros automáticos** distribuidos en 9 categorías
- **Sistema de niveles** basado en XP acumulado
- **Sistema de rachas** para fomentar consistencia diaria
- **Tienda de canjes** con cursos STEAM reales ($100-2000 monedas)
- **Rankings** por equipo e individual

### Flujo Básico de Integración

```
Tu Juego → POST /api/progreso-actividad/completar → Backend
                                                      ↓
                        ← Recompensas (XP, Monedas, Logros) ←
```

---

## SISTEMA DE PUNTOS Y RECOMPENSAS

### 1. XP (EXPERIENCIA) ⚡

**Propósito**: Subir de nivel, progresión visual, status

**Características**:
- NO se gastan (acumulativos permanentes)
- Determinan el nivel del estudiante
- Se ganan por cualquier actividad educativa

**Fórmula de Nivel**:

```javascript
// Calcular nivel desde XP total
function calcularNivel(xp_total) {
  return Math.floor(Math.sqrt(xp_total / 100)) + 1;
}

// XP necesario para alcanzar un nivel
function xpParaNivel(nivel) {
  return Math.pow(nivel - 1, 2) * 100;
}
```

**Progresión de Niveles**:

```
Nivel 1:  0 XP      (inicio)
Nivel 2:  100 XP    (+100)
Nivel 3:  400 XP    (+300)
Nivel 4:  900 XP    (+500)
Nivel 5:  1,600 XP  (+700)
Nivel 10: 8,100 XP
Nivel 15: 19,600 XP
```

**Cómo se Gana XP en Actividades/Juegos**:

```yaml
ACTIVIDADES BÁSICAS:
  ejercicio_facil: 5 XP
  ejercicio_medio: 10 XP
  ejercicio_dificil: 20 XP
  ejercicio_perfecto_bonus: +15 XP (100% aciertos)
  ejercicio_rapido_bonus: +10 XP (<30 segundos)

COMPLETAR ACTIVIDADES (tu juego):
  porcentaje_90_100: 100 XP base + bonus estrellas
  porcentaje_75_89: 75 XP base + bonus estrellas
  porcentaje_60_74: 50 XP base + bonus estrellas
  porcentaje_0_59: 25 XP base

BONUS POR ESTRELLAS:
  1_estrella: +15 XP
  2_estrellas: +30 XP
  3_estrellas: +45 XP

CONSISTENCIA:
  racha_1_dia: 10 XP
  racha_7_dias: 100 XP
  racha_30_dias: 500 XP
  racha_90_dias: 2,000 XP

LOGROS:
  logro_comun: 30 XP
  logro_raro: 100 XP
  logro_epico: 250 XP
  logro_legendario: 500 XP
```

---

### 2. MONEDAS 💰

**Propósito**: Moneda principal para canjear cursos STEAM reales

**Características**:
- SÍ se gastan al canjear
- Se acumulan sin límite
- NO expiran nunca
- Conversión referencial: **1 moneda ≈ $1 USD** de cursos

**Cómo se Ganan Monedas en Juegos**:

```yaml
COMPLETAR ACTIVIDADES (tu juego):
  porcentaje_90_100: 50 monedas base + bonus estrellas
  porcentaje_75_89: 35 monedas base + bonus estrellas
  porcentaje_60_74: 20 monedas base + bonus estrellas
  porcentaje_0_59: 10 monedas base

BONUS POR ESTRELLAS:
  1_estrella: +5 monedas
  2_estrellas: +10 monedas
  3_estrellas: +15 monedas

GEMAS (RARÍSIMO - solo display, no implementado aún):
  3_estrellas + precision_95_100: 5 gemas
  3_estrellas: 2 gemas

DIARIO:
  racha_1_dia: 2 monedas
  completar_5_ejercicios: 5 monedas
  completar_10_ejercicios: 10 monedas adicionales

LOGROS:
  logro_comun: 20 monedas
  logro_raro: 50 monedas
  logro_epico: 100 monedas
  logro_legendario: 250 monedas
```

**Economía Proyectada para Estudiantes**:

```yaml
Estudiante_IDEAL (todo perfecto):
  monedas_por_mes: 700-900
  tiempo_primer_curso_$50: "3 semanas" (1,000 monedas)

Estudiante_ACTIVO (80% esfuerzo):
  monedas_por_mes: 400-500
  tiempo_primer_curso: "2 meses"

Estudiante_CASUAL (50% esfuerzo):
  monedas_por_mes: 150-200
  tiempo_primer_curso: "3-4 meses"
```

---

### 3. SISTEMA DE ESTRELLAS

**Cálculo Automático por el Backend**:

```typescript
function calcularEstrellas(puntaje: number): number {
  if (puntaje >= 90) return 3;  // ⭐⭐⭐
  if (puntaje >= 75) return 2;  // ⭐⭐
  if (puntaje >= 60) return 1;  // ⭐
  return 0;                      // Sin estrellas
}
```

**Recompensas según Estrellas**:

```typescript
function calcularRecompensas(estrellas: number, porcentaje: number) {
  let xp_ganado = 0;
  let monedas_ganadas = 0;

  // Base por porcentaje
  if (porcentaje >= 90) {
    xp_ganado = 100;
    monedas_ganadas = 50;
  } else if (porcentaje >= 75) {
    xp_ganado = 75;
    monedas_ganadas = 35;
  } else if (porcentaje >= 60) {
    xp_ganado = 50;
    monedas_ganadas = 20;
  } else {
    xp_ganado = 25;
    monedas_ganadas = 10;
  }

  // Bonus por estrellas
  const bonusEstrellas = estrellas * 15;
  xp_ganado += bonusEstrellas;
  monedas_ganadas += Math.floor(bonusEstrellas / 3);

  // Gemas (solo si 3 estrellas + >95% precisión)
  let gemas_ganadas = undefined;
  if (estrellas === 3 && porcentaje >= 95) {
    gemas_ganadas = 5;
  } else if (estrellas === 3) {
    gemas_ganadas = 2;
  }

  return { xp_ganado, monedas_ganadas, gemas_ganadas };
}
```

---

## ENDPOINTS DE INTEGRACIÓN

### 1. INICIAR ACTIVIDAD/JUEGO

**Endpoint**: `POST /api/progreso-actividad/iniciar`

**Cuándo Llamar**: Cuando el estudiante empieza a jugar por primera vez

**Headers**:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (DTO: IniciarActividad)**:
```typescript
{
  estudiante_id: "cuid...",
  actividad_id: "cuid...",
  asignacion_id: "cuid..."
}
```

**Response**:
```typescript
{
  progreso: {
    id: "cuid...",
    iniciado: true,
    fecha_inicio: "2025-10-30T10:00:00.000Z"
  },
  mensaje: "Actividad iniciada exitosamente"
}
```

---

### 2. GUARDAR PROGRESO (Opcional)

**Endpoint**: `POST /api/progreso-actividad/guardar`

**Cuándo Llamar**: Durante el juego, cada 2-5 minutos, o cuando el estudiante sale sin terminar

**Headers**:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (DTO: GuardarProgresoActividad)**:
```typescript
{
  estudiante_id: "cuid...",
  actividad_id: "cuid...",
  asignacion_id: "cuid...",
  estado_juego: {
    // JSON con estado serializado para reanudar
    nivel_actual: 3,
    vidas: 2,
    puntaje_parcial: 45,
    preguntas_respondidas: [1, 2, 3]
  },
  tiempo_minutos: 5  // Tiempo de esta sesión
}
```

**Response**:
```typescript
{
  progreso: {
    id: "cuid...",
    estado_juego: { nivel_actual: 3, vidas: 2, ... },
    tiempo_total_minutos: 5
  },
  mensaje: "Progreso guardado exitosamente"
}
```

---

### 3. COMPLETAR ACTIVIDAD/JUEGO ⭐ (PRINCIPAL)

**Endpoint**: `POST /api/progreso-actividad/completar`

**Cuándo Llamar**: Cuando el estudiante termina el juego/actividad

**Headers**:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (DTO: CompletarActividad)**:
```typescript
{
  estudiante_id: "cuid...",
  actividad_id: "cuid...",
  asignacion_id: "cuid...",

  // MÉTRICAS REQUERIDAS
  puntos_obtenidos: 95,        // Puntaje final 0-100
  puntaje_intento: 95,         // Puntaje de este intento específico
  tiempo_minutos: 12,          // Tiempo total jugado
  estrellas: 3,                // 0-3 estrellas (calcula el frontend)
  porcentaje_aciertos: 95,     // Porcentaje de aciertos 0-100

  // OPCIONAL: Historial de respuestas (para análisis)
  respuestas_detalle?: {
    ejercicio1: { correcto: true, tiempo: 5, intentos: 1 },
    ejercicio2: { correcto: true, tiempo: 3, intentos: 1 },
    ejercicio3: { correcto: false, tiempo: 8, intentos: 2 }
  },

  // OPCIONAL: Estado final del juego (para stats)
  estado_juego?: {
    nivel_alcanzado: 5,
    bonus_obtenidos: ["velocidad", "perfecto"],
    power_ups_usados: 2
  }
}
```

**Response (ProgresoActualizadoResponse)**:
```typescript
{
  progreso: {
    id: "cuid...",
    completado: true,
    fecha_completado: "2025-10-30T10:15:00.000Z",
    puntos_obtenidos: 95,
    tiempo_total_minutos: 12,
    intentos: 1,
    mejor_puntaje: 95
  },

  recompensas: {
    xp_ganado: 145,               // Base 100 + bonus 45 (3 estrellas)
    monedas_ganadas: 65,          // Base 50 + bonus 15
    gemas_ganadas: 5,             // Solo si 3 estrellas + >95%
    nivel_subido: true,           // Si cruzó umbral de nivel
    nivel_actual: 6,              // Nuevo nivel

    // Logros desbloqueados automáticamente
    logros_desbloqueados: [
      {
        id: "cuid...",
        nombre: "Perfeccionista",
        descripcion: "Completa 10 ejercicios con 100%",
        puntos: 100,
        icono: "💯",
        monedas_recompensa: 50,
        xp_recompensa: 100
      }
    ]
  },

  mensaje: "¡Felicidades! Completaste la actividad con 3 estrellas. ¡Subiste al nivel 6! Desbloqueaste 1 logro!"
}
```

**Validaciones Automáticas del Backend**:

El backend automáticamente:
1. ✅ Guarda el progreso de la actividad
2. ✅ Calcula recompensas según fórmulas
3. ✅ Actualiza XP y monedas del estudiante
4. ✅ Verifica si subió de nivel
5. ✅ Registra racha del día
6. ✅ Verifica logros desbloqueados (precisión, velocidad, racha, nivel)
7. ✅ Otorga recompensas de logros adicionales
8. ✅ Retorna todo en una sola respuesta

---

### 4. OBTENER RECURSOS DEL ESTUDIANTE

**Endpoint**: `GET /api/gamificacion/recursos/:estudianteId`

**Cuándo Llamar**: Al cargar el juego, para mostrar XP/monedas actuales

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response**:
```typescript
{
  id: "cuid...",
  estudiante_id: "cuid...",
  xp_total: 1750,
  monedas_total: 450,
  nivel: 5,
  xp_progreso: 150,        // XP ganado en nivel actual
  xp_necesario: 900,       // XP total para subir
  porcentaje_nivel: 16,    // (150 / 900) × 100
  racha: {
    racha_actual: 7,       // Días consecutivos
    racha_maxima: 14,      // Mejor racha histórica
    total_dias_activos: 23,
    ultima_actividad: "2025-10-30T10:00:00.000Z",
    dias_consecutivos: 7
  }
}
```

---

### 5. REGISTRAR RACHA DEL DÍA

**Endpoint**: `POST /api/gamificacion/recursos/:estudianteId/racha`

**Cuándo Llamar**: Automáticamente cuando completas una actividad, pero puedes llamarlo manualmente

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Body**: (vacío)

**Response**:
```typescript
{
  racha_actual: 8,
  racha_maxima: 14,
  es_nueva_racha: true,
  rompio_racha: false
}
```

---

## SISTEMA DE LOGROS

### Distribución Completa (67 Logros)

```yaml
TOTAL: 67 logros
├─ Comunes: 17 logros (25%)
├─ Raros: 24 logros (36%)
├─ Épicos: 18 logros (27%)
├─ Legendarios: 8 logros (12%)
└─ Secretos: 10 logros (easter eggs)

CATEGORÍAS:
├─ Consistencia: 10 logros (rachas)
├─ Maestría: 12 logros (completar temas)
├─ Precisión: 8 logros (100% aciertos)
├─ Velocidad: 6 logros (<30 segundos)
├─ Social: 8 logros (ayudar compañeros)
├─ Asistencia: 6 logros (ir a clases)
├─ Desafíos Semanales: 5 logros
├─ Especialización: 4 logros
├─ Niveles: 4 logros
└─ Secretos: 10 logros (ocultos)
```

### Logros Relacionados con Juegos

**PRECISIÓN** (Se verifican automáticamente):

```yaml
primera_perfeccion:
  nombre: "Primera Perfección"
  descripcion: "Completa 1 ejercicio con 100%"
  icono: "🎯"
  monedas: 10
  xp: 30
  criterio: "ejercicios_perfectos >= 1"

perfeccionista:
  nombre: "Perfeccionista"
  descripcion: "Completa 10 ejercicios con 100%"
  icono: "💯"
  monedas: 50
  xp: 100
  criterio: "ejercicios_perfectos >= 10"

ojo_halcon:
  nombre: "Ojo de Halcón"
  descripcion: "Completa 25 ejercicios con 100%"
  icono: "🦅"
  monedas: 100
  xp: 250
  criterio: "ejercicios_perfectos >= 25"
```

**VELOCIDAD** (Se verifican automáticamente):

```yaml
rapido_como_rayo:
  nombre: "Rápido como el Rayo"
  descripcion: "Completa 1 ejercicio en menos de 30 segundos"
  icono: "⚡"
  monedas: 20
  xp: 50
  criterio: "tiempo < 30s"

velocista:
  nombre: "Velocista"
  descripcion: "Completa 10 ejercicios en menos de 30 segundos"
  icono: "🏃"
  monedas: 50
  xp: 100
  criterio: "ejercicios_rapidos >= 10"
```

**CONSISTENCIA** (Se verifican automáticamente):

```yaml
racha_fuego:
  nombre: "Racha de Fuego"
  descripcion: "Mantén una racha de 7 días consecutivos"
  icono: "🔥"
  monedas: 50
  xp: 100
  criterio: "racha_actual >= 7"
  titulo: "Incansable"

imparable:
  nombre: "Imparable"
  descripcion: "Mantén una racha de 30 días"
  icono: "💪"
  monedas: 200
  xp: 500
  criterio: "racha_actual >= 30"
  titulo: "Leyenda"
```

### Verificación Automática de Logros

El backend **verifica automáticamente** logros después de completar una actividad:

```typescript
// Flujo automático en el backend:

1. Completar actividad → Guardar progreso
2. Actualizar recursos (XP, monedas)
3. Verificar logros de precisión (si 100% aciertos)
4. Verificar logros de velocidad (si <30 segundos)
5. Verificar logros de nivel (si subió de nivel)
6. Verificar logros de racha (si se registró actividad del día)
7. Desbloquear logros encontrados
8. Otorgar recompensas adicionales de logros
9. Retornar todo en la response
```

**No necesitás hacer nada especial** - Solo enviar las métricas correctas en `completar` y el backend se encarga del resto.

---

### Endpoints de Logros (Consulta)

**GET /api/gamificacion/logros**

Obtener catálogo completo de logros:

```typescript
// Response: Array de Logro
[
  {
    id: "cuid...",
    codigo: "racha_7_dias",
    nombre: "Racha de Fuego",
    descripcion: "Mantén una racha de 7 días",
    categoria: "consistencia",
    rareza: "raro",
    icono: "🔥",
    monedas_recompensa: 50,
    xp_recompensa: 100,
    secreto: false,
    titulo: "Incansable",
    badge: "badge_fuego.png",
    activo: true
  }
]
```

**GET /api/gamificacion/logros/:estudianteId**

Obtener logros desbloqueados del estudiante:

```typescript
{
  logros_desbloqueados: [
    {
      id: "cuid...",
      fecha_desbloqueo: "2025-10-30T10:15:00.000Z",
      visto: false,  // Para mostrar notificación
      logro: {
        codigo: "primer_paso",
        nombre: "Primer Paso",
        descripcion: "Completa tu primer ejercicio",
        icono: "🎯",
        monedas_recompensa: 10,
        xp_recompensa: 30
      }
    }
  ],
  progreso: {
    desbloqueados: 5,
    totales: 67,
    porcentaje: 7
  },
  por_categoria: [
    {
      categoria: "consistencia",
      total: 10,
      desbloqueados: 2,
      porcentaje: 20
    }
  ]
}
```

---

## MECÁNICAS SOCIALES

### 1. Sistema de Equipos

**4 Equipos Predefinidos**:

```typescript
const equipos = [
  {
    nombre: "Fénix",
    color_primario: "#FF6B35",  // Naranja/rojo
    icono_url: "fenix.svg"
  },
  {
    nombre: "Dragón",
    color_primario: "#3D5A80",  // Azul oscuro
    icono_url: "dragon.svg"
  },
  {
    nombre: "Tigre",
    color_primario: "#EE6C4D",  // Rojo coral
    icono_url: "tigre.svg"
  },
  {
    nombre: "Águila",
    color_primario: "#2A9D8F",  // Verde turquesa
    icono_url: "aguila.svg"
  }
];
```

Cada estudiante es asignado a un equipo. Los puntos individuales se suman al equipo.

### 2. Rankings

**GET /api/gamificacion/ranking/equipos**

Ranking de equipos:

```typescript
{
  equipos: [
    {
      equipo_id: "cuid...",
      nombre: "Fénix",
      color_primario: "#FF6B35",
      puntos_totales: 15420,
      cantidad_estudiantes: 12,
      posicion: 1
    }
  ]
}
```

**GET /api/gamificacion/ranking/individual**

Ranking individual (paginado):

```typescript
// Query: ?page=1&limit=20

{
  data: [
    {
      id: "cuid...",
      nombre: "Juan",
      apellido: "Pérez",
      avatar: "https://...",
      equipo: {
        nombre: "Fénix",
        color: "#FF6B35"
      },
      puntos: 1540,
      posicion: 1
    }
  ],
  metadata: {
    total: 245,
    page: 1,
    limit: 20,
    totalPages: 13
  }
}
```

### 3. Sistema de Rachas

**Cómo Funciona**:

```typescript
// Racha se actualiza automáticamente al completar actividad
// O puedes llamar manualmente:
POST /api/gamificacion/recursos/:estudianteId/racha

// Lógica:
- Si completa actividad hoy: racha_actual + 1
- Si pasó 1 día sin actividad: racha se rompe → racha_actual = 1
- racha_maxima: siempre guarda el mejor récord
```

**Logros de Racha** (se verifican automáticamente):

```yaml
racha_1_dia: 10 XP + 2 monedas
racha_3_dias: 30 XP + 10 monedas
racha_7_dias: 100 XP + 50 monedas
racha_14_dias: 200 XP + 100 monedas
racha_30_dias: 500 XP + 200 monedas
racha_90_dias: 2000 XP + 500 monedas
```

---

## EJEMPLO PRÁCTICO COMPLETO

### Escenario: Juego de Química "Reacciones Mágicas"

**1. Estudiante Abre el Juego**

```typescript
// Frontend: Al cargar el juego
const estudianteId = 'cuid-estudiante-123';
const actividadId = 'cuid-actividad-quimica';
const asignacionId = 'cuid-asignacion-456';

// Obtener recursos actuales para mostrar en UI
const recursos = await fetch(`/api/gamificacion/recursos/${estudianteId}`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

console.log(`XP: ${recursos.xp_total}, Nivel: ${recursos.nivel}`);
console.log(`Monedas: ${recursos.monedas_total}`);
console.log(`Racha: ${recursos.racha.racha_actual} días`);

// Iniciar actividad (primera vez)
await fetch('/api/progreso-actividad/iniciar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estudiante_id: estudianteId,
    actividad_id: actividadId,
    asignacion_id: asignacionId
  })
});
```

**2. Durante el Juego**

```typescript
// Frontend: Guardar progreso cada 2 minutos
let estadoJuego = {
  nivel_actual: 3,
  vidas: 2,
  puntaje_parcial: 45,
  preguntas_respondidas: [1, 2, 3],
  tiempo_transcurrido: 5
};

await fetch('/api/progreso-actividad/guardar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estudiante_id: estudianteId,
    actividad_id: actividadId,
    asignacion_id: asignacionId,
    estado_juego: estadoJuego,
    tiempo_minutos: 5
  })
});
```

**3. Finaliza el Juego**

```typescript
// Frontend: Estudiante termina el juego
const resultadoJuego = {
  preguntasTotales: 20,
  correctas: 19,
  incorrectas: 1,
  tiempoTotal: 12, // minutos
  puntajeFinal: 95 // 0-100
};

// Calcular métricas
const porcentajeAciertos = (resultadoJuego.correctas / resultadoJuego.preguntasTotales) * 100; // 95%
const estrellas = porcentajeAciertos >= 90 ? 3 : porcentajeAciertos >= 75 ? 2 : 1; // 3 estrellas

// Enviar a backend
const response = await fetch('/api/progreso-actividad/completar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estudiante_id: estudianteId,
    actividad_id: actividadId,
    asignacion_id: asignacionId,
    puntos_obtenidos: resultadoJuego.puntajeFinal,
    puntaje_intento: resultadoJuego.puntajeFinal,
    tiempo_minutos: resultadoJuego.tiempoTotal,
    estrellas: estrellas,
    porcentaje_aciertos: porcentajeAciertos,
    respuestas_detalle: {
      total: resultadoJuego.preguntasTotales,
      correctas: resultadoJuego.correctas,
      incorrectas: resultadoJuego.incorrectas,
      desglose: [
        { pregunta: 1, correcto: true, tiempo: 30 },
        { pregunta: 2, correcto: true, tiempo: 25 },
        { pregunta: 3, correcto: false, tiempo: 45 },
        // ... resto
      ]
    },
    estado_juego: {
      nivel_alcanzado: 5,
      bonus_obtenidos: ["velocidad", "perfecto"]
    }
  })
});

const data = await response.json();
```

**4. Mostrar Recompensas**

```typescript
// Response del backend:
{
  progreso: {
    completado: true,
    puntos_obtenidos: 95,
    tiempo_total_minutos: 12
  },
  recompensas: {
    xp_ganado: 145,        // 100 base + 45 bonus (3 estrellas)
    monedas_ganadas: 65,   // 50 base + 15 bonus
    gemas_ganadas: 5,      // Por 3 estrellas + >95%
    nivel_subido: true,
    nivel_actual: 6,
    logros_desbloqueados: [
      {
        id: "cuid...",
        nombre: "Perfeccionista",
        descripcion: "Completa 10 ejercicios con 100%",
        puntos: 100,
        icono: "💯"
      },
      {
        id: "cuid...",
        nombre: "Racha de Fuego",
        descripcion: "Mantén una racha de 7 días",
        puntos: 100,
        icono: "🔥"
      }
    ]
  },
  mensaje: "¡Felicidades! Completaste la actividad con 3 estrellas. ¡Subiste al nivel 6! Desbloqueaste 2 logros!"
}

// Frontend: Mostrar animaciones
showRewardModal({
  estrellas: 3,
  xp: data.recompensas.xp_ganado,
  monedas: data.recompensas.monedas_ganadas,
  gemas: data.recompensas.gemas_ganadas,
  nivelAnterior: 5,
  nivelNuevo: data.recompensas.nivel_actual,
  subioNivel: data.recompensas.nivel_subido,
  logros: data.recompensas.logros_desbloqueados
});

// Animaciones sugeridas:
// 1. Mostrar estrellas obtenidas (1-2 segundos)
// 2. Contador de XP subiendo (1-2 segundos)
// 3. Contador de monedas subiendo (1-2 segundos)
// 4. Si subió de nivel: Animación de "LEVEL UP!" (2 segundos)
// 5. Si desbloqueó logros: Mostrar cards de logros (3 segundos cada uno)
// 6. Botón "Continuar" para cerrar modal
```

---

## MODELOS DE BASE DE DATOS

### Modelo: RecursosEstudiante

```prisma
model RecursosEstudiante {
  id                   String   @id @default(cuid())
  estudiante_id        String   @unique
  xp_total             Int      @default(0)
  monedas_total        Int      @default(0)
  ultima_actualizacion DateTime @updatedAt

  estudiante    Estudiante           @relation(...)
  transacciones TransaccionRecurso[]

  @@map("recursos_estudiante")
}
```

### Modelo: ProgresoEstudianteActividad

```prisma
model ProgresoEstudianteActividad {
  id                   String    @id @default(cuid())
  estudiante_id        String
  actividad_id         String
  asignacion_id        String

  // Estado
  iniciado             Boolean   @default(false)
  completado           Boolean   @default(false)
  fecha_inicio         DateTime?
  fecha_completado     DateTime?

  // Métricas
  puntos_obtenidos     Int       @default(0)  // 0-100
  tiempo_total_minutos Int       @default(0)
  intentos             Int       @default(0)
  mejor_puntaje        Int       @default(0)  // 0-100

  // Datos del juego
  estado_juego         Json?     // Estado serializado
  respuestas_detalle   Json?     // Historial de respuestas

  @@unique([estudiante_id, actividad_id, asignacion_id])
  @@map("progreso_estudiante_actividades")
}
```

### Modelo: RachaEstudiante

```prisma
model RachaEstudiante {
  id                  String    @id @default(cuid())
  estudiante_id       String    @unique
  racha_actual        Int       @default(0)
  racha_maxima        Int       @default(0)
  ultima_actividad    DateTime?
  inicio_racha_actual DateTime?
  total_dias_activos  Int       @default(0)

  @@map("rachas_estudiantes")
}
```

### Modelo: Logro

```prisma
model Logro {
  id                 String   @id @default(cuid())
  codigo             String   @unique  // "racha_7_dias"
  nombre             String            // "Racha de Fuego"
  descripcion        String
  categoria          String            // "consistencia"
  rareza             String            // "comun", "raro", "epico", "legendario"
  icono              String            // "🔥"
  monedas_recompensa Int
  xp_recompensa      Int
  criterio_tipo      String            // "racha_dias"
  criterio_valor     String            // "7"
  secreto            Boolean  @default(false)
  titulo             String?           // "Incansable"
  badge              String?           // "badge_fuego.png"
  activo             Boolean  @default(true)

  logros_estudiantes LogroEstudiante[]

  @@map("logros_gamificacion")
}
```

### Modelo: LogroEstudiante

```prisma
model LogroEstudiante {
  id               String   @id @default(cuid())
  estudiante_id    String
  logro_id         String
  fecha_desbloqueo DateTime @default(now())
  visto            Boolean  @default(false)

  @@unique([estudiante_id, logro_id])
  @@map("logros_estudiantes_gamificacion")
}
```

---

## CHECKLIST DE INTEGRACIÓN

### Para Tu Juego:

- [ ] **Obtener IDs necesarios**: `estudiante_id`, `actividad_id`, `asignacion_id`
- [ ] **Iniciar actividad** al empezar: `POST /api/progreso-actividad/iniciar`
- [ ] **Guardar progreso** cada 2-5 minutos (opcional): `POST /api/progreso-actividad/guardar`
- [ ] **Calcular métricas** al finalizar: puntaje (0-100), tiempo, porcentaje de aciertos, estrellas
- [ ] **Completar actividad**: `POST /api/progreso-actividad/completar` con todas las métricas
- [ ] **Mostrar recompensas**: Animar XP, monedas, nivel, logros
- [ ] **Manejar errores**: Validar response status 200, 400, 401, 500

### Para Mostrar en UI:

- [ ] **Antes del juego**: Mostrar XP, monedas, nivel, racha actual
- [ ] **Durante el juego**: Opcional: Mostrar progreso guardado
- [ ] **Después del juego**: Animaciones de recompensas
- [ ] **Pantalla de logros**: Mostrar logros desbloqueados (con badge "NUEVO" si `visto: false`)
- [ ] **Botón de perfil**: Mostrar racha actual y nivel

---

## RECURSOS ADICIONALES

### Endpoints de Consulta

```typescript
// Obtener recursos actuales
GET /api/gamificacion/recursos/:estudianteId

// Obtener logros desbloqueados
GET /api/gamificacion/logros/:estudianteId

// Obtener dashboard completo
GET /api/gamificacion/dashboard/:estudianteId

// Obtener ranking individual
GET /api/gamificacion/ranking/individual?page=1&limit=20

// Obtener ranking de equipos
GET /api/gamificacion/ranking/equipos
```

### Archivos del Proyecto

```
Backend:
├─ apps/api/src/gamificacion/
│  ├─ services/
│  │  ├─ recursos.service.ts        # XP y monedas
│  │  ├─ logros.service.ts          # Logros
│  │  ├─ verificador-logros.service.ts  # Verificación automática
│  │  └─ racha.service.ts           # Sistema de rachas
│  ├─ controllers/
│  │  ├─ recursos.controller.ts
│  │  └─ logros.controller.ts
│  └─ dto/
│     └─ gamificacion.dto.ts
├─ apps/api/src/planificaciones-simples/
│  └─ progreso-actividad.service.ts  # Completar actividades
└─ apps/api/prisma/schema.prisma     # Modelos de BD

Frontend:
├─ apps/web/src/lib/api/
│  ├─ gamificacion.api.ts            # API client de gamificación
│  └─ tienda.api.ts                  # API client de recursos
└─ packages/contracts/src/
   └─ schemas/
      ├─ progreso-actividad.schema.ts
      └─ gamificacion.schema.ts
```

---

## PREGUNTAS FRECUENTES

### ¿Qué pasa si el estudiante sale del juego sin terminar?

Usa `POST /api/progreso-actividad/guardar` para guardar el estado. La próxima vez que entre, puedes cargar `estado_juego` y reanudar.

### ¿Cómo sé si desbloqueó un logro?

El endpoint `completar` retorna `logros_desbloqueados` automáticamente. No necesitás verificar manualmente.

### ¿Puedo otorgar XP/monedas personalizados?

No directamente desde el juego. El backend calcula las recompensas según las fórmulas establecidas. Esto garantiza balance económico.

### ¿Qué pasa si llamo `completar` dos veces?

El backend lo permite (cuenta como 2 intentos). Si querés evitarlo, verifica `progreso.completado` antes.

### ¿Las gemas se implementan?

Actualmente las gemas se calculan pero **no se guardan en BD**. Es un placeholder para futura implementación.

### ¿Cómo afectan los logros a las monedas?

Cada logro desbloqueado otorga monedas adicionales (10-250 según rareza). Estas se suman automáticamente en `completar`.

---

## CONTACTO Y SOPORTE

Para dudas o problemas con la integración:
- Revisar logs del backend en `/apps/api/logs/`
- Verificar respuestas HTTP con status codes
- Consultar código fuente en repositorio

**Última actualización**: 2025-10-30
**Versión del documento**: 1.0.0
