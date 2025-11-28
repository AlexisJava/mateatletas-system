# PLAN DE IMPLEMENTACIÓN - MÓDULO QUÍMICA

## Mes de la Ciencia - Semana 1: "El Laboratorio de Mezclas Mágicas"

**Fecha**: 2025-10-29
**Objetivo**: Implementar completamente la semana de Química según planificación PDF

---

## 📊 ESTADO ACTUAL

### ✅ Ya implementado:

- Interfaz del átomo interactivo ([LaboratorioEcosistema.tsx](apps/web/src/app/estudiante/gimnasio/components/overlays/LaboratorioEcosistema.tsx))
- 6 electrones orbitando con datos hardcodeados
- Sistema de navegación (4 cards → átomo → detalles)
- Animación de transición con branding "Mateatletas"
- Tooltip explicativo en card de energía
- Sistema de tracking de progreso (16% energía = 3/18 actividades)

### ❌ Falta implementar:

- **Contenido real** de las actividades de química
- **Simuladores interactivos** (concentraciones, laboratorio, olimpiada, reacción en cadena)
- **Adaptación por grupo etario** (6-7, 8-9, 10-12 años)
- **Persistencia de progreso** en backend
- **4 actividades asincrónicas completas**

---

## 🎯 OBJETIVOS SEGÚN PDF

### Narrativa

> "Los estudiantes son aprendices de un laboratorio secreto. Deben aprender a crear compuestos siguiendo recetas exactas, balanceando proporciones y gestionando inventarios para salvar a la ciudad de una crisis química."

### Conceptos matemáticos por grupo

- **Grupo 1 (6-7 años)**: Sumas/restas hasta 1,000, multiplicación básica, proporciones simples (2:3)
- **Grupo 2 (8-9 años)**: Operaciones hasta 10,000, proporciones más complejas, fracciones básicas, regla de 3 simple
- **Grupo 3 (10-12 años)**: Ecuaciones simples, porcentajes, balanceo de ecuaciones, optimización

### Contenido científico

- Mezclas de colores (primarios → secundarios)
- Concentraciones (soluto + solvente)
- Proporciones en recetas químicas
- Medición de cantidades
- Balanceo básico de reacciones

### 4 Actividades asincrónicas

1. **Desafío de acertijos matemáticos** con temática química (historia interactiva)
2. **Simulador de concentraciones** (8-10 niveles de dificultad creciente)
3. **Olimpiada de problemas** (15-20 ejercicios progresivos)
4. **Proyecto final**: Simulador de reacción en cadena (balancear múltiples variables)

---

## 📐 ARQUITECTURA PROPUESTA

```
apps/web/src/app/estudiante/gimnasio/
├── components/
│   └── overlays/
│       ├── LaboratorioEcosistema.tsx         [✅ Ya existe - átomo interactivo]
│       ├── quimica/
│       │   ├── AcertijosQuimicos.tsx         [🆕 Actividad 1]
│       │   ├── SimuladorConcentraciones.tsx  [🆕 Actividad 2]
│       │   ├── OlimpiadaProblemas.tsx        [🆕 Actividad 3]
│       │   ├── ReaccionEnCadena.tsx          [🆕 Actividad 4]
│       │   └── components/
│       │       ├── Tubo Ensayo.tsx            [🆕 Componente visual]
│       │       ├── MezcladorColores.tsx      [🆕 Mezcla de reactivos]
│       │       ├── BarraProgreso.tsx         [🆕 Barra de nivel]
│       │       └── ModalResultado.tsx        [🆕 Feedback de completitud]
│       └── ...
├── data/
│   ├── quimica/
│   │   ├── acertijos-por-grupo.ts            [🆕 Acertijos adaptados]
│   │   ├── niveles-concentraciones.ts        [🆕 10 niveles simulador]
│   │   ├── problemas-olimpiada.ts            [🆕 15-20 problemas]
│   │   └── reactivos-reacciones.ts           [🆕 Data del proyecto final]
│   └── actividades-mes-ciencia.ts            [⚙️ Actualizar con nuevas actividades]
└── types/
    └── quimica.types.ts                      [🆕 Tipos TypeScript]
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN (11 PASOS)

### **PASO 1: Actualizar data de electrones en el átomo**

**Archivo**: `LaboratorioEcosistema.tsx`
**Qué hacer**: Reemplazar los datos hardcodeados de los 6 electrones con contenido real de química

**Electrones actuales** (placeholder):

- intro: Ciencia Básica 📚
- tabla: Átomos ⚛️
- acidos: Ácidos 🧪
- moleculas: Moléculas 🔬
- reacciones: Reacciones 💥
- estados: Estados ❄️

**Nuevos electrones** (basados en PDF + creatividad):

1. **Introducción** 🧪: "¿Qué es la Química?" (Video + quiz rápido)
2. **Mezclas de Colores** 🎨: Aprender colores primarios → secundarios
3. **Concentraciones** ⚗️: Soluto + solvente, proporciones
4. **Tabla Periódica** ⚛️: Elementos químicos básicos
5. **Reacciones Químicas** 💥: Balanceo simple de ecuaciones
6. **Laboratorio Final** 🔬: Proyecto integrador

**Actividades por electrón** (3 por cada uno = 18 total):

- Video introductorio (3-5 min)
- Ejercicio interactivo (10-15 min)
- Desafío práctico (5-10 min)

---

### **PASO 2: Crear tipos TypeScript**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/types/quimica.types.ts`

```typescript
export type GrupoEtario = '6-7' | '8-9' | '10-12';
export type Dificultad = 'facil' | 'medio' | 'dificil';
export type TipoReactivo = 'acido' | 'base' | 'neutral';

export interface Reactivo {
  id: string;
  nombre: string;
  simbolo: string;
  color: string;
  tipo: TipoReactivo;
  concentracion?: number; // 0-100
}

export interface RecetaQuimica {
  id: string;
  nombre: string;
  reactivos: { reactivoId: string; cantidad: number }[];
  resultado: {
    nombre: string;
    color: string;
    puntos: number;
  };
  dificultad: Dificultad;
  grupoEtario: GrupoEtario[];
}

export interface NivelConcentracion {
  numero: number;
  titulo: string;
  objetivo: string;
  solucion: {
    soluto: number; // ml
    solvente: number; // ml
    concentracionObjetivo: number; // %
  };
  tolerancia: number; // % de margen de error
  puntos: number;
  grupoEtario: GrupoEtario;
}

export interface ProblemaMatematico {
  id: string;
  enunciado: string;
  opciones?: string[]; // Para multiple choice
  respuestaCorrecta: string | number;
  explicacion: string;
  puntos: number;
  dificultad: Dificultad;
  grupoEtario: GrupoEtario;
  contextoQuimico: string; // Ej: "mezclas", "reacciones", "concentraciones"
}

export interface ReaccionCadena {
  id: string;
  nombreExperimento: string;
  pasos: PasoReaccion[];
  variables: VariableQuimica[];
  objetivoFinal: {
    descripcion: string;
    condiciones: Record<string, number>; // Ej: { "temperatura": 80, "ph": 7 }
  };
}

export interface PasoReaccion {
  numero: number;
  accion: string; // "agregar_reactivo", "calentar", "enfriar", "agitar"
  parametros: Record<string, any>;
}

export interface VariableQuimica {
  nombre: string;
  valorInicial: number;
  valorObjetivo: number;
  unidad: string; // "ml", "°C", "pH", "g"
}

export interface ResultadoActividad {
  actividadId: string;
  completada: boolean;
  puntajeObtenido: number;
  puntajeMaximo: number;
  estrellas: 0 | 1 | 2 | 3;
  tiempoEmpleado: number; // segundos
  intentos: number;
}
```

---

### **PASO 3: Crear data de acertijos matemáticos**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/data/quimica/acertijos-por-grupo.ts`

**Contenido**: 20-30 acertijos matemáticos con temática química, adaptados por grupo etario

Ejemplo:

```typescript
export const ACERTIJOS_QUIMICA_6_7: ProblemaMatematico[] = [
  {
    id: 'acertijo-1-facil',
    enunciado:
      'El científico tiene 5 tubos de ensayo rojos y 3 azules. ¿Cuántos tubos tiene en total?',
    respuestaCorrecta: 8,
    explicacion: '5 + 3 = 8 tubos de ensayo',
    puntos: 10,
    dificultad: 'facil',
    grupoEtario: '6-7',
    contextoQuimico: 'conteo',
  },
  // ... más acertijos
];

export const ACERTIJOS_QUIMICA_8_9: ProblemaMatematico[] = [
  {
    id: 'acertijo-1-medio',
    enunciado:
      'Una reacción química necesita 150ml de agua y 50ml de ácido. ¿Cuál es la proporción agua:ácido?',
    opciones: ['3:1', '2:1', '1:3', '1:2'],
    respuestaCorrecta: '3:1',
    explicacion: '150÷50 = 3, por lo tanto la proporción es 3:1',
    puntos: 15,
    dificultad: 'medio',
    grupoEtario: '8-9',
    contextoQuimico: 'proporciones',
  },
  // ... más acertijos
];

export const ACERTIJOS_QUIMICA_10_12: ProblemaMatematico[] = [
  {
    id: 'acertijo-1-dificil',
    enunciado:
      'Para balancear la ecuación H₂ + O₂ → H₂O, ¿cuántas moléculas de H₂ necesitas por cada O₂?',
    opciones: ['1', '2', '3', '4'],
    respuestaCorrecta: '2',
    explicacion: '2H₂ + O₂ → 2H₂O es la ecuación balanceada',
    puntos: 25,
    dificultad: 'dificil',
    grupoEtario: '10-12',
    contextoQuimico: 'balanceo',
  },
  // ... más acertijos
];
```

---

### **PASO 4: Crear data de simulador de concentraciones**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/data/quimica/niveles-concentraciones.ts`

**Contenido**: 10 niveles progresivos donde el estudiante debe mezclar soluto y solvente para lograr una concentración objetivo

```typescript
export const NIVELES_CONCENTRACIONES: NivelConcentracion[] = [
  // Grupo 6-7: Niveles 1-3 (conceptual, sin porcentajes complejos)
  {
    numero: 1,
    titulo: 'Primera Mezcla',
    objetivo: 'Mezcla 50ml de jugo (soluto) con 50ml de agua (solvente)',
    solucion: {
      soluto: 50,
      solvente: 50,
      concentracionObjetivo: 50, // 50% de concentración
    },
    tolerancia: 10, // ±10%
    puntos: 50,
    grupoEtario: '6-7',
  },
  // Grupo 8-9: Niveles 4-7 (proporciones, fracciones)
  {
    numero: 4,
    titulo: 'Proporción 1:3',
    objetivo: 'Crea una mezcla con proporción 1:3 de colorante:agua (total: 200ml)',
    solucion: {
      soluto: 50, // 1 parte
      solvente: 150, // 3 partes
      concentracionObjetivo: 25,
    },
    tolerancia: 5,
    puntos: 100,
    grupoEtario: '8-9',
  },
  // Grupo 10-12: Niveles 8-10 (porcentajes exactos, optimización)
  {
    numero: 8,
    titulo: 'Concentración Exacta',
    objetivo: 'Logra exactamente 37.5% de concentración con 120ml totales',
    solucion: {
      soluto: 45,
      solvente: 75,
      concentracionObjetivo: 37.5,
    },
    tolerancia: 2,
    puntos: 200,
    grupoEtario: '10-12',
  },
  // ... resto de niveles
];
```

---

### **PASO 5: Crear data de olimpiada de problemas**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/data/quimica/problemas-olimpiada.ts`

**Contenido**: 15-20 problemas matemáticos progresivos (fácil → difícil), temática química

```typescript
export const PROBLEMAS_OLIMPIADA: ProblemaMatematico[] = [
  // Problemas 1-5: Fáciles (6-7 años)
  {
    id: 'olimp-1',
    enunciado:
      'Un laboratorio compró 8 cajas de tubos. Cada caja tiene 12 tubos. ¿Cuántos tubos hay en total?',
    respuestaCorrecta: 96,
    explicacion: '8 × 12 = 96 tubos',
    puntos: 20,
    dificultad: 'facil',
    grupoEtario: '6-7',
    contextoQuimico: 'multiplicación básica',
  },
  // Problemas 6-12: Medios (8-9 años)
  {
    id: 'olimp-7',
    enunciado:
      'Una solución tiene 240ml de agua y 60ml de sal. ¿Qué porcentaje de la mezcla es sal?',
    opciones: ['20%', '25%', '30%', '40%'],
    respuestaCorrecta: '20%',
    explicacion: 'Total = 300ml. Sal = 60ml. Porcentaje = (60÷300)×100 = 20%',
    puntos: 40,
    dificultad: 'medio',
    grupoEtario: '8-9',
    contextoQuimico: 'porcentajes',
  },
  // Problemas 13-20: Difíciles (10-12 años)
  {
    id: 'olimp-15',
    enunciado:
      'Para producir 500g de un compuesto se necesita 2 partes de A y 3 partes de B. ¿Cuántos gramos de B se requieren?',
    respuestaCorrecta: 300,
    explicacion: 'Total = 2+3 = 5 partes. B = 3 partes. 500g ÷ 5 × 3 = 300g',
    puntos: 80,
    dificultad: 'dificil',
    grupoEtario: '10-12',
    contextoQuimico: 'regla de 3 compuesta',
  },
  // ... resto de problemas
];
```

---

### **PASO 6: Crear data de reacciones en cadena**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/data/quimica/reactivos-reacciones.ts`

**Contenido**: Experimentos de reacción en cadena con múltiples variables

```typescript
export const REACTIVOS_DISPONIBLES: Reactivo[] = [
  { id: 'h2o', nombre: 'Agua', simbolo: 'H₂O', color: '#60a5fa', tipo: 'neutral' },
  { id: 'hcl', nombre: 'Ácido Clorhídrico', simbolo: 'HCl', color: '#ef4444', tipo: 'acido' },
  { id: 'naoh', nombre: 'Hidróxido de Sodio', simbolo: 'NaOH', color: '#10b981', tipo: 'base' },
  { id: 'nacl', nombre: 'Sal', simbolo: 'NaCl', color: '#f3f4f6', tipo: 'neutral' },
  // ... más reactivos
];

export const REACCIONES_CADENA: ReaccionCadena[] = [
  {
    id: 'experimento-1-facil',
    nombreExperimento: 'Neutralización Básica',
    pasos: [
      { numero: 1, accion: 'agregar_reactivo', parametros: { reactivoId: 'hcl', cantidad: 50 } },
      { numero: 2, accion: 'agregar_reactivo', parametros: { reactivoId: 'naoh', cantidad: 50 } },
      { numero: 3, accion: 'agitar', parametros: { duracion: 10 } },
    ],
    variables: [
      { nombre: 'pH', valorInicial: 2, valorObjetivo: 7, unidad: 'pH' },
      { nombre: 'Temperatura', valorInicial: 20, valorObjetivo: 25, unidad: '°C' },
    ],
    objetivoFinal: {
      descripcion: 'Crear una solución neutra (pH 7) mezclando ácido y base',
      condiciones: { pH: 7, temperatura: 25 },
    },
  },
  // ... más experimentos
];
```

---

### **PASO 7: Implementar componente AcertijosQuimicos.tsx**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/components/overlays/quimica/AcertijosQuimicos.tsx`

**Funcionalidad**:

- Historia interactiva con narración
- Presentar acertijos uno por uno
- Input para respuesta (numérica o multiple choice)
- Feedback inmediato (correcto/incorrecto con explicación)
- Progreso visual (5/20 acertijos completados)
- Sistema de estrellas basado en % de aciertos

**Interfaz visual**:

- Tema laboratorio (tubos de ensayo, burbujas, colores químicos)
- Animaciones de reacción al acertar/fallar
- Contador de puntos en tiempo real
- Botón "Siguiente acertijo" con efecto hover

---

### **PASO 8: Implementar componente SimuladorConcentraciones.tsx**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/components/overlays/quimica/SimuladorConcentraciones.tsx`

**Funcionalidad**:

- Tubo de ensayo visual grande
- 2 sliders o input numéricos:
  - Soluto (ml)
  - Solvente (ml)
- Visualización en tiempo real:
  - Mezcla con gradiente de color (más soluto = más oscuro)
  - Porcentaje de concentración calculado automáticamente
  - Comparación con objetivo (meta: 25%, actual: 32%)
- Botón "Mezclar" para confirmar
- Feedback: "¡Perfecto!" / "Muy cerca, intentá de nuevo" / "Lejos del objetivo"
- 10 niveles desbloqueables

**Interfaz visual**:

- Tubo de ensayo SVG animado
- Líquidos con efecto de burbujeo
- Partículas flotantes
- Medidor tipo termómetro para concentración

---

### **PASO 9: Implementar componente OlimpiadaProblemas.tsx**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/components/overlays/quimica/OlimpiadaProblemas.tsx`

**Funcionalidad**:

- Lista de 15-20 problemas matemáticos
- Cada problema muestra:
  - Enunciado claro con contexto químico
  - Input de respuesta o botones de opción múltiple
  - Indicador de dificultad (⭐ / ⭐⭐ / ⭐⭐⭐)
  - Puntos otorgados
- Al resolver:
  - Validación inmediata
  - Explicación educativa
  - Suma de puntos
- Barra de progreso general
- Ranking de estrellas al final (1-3 según % de aciertos)

**Interfaz visual**:

- Grid de problemas con estado (pendiente/correcto/incorrecto)
- Tema científico (iconos de química)
- Modal de resultado final con estadísticas

---

### **PASO 10: Implementar componente ReaccionEnCadena.tsx**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/components/overlays/quimica/ReaccionEnCadena.tsx`

**Funcionalidad** (proyecto final más complejo):

- Vista de laboratorio virtual 3D o isométrico
- Panel de reactivos disponibles (arrastrar o clickear)
- Panel de variables con sliders:
  - Temperatura (°C)
  - pH
  - Cantidad de cada reactivo (ml)
- Simulación en tiempo real de la reacción:
  - Color de la mezcla cambia según combinaciones
  - Burbujas si hay efervescencia
  - Humo si se calienta demasiado
- Objetivo mostrado claramente:
  - "Logra pH 7 y temperatura 25°C"
- Botón "Ejecutar Reacción"
- Resultado: éxito/fallo con retroalimentación detallada

**Interfaz visual**:

- Estética de laboratorio moderno
- Matraz Erlenmeyer animado
- Partículas de reacción con canvas/WebGL
- Panel de control estilo sci-fi

---

### **PASO 11: Integrar actividades en el átomo de química**

**Archivo**: `apps/web/src/app/estudiante/gimnasio/components/overlays/LaboratorioEcosistema.tsx`

**Cambios**:

1. Actualizar array `ELECTRONES` con contenido real
2. Reemplazar las 3 actividades placeholder de cada electrón con:
   - Video/lectura intro
   - Ejercicio/simulador
   - Desafío/evaluación
3. Cambiar `handleIrAMision()` para abrir el componente correcto según `actividadId`
4. Integrar los 4 componentes nuevos en el flujo de navegación

**Ejemplo de integración**:

```typescript
const ELECTRONES: Electron[] = [
  {
    id: 'intro',
    nombre: 'Introducción',
    emoji: '🧪',
    color: '#3b82f6',
    orbitRadius: 140,
    anglePosition: 0,
    size: 70,
    completado: false,
    bloqueado: false,
    actividades: [
      {
        id: 'video-intro',
        titulo: 'Video: ¿Qué es la Química?',
        emoji: '🎬',
        duracion: '3 min',
        completada: false,
      },
      {
        id: 'quiz-intro',
        titulo: 'Quiz Rápido',
        emoji: '✅',
        duracion: '2 min',
        completada: false,
      },
      {
        id: 'lab-intro',
        titulo: 'Primera Mezcla',
        emoji: '⚗️',
        duracion: '5 min',
        completada: false,
      },
    ],
  },
  {
    id: 'colores',
    nombre: 'Mezclas de Colores',
    emoji: '🎨',
    color: '#8b5cf6',
    orbitRadius: 200,
    anglePosition: 60,
    size: 75,
    completado: false,
    bloqueado: false,
    actividades: [
      {
        id: 'acertijos-colores',
        titulo: 'Acertijos de Colores',
        emoji: '🧩',
        duracion: '8 min',
        completada: false,
        componente: 'AcertijosQuimicos',
      },
      {
        id: 'mezclar-colores',
        titulo: 'Laboratorio de Colores',
        emoji: '🌈',
        duracion: '10 min',
        completada: false,
        componente: 'SimuladorConcentraciones',
      },
      {
        id: 'quiz-colores',
        titulo: 'Evaluación',
        emoji: '📝',
        duracion: '5 min',
        completada: false,
      },
    ],
  },
  // ... resto de electrones
];
```

---

## 🧪 DETALLE DE LOS 6 ELECTRONES

### **Electrón 1: Introducción a la Química** 🧪

**Actividades**:

1. Video: "¿Qué es la Química?" (3 min) - Intro animada
2. Quiz: 5 preguntas básicas de comprensión
3. Primera mezcla: Simulador simple (agua + colorante)

### **Electrón 2: Mezclas y Colores** 🎨

**Actividades**:

1. Acertijos matemáticos: Problemas de sumas/proporciones con colores
2. Simulador: Mezclar colores primarios → secundarios
3. Desafío: Crear 6 colores diferentes (progresivo)

### **Electrón 3: Concentraciones** ⚗️

**Actividades**:

1. Video: "Soluto y Solvente" (4 min) - Explicación con animaciones
2. Simulador de concentraciones: Niveles 1-10
3. Olimpiada: Problemas de porcentajes/proporciones (subset)

### **Electrón 4: Tabla Periódica** ⚛️

**Actividades**:

1. Tabla Periódica interactiva: Clickear elementos y ver info
2. Memorización: Juego de memoria con símbolos químicos
3. Quiz: Identificar elementos por símbolo/nombre

### **Electrón 5: Reacciones Químicas** 💥

**Actividades**:

1. Video: "Qué es una Reacción Química" (5 min)
2. Balanceo simple: Ecuaciones visuales (H₂ + O₂ → H₂O)
3. Olimpiada de problemas: Subset de problemas matemáticos

### **Electrón 6: Laboratorio Final** 🔬

**Actividades**:

1. Acertijos finales: Problemas integradores
2. Proyecto: Reacción en cadena (actividad más compleja)
3. Evaluación: Quiz final de 10 preguntas

---

## 🗂️ BACKEND Y PERSISTENCIA

### **Endpoints necesarios** (API):

```
GET  /api/estudiante/progreso-quimica
POST /api/estudiante/completar-actividad
GET  /api/estudiante/estadisticas-mes-ciencia
```

### **Modelo de datos** (Prisma):

Ya existe el modelo `Planificacion` y `AsignacionPlanificacion`. Se debe:

1. Verificar que soporte tracking de progreso por actividad individual
2. Agregar campo `actividadCompletada: boolean[]` (18 elementos, uno por actividad)
3. Endpoint para actualizar progreso cuando el estudiante completa una actividad

---

## 📊 CRITERIOS DE ÉXITO

### **Funcional**:

- ✅ Las 4 actividades asincrónicas funcionan end-to-end
- ✅ Progreso se guarda en backend y persiste entre sesiones
- ✅ Contenido adaptado por grupo etario (6-7, 8-9, 10-12)
- ✅ Sistema de estrellas funciona correctamente
- ✅ Navegación fluida: 4 cards → átomo → electrón → actividad → volver
- ✅ Animaciones suaves y sin bugs visuales

### **Pedagógico**:

- ✅ Los problemas matemáticos son apropiados para cada edad
- ✅ La narrativa de "laboratorio secreto" se mantiene consistente
- ✅ Feedback educativo en cada respuesta incorrecta
- ✅ Progresión de dificultad: fácil → medio → difícil
- ✅ Gamificación motivante (puntos, estrellas, desbloqueables)

### **Técnico**:

- ✅ TypeScript strict mode sin errores
- ✅ Componentes reutilizables y bien estructurados
- ✅ Performance: 60fps en animaciones
- ✅ Responsive: funciona en tablets y desktops
- ✅ Accesibilidad: navegable por teclado

---

## 📅 ESTIMACIÓN DE TIEMPO

| Tarea                                | Tiempo estimado |
| ------------------------------------ | --------------- |
| PASO 1: Actualizar electrones        | 30 min          |
| PASO 2: Crear tipos TypeScript       | 20 min          |
| PASO 3: Data acertijos               | 1 hora          |
| PASO 4: Data concentraciones         | 45 min          |
| PASO 5: Data olimpiada               | 1 hora          |
| PASO 6: Data reacciones              | 1 hora          |
| PASO 7: AcertijosQuimicos.tsx        | 2 horas         |
| PASO 8: SimuladorConcentraciones.tsx | 3 horas         |
| PASO 9: OlimpiadaProblemas.tsx       | 2 horas         |
| PASO 10: ReaccionEnCadena.tsx        | 4 horas         |
| PASO 11: Integración en átomo        | 1 hora          |
| Testing y ajustes                    | 2 horas         |
| **TOTAL**                            | **~18 horas**   |

---

## 🎨 PALETA DE COLORES - QUÍMICA

```css
/* Tema Química - Verde/Esmeralda */
--quimica-primary: #10b981; /* Emerald 500 */
--quimica-secondary: #059669; /* Emerald 600 */
--quimica-accent: #34d399; /* Emerald 400 */
--quimica-dark: #047857; /* Emerald 700 */
--quimica-light: #d1fae5; /* Emerald 100 */
--quimica-glow: rgba(16, 185, 129, 0.6);

/* Colores de reactivos */
--reactivo-acido: #ef4444; /* Red */
--reactivo-base: #3b82f6; /* Blue */
--reactivo-neutral: #8b5cf6; /* Purple */
--reactivo-agua: #60a5fa; /* Light Blue */
```

---

## 🔄 PRÓXIMOS PASOS (después de Química)

Una vez completada la Semana 1 (Química), replicar el mismo patrón para:

- **Semana 2**: Astronomía 🔭 (Observatorio Galáctico)
- **Semana 3**: Física 🎢 (Parque de Diversiones)
- **Semana 4**: Informática 💻 (Academia de Programadores)

Cada una tendrá su propio átomo con 6 electrones y actividades específicas.

---

## 📝 NOTAS FINALES

- **Narrativa**: Mantener siempre la historia del "laboratorio secreto" y la "crisis química" que deben resolver
- **Gamificación**: Sistema de puntos, estrellas, logros desbloqueables
- **Feedback**: Siempre explicar el "por qué" en cada respuesta incorrecta
- **Accesibilidad**: Textos grandes, colores de alto contraste, navegación por teclado
- **Performance**: Lazy loading de actividades, imágenes optimizadas, animaciones con CSS cuando sea posible

---

**Autor**: Claude (Sonnet 4.5)
**Fecha**: 2025-10-29
**Proyecto**: Mateatletas - Mes de la Ciencia - Semana 1: Química
