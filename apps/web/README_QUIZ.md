# 🎯 Sistema de Quiz Inteligente - Mateatletas

Sistema completo de quiz con algoritmo de recomendación de rutas de aprendizaje personalizadas para estudiantes de 6-17 años.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Estructura de Archivos](#estructura-de-archivos)
- [Guía de Uso](#guía-de-uso)
- [Algoritmo de Recomendación](#algoritmo-de-recomendación)
- [Integración con Backend](#integración-con-backend)
- [Testing](#testing)
- [Personalización](#personalización)

---

## 📖 Descripción General

Este sistema permite a los padres completar un quiz de 5 preguntas sobre su hijo/a para obtener una **recomendación personalizada** de una ruta de aprendizaje (4 cursos secuenciales).

### ✨ Características

- ✅ **5 preguntas optimizadas** (completo en menos de 2 minutos)
- ✅ **10 rutas pre-definidas** que cubren diferentes perfiles
- ✅ **Algoritmo de scoring inteligente** (0-100 puntos)
- ✅ **Animaciones suaves** con Framer Motion
- ✅ **Persistencia en localStorage** (si el usuario recarga la página)
- ✅ **100% responsive** (mobile-first)
- ✅ **Integración opcional con backend** NestJS
- ✅ **Accesibilidad** (keyboard navigation, ARIA labels)

### 💰 Modelo de Negocio

- **Curso individual**: $30.000 ARS
- **Ruta completa (4 cursos)**: USD $30 (~$45.000 ARS)
- **Ahorro**: $75.000 ARS (63% de descuento)

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuario completa Quiz (5 preguntas)                    │
│     └─> Estado en React + localStorage                     │
│                                                             │
│  2. Algoritmo genera recomendación (100% frontend)         │
│     └─> Scoring de 10 rutas predefinidas                   │
│                                                             │
│  3. Muestra resultado al usuario                           │
│     └─> Ruta principal + alternativas                      │
│                                                             │
│  4. (Opcional) Envía datos al backend                      │
│     └─> Solo si el usuario dejó email                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS - Railway)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/quiz/submit                                      │
│  ├─> Guarda en PostgreSQL                                  │
│  ├─> (Opcional) Envía email al padre                       │
│  └─> Retorna quiz_id                                       │
│                                                             │
│  GET /api/quiz/stats                                        │
│  └─> Estadísticas para dashboard admin                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
apps/web/
├── src/
│   ├── types/
│   │   └── courses.ts                    # Interfaces TypeScript
│   │
│   ├── data/
│   │   └── rutasAprendizaje.ts           # 10 rutas pre-definidas
│   │
│   ├── lib/
│   │   ├── algorithms/
│   │   │   └── recomendarRuta.ts         # Algoritmo de matching
│   │   │
│   │   └── api/
│   │       └── quizApi.ts                # Cliente para backend
│   │
│   ├── components/
│   │   └── quiz/
│   │       ├── QuizAsincronico.tsx       # Componente principal
│   │       ├── Pregunta1.tsx             # Nombre y edad
│   │       ├── Pregunta2.tsx             # Intereses (multi-select)
│   │       ├── Pregunta3.tsx             # Nivel actual
│   │       ├── Pregunta4.tsx             # Objetivos (multi-select)
│   │       └── Pregunta5.tsx             # Tiempo + email opcional
│   │
│   └── app/
│       └── quiz-test/
│           └── page.tsx                  # Página de testing
│
└── README_QUIZ.md                        # Este archivo
```

---

## 🚀 Guía de Uso

### 1. Configuración Inicial

El sistema ya está implementado y listo para usar. Solo necesitas configurar la URL del backend:

```bash
# En .env.local
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
```

### 2. Testing Local

Accede a la página de testing:

```
http://localhost:3000/quiz-test
```

Esta página incluye:
- ✅ El quiz completo funcional
- ✅ Vista de resultados con todos los datos
- ✅ JSON completo para debugging
- ✅ Respuesta del backend (si está configurado)

### 3. Integración en tu App

Para integrar el quiz en cualquier página:

```tsx
'use client';

import { useState } from 'react';
import QuizAsincronico from '@/components/quiz/QuizAsincronico';
import { recomendarRuta } from '@/lib/algorithms/recomendarRuta';
import { enviarQuizAlBackend } from '@/lib/api/quizApi';
import { RUTAS } from '@/data/rutasAprendizaje';
import { QuizResponses } from '@/types/courses';

export default function MiPaginaDelQuiz() {
  const [resultado, setResultado] = useState(null);

  const handleComplete = async (respuestas: QuizResponses) => {
    // 1. Generar recomendación
    const recomendacion = recomendarRuta(respuestas, RUTAS);

    // 2. Enviar al backend (opcional)
    if (respuestas.parent_email) {
      await enviarQuizAlBackend(respuestas, recomendacion);
    }

    // 3. Mostrar resultado
    setResultado({ respuestas, recomendacion });
  };

  return (
    <div>
      {!resultado ? (
        <QuizAsincronico onComplete={handleComplete} />
      ) : (
        <MiPaginaDeResultados resultado={resultado} />
      )}
    </div>
  );
}
```

---

## 🧠 Algoritmo de Recomendación

El algoritmo calcula un **score de 0-100** para cada ruta basándose en:

### Sistema de Puntuación

| Factor | Puntos | Descripción |
|--------|--------|-------------|
| **Edad** | 20 pts | Qué tan cerca está de la edad ideal de la ruta |
| **Interés** | 30 pts | **EL MÁS IMPORTANTE** - Si los intereses coinciden |
| **Objetivo** | 25 pts | Si los objetivos del padre coinciden con la ruta |
| **Nivel** | 15 pts | Si el nivel actual es compatible |
| **Tiempo** | 10 pts | Si el tiempo disponible es adecuado para la duración |

### Ejemplo de Cálculo

Usuario: Mateo, 10 años, le gustan los videojuegos, nunca programó, quiere crear su propio proyecto, tiene 3-4hrs/semana.

**Ruta "Game Maker"**:
- Edad ideal: 10.5 años → ✅ 20 puntos (diferencia < 1 año)
- Interés "videojuegos" coincide → ✅ 30 puntos
- Objetivo "proyecto" coincide → ✅ 25 puntos
- Nivel "principiante" perfecto para "nunca" → ✅ 15 puntos
- Tiempo "3-4hrs" adecuado → ✅ 10 puntos
- **TOTAL: 100/100** ⭐

### Lógica de Selección

```typescript
// 1. Filtrado duro
- Edad fuera de rango → ❌ eliminar
- Principiante absoluto + ruta avanzada → ❌ eliminar

// 2. Scoring
- Calcular score para cada ruta compatible

// 3. Ordenar
- Por score descendente
- Empate: priorizar rutas más cortas

// 4. Seleccionar
- Ruta con mayor score = Principal
- Rutas con score >= 60 = Alternativas (máx 3)
```

---

## 🔌 Integración con Backend

### Endpoint Requerido

Tu backend NestJS debe implementar:

```typescript
POST /api/quiz/submit

// Request
{
  nombre_estudiante: string,
  edad: number,
  interes_principal: string[],
  nivel_actual: string,
  objetivo: string[],
  tiempo_disponible: string,
  ruta_recomendada_id: string,
  ruta_recomendada_nombre: string,
  score_match: number,
  alternativas_ids: string[],
  parent_email?: string,
  parent_name?: string,
  timestamp: string
}

// Response
{
  success: true,
  quiz_id: "uuid-del-quiz",
  message: "Quiz guardado correctamente"
}
```

### Opcional: Endpoints Adicionales

```typescript
// Obtener estadísticas
GET /api/quiz/stats

// Verificar salud del backend
GET /api/health
```

### Variables de Entorno

```bash
# .env.local (Frontend)
NEXT_PUBLIC_BACKEND_URL=https://mateatletas-api.railway.app

# .env (Backend)
DATABASE_URL=postgresql://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@mateatletas.com
SMTP_PASS=...
```

---

## 🧪 Testing

### Test Manual

1. Acceder a `/quiz-test`
2. Completar las 5 preguntas
3. Verificar que:
   - ✅ El score tenga sentido (60-100 para buen match)
   - ✅ El mensaje personalizado sea coherente
   - ✅ Las alternativas sean relevantes
   - ✅ El backend reciba los datos (si está configurado)

### Test Automático (TODO)

```bash
# Crear tests con Playwright
pnpm test:e2e quiz
```

### Casos de Prueba Recomendados

| Perfil | Edad | Intereses | Nivel | Objetivo | Ruta Esperada |
|--------|------|-----------|-------|----------|---------------|
| Gamer Principiante | 10 | Videojuegos | Nunca | Proyecto | Game Maker |
| Matemático Competitivo | 12 | Matemática | Intermedio | Competencias | Olimpiadas Track |
| Científico Curioso | 9 | Ciencias | Nunca | Diversión | Space Explorer |
| Dev Avanzado | 16 | Varios | Intermedio | Futuro | AI Explorer / Data Wizard |

---

## 🎨 Personalización

### Agregar Nueva Ruta

1. Editar `src/data/rutasAprendizaje.ts`:

```typescript
export const RUTAS: Ruta[] = [
  // ... rutas existentes
  {
    id: 'mi-nueva-ruta',
    nombre: 'Mi Nueva Ruta',
    descripcion: 'Descripción breve',
    emoji: '🚀',
    area_principal: 'programacion',
    edad_minima: 10,
    edad_maxima: 14,
    intereses_requeridos: ['crear_cosas'],
    objetivos_match: ['proyecto'],
    nivel_estudiante: 'principiante',
    cursos: ['curso-1', 'curso-2', 'curso-3', 'curso-4'],
    duracion_total_meses: 8,
    total_clases: 60,
    resultado_final: 'Qué podrá hacer al terminar',
    precio_usd: 30,
    precio_ars: 45000
  }
];
```

2. Probar en `/quiz-test`

### Modificar Algoritmo

Editar `src/lib/algorithms/recomendarRuta.ts`:

```typescript
// Ejemplo: Dar más peso a la edad
if (diferenciaEdad <= 1) {
  score += 30; // Era 20, ahora 30
}
```

### Agregar Pregunta

1. Crear `Pregunta6.tsx` en `src/components/quiz/`
2. Actualizar `QuizAsincronico.tsx`:

```typescript
const TOTAL_STEPS = 6; // Era 5

// En el render:
{step === 6 && <Pregunta6 respuestas={respuestas} setRespuestas={setRespuestas} />}
```

3. Actualizar interfaz `QuizResponses` en `types/courses.ts`

### Cambiar Colores

En cada componente de pregunta, modificar las clases de Tailwind:

```typescript
// De cyan/purple a otro gradiente
className="bg-gradient-to-r from-emerald-500 to-blue-500"
```

---

## 📊 Métricas de Éxito

### KPIs del Quiz

- **Tasa de completación**: % de usuarios que llegan al paso 5
- **Tiempo promedio**: Debe ser < 2 minutos
- **Tasa de conversión**: % que dejan email para seguimiento
- **Distribución de rutas**: Qué rutas son más recomendadas

### Cómo Medirlas

1. **Google Analytics**: Eventos personalizados
2. **PostHog**: Session replay + funnels
3. **Backend**: Query a `quiz_responses` table

```sql
-- Tasa de completación (si guardas intentos parciales)
SELECT
  COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*) as completion_rate
FROM quiz_attempts;

-- Ruta más popular
SELECT
  ruta_recomendada_nombre,
  COUNT(*) as veces_recomendada
FROM quiz_responses
GROUP BY ruta_recomendada_nombre
ORDER BY veces_recomendada DESC;
```

---

## 🐛 Troubleshooting

### El quiz no avanza al siguiente paso

- Verificar que `canAdvance()` retorne `true`
- Revisar consola del navegador para errores
- Asegurarse de que el campo requerido no esté vacío

### El backend no recibe los datos

- Verificar `NEXT_PUBLIC_BACKEND_URL` en `.env.local`
- Comprobar que el backend esté corriendo
- Revisar logs de Network en DevTools
- Verificar CORS en el backend NestJS

### El score es muy bajo (< 50)

- Revisar que las rutas tengan metadata completa
- Verificar que `intereses_requeridos` y `objetivos_match` coincidan con las opciones del quiz
- Usar `explicarScore()` para debuggear:

```typescript
import { explicarScore } from '@/lib/algorithms/recomendarRuta';

const desglose = explicarScore(ruta, respuestas);
console.log('Score desglosado:', desglose);
```

### Animaciones no funcionan

- Verificar que Framer Motion esté instalado:

```bash
pnpm add framer-motion
```

- Asegurarse de que el componente sea `'use client'`

---

## 🚢 Deploy a Producción

### 1. Frontend (Vercel)

```bash
# Ya está configurado en tu monorepo
# Se despliega automáticamente con cada push a main
```

Verificar variables de entorno en Vercel:
- `NEXT_PUBLIC_BACKEND_URL`

### 2. Backend (Railway)

Tu backend NestJS ya está en Railway. Asegúrate de que:
- El endpoint `/api/quiz/submit` esté implementado
- CORS permita requests desde tu dominio de Vercel
- Las variables de entorno estén configuradas

---

## 📚 Referencias

- [Documentación de Next.js 15](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 🤝 Soporte

Si encontrás algún issue o tenés preguntas:

1. Revisar esta documentación
2. Revisar `/quiz-test` con la consola abierta
3. Revisar logs del backend en Railway

---

## ✅ Checklist de Implementación

- [x] ✅ Tipos TypeScript definidos
- [x] ✅ 10 rutas pre-definidas
- [x] ✅ Algoritmo de recomendación implementado
- [x] ✅ Componentes de preguntas (1-5)
- [x] ✅ Componente principal del quiz
- [x] ✅ Integración con backend (cliente API)
- [x] ✅ Página de testing funcional
- [x] ✅ Documentación completa

**NEXT STEPS (Prompt 2 y 3):**
- [ ] 🔜 Página de resultados premium (mostrar ruta con pricing)
- [ ] 🔜 CTA para checkout (MercadoPago)
- [ ] 🔜 Email automation con los resultados

---

## 📝 Changelog

### v1.0.0 (2025-01-12)
- ✨ Implementación inicial completa
- ✨ 10 rutas pre-definidas
- ✨ Algoritmo de scoring
- ✨ Quiz de 5 pasos con animaciones
- ✨ Integración con backend NestJS
- ✨ Página de testing

---

**¡El sistema de quiz está listo para usar!** 🚀

Para probarlo: `http://localhost:3000/quiz-test`
