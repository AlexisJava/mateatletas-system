# 🎮 Planificación Noviembre 2025 - Nivel 3 (10-12 años)

## ⚠️ IMPORTANTE - ARMAR AQUÍ TU APLICACIÓN REACT

Esta carpeta contiene la planificación de **Noviembre 2025 para Nivel 3 (Grupos B4, L1, L2)**.

**Aquí es donde vas a construir tu aplicación React completamente personalizada.**

---

## 📋 Información de la Planificación

- **Código**: `2025-11-nivel-3`
- **Nivel**: 3 (10-12 años)
- **Grupos objetivo**: B4, L1, L2
- **Mes**: Noviembre 2025
- **Duración**: 4 semanas, 120 minutos por sesión

---

## 🎯 Objetivos Pedagógicos Sugeridos

1. **Semana 1**: Fracciones y decimales (conversión y operaciones)
2. **Semana 2**: Proporciones y porcentajes aplicados
3. **Semana 3**: Geometría avanzada (áreas, perímetros, volúmenes)
4. **Semana 4**: Resolución de problemas complejos y pensamiento crítico

---

## 🎨 Ideas de Narrativa (Ejemplos)

Para este nivel podés crear narrativas más sofisticadas:
- 🧬 "La Misión de los Científicos del Futuro"
- 🏙️ "Arquitectos de la Ciudad Matemática"
- 🌍 "Expedición a los Enigmas del Mundo"
- 🎮 "La Academia de Hackers Matemáticos"
- 🚀 "Colonización de Marte: Desafíos Numéricos"

**O cualquier otra idea que se te ocurra.**

---

## 📁 Estructura Propuesta

```
2025-11-nivel-3/
├── README.md (este archivo)
├── index.tsx                 ← COMPONENTE PRINCIPAL
├── metadata.json             ← CONFIGURACIÓN
├── semanas/
│   ├── semana-1/
│   │   ├── index.tsx        ← ACTIVIDADES SEMANA 1
│   │   ├── SimuladorFracciones.tsx
│   │   ├── DesafioDecimales.tsx
│   │   └── assets/
│   ├── semana-2/
│   ├── semana-3/
│   └── semana-4/
├── components/               ← COMPONENTES COMPARTIDOS
│   ├── Simulador3D.tsx
│   ├── GraphEngine.tsx
│   ├── CodeChallenge.tsx
│   └── ...
└── assets/                   ← RECURSOS GLOBALES
    ├── images/
    ├── sounds/
    ├── videos/
    └── models/              ← Modelos 3D si usás
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

export default function PlanificacionNoviembre2025Nivel3() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-3"
      titulo="TU TÍTULO AQUÍ"
      descripcion="TU DESCRIPCIÓN AQUÍ"
    >
      {/*
        AQUÍ ARMÁS TU APLICACIÓN REACT COMPLETAMENTE PERSONALIZADA

        Para este nivel (10-12 años) podés incluir:
        - Simulaciones interactivas complejas
        - Visualizaciones de datos en tiempo real
        - Programación visual (tipo Scratch)
        - Experimentos científicos virtuales
        - Desafíos de pensamiento crítico
        - Narrativas multi-lineales
        - Sistemas de decisiones complejas

        ¡Máxima creatividad y complejidad!
      */}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <h1 className="text-6xl font-bold text-white text-center pt-10">
          ¡Bienvenidos al Nivel Avanzado!
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

En `assets/` guardá imágenes, sonidos, videos, modelos 3D que necesites.

---

## 💡 Componentes Disponibles (Opcionales)

Si querés usar componentes pre-construidos:

```tsx
import {
  ProgressTracker,    // Barra de progreso
  GameScore,          // Sistema de puntaje
  ActivityTimer,      // Temporizador
  AchievementPopup,   // Notificaciones de logros
  WeekNavigation,     // Navegación entre semanas
  StudentProfile,     // Perfil del estudiante
} from '@/planificaciones/shared';
```

**Pero podés hacer TODO desde cero si preferís.**

---

## 🎯 Características Sugeridas para Nivel 3

Para estudiantes de 10-12 años, podés incluir:

- 🧠 **Desafíos de lógica compleja**: Problemas multi-paso
- 📊 **Visualización de datos**: Gráficos interactivos
- 💻 **Programación visual**: Bloques tipo Scratch
- 🔬 **Simulaciones científicas**: Experimentos virtuales
- 🏆 **Rankings y competencias**: Tablas de posiciones
- 🎯 **Misiones ramificadas**: Decisiones que afectan el resultado
- 🌐 **Colaboración en tiempo real**: Trabajo en equipo online
- 📈 **Análisis de rendimiento**: Métricas detalladas

---

## 📊 Ejemplo de Simulador Avanzado

```tsx
'use client';

import { useState } from 'react';
import { PlanificacionApp, GameScore } from '@/planificaciones/shared';

interface Fraccion {
  numerador: number;
  denominador: number;
}

export default function PlanificacionNoviembre2025Nivel3() {
  const [puntos, setPuntos] = useState(0);
  const [fraccion1, setFraccion1] = useState<Fraccion>({ numerador: 1, denominador: 2 });
  const [fraccion2, setFraccion2] = useState<Fraccion>({ numerador: 1, denominador: 3 });

  const calcularSuma = (): Fraccion => {
    // Algoritmo de suma de fracciones
    const mcm = (fraccion1.denominador * fraccion2.denominador) /
                 gcd(fraccion1.denominador, fraccion2.denominador);

    const num1 = fraccion1.numerador * (mcm / fraccion1.denominador);
    const num2 = fraccion2.numerador * (mcm / fraccion2.denominador);

    return simplificar({
      numerador: num1 + num2,
      denominador: mcm
    });
  };

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

  const simplificar = (f: Fraccion): Fraccion => {
    const divisor = gcd(f.numerador, f.denominador);
    return {
      numerador: f.numerador / divisor,
      denominador: f.denominador / divisor
    };
  };

  const verificarRespuesta = (num: number, den: number) => {
    const resultado = calcularSuma();
    if (num === resultado.numerador && den === resultado.denominador) {
      setPuntos(prev => prev + 20);
      // Generar nuevas fracciones
      generarNuevasFracciones();
    }
  };

  const generarNuevasFracciones = () => {
    setFraccion1({
      numerador: Math.floor(Math.random() * 9) + 1,
      denominador: Math.floor(Math.random() * 9) + 2
    });
    setFraccion2({
      numerador: Math.floor(Math.random() * 9) + 1,
      denominador: Math.floor(Math.random() * 9) + 2
    });
  };

  return (
    <PlanificacionApp
      codigo="2025-11-nivel-3"
      titulo="Laboratorio de Fracciones"
    >
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 p-8">
        <GameScore puntos={puntos} />

        <div className="max-w-4xl mx-auto mt-10">
          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              Suma de Fracciones
            </h2>

            {/* Visualización de fracciones */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600">
                  {fraccion1.numerador}
                </div>
                <div className="border-t-4 border-purple-600 w-24 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-purple-600">
                  {fraccion1.denominador}
                </div>
              </div>

              <div className="text-6xl font-bold text-gray-600">+</div>

              <div className="text-center">
                <div className="text-6xl font-bold text-pink-600">
                  {fraccion2.numerador}
                </div>
                <div className="border-t-4 border-pink-600 w-24 mx-auto my-2"></div>
                <div className="text-6xl font-bold text-pink-600">
                  {fraccion2.denominador}
                </div>
              </div>

              <div className="text-6xl font-bold text-gray-600">=</div>

              <div className="text-center">
                <input
                  type="number"
                  className="w-24 text-4xl text-center border-4 border-green-500 rounded-lg p-2"
                  placeholder="?"
                />
                <div className="border-t-4 border-green-500 w-24 mx-auto my-2"></div>
                <input
                  type="number"
                  className="w-24 text-4xl text-center border-4 border-green-500 rounded-lg p-2"
                  placeholder="?"
                />
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold py-4 rounded-xl hover:scale-105 transition-transform"
              onClick={() => {
                const num = parseInt((document.querySelectorAll('input[type="number"]')[0] as HTMLInputElement).value);
                const den = parseInt((document.querySelectorAll('input[type="number"]')[1] as HTMLInputElement).value);
                verificarRespuesta(num, den);
              }}
            >
              Verificar
            </button>
          </div>
        </div>
      </div>
    </PlanificacionApp>
  );
}
```

---

## 🎨 Tecnologías Sugeridas

Para este nivel avanzado, considerá usar:

- **Visualización**: Chart.js, D3.js, Recharts
- **3D**: Three.js, React Three Fiber
- **Animaciones**: Framer Motion, GSAP
- **Física**: Matter.js, Cannon.js
- **Programación visual**: Blockly
- **Mapas**: Leaflet, Mapbox
- **Matemática visual**: Desmos API, GeoGebra

---

## 🎨 Libertad Creativa Total

Recordá que podés:
- Usar cualquier librería de React
- Crear visualizaciones complejas
- Implementar simulaciones científicas
- Hacer juegos con física realista
- Crear sistemas de progresión multinivel
- Integrar APIs externas
- ¡Lo que se te ocurra!

---

## ✅ Checklist

- [ ] Diseñar narrativa compleja y temática
- [ ] Completar `metadata.json`
- [ ] Crear `index.tsx` con componente principal
- [ ] Programar actividades de Semana 1
- [ ] Programar actividades de Semana 2
- [ ] Programar actividades de Semana 3
- [ ] Programar actividades de Semana 4
- [ ] Agregar assets (imágenes, sonidos, modelos 3D)
- [ ] Implementar sistema de puntuación avanzado
- [ ] Agregar feedback detallado y explicativo
- [ ] Implementar sistema de hints/pistas
- [ ] Crear desafíos opcionales para estudiantes avanzados
- [ ] Probar la aplicación exhaustivamente
- [ ] Documentar objetivos pedagógicos detallados

---

## 🆘 Ayuda

Si tenés dudas sobre cómo integrar algo específico, consultá:
- `/planificaciones/shared/README.md` - Componentes disponibles
- `/planificaciones/README.md` - Guía general del sistema

---

¡A crear una experiencia desafiante e inmersiva para los chicos de 10-12 años! 🔥
