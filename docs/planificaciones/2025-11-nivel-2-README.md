# 🎮 Planificación Noviembre 2025 - Nivel 2 (8-9 años)

## ⚠️ IMPORTANTE - ARMAR AQUÍ TU APLICACIÓN REACT

Esta carpeta contiene la planificación de **Noviembre 2025 para Nivel 2 (Grupos B2, B3)**.

**Aquí es donde vas a construir tu aplicación React completamente personalizada.**

---

## 📋 Información de la Planificación

- **Código**: `2025-11-nivel-2`
- **Nivel**: 2 (8-9 años)
- **Grupos objetivo**: B2, B3
- **Mes**: Noviembre 2025
- **Duración**: 4 semanas, 90 minutos por sesión

---

## 🎯 Objetivos Pedagógicos Sugeridos

1. **Semana 1**: Multiplicación (tablas del 2, 3, 5)
2. **Semana 2**: División como reparto equitativo
3. **Semana 3**: Operaciones combinadas (suma, resta, multiplicación)
4. **Semana 4**: Resolución de problemas con múltiples pasos

---

## 🎨 Ideas de Narrativa (Ejemplos)

Podés crear una narrativa inmersiva como:

- 🏴‍☠️ "La Expedición de los Piratas Matemáticos"
- 🔬 "Laboratorio Secreto de Experimentos Numéricos"
- 🌌 "Guardianes de la Galaxia Matemática"
- 🏛️ "El Misterio del Templo de los Números Perdidos"

**O cualquier otra idea que se te ocurra.**

---

## 📁 Estructura Propuesta

```
2025-11-nivel-2/
├── README.md (este archivo)
├── index.tsx                 ← COMPONENTE PRINCIPAL
├── metadata.json             ← CONFIGURACIÓN
├── semanas/
│   ├── semana-1/
│   │   ├── index.tsx        ← ACTIVIDADES SEMANA 1
│   │   ├── JuegoMultiplicacion.tsx
│   │   ├── DesafioTablas.tsx
│   │   └── assets/
│   ├── semana-2/
│   ├── semana-3/
│   └── semana-4/
├── components/               ← COMPONENTES COMPARTIDOS
│   ├── Avatar.tsx
│   ├── MisionPanel.tsx
│   └── ...
└── assets/                   ← RECURSOS GLOBALES
    ├── images/
    ├── sounds/
    └── videos/
```

---

## 🚀 Paso a Paso

### 1. Editar `metadata.json`

Define los datos de tu planificación:

- Título
- Descripción
- Objetivos de aprendizaje
- Temática principal

### 2. Crear `index.tsx`

Este es el componente principal que se va a cargar:

```tsx
'use client';

import { PlanificacionApp } from '@/planificaciones/shared';

export default function PlanificacionNoviembre2025Nivel2() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-2"
      titulo="TU TÍTULO AQUÍ"
      descripcion="TU DESCRIPCIÓN AQUÍ"
    >
      {/*
        AQUÍ ARMÁS TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA

        Para este nivel (8-9 años) podés incluir:
        - Juegos con más complejidad
        - Desafíos cronometrados
        - Competencias amistosas
        - Narrativas más elaboradas
        - Sistemas de niveles y progresión

        ¡Creatividad al máximo!
      */}

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <h1 className="text-5xl font-bold text-white text-center pt-10">
          ¡Tu Aventura Matemática de Nivel 2!
        </h1>

        {/* TUS JUEGOS Y ACTIVIDADES AQUÍ */}
      </div>
    </PlanificacionApp>
  );
}
```

### 3. Crear Actividades Semanales

En `semanas/semana-X/` creá las actividades específicas de cada semana.

### 4. Agregar Recursos

En `assets/` guardá imágenes, sonidos, videos que necesites.

---

## 💡 Componentes Disponibles (Opcionales)

Si querés usar componentes pre-construidos:

```tsx
import {
  ProgressTracker, // Barra de progreso
  GameScore, // Sistema de puntaje
  ActivityTimer, // Temporizador
  AchievementPopup, // Notificaciones de logros
  WeekNavigation, // Navegación entre semanas
} from '@/planificaciones/shared';
```

**Pero podés hacer TODO desde cero si preferís.**

---

## 🎯 Características Sugeridas para Nivel 2

Para estudiantes de 8-9 años, podés incluir:

- ⏱️ **Desafíos cronometrados**: Agregar presión de tiempo
- 🏆 **Sistema de niveles**: Progresión más compleja
- 👥 **Modo colaborativo**: Trabajar en equipo
- 📊 **Estadísticas**: Mostrar progreso y mejoras
- 🎮 **Mini-juegos variados**: Diferentes mecánicas de juego
- 🌟 **Badges y logros**: Reconocimiento de habilidades

---

## 📊 Ejemplo de Juego con Timer

```tsx
'use client';

import { useState, useEffect } from 'react';
import { PlanificacionApp, GameScore, ActivityTimer } from '@/planificaciones/shared';

export default function PlanificacionNoviembre2025Nivel2() {
  const [puntos, setPuntos] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(60);
  const [preguntaActual, setPreguntaActual] = useState({ a: 5, b: 3 });

  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tiempoRestante]);

  const verificarRespuesta = (respuesta: number) => {
    if (respuesta === preguntaActual.a * preguntaActual.b) {
      setPuntos((prev) => prev + 10);
      // Generar nueva pregunta
      setPreguntaActual({
        a: Math.floor(Math.random() * 10) + 1,
        b: Math.floor(Math.random() * 10) + 1,
      });
    }
  };

  return (
    <PlanificacionApp codigo="2025-11-nivel-2" titulo="Carrera de Multiplicaciones">
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-8">
        <div className="flex justify-between items-center mb-8">
          <GameScore puntos={puntos} />
          <ActivityTimer tiempoRestante={tiempoRestante} />
        </div>

        <div className="text-center mt-10 bg-white rounded-2xl p-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            ¿Cuánto es {preguntaActual.a} × {preguntaActual.b}?
          </h2>

          <input
            type="number"
            className="text-3xl p-4 border-4 border-purple-500 rounded-lg text-center"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                verificarRespuesta(parseInt(e.currentTarget.value));
                e.currentTarget.value = '';
              }
            }}
            placeholder="?"
            autoFocus
          />
        </div>
      </div>
    </PlanificacionApp>
  );
}
```

---

## 🎨 Libertad Creativa Total

Recordá que podés:

- Usar cualquier librería de React
- Crear animaciones con CSS, Framer Motion, GSAP
- Usar Canvas, SVG, WebGL
- Integrar videos y audios
- Hacer juegos con física (Matter.js, Phaser)
- Crear sistemas de progresión complejos
- ¡Lo que se te ocurra!

---

## ✅ Checklist

- [ ] Diseñar narrativa y temática
- [ ] Completar `metadata.json`
- [ ] Crear `index.tsx` con componente principal
- [ ] Programar actividades de Semana 1
- [ ] Programar actividades de Semana 2
- [ ] Programar actividades de Semana 3
- [ ] Programar actividades de Semana 4
- [ ] Agregar assets (imágenes, sonidos)
- [ ] Implementar sistema de puntuación
- [ ] Agregar feedback inmediato
- [ ] Probar la aplicación
- [ ] Documentar objetivos pedagógicos

---

## 🆘 Ayuda

Si tenés dudas sobre cómo integrar algo específico, consultá:

- `/planificaciones/shared/README.md` - Componentes disponibles
- `/planificaciones/README.md` - Guía general del sistema

---

¡A crear una experiencia desafiante para los chicos de 8-9 años! 🚀
