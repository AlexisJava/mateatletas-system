# 🛠️ Componentes Compartidos - Sistema de Planificaciones

## 📖 Descripción

Esta carpeta contiene componentes, hooks y utilidades **opcionales** que podés usar en tus planificaciones para acelerar el desarrollo.

**Importante:** No estás obligado a usar ninguno de estos componentes. Podés crear TODO desde cero si preferís.

---

## 🎯 ¿Qué provee el sistema?

### Tracking Automático

El componente `<PlanificacionApp>` maneja automáticamente:

- ✅ **Autenticación**: Verifica que el estudiante esté logueado
- ✅ **Inicio de sesión**: Registra cuándo empezó la actividad
- ✅ **Tiempo de actividad**: Cuenta cuántos minutos estuvo activo
- ✅ **Auto-guardado**: Guarda el progreso cada 5 minutos
- ✅ **Registro de finalización**: Cuando el estudiante termina

### Componentes UI Listos

Componentes pre-construidos para acelerar el desarrollo:

- 🎮 **GameScore**: Puntaje del juego
- ⏱️ **ActivityTimer**: Temporizador con barra de progreso
- 📊 **ProgressTracker**: Barra de progreso general
- 🏆 **AchievementPopup**: Notificación de logro desbloqueado

---

## 📦 Componentes Disponibles

### `<PlanificacionApp>`

**Wrapper principal obligatorio** para todas las planificaciones.

```tsx
import { PlanificacionApp } from '@/planificaciones/shared';

export default function MiPlanificacion() {
  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="El Reino de los Números Mágicos"
      descripcion="Una aventura mágica..."
    >
      {/* Tu aplicación aquí */}
    </PlanificacionApp>
  );
}
```

**Props:**
- `codigo`: ID único de la planificación (ej: "2025-11-nivel-1")
- `titulo`: Título de la planificación
- `descripcion` (opcional): Descripción breve

**Qué hace automáticamente:**
- Registra inicio de sesión
- Trackea tiempo de actividad
- Auto-guarda cada 5 minutos
- Registra finalización al cerrar

---

### `<GameScore>`

Muestra el puntaje del juego.

```tsx
import { GameScore } from '@/planificaciones/shared';

function MiJuego() {
  const [puntos, setPuntos] = useState(0);

  return (
    <div>
      <GameScore puntos={puntos} />
    </div>
  );
}
```

**Props:**
- `puntos`: Puntaje actual (número)
- `className` (opcional): Clases CSS adicionales

---

### `<ActivityTimer>`

Temporizador con barra de progreso circular.

```tsx
import { ActivityTimer } from '@/planificaciones/shared';

function MiJuego() {
  const [tiempoRestante, setTiempoRestante] = useState(60);

  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tiempoRestante]);

  return (
    <div>
      <ActivityTimer
        tiempoRestante={tiempoRestante}
        tiempoTotal={60}
        onTimeout={() => alert('¡Tiempo terminado!')}
      />
    </div>
  );
}
```

**Props:**
- `tiempoRestante`: Tiempo restante en segundos
- `tiempoTotal` (opcional): Tiempo total (default: 60)
- `onTimeout` (opcional): Callback cuando llega a 0
- `className` (opcional): Clases CSS adicionales

---

### `<ProgressTracker>`

Barra de progreso con porcentaje.

```tsx
import { ProgressTracker } from '@/planificaciones/shared';

function MiActividad() {
  const [progreso, setProgreso] = useState(0); // 0-100

  return (
    <div>
      <ProgressTracker
        progreso={progreso}
        label="Progreso de la semana"
      />
    </div>
  );
}
```

**Props:**
- `progreso`: Porcentaje de progreso (0-100)
- `label` (opcional): Texto descriptivo
- `className` (opcional): Clases CSS adicionales

---

### `<AchievementPopup>`

Notificación de logro desbloqueado con auto-cierre.

```tsx
import { AchievementPopup } from '@/planificaciones/shared';

function MiJuego() {
  const [mostrarLogro, setMostrarLogro] = useState(false);

  const desbloquearLogro = () => {
    setMostrarLogro(true);
  };

  return (
    <div>
      <button onClick={desbloquearLogro}>
        Completar misión
      </button>

      <AchievementPopup
        visible={mostrarLogro}
        onClose={() => setMostrarLogro(false)}
        achievement={{
          titulo: '¡Maestro de las Sumas!',
          descripcion: 'Completaste 10 sumas sin errores',
          icono: '🎯',
          puntos: 50,
        }}
      />
    </div>
  );
}
```

**Props:**
- `visible`: Booleano para mostrar/ocultar
- `onClose`: Callback al cerrar
- `achievement`: Objeto con datos del logro
  - `titulo`: Nombre del logro
  - `descripcion`: Descripción
  - `icono` (opcional): Emoji o icono
  - `puntos` (opcional): Puntos otorgados

---

## 🪝 Hooks Disponibles

### `usePlanificacionTracking`

Hook para tracking manual de progreso.

```tsx
import { usePlanificacionTracking } from '@/planificaciones/shared';

function MiJuego() {
  const {
    registrarInicio,
    registrarProgreso,
    guardarEstado,
    cargarEstado,
    registrarCompletado,
  } = usePlanificacionTracking('2025-11-nivel-1');

  useEffect(() => {
    registrarInicio();
  }, []);

  const completarNivel = () => {
    registrarProgreso({
      puntos_obtenidos: 100,
      tiempo_total_minutos: 15,
    });
  };

  const guardarPartida = () => {
    guardarEstado({
      nivel: 5,
      vidas: 3,
      items: ['espada', 'escudo'],
    });
  };

  const cargarPartida = () => {
    const estadoGuardado = cargarEstado();
    if (estadoGuardado) {
      // Restaurar estado del juego
    }
  };

  return <div>Mi juego...</div>;
}
```

**Métodos:**
- `registrarInicio()`: Registra inicio de actividad
- `registrarProgreso(data)`: Actualiza progreso
- `guardarEstado(estado)`: Guarda estado del juego
- `cargarEstado()`: Carga estado guardado
- `registrarCompletado(puntos)`: Marca como completado

---

## 📝 Tipos TypeScript

Todos los tipos están disponibles para importar:

```tsx
import type {
  PlanificacionMetadata,
  SemanaMetadata,
  ProgresoEstudiante,
  PlanificacionState,
  GameScoreProps,
  ActivityTimerProps,
  ProgressTrackerProps,
  AchievementData,
  AchievementPopupProps,
} from '@/planificaciones/shared';
```

---

## 🎨 Ejemplo Completo

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PlanificacionApp,
  GameScore,
  ActivityTimer,
  ProgressTracker,
  AchievementPopup,
  usePlanificacionTracking,
} from '@/planificaciones/shared';

export default function MiPlanificacion() {
  const [puntos, setPuntos] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [progreso, setProgreso] = useState(0);
  const [logro, setLogro] = useState<any>(null);

  const { registrarProgreso, guardarEstado } = usePlanificacionTracking('2025-11-nivel-1');

  // Timer countdown
  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(() => setTiempoRestante(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [tiempoRestante]);

  // Auto-guardar estado
  useEffect(() => {
    guardarEstado({ puntos, progreso });
  }, [puntos, progreso]);

  const responderPregunta = (correcta: boolean) => {
    if (correcta) {
      const nuevosPuntos = puntos + 10;
      setPuntos(nuevosPuntos);
      setProgreso(prev => Math.min(100, prev + 10));

      if (nuevosPuntos === 100) {
        setLogro({
          titulo: '¡Centenario!',
          descripcion: 'Llegaste a 100 puntos',
          icono: '💯',
          puntos: 50,
        });
      }

      registrarProgreso({
        puntos_obtenidos: nuevosPuntos,
      });
    }
  };

  return (
    <PlanificacionApp
      codigo="2025-11-nivel-1"
      titulo="Mi Planificación Increíble"
    >
      <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-8">
        {/* Header con Score y Timer */}
        <div className="flex justify-between items-center mb-8">
          <GameScore puntos={puntos} />
          <ActivityTimer
            tiempoRestante={tiempoRestante}
            tiempoTotal={120}
            onTimeout={() => alert('¡Tiempo terminado!')}
          />
        </div>

        {/* Barra de progreso */}
        <ProgressTracker
          progreso={progreso}
          label="Progreso de la misión"
          className="mb-8"
        />

        {/* Tu juego aquí */}
        <div className="bg-white rounded-3xl p-10">
          <h2 className="text-3xl font-bold mb-6">¿Cuánto es 5 + 3?</h2>

          <button
            onClick={() => responderPregunta(true)}
            className="bg-green-500 text-white px-8 py-4 rounded-lg text-xl font-bold"
          >
            8 ✓
          </button>

          <button
            onClick={() => responderPregunta(false)}
            className="bg-red-500 text-white px-8 py-4 rounded-lg text-xl font-bold ml-4"
          >
            7 ✗
          </button>
        </div>

        {/* Popup de logro */}
        <AchievementPopup
          visible={!!logro}
          onClose={() => setLogro(null)}
          achievement={logro || {}}
        />
      </div>
    </PlanificacionApp>
  );
}
```

---

## ⚠️ Recordá

**No estás obligado a usar NADA de esto.**

Estos son componentes opcionales para acelerar el desarrollo. Podés:

- Usar solo algunos componentes
- Crear tus propios componentes
- Ignorar todo y construir desde cero
- Mezclar: usar componentes compartidos Y crear los tuyos

**La única regla:** Tu planificación debe estar envuelta en `<PlanificacionApp>` para el tracking automático.

---

## 🆘 Soporte

Si necesitás agregar más componentes compartidos o funcionalidades, podés:

1. Crear tus propios componentes en `/planificaciones/shared/components/`
2. Exportarlos en `/planificaciones/shared/index.ts`
3. Usarlos en todas tus planificaciones

---

¡A crear experiencias increíbles! 🚀
