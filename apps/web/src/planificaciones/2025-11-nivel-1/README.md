# 🎮 Planificación Noviembre 2025 - Nivel 1 (6-7 años)

## ⚠️ IMPORTANTE - ARMAR AQUÍ TU APLICACIÓN REACT

Esta carpeta contiene la planificación de **Noviembre 2025 para Nivel 1 (Grupo B1)**.

**Aquí es donde vas a construir tu aplicación React completamente personalizada.**

---

## 📋 Información de la Planificación

- **Código**: `2025-11-nivel-1`
- **Nivel**: 1 (6-7 años)
- **Grupos objetivo**: B1
- **Mes**: Noviembre 2025
- **Duración**: 4 semanas, 75 minutos por sesión

---

## 🎯 Objetivos Pedagógicos Sugeridos

1. **Semana 1**: Reconocimiento de números hasta 50
2. **Semana 2**: Suma sin reagrupamiento (hasta 20)
3. **Semana 3**: Resta sin reagrupamiento (hasta 20)
4. **Semana 4**: Resolución de problemas simples contextualizados

---

## 🎨 Ideas de Narrativa (Ejemplos)

Podés crear una narrativa inmersiva como:
- 🏰 "El Castillo de los Números Mágicos"
- 🌳 "La Aventura en el Bosque Matemático"
- 🚀 "Viaje a los Planetas de los Números"
- 🐉 "La Búsqueda del Tesoro del Dragón Matemático"

**O cualquier otra idea que se te ocurra.**

---

## 📁 Estructura Propuesta

```
2025-11-nivel-1/
├── README.md (este archivo)
├── index.tsx                 ← COMPONENTE PRINCIPAL
├── metadata.json             ← CONFIGURACIÓN
├── semanas/
│   ├── semana-1/
│   │   ├── index.tsx        ← ACTIVIDADES SEMANA 1
│   │   ├── Juego1.tsx
│   │   ├── Juego2.tsx
│   │   └── assets/
│   ├── semana-2/
│   ├── semana-3/
│   └── semana-4/
├── components/               ← COMPONENTES COMPARTIDOS
│   ├── Personaje.tsx
│   ├── MundoJuego.tsx
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

export default function PlanificacionNoviembre2025Nivel1() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="TU TÍTULO AQUÍ"
      descripcion="TU DESCRIPCIÓN AQUÍ"
    >
      {/*
        AQUÍ ARMÁS TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA

        Podés usar:
        - Canvas para juegos 2D
        - Drag & Drop
        - Animaciones
        - Videos
        - Audios
        - Cualquier librería de React

        ¡Creatividad al máximo!
      */}

      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-600">
        <h1 className="text-4xl font-bold text-white text-center pt-10">
          ¡Bienvenidos a tu Aventura Matemática!
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
  ProgressTracker,    // Barra de progreso
  GameScore,          // Sistema de puntaje
  ActivityTimer,      // Temporizador
  AchievementPopup,   // Notificaciones de logros
} from '@/planificaciones/shared';
```

**Pero podés hacer TODO desde cero si preferís.**

---

## 🎯 Tracking Automático

El sistema automáticamente trackea:
- ✅ Qué estudiante jugó
- ✅ Cuánto tiempo estuvo
- ✅ Qué actividades completó
- ✅ Puntos obtenidos

**No necesitás programar esto**, solo usá el wrapper `<PlanificacionApp>`.

---

## 📊 Ejemplo de Juego Simple

```tsx
'use client';

import { useState } from 'react';
import { PlanificacionApp, GameScore } from '@/planificaciones/shared';

export default function PlanificacionNoviembre2025Nivel1() {
  const [puntos, setPuntos] = useState(0);

  const handleRespuesta = (esCorrecta: boolean) => {
    if (esCorrecta) {
      setPuntos(prev => prev + 10);
    }
  };

  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="El Reino de los Números"
    >
      <div className="min-h-screen bg-blue-500 p-8">
        <GameScore puntos={puntos} />

        <div className="text-center mt-10">
          <h2 className="text-3xl text-white mb-4">
            ¿Cuánto es 5 + 3?
          </h2>

          <button
            onClick={() => handleRespuesta(false)}
            className="bg-white px-6 py-3 rounded-lg m-2"
          >
            7
          </button>

          <button
            onClick={() => handleRespuesta(true)}
            className="bg-white px-6 py-3 rounded-lg m-2"
          >
            8
          </button>

          <button
            onClick={() => handleRespuesta(false)}
            className="bg-white px-6 py-3 rounded-lg m-2"
          >
            9
          </button>
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
- [ ] Probar la aplicación
- [ ] Documentar objetivos pedagógicos

---

## 🆘 Ayuda

Si tenés dudas sobre cómo integrar algo específico, consultá:
- `/planificaciones/shared/README.md` - Componentes disponibles
- `/planificaciones/README.md` - Guía general del sistema

---

¡A crear una experiencia increíble para los chicos de 6-7 años! 🎉
