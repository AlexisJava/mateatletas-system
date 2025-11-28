# 🎮 Sistema de Gamificación - Mateatletas

**Versión:** 1.0  
**Fecha:** 30 de Octubre 2025  
**Autor:** Alexis - Founder Mateatletas

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Sistema de Recursos](#sistema-de-recursos)
4. [Recompensas para Estudiantes](#recompensas-para-estudiantes)
5. [Recompensas para Padres](#recompensas-para-padres)
6. [Catálogo de Premios - Estudiantes](#catálogo-de-premios-estudiantes)
7. [Catálogo de Premios - Padres](#catálogo-de-premios-padres)
8. [Sistema de Logros](#sistema-de-logros)
9. [Sistema de Niveles](#sistema-de-niveles)
10. [Flujos de Canje](#flujos-de-canje)
11. [Métricas de Éxito](#métricas-de-éxito)

---

## 🎯 Resumen Ejecutivo

### Objetivo Principal

Crear un sistema de gamificación dual que incentive tanto a estudiantes como a padres, generando:

- ✅ Mayor engagement y retención
- ✅ Mejor cash flow (pagos puntuales)
- ✅ Crecimiento orgánico (referidos)
- ✅ Motivación extrínseca tangible

### Principios Fundamentales

**Para Estudiantes:**

- Premiar **CONSISTENCIA** sobre todo (racha diaria)
- Premiar **COMPLETAR TEMAS** (no dejar a medias)
- Premiar **ASISTENCIA A CLASES** (crítico)
- Premiar **COMPORTAMIENTO SOCIAL** (ayudar, invitar)

**Para Padres:**

- Premiar **PAGO PUNTUAL** (mejorar cash flow)
- Premiar **INVOLUCRAMIENTO** (revisar progreso, comentar)
- Premiar **REFERIDOS** (crecimiento orgánico)
- Premiar **FIDELIDAD** (rachas de pago)

### Sistema Tipo "Programa de Puntos"

Inspirado en Movistar Puntos, Personal Club, y programas de tarjetas de crédito:

- Acumulación ilimitada sin expiración
- Catálogo de productos canjeables
- Precios fijos en monedas/puntos
- Sin conversión directa a descuentos (salvo premios específicos)

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────┐
│                    MATEATLETAS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ESTUDIANTE                        PADRE                │
│  ┌──────────────┐                 ┌──────────────┐     │
│  │              │                 │              │     │
│  │   Estudia    │                 │  Paga Cuota  │     │
│  │   Completa   │                 │  Revisa      │     │
│  │   Asiste     │                 │  Comenta     │     │
│  │              │                 │  Invita      │     │
│  └──────┬───────┘                 └──────┬───────┘     │
│         │                                │             │
│         ▼                                ▼             │
│  ┌──────────────┐                 ┌──────────────┐     │
│  │   Gana       │                 │   Gana       │     │
│  │   MONEDAS    │                 │   PUNTOS     │     │
│  │   + XP       │                 │   + XP       │     │
│  └──────┬───────┘                 └──────┬───────┘     │
│         │                                │             │
│         ▼                                ▼             │
│  ┌──────────────┐                 ┌──────────────┐     │
│  │  Acumula     │                 │  Acumula     │     │
│  │  sin límite  │                 │  sin límite  │     │
│  └──────┬───────┘                 └──────┬───────┘     │
│         │                                │             │
│         ▼                                ▼             │
│  ┌──────────────┐                 ┌──────────────┐     │
│  │  Canjea por: │                 │  Canjea por: │     │
│  │  - Cursos    │                 │  - Monedas   │     │
│  │  - Items     │                 │    para hijo │     │
│  │              │                 │  - Cursos    │     │
│  │              │                 │  - Beneficios│     │
│  └──────────────┘                 └──────────────┘     │
│         │                                │             │
│         └────────────┬───────────────────┘             │
│                      ▼                                 │
│              ┌──────────────┐                          │
│              │  Solicitud   │                          │
│              │  de Canje    │                          │
│              └──────┬───────┘                          │
│                     │                                  │
│                     ▼                                  │
│              ┌──────────────┐                          │
│              │ Padre Aprueba│                          │
│              └──────┬───────┘                          │
│                     │                                  │
│                     ▼                                  │
│              ┌──────────────┐                          │
│              │   Curso/Item │                          │
│              │  Habilitado  │                          │
│              └──────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Sistema de Recursos

### 1. Para Estudiantes

#### **XP (Puntos de Experiencia)**

- **Propósito:** Subir de nivel, progresión visual
- **Características:**
  - NO se gastan
  - Se acumulan permanentemente
  - Se ganan por cualquier actividad
- **Fórmula de Nivel:**
  ```
  nivel = floor(sqrt(XP / 100)) + 1
  ```
- **Ejemplos:**
  - 100 XP = Nivel 2
  - 400 XP = Nivel 3
  - 900 XP = Nivel 4
  - 10,000 XP = Nivel 11

#### **MONEDAS** 💰

- **Propósito:** Canjear por cursos STEAM y items cosméticos
- **Características:**
  - SÍ se gastan al canjear
  - Se acumulan sin límite
  - NO expiran nunca
  - Incentivo económico real
- **Conversión Referencial:**
  - Precio del curso en USD × 20 = Monedas necesarias
  - Ejemplo: Curso $50 USD = 1,000 monedas

#### **GEMAS** 💎 (Opcional - Fase 2)

- **Propósito:** Items exclusivos legendarios, eventos especiales
- **Características:**
  - Muy difíciles de ganar
  - Para logros épicos
  - Items que NO se pueden comprar con monedas

---

### 2. Para Padres

#### **PUNTOS DE PADRE** ⭐

- **Propósito:** Canjear por beneficios para el hijo y para sí mismos
- **Características:**
  - Sistema SEPARADO de las monedas del hijo
  - Se acumulan sin límite
  - NO expiran
  - Se ganan por buen comportamiento de pago y engagement

#### **XP DE PADRE**

- **Propósito:** Subir de nivel como padre (gamificación para adultos)
- **Características:**
  - Progresión de Nivel 1 ("Novato") a Nivel 6 ("Leyenda")
  - Desbloquea beneficios por nivel
  - Visible en perfil

---

## 🎁 Recompensas para Estudiantes

### Tabla Completa de Recompensas

| Acción                                  | Monedas | XP    | Frecuencia |
| --------------------------------------- | ------- | ----- | ---------- |
| **CONSISTENCIA (RACHA DIARIA)**         |
| Mantener racha 1 día (1+ ejercicio)     | 2       | 10    | Diario     |
| Racha 3 días consecutivos               | 10      | 30    | 1 vez      |
| Racha 7 días consecutivos               | 15      | 100   | Semanal    |
| Racha 14 días consecutivos              | 30      | 200   | 1 vez      |
| Racha 30 días consecutivos              | 100     | 500   | Mensual    |
| Racha 60 días consecutivos              | 250     | 1,000 | 1 vez      |
| Racha 90 días (trimestre)               | 500     | 2,000 | 1 vez      |
| **ASISTENCIA A CLASES**                 |
| Asistir a clase semanal                 | 10      | 50    | Semanal    |
| 4 clases en el mes (completo)           | 50      | 300   | Mensual    |
| 12 clases en trimestre                  | 200     | 1,000 | Trimestral |
| **COMPLETAR TEMAS**                     |
| Completar tema al 100%                  | 40      | 200   | Por tema   |
| Completar 3 temas en el mes             | 60      | 500   | Mensual    |
| Completar módulo completo (ej: Álgebra) | 200     | 1,000 | Por módulo |
| **PROGRESIÓN**                          |
| Subir de nivel                          | 15      | 100   | Por nivel  |
| Llegar a nivel 5                        | 50      | 200   | 1 vez      |
| Llegar a nivel 10                       | 150     | 500   | 1 vez      |
| **COMPORTAMIENTO SOCIAL**               |
| Ayudar a un compañero                   | 5       | 20    | Ilimitado  |
| Invitar amigo que se registra           | 50      | 100   | Ilimitado  |
| Invitar amigo que completa 1 tema       | 100     | 300   | Ilimitado  |
| Tu equipo gana la semana                | 20      | 100   | Semanal    |
| **VOLUMEN (BONUS)**                     |
| Completar 5 ejercicios en un día        | 5       | 60    | Diario     |
| Completar 10 ejercicios en un día       | 10      | 120   | Diario     |
| **LOGROS ESPECIALES**                   |
| Desbloquear logro básico                | 20      | 30    | Por logro  |
| Desbloquear logro épico                 | 100     | 100   | Por logro  |
| Desbloquear logro legendario            | 250     | 250   | Por logro  |

---

### Simulación: ¿Cuánto Gana un Estudiante?

#### **Estudiante IDEAL (Todo perfecto):**

```
RACHA (30 días perfectos):
├─ 30 días × 2 monedas = 60
├─ Bonus 7 días × 4 semanas = 60
├─ Bonus 14 días × 2 = 60
├─ Bonus 30 días = 100
└─ Subtotal: 280 monedas

ASISTENCIA (4/4 clases):
├─ 4 clases × 10 = 40
├─ Bonus mes completo = 50
└─ Subtotal: 90 monedas

TEMAS (3 completados):
├─ 3 temas × 40 = 120
├─ Bonus 3 temas = 60
└─ Subtotal: 180 monedas

NIVELES (2 niveles/mes):
├─ 2 × 15 = 30
└─ Subtotal: 30 monedas

SOCIAL (ayuda + equipo):
├─ Ayudar 10 veces = 50
├─ Equipo gana 4 semanas = 80
└─ Subtotal: 130 monedas

TOTAL ESTUDIANTE SOLO: ~710 monedas/mes
```

#### **+ BONUS DEL PADRE (si paga puntual):**

```
COMPORTAMIENTO DEL PADRE:
├─ Pagó antes del día 5 = +50 monedas
├─ Débito automático activo = +20 monedas
├─ Bonus racha 3 meses (si aplica) = +100 monedas
└─ Subtotal padre: +70 a +170 monedas

GRAN TOTAL: 780-880 monedas/mes
```

#### **Estudiante CONSISTENTE (80% esfuerzo):**

```
TOTAL: ~400-500 monedas/mes
```

#### **Estudiante CASUAL (50% esfuerzo):**

```
TOTAL: ~150-200 monedas/mes
```

---

## 👨‍👩‍👦 Recompensas para Padres

### Tabla Completa de Recompensas

| Acción del Padre                  | Puntos Padre | XP Padre |
| --------------------------------- | ------------ | -------- |
| **PAGO PUNTUAL**                  |
| Pagar cuota antes del día 5       | 50 pts       | 50 XP    |
| Pagar cuota antes del día 10      | 30 pts       | 30 XP    |
| Pagar cuota después del día 10    | 0 pts        | 10 XP    |
| **RACHA DE PAGOS**                |
| 3 meses pagando a tiempo          | 100 pts      | 200 XP   |
| 6 meses pagando a tiempo          | 250 pts      | 500 XP   |
| 12 meses pagando a tiempo         | 500 pts      | 1,000 XP |
| **MÉTODO DE PAGO**                |
| Pago con débito automático        | 20 pts/mes   | 20 XP    |
| Pago manual pero puntual          | 10 pts/mes   | 10 XP    |
| **ENGAGEMENT**                    |
| Revisar progreso del hijo         | 10 pts       | 10 XP    |
| Dejar comentario motivacional     | 20 pts       | 20 XP    |
| Asistir a reunión con docente     | 100 pts      | 100 XP   |
| Completar curso "Crianza Digital" | 500 pts      | 500 XP   |
| Completar perfil al 100%          | 100 pts      | 100 XP   |
| **SOCIAL**                        |
| Invitar padre que se registra     | 200 pts      | 200 XP   |
| Referido completa 1 mes activo    | 300 pts      | 300 XP   |
| Compartir logro hijo en redes     | 500 pts      | 100 XP   |
| **DESAFÍOS SEMANALES**            |
| Completar desafío de la semana    | 50 pts       | 50 XP    |

---

### Simulación: ¿Cuánto Gana un Padre?

#### **Padre IDEAL (Súper comprometido):**

```
PAGO PUNTUAL:
├─ Paga día 3 = 50 pts
├─ Débito automático = 20 pts
└─ Subtotal: 70 pts/mes

ENGAGEMENT:
├─ Revisa progreso 20 días = 200 pts
├─ 5 comentarios = 100 pts
├─ 1 reunión docente = 100 pts
└─ Subtotal: 400 pts/mes

SOCIAL:
├─ Compartió logro = 500 pts
└─ Subtotal: 500 pts/mes

TOTAL: ~970 pts/mes
```

#### **Padre CONSISTENTE:**

```
TOTAL: ~300-400 pts/mes
```

#### **Padre BÁSICO (Solo paga):**

```
TOTAL: 50-70 pts/mes
```

---

## 📦 Catálogo de Premios - Estudiantes

### 🔬 Cursos de Ciencia

| Curso                               | Duración  | Monedas | Valor USD |
| ----------------------------------- | --------- | ------- | --------- |
| 🧪 Química Explosiva Virtual        | 8 clases  | 700     | $35       |
| ⚗️ Laboratorio Químico Avanzado     | 12 clases | 1,000   | $50       |
| 🔭 Astronomía Interactiva           | 6 clases  | 600     | $30       |
| 🌌 Sistema Solar 3D                 | 10 clases | 900     | $45       |
| ⚛️ Física con Simuladores           | 8 clases  | 700     | $35       |
| 🧬 Biología Molecular               | 10 clases | 800     | $40       |
| 🌡️ Experimentos Científicos en Casa | 6 clases  | 500     | $25       |

---

### 💻 Cursos de Programación

| Curso                             | Duración  | Monedas | Valor USD |
| --------------------------------- | --------- | ------- | --------- |
| 🎮 Videojuegos con Scratch        | 6 clases  | 500     | $25       |
| 🕹️ Videojuegos con JavaScript     | 10 clases | 900     | $45       |
| 🐍 Python desde Cero              | 12 clases | 1,000   | $50       |
| 🐍 Python Intermedio (Pygame)     | 15 clases | 1,400   | $70       |
| 🌐 Desarrollo Web: HTML/CSS/JS    | 12 clases | 1,000   | $50       |
| ⚛️ React para Principiantes       | 15 clases | 1,600   | $80       |
| 🚀 Next.js Full Stack             | 20 clases | 3,000   | $150      |
| 🤖 Inteligencia Artificial Básica | 15 clases | 1,800   | $90       |
| 🤖 Machine Learning con Python    | 20 clases | 3,200   | $160      |
| 📱 Crear tu Primera App Móvil     | 12 clases | 1,200   | $60       |

---

### 🤖 Cursos de Robótica e Ingeniería

| Curso                              | Duración  | Monedas | Valor USD |
| ---------------------------------- | --------- | ------- | --------- |
| ⚙️ Arduino desde Cero              | 8 clases  | 700     | $35       |
| 🤖 Robot Móvil con Arduino         | 10 clases | 1,000   | $50       |
| 📡 Sensores y Actuadores Avanzados | 12 clases | 1,200   | $60       |
| 🏠 Domótica: Casa Inteligente      | 10 clases | 1,000   | $50       |
| 🚁 Diseño de Drones Básicos        | 12 clases | 1,400   | $70       |
| 🔌 Circuitos Electrónicos          | 8 clases  | 800     | $40       |
| 📶 Internet of Things (IoT)        | 15 clases | 1,800   | $90       |

---

### 🎨 Cursos de Diseño Técnico

| Curso                                  | Duración  | Monedas | Valor USD |
| -------------------------------------- | --------- | ------- | --------- |
| 🎨 Blender 3D: Modelado Básico         | 10 clases | 1,000   | $50       |
| 🎬 Blender 3D: Animación               | 12 clases | 1,400   | $70       |
| 🎮 Diseño de Personajes 3D             | 10 clases | 1,200   | $60       |
| 🏗️ TinkerCAD: Diseño para Impresión 3D | 6 clases  | 600     | $30       |
| 🎯 Unity Básico: Juegos 3D             | 15 clases | 2,000   | $100      |
| 🎨 Motion Graphics y Animación 3D      | 12 clases | 1,600   | $80       |

---

### 🏆 Programas Completos (Maestrías)

| Programa                              | Duración  | Monedas | Valor USD |
| ------------------------------------- | --------- | ------- | --------- |
| 🚀 Full Stack Web Developer           | 30 clases | 4,000   | $200      |
| 🎮 Desarrollo de Videojuegos AAA      | 35 clases | 5,000   | $250      |
| 🤖 Robótica Competitiva               | 40 clases | 5,000   | $250      |
| 🧠 Inteligencia Artificial Aplicada   | 40 clases | 6,000   | $300      |
| 💼 Ingeniería de Software Profesional | 40 clases | 6,000   | $300      |
| 🔬 Simulación Científica Avanzada     | 35 clases | 5,500   | $275      |

---

### 🎁 Items Exclusivos (Opcional - Tienda Cosmética)

| Item                                    | Descripción                         | Monedas | Tipo      |
| --------------------------------------- | ----------------------------------- | ------- | --------- |
| 🎭 Animación "Victoria Épica"           | Animación legendaria para avatar    | 150     | Cosmético |
| 🎭 Animación "Baile del Fuego"          | Animación épica con efectos         | 100     | Cosmético |
| 🎭 Animación "Cerebrito"                | Animación exclusiva de inteligencia | 80      | Cosmético |
| 👕 Skin Avatar "Científico Loco"        | Outfit completo para avatar         | 120     | Cosmético |
| 👕 Skin Avatar "Hacker Elite"           | Outfit temático programación        | 120     | Cosmético |
| 👕 Skin Avatar "Ingeniero Espacial"     | Outfit temático astronauta          | 120     | Cosmético |
| ✨ Efecto de Partículas "Estrellas"     | Efecto visual permanente            | 60      | Cosmético |
| ✨ Efecto de Partículas "Código Matrix" | Efecto visual premium               | 80      | Cosmético |
| 🏆 Título "Maestro Matemático"          | Título visible en perfil            | 50      | Social    |
| 🏆 Título "Genio STEAM"                 | Título épico exclusivo              | 100     | Social    |
| 🎨 Marco de Avatar "Oro"                | Borde dorado para avatar            | 70      | Cosmético |
| 🎨 Marco de Avatar "Platino"            | Borde platino exclusivo             | 150     | Cosmético |

**Total Catálogo Estudiantes:** ~50 productos canjeables

---

## 👨‍👩‍👦 Catálogo de Premios - Padres

### 🎁 Premios Digitales (Sin costo)

| Premio                              | Descripción                      | Puntos Padre | Costo Real |
| ----------------------------------- | -------------------------------- | ------------ | ---------- |
| 💰 +100 monedas para hijo           | Bonus directo para el estudiante | 200 pts      | $0         |
| 💰 +300 monedas para hijo           | Bonus grande para el estudiante  | 500 pts      | $0         |
| 💰 +500 monedas para hijo           | Bonus épico para el estudiante   | 800 pts      | $0         |
| 🏅 Badge "Padre del Mes"            | Badge visible en perfil          | 300 pts      | $0         |
| 🏅 Badge "Mentor Ejemplar"          | Badge exclusivo oro              | 500 pts      | $0         |
| 🏅 Badge "Padre Leyenda"            | Badge legendario                 | 1,000 pts    | $0         |
| 📜 Certificado "Padre Comprometido" | Certificado digital descargable  | 150 pts      | $0         |
| ⭐ Título "Padre del Año"           | Título visible en portal         | 800 pts      | $0         |
| 🎨 Avatar Padre Personalizado       | Avatar exclusivo para portal     | 400 pts      | $0         |
| 📸 Feature en Newsletter            | Mención especial en newsletter   | 600 pts      | $0         |
| 📱 Feature en Redes Sociales        | Post destacando tu familia       | 400 pts      | $0         |

---

### 📚 Premios de Acceso (Costo bajo)

| Premio                                | Descripción                        | Puntos Padre | Costo Real |
| ------------------------------------- | ---------------------------------- | ------------ | ---------- |
| 🎓 Webinar "Crianza Digital"          | Acceso a webinar exclusivo grabado | 200 pts      | $0         |
| 🎓 Curso "Apoyo Escolar Efectivo"     | Curso para padres (5 módulos)      | 400 pts      | $0         |
| 🎓 Masterclass con Director Académico | Sesión grupal virtual (1 hora)     | 600 pts      | $10        |
| 💬 Sesión 1-on-1 con Docente          | 30 min personalizado               | 800 pts      | $15        |
| 💬 Grupo Privado VIP de Padres        | Acceso a Telegram/WhatsApp VIP     | 300 pts      | $0         |
| 📖 E-book "Matemática en Casa"        | Guía exclusiva digital             | 150 pts      | $0         |
| 📖 Kit "Actividades STEAM Familiares" | PDFs descargables                  | 200 pts      | $0         |
| 🎯 Acceso Anticipado a Cursos Nuevos  | 1 semana antes del lanzamiento     | 500 pts      | $0         |
| ⚡ Prioridad en Atención al Cliente   | Soporte prioritario 3 meses        | 400 pts      | $0         |

---

### 🎁 Premios Premium (Para logros épicos)

| Premio                             | Descripción                   | Puntos Padre | Costo Real |
| ---------------------------------- | ----------------------------- | ------------ | ---------- |
| 🎓 1 Curso GRATIS para hijo        | Cualquier curso hasta $50     | 2,000 pts    | $50        |
| 💳 1 Mes de Cuota GRATIS           | Descuento de 1 mes            | 3,000 pts    | $30        |
| 🎯 10% Descuento en Próxima Compra | Vale para cursos adicionales  | 1,500 pts    | Variable   |
| 🎯 20% Descuento en Próxima Compra | Vale premium                  | 2,500 pts    | Variable   |
| 🎁 Kit de Merchandising            | Remera + Taza + Stickers      | 1,200 pts    | $15        |
| 🎁 Remera Mateatletas Exclusiva    | Diseño exclusivo para padres  | 800 pts      | $8         |
| 🏆 Trofeo Físico "Padre del Año"   | Trofeo enviado a domicilio    | 5,000 pts    | $20        |
| 🎟️ Entrada a Evento Anual          | Acceso a evento presencial    | 2,000 pts    | $30        |
| 📦 Caja Sorpresa STEAM             | Kit de experimentos para hijo | 1,500 pts    | $25        |

---

### 💎 Premios Épicos (Logros anuales)

| Premio                         | Descripción                                      | Puntos Padre | Costo Real |
| ------------------------------ | ------------------------------------------------ | ------------ | ---------- |
| 👑 "Familia del Año"           | Reconocimiento público + Trofeo + 3 meses gratis | 10,000 pts   | $90        |
| 🏆 Beca Completa 6 Meses       | 6 meses de cuota gratis                          | 15,000 pts   | $180       |
| 🎓 Maestría GRATIS para hijo   | Cualquier maestría (valor $200-300)              | 12,000 pts   | $250       |
| 🎤 Ser Speaker en Webinar      | Compartir experiencia + Exposición               | 5,000 pts    | $0         |
| 📹 Video Testimonial Producido | Video profesional de tu familia                  | 4,000 pts    | $50        |

---

### 🎯 Premios por Referidos (Especiales)

| Premio                              | Descripción                                 | Requisito    | Costo Real    |
| ----------------------------------- | ------------------------------------------- | ------------ | ------------- |
| 💰 +500 monedas para hijo           | Por cada padre referido activo              | 1 referido   | $0            |
| 🎁 1 Curso Gratis ($35)             | 3 padres referidos activos                  | 3 referidos  | $35           |
| 💳 1 Mes Gratis                     | 5 padres referidos activos                  | 5 referidos  | $30           |
| 🏆 "Embajador Oficial" + Beneficios | 10 padres referidos activos                 | 10 referidos | Variable      |
| 👑 Comisión 10% en Referidos        | Por cada pago de tus referidos (permanente) | 20 referidos | Revenue share |

**Total Catálogo Padres:** ~40 premios canjeables

---

## 🏆 Sistema de Logros

### Logros para Estudiantes

#### **Categoría: Consistencia** 🔥

| Logro              | Descripción                  | Monedas | XP    | Animación Desbloqueada |
| ------------------ | ---------------------------- | ------- | ----- | ---------------------- |
| "Primer Paso"      | Completa tu primer ejercicio | 10      | 20    | "Celebración Básica"   |
| "Racha de Fuego"   | Mantén 7 días consecutivos   | 30      | 100   | "Baile del Fuego"      |
| "Imparable"        | Mantén 30 días consecutivos  | 150     | 500   | "Aura de Fuego"        |
| "Leyenda Viviente" | Mantén 90 días consecutivos  | 600     | 2,000 | "Fénix Renace"         |

#### **Categoría: Maestría** 🎓

| Logro                 | Descripción                   | Monedas | XP    | Animación Desbloqueada |
| --------------------- | ----------------------------- | ------- | ----- | ---------------------- |
| "Completista"         | Termina tu primer tema 100%   | 50      | 200   | "Cerebrito"            |
| "Maestro del Álgebra" | Completa módulo Álgebra 100%  | 250     | 1,000 | "Genio Matemático"     |
| "Polímata"            | Completa 5 módulos diferentes | 500     | 2,000 | "Sabio"                |
| "Enciclopedia"        | Completa todos los módulos    | 1,000   | 5,000 | "Omnisciente"          |

#### **Categoría: Precisión** 🎯

| Logro             | Descripción                   | Monedas | XP    | Animación Desbloqueada |
| ----------------- | ----------------------------- | ------- | ----- | ---------------------- |
| "Perfeccionista"  | 10 ejercicios 100% correctos  | 80      | 300   | "Victoria Épica"       |
| "Francotirador"   | 50 ejercicios 100% correctos  | 200     | 800   | "Sniper Shot"          |
| "Mente Brillante" | 100 ejercicios 100% correctos | 500     | 2,000 | "Explosión Mental"     |

#### **Categoría: Social** 👥

| Logro            | Descripción             | Monedas | XP    | Animación Desbloqueada |
| ---------------- | ----------------------- | ------- | ----- | ---------------------- |
| "Buen Compañero" | Ayuda a 5 estudiantes   | 60      | 200   | "High Five"            |
| "Mentor"         | Ayuda a 25 estudiantes  | 200     | 800   | "Maestro Shaolin"      |
| "Embajador"      | Invita 3 amigos activos | 400     | 1,000 | "Líder Nato"           |

#### **Categoría: Velocidad** ⚡

| Logro              | Descripción                    | Monedas | XP  | Animación Desbloqueada |
| ------------------ | ------------------------------ | ------- | --- | ---------------------- |
| "Rápido y Furioso" | Completa ejercicio en <30s     | 40      | 150 | "Flash"                |
| "Velocista"        | 10 ejercicios en <30s cada uno | 150     | 500 | "Sonic"                |

---

### Logros para Padres

#### **Categoría: Puntualidad** 💳

| Logro          | Descripción                   | Puntos | XP    | Badge               |
| -------------- | ----------------------------- | ------ | ----- | ------------------- |
| "Puntual"      | Paga 3 meses antes del día 5  | 150    | 300   | "Padre Responsable" |
| "Impecable"    | Paga 12 meses antes del día 5 | 700    | 1,500 | "Padre del Año"     |
| "Automatizado" | Activa débito automático      | 100    | 200   | "Padre Smart"       |

#### **Categoría: Engagement** 👀

| Logro          | Descripción                      | Puntos | XP    | Badge               |
| -------------- | -------------------------------- | ------ | ----- | ------------------- |
| "Padre Atento" | Revisa progreso 30 días seguidos | 300    | 500   | "Padre Coach"       |
| "Motivador"    | Deja 50 comentarios              | 500    | 800   | "Padre Inspirador"  |
| "Comprometido" | Asiste a 5 reuniones docentes    | 600    | 1,000 | "Padre Involucrado" |

#### **Categoría: Comunidad** 🌟

| Logro         | Descripción              | Puntos | XP    | Badge               |
| ------------- | ------------------------ | ------ | ----- | ------------------- |
| "Evangelista" | Invita 3 padres activos  | 900    | 1,200 | "Embajador"         |
| "Constructor" | Invita 10 padres activos | 3,000  | 3,000 | "Líder Comunitario" |

---

## 📈 Sistema de Niveles

### Niveles para Estudiantes

| Nivel | XP Requerido | Título       | Beneficios                                                     |
| ----- | ------------ | ------------ | -------------------------------------------------------------- |
| 1     | 0-100        | "Novato"     | - Acceso básico                                                |
| 2     | 100-400      | "Aprendiz"   | - Desbloquea tienda                                            |
| 3     | 400-900      | "Estudiante" | - +5% bonus monedas                                            |
| 4     | 900-1,600    | "Dedicado"   | - Acceso a desafíos especiales                                 |
| 5     | 1,600-2,500  | "Experto"    | - +10% bonus monedas <br> - Badge "Experto"                    |
| 6     | 2,500-3,600  | "Maestro"    | - Acceso a cursos exclusivos                                   |
| 7     | 3,600-4,900  | "Virtuoso"   | - +15% bonus monedas                                           |
| 8     | 4,900-6,400  | "Genio"      | - Prioridad en eventos                                         |
| 9     | 6,400-8,100  | "Prodigio"   | - +20% bonus monedas <br> - Mentor oficial                     |
| 10    | 8,100+       | "Leyenda"    | - +25% bonus monedas <br> - Avatar exclusivo <br> - Acceso VIP |

---

### Niveles para Padres

| Nivel | XP Requerido | Título         | Beneficios                                                                           |
| ----- | ------------ | -------------- | ------------------------------------------------------------------------------------ |
| 1     | 0-500        | "Novato"       | - Acceso básico                                                                      |
| 2     | 500-1,000    | "Comprometido" | - +10 monedas/mes para hijo                                                          |
| 3     | 1,000-2,000  | "Activo"       | - +20 monedas/mes para hijo <br> - Acceso webinars                                   |
| 4     | 2,000-3,000  | "Mentor"       | - +30 monedas/mes para hijo <br> - Prioridad soporte                                 |
| 5     | 3,000-5,000  | "Líder"        | - +50 monedas/mes para hijo <br> - Acceso VIP <br> - 10% descuento cursos            |
| 6     | 5,000+       | "Leyenda"      | - +100 monedas/mes para hijo <br> - Sesiones 1-on-1 gratis <br> - Programa embajador |

---

## 🔄 Flujos de Canje

### Flujo 1: Estudiante Canjea Curso

```
1. ESTUDIANTE ve catálogo de cursos
   └─ "Tengo 1,200 monedas"
   └─ "Curso Arduino cuesta 700 monedas"
   └─ Click "CANJEAR"

2. SISTEMA valida saldo
   └─ ¿Tiene suficientes monedas? ✅

3. SISTEMA crea solicitud
   └─ Estado: "Pendiente aprobación"
   └─ Descuenta monedas temporalmente

4. NOTIFICACIÓN a Padre
   └─ Email: "Juan quiere canjear curso Arduino (700 monedas = $35 USD)"
   └─ Portal: Solicitud visible en dashboard

5. PADRE revisa y decide
   Opción A: "APROBAR - Yo pago los $35"
      └─ Monedas se gastan definitivamente
      └─ Curso se habilita para estudiante
      └─ Padre NO paga nada adicional (tú regalas el curso)

   Opción B: "APROBAR - Que pague la mitad"
      └─ Monedas se gastan definitivamente
      └─ Curso se habilita
      └─ Padre paga $17.50 (50% del valor)

   Opción C: "APROBAR - Que pague todo"
      └─ Monedas se gastan pero curso se habilita
      └─ Padre paga $35 completo
      └─ (Monedas fueron "requisito de acceso", no descuento)

   Opción D: "RECHAZAR"
      └─ Monedas se devuelven al estudiante
      └─ Curso NO se habilita
      └─ Padre puede dejar mensaje: "Terminá matemática primero"

6. ESTUDIANTE recibe notificación
   └─ "¡Tu solicitud fue aprobada! 🎉"
   └─ Curso disponible en "Mis Cursos"
   └─ Avatar hace animación de celebración
```

---

### Flujo 2: Padre Canjea Premio

```
1. PADRE ve su catálogo de premios
   └─ "Tengo 800 puntos"
   └─ "Premio: +300 monedas para Juan (500 pts)"
   └─ Click "CANJEAR"

2. SISTEMA valida saldo
   └─ ¿Tiene suficientes puntos? ✅

3. SISTEMA ejecuta canje inmediato
   └─ Descuenta 500 puntos del padre
   └─ Suma 300 monedas al hijo
   └─ Padre quedan 300 puntos

4. NOTIFICACIONES
   └─ Email a padre: "Canjeaste +300 monedas para Juan"
   └─ Email a estudiante: "¡Tu papá te regaló 300 monedas! 🎁"
   └─ Dashboard actualizado en tiempo real

5. ESTUDIANTE ve bonus
   └─ Notificación en gimnasio
   └─ "Tu papá te dio +300 monedas"
   └─ Avatar hace animación especial "Regalo del Padre"
```

---

### Flujo 3: Canje de Item Cosmético

```
1. ESTUDIANTE en tienda cosmética
   └─ "Animación Victoria Épica: 150 monedas"
   └─ Click "COMPRAR"

2. SISTEMA valida y ejecuta
   └─ Descuenta 150 monedas
   └─ Desbloquea animación
   └─ NO requiere aprobación del padre (es cosmético)

3. ANIMACIÓN desbloqueada
   └─ Aparece en "Mis Animaciones"
   └─ Estudiante puede asignarla a eventos
   └─ Visible para otros estudiantes
```

---

## 📊 Métricas de Éxito

### KPIs Principales

#### **Para Estudiantes:**

- **Engagement Rate:** % de estudiantes activos diariamente
  - Meta: 70%+ engagement diario
- **Retention Rate:** % que completan 3+ meses
  - Meta: 80%+ retención trimestral
- **Completion Rate:** % que completan temas al 100%
  - Meta: 60%+ completion rate
- **Racha Promedio:** Días consecutivos promedio
  - Meta: 15+ días promedio

#### **Para Padres:**

- **Payment Punctuality:** % que pagan antes del día 5
  - Meta: 70%+ pagos puntuales
- **Autopay Adoption:** % con débito automático activo
  - Meta: 50%+ adopción débito automático
- **Parent Engagement:** % que revisan progreso semanalmente
  - Meta: 60%+ engagement semanal
- **Referral Rate:** % que invitan al menos 1 padre
  - Meta: 30%+ referral rate

#### **Para el Negocio:**

- **Churn Rate:** % de cancelaciones mensuales
  - Meta: <5% churn mensual
- **LTV (Lifetime Value):** Ingreso promedio por estudiante
  - Meta: USD $500+ LTV
- **CAC Payback:** Meses para recuperar costo de adquisición
  - Meta: <3 meses
- **Curso Redemption Rate:** % de monedas canjeadas
  - Meta: 40%+ redemption rate
- **Costo de Premios:** % de ingresos gastado en premios
  - Meta: <10% de ingresos

---

### Dashboard de Métricas (Sugerido)

```
┌─────────────────────────────────────────────────────────┐
│  📊 MÉTRICAS DE GAMIFICACIÓN - OCTUBRE 2025            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ESTUDIANTES:                                           │
│  ├─ Activos diarios: 85/120 (71%) 🟢                   │
│  ├─ Racha promedio: 18 días 🟢                         │
│  ├─ Monedas ganadas/mes: 520 promedio                  │
│  └─ Cursos canjeados: 23 este mes                      │
│                                                         │
│  PADRES:                                                │
│  ├─ Pagos puntuales: 89/120 (74%) 🟢                   │
│  ├─ Débito automático: 65/120 (54%) 🟢                 │
│  ├─ Engagement semanal: 78/120 (65%) 🟢                │
│  └─ Referidos activos: 12 este mes                     │
│                                                         │
│  NEGOCIO:                                               │
│  ├─ Churn rate: 4.2% 🟢                                │
│  ├─ Costo de premios: 8.5% de ingresos 🟢              │
│  ├─ Redemption rate: 45% 🟢                            │
│  └─ NPS Score: 78 🟢                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Consideraciones Finales

### Ventajas del Sistema

**Para Mateatletas:**

1. ✅ Mejora retención dramáticamente
2. ✅ Aumenta engagement diario
3. ✅ Mejora cash flow (pagos puntuales)
4. ✅ Genera crecimiento orgánico (referidos)
5. ✅ Control total sobre costos (premios virtuales)
6. ✅ Diferenciación vs competencia

**Para Estudiantes:**

1. ✅ Motivación extrínseca tangible
2. ✅ Aprenden sobre ahorro y planificación
3. ✅ Acceso a cursos STEAM que les interesan
4. ✅ Gamificación divertida y adictiva
5. ✅ Reconocimiento social (avatares, logros)

**Para Padres:**

1. ✅ Ven valor tangible del esfuerzo del hijo
2. ✅ Incentivo para pagar puntual
3. ✅ Mayor involucramiento en educación
4. ✅ Comunidad de padres comprometidos
5. ✅ Herramienta educativa (responsabilidad)

---

### Riesgos y Mitigaciones

**Riesgo 1: Inflación de Monedas**

- **Mitigación:** Ajustar tasas de recompensas trimestralmente según métricas

**Riesgo 2: Costo de Premios Insostenible**

- **Mitigación:** Mayoría de premios son digitales ($0 costo), límite 10% de ingresos

**Riesgo 3: Gaming del Sistema**

- **Mitigación:** Validaciones en backend, límites de frecuencia, detección de patrones

**Riesgo 4: Dependencia de Motivación Extrínseca**

- **Mitigación:** Balance con motivación intrínseca (logros, progreso, maestría)

**Riesgo 5: Complejidad para Usuarios**

- **Mitigación:** Onboarding claro, tooltips, tutoriales interactivos

---

### Próximos Pasos

Ver documento: `PLAN_DE_ACCION_GAMIFICACION.md`

---

**Fin del Documento**

---

_Última actualización: 30 de Octubre 2025_  
_Versión: 1.0_  
_Autor: Alexis - Founder Mateatletas_
