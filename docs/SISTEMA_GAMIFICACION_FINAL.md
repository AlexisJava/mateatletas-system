# 🎮 SISTEMA DE GAMIFICACIÓN MATEATLETAS - VERSIÓN FINAL OPTIMIZADA

**Versión:** 2.0 FINAL  
**Fecha:** 30 de Octubre 2025  
**Estado:** LISTO PARA IMPLEMENTAR

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Sistema de Recursos (2 Monedas)](#sistema-de-recursos)
3. [Sistema de Logros Completo (67 Logros)](#sistema-de-logros)
4. [Sistema de Niveles](#sistema-de-niveles)
5. [Economía Balanceada](#economía-balanceada)
6. [Catálogo de Recompensas](#catálogo-de-recompensas)

---

## 🎯 RESUMEN EJECUTIVO

### **Cambios vs Versión Original:**

```diff
MONEDAS:
- ❌ Eliminadas Gemas (fase 2)
+ ✅ Solo 2 monedas: Monedas + XP

LOGROS:
- ❌ Categoría "Volumen" (6 logros genéricos)
+ ✅ Categoría "Desafíos Semanales" (5 logros)
+ ✅ Categoría "Especialización" (4 logros)
+ ✅ 10 Logros Secretos (easter eggs)

TOTAL: 67 logros (vs 64 original)
├─ Visibles: 57 logros
└─ Secretos: 10 logros
```

### **Ventajas del Sistema Optimizado:**

1. ✅ **Más Simple** - 2 monedas fáciles de explicar
2. ✅ **Más Viral** - Logros secretos generan curiosidad
3. ✅ **Más Divertido** - Easter eggs con humor
4. ✅ **Más Engagement** - Desafíos semanales específicos
5. ✅ **Más Memorable** - Todos los logros son interesantes

---

## 💰 SISTEMA DE RECURSOS (2 MONEDAS)

### **1. MONEDAS** 💰

**Propósito:** Moneda principal para canjear cursos STEAM reales

**Conversión:** 1 moneda = ~$1 USD de cursos

**Cómo se ganan:**

```yaml
DIARIO:
  racha_1_dia:
    monedas: 2
    frecuencia: diaria

  completar_5_ejercicios:
    monedas: 5
    frecuencia: diaria

  completar_10_ejercicios:
    monedas: 10
    frecuencia: diaria
    tipo: bonus_adicional

  sesion_30_min:
    monedas: 5
    frecuencia: diaria

SEMANAL:
  asistir_clase:
    monedas: 10
    frecuencia: semanal

  completar_tema_100:
    monedas: 40
    frecuencia: por_tema

  racha_7_dias:
    monedas: 15
    frecuencia: semanal

MENSUAL:
  4_clases_mes:
    monedas: 50
    frecuencia: mensual

  completar_3_temas:
    monedas: 60
    frecuencia: mensual

  racha_30_dias:
    monedas: 100
    frecuencia: mensual

SOCIAL:
  ayudar_companero:
    monedas: 5
    frecuencia: ilimitada

  invitar_amigo_registro:
    monedas: 50
    frecuencia: por_referido

  invitar_amigo_completa_tema:
    monedas: 100
    frecuencia: por_referido

LOGROS:
  logro_comun:
    monedas: 20

  logro_raro:
    monedas: 50

  logro_epico:
    monedas: 100

  logro_legendario:
    monedas: 250

BONUS_PADRE:
  pago_antes_dia_5:
    monedas: 50
    frecuencia: mensual

  debito_automatico:
    monedas: 20
    frecuencia: mensual
```

**Economía Proyectada:**

```yaml
Estudiante_IDEAL:
  monedas_por_mes: 700-900
  tiempo_primer_curso: '3 semanas'

Estudiante_ACTIVO:
  monedas_por_mes: 400-500
  tiempo_primer_curso: '2 meses'

Estudiante_CASUAL:
  monedas_por_mes: 150-200
  tiempo_primer_curso: '3-4 meses'
```

---

### **2. XP (EXPERIENCIA)** ⚡

**Propósito:** Subir de nivel, progresión visual, status

**Características:**

- NO se gastan (acumulativos)
- Determinan nivel del estudiante
- Desbloquean beneficios

**Cómo se gana:**

```yaml
ACTIVIDADES:
  ejercicio_facil:
    xp: 5

  ejercicio_medio:
    xp: 10

  ejercicio_dificil:
    xp: 20

  ejercicio_perfecto_bonus:
    xp: 15

  ejercicio_rapido_bonus:
    xp: 10

CONSISTENCIA:
  racha_1_dia:
    xp: 10

  racha_7_dias:
    xp: 100

  racha_30_dias:
    xp: 500

  racha_90_dias:
    xp: 2000

MAESTRIA:
  completar_tema:
    xp: 200

  completar_modulo:
    xp: 1000

  completar_todos_modulos_grado:
    xp: 5000

ASISTENCIA:
  asistir_clase:
    xp: 50

  4_clases_mes:
    xp: 300

  12_clases_trimestre:
    xp: 1000

LOGROS:
  logro_comun:
    xp: 30

  logro_raro:
    xp: 100

  logro_epico:
    xp: 250

  logro_legendario:
    xp: 500
```

**Fórmula de Nivel:**

```javascript
// XP requerido = nivel² × 100
function calcularNivel(xp_total) {
  return Math.floor(Math.sqrt(xp_total / 100)) + 1;
}

function xpParaNivel(nivel) {
  return Math.pow(nivel - 1, 2) * 100;
}

// Ejemplos:
Nivel 1:  0 XP
Nivel 2:  100 XP
Nivel 3:  400 XP
Nivel 4:  900 XP
Nivel 5:  1,600 XP
Nivel 6:  2,500 XP
Nivel 7:  3,600 XP
Nivel 8:  4,900 XP
Nivel 9:  6,400 XP
Nivel 10: 8,100 XP
```

---

## 🏆 SISTEMA DE LOGROS COMPLETO (67 LOGROS)

### **DISTRIBUCIÓN:**

```
TOTAL: 67 logros
├─ Comunes: 17 logros (25%)
├─ Raros: 24 logros (36%)
├─ Épicos: 18 logros (27%)
├─ Legendarios: 8 logros (12%)
└─ Secretos: 10 logros (incluidos en totales)

CATEGORÍAS:
├─ Consistencia: 10 logros
├─ Maestría: 12 logros
├─ Precisión: 8 logros
├─ Velocidad: 6 logros
├─ Social: 8 logros
├─ Asistencia: 6 logros
├─ Desafíos Semanales: 5 logros (NUEVO)
├─ Especialización: 4 logros (NUEVO)
├─ Niveles: 4 logros
└─ Secretos: 10 logros (NUEVO)
```

---

### **CATEGORÍA 1: CONSISTENCIA** 🔥 (10 logros)

#### **COMUNES (4):**

```yaml
primer_paso:
  codigo: 'primer_paso'
  nombre: 'Primer Paso'
  descripcion: 'Completa tu primer ejercicio'
  categoria: 'consistencia'
  rareza: 'comun'
  icono: '🎯'
  monedas: 10
  xp: 20
  criterio:
    tipo: 'ejercicios_completados'
    valor: 1

un_dia_vez:
  codigo: 'un_dia_vez'
  nombre: 'Un Día a la Vez'
  descripcion: 'Mantén una racha de 1 día'
  categoria: 'consistencia'
  rareza: 'comun'
  icono: '🔥'
  monedas: 5
  xp: 10
  criterio:
    tipo: 'racha_dias'
    valor: 1

tres_multitud:
  codigo: 'tres_multitud'
  nombre: 'Tres son Multitud'
  descripcion: 'Mantén una racha de 3 días consecutivos'
  categoria: 'consistencia'
  rareza: 'comun'
  icono: '🔥🔥'
  monedas: 20
  xp: 50
  criterio:
    tipo: 'racha_dias'
    valor: 3

segunda_semana:
  codigo: 'segunda_semana'
  nombre: 'Segunda Semana'
  descripcion: 'Completa 7 días de actividad (no consecutivos)'
  categoria: 'consistencia'
  rareza: 'comun'
  icono: '📅'
  monedas: 30
  xp: 80
  criterio:
    tipo: 'dias_activos_total'
    valor: 7
```

#### **RAROS (3):**

```yaml
racha_fuego:
  codigo: 'racha_fuego'
  nombre: 'Racha de Fuego'
  descripcion: 'Mantén una racha de 7 días consecutivos'
  categoria: 'consistencia'
  rareza: 'raro'
  icono: '🔥🔥🔥'
  monedas: 50
  xp: 100
  animacion: 'aura_fuego'
  criterio:
    tipo: 'racha_dias'
    valor: 7

dos_semanas_imparables:
  codigo: 'dos_semanas_imparables'
  nombre: 'Dos Semanas Imparables'
  descripcion: 'Mantén una racha de 14 días consecutivos'
  categoria: 'consistencia'
  rareza: 'raro'
  icono: '🔥🔥🔥'
  monedas: 80
  xp: 200
  criterio:
    tipo: 'racha_dias'
    valor: 14

veterano_gimnasio:
  codigo: 'veterano_gimnasio'
  nombre: 'Veterano del Gimnasio'
  descripcion: '30 días de actividad total (no consecutivos)'
  categoria: 'consistencia'
  rareza: 'raro'
  icono: '💪'
  monedas: 60
  xp: 150
  criterio:
    tipo: 'dias_activos_total'
    valor: 30
```

#### **ÉPICOS (2):**

```yaml
imparable:
  codigo: 'imparable'
  nombre: 'Imparable'
  descripcion: 'Mantén una racha de 30 días consecutivos'
  categoria: 'consistencia'
  rareza: 'epico'
  icono: '🔥🔥🔥🔥'
  monedas: 200
  xp: 500
  animacion: 'fenix_ardiendo'
  criterio:
    tipo: 'racha_dias'
    valor: 30

dedicacion_hierro:
  codigo: 'dedicacion_hierro'
  nombre: 'Dedicación de Hierro'
  descripcion: 'Mantén una racha de 60 días consecutivos'
  categoria: 'consistencia'
  rareza: 'epico'
  icono: '⚡'
  monedas: 400
  xp: 1000
  titulo: 'Inquebrantable'
  criterio:
    tipo: 'racha_dias'
    valor: 60
```

#### **LEGENDARIO (1):**

```yaml
leyenda_viviente:
  codigo: 'leyenda_viviente'
  nombre: 'Leyenda Viviente'
  descripcion: 'Mantén una racha de 90 días consecutivos (trimestre)'
  categoria: 'consistencia'
  rareza: 'legendario'
  icono: '👑🔥'
  monedas: 800
  xp: 2000
  animacion: 'fenix_inmortal'
  titulo: 'Leyenda Viviente'
  extras:
    - 'Avatar con llamas permanentes'
    - 'Mención en Hall of Fame'
  criterio:
    tipo: 'racha_dias'
    valor: 90
```

---

### **CATEGORÍA 2: MAESTRÍA** 🎓 (12 logros)

#### **COMUNES (3):**

```yaml
primera_victoria:
  codigo: 'primera_victoria'
  nombre: 'Primera Victoria'
  descripcion: 'Completa tu primer tema al 100%'
  categoria: 'maestria'
  rareza: 'comun'
  icono: '✅'
  monedas: 30
  xp: 100
  criterio:
    tipo: 'temas_completados'
    valor: 1

doble_nada:
  codigo: 'doble_nada'
  nombre: 'Doble o Nada'
  descripcion: 'Completa 2 temas al 100%'
  categoria: 'maestria'
  rareza: 'comun'
  icono: '✅✅'
  monedas: 50
  xp: 150
  criterio:
    tipo: 'temas_completados'
    valor: 2

trio_perfecto:
  codigo: 'trio_perfecto'
  nombre: 'Trío Perfecto'
  descripcion: 'Completa 3 temas al 100%'
  categoria: 'maestria'
  rareza: 'comun'
  icono: '✅✅✅'
  monedas: 80
  xp: 200
  criterio:
    tipo: 'temas_completados'
    valor: 3
```

#### **RAROS (5):**

```yaml
completista:
  codigo: 'completista'
  nombre: 'Completista'
  descripcion: 'Completa 5 temas al 100%'
  categoria: 'maestria'
  rareza: 'raro'
  icono: '🎯'
  monedas: 120
  xp: 300
  animacion: 'cerebrito'
  criterio:
    tipo: 'temas_completados'
    valor: 5

maestro_algebra:
  codigo: 'maestro_algebra'
  nombre: 'Maestro del Álgebra'
  descripcion: 'Completa módulo de Álgebra al 100%'
  categoria: 'maestria'
  rareza: 'raro'
  icono: '🧮'
  monedas: 300
  xp: 1000
  badge: 'Maestro Álgebra'
  criterio:
    tipo: 'modulo_completado'
    valor: 'algebra'

maestro_geometria:
  codigo: 'maestro_geometria'
  nombre: 'Maestro de Geometría'
  descripcion: 'Completa módulo de Geometría al 100%'
  categoria: 'maestria'
  rareza: 'raro'
  icono: '📐'
  monedas: 300
  xp: 1000
  badge: 'Maestro Geometría'
  criterio:
    tipo: 'modulo_completado'
    valor: 'geometria'

maestro_aritmetica:
  codigo: 'maestro_aritmetica'
  nombre: 'Maestro de Aritmética'
  descripcion: 'Completa módulo de Aritmética al 100%'
  categoria: 'maestria'
  rareza: 'raro'
  icono: '➗'
  monedas: 300
  xp: 1000
  badge: 'Maestro Aritmética'
  criterio:
    tipo: 'modulo_completado'
    valor: 'aritmetica'

coleccionista:
  codigo: 'coleccionista'
  nombre: 'Coleccionista'
  descripcion: 'Completa 10 temas al 100%'
  categoria: 'maestria'
  rareza: 'raro'
  icono: '📚'
  monedas: 250
  xp: 600
  criterio:
    tipo: 'temas_completados'
    valor: 10
```

#### **ÉPICOS (3):**

```yaml
polimata:
  codigo: 'polimata'
  nombre: 'Polímata'
  descripcion: 'Completa 3 módulos diferentes al 100%'
  categoria: 'maestria'
  rareza: 'epico'
  icono: '🌟'
  monedas: 500
  xp: 2000
  titulo: 'Polímata'
  criterio:
    tipo: 'modulos_completados'
    valor: 3

maestria_total:
  codigo: 'maestria_total'
  nombre: 'Maestría Total'
  descripcion: 'Completa 20 temas al 100%'
  categoria: 'maestria'
  rareza: 'epico'
  icono: '🎓💯'
  monedas: 600
  xp: 2500
  extras:
    - 'Avatar con aura dorada académica'
  criterio:
    tipo: 'temas_completados'
    valor: 20

dominio_absoluto:
  codigo: 'dominio_absoluto'
  nombre: 'Dominio Absoluto'
  descripcion: 'Completa 5 módulos diferentes al 100%'
  categoria: 'maestria'
  rareza: 'epico'
  icono: '👑'
  monedas: 1000
  xp: 3000
  extras:
    - 'Marco avatar platino académico'
  criterio:
    tipo: 'modulos_completados'
    valor: 5
```

#### **LEGENDARIO (1):**

```yaml
enciclopedia_viviente:
  codigo: 'enciclopedia_viviente'
  nombre: 'Enciclopedia Viviente'
  descripcion: 'Completa TODOS los módulos de tu grado al 100%'
  categoria: 'maestria'
  rareza: 'legendario'
  icono: '📖👑'
  monedas: 2000
  xp: 5000
  animacion: 'explosion_conocimiento'
  titulo: 'Enciclopedia'
  extras:
    - 'Certificado especial del director'
    - 'Mención en Hall of Fame'
  criterio:
    tipo: 'todos_modulos_grado'
    valor: 100
```

---

### **CATEGORÍA 3: PRECISIÓN** 🎯 (8 logros)

```yaml
# COMUNES (2)
primera_perfeccion:
  codigo: 'primera_perfeccion'
  nombre: 'Primera Perfección'
  descripcion: 'Completa 1 ejercicio con 100% de precisión'
  categoria: 'precision'
  rareza: 'comun'
  icono: '💯'
  monedas: 15
  xp: 30
  criterio:
    tipo: 'ejercicios_perfectos'
    valor: 1

racha_perfecta:
  codigo: 'racha_perfecta'
  nombre: 'Racha Perfecta'
  descripcion: 'Completa 3 ejercicios perfectos consecutivos'
  categoria: 'precision'
  rareza: 'comun'
  icono: '💯💯'
  monedas: 30
  xp: 60
  criterio:
    tipo: 'ejercicios_perfectos_consecutivos'
    valor: 3

# RAROS (3)
perfeccionista:
  codigo: 'perfeccionista'
  nombre: 'Perfeccionista'
  descripcion: 'Completa 10 ejercicios con 100% de precisión'
  categoria: 'precision'
  rareza: 'raro'
  icono: '💯🎯'
  monedas: 100
  xp: 300
  animacion: 'victoria_epica'
  criterio:
    tipo: 'ejercicios_perfectos'
    valor: 10

ojo_halcon:
  codigo: 'ojo_halcon'
  nombre: 'Ojo de Halcón'
  descripcion: 'Completa 25 ejercicios con 100% de precisión'
  categoria: 'precision'
  rareza: 'raro'
  icono: '🦅'
  monedas: 200
  xp: 600
  criterio:
    tipo: 'ejercicios_perfectos'
    valor: 25

precision_mortal:
  codigo: 'precision_mortal'
  nombre: 'Precisión Mortal'
  descripcion: '10 ejercicios perfectos en un solo día'
  categoria: 'precision'
  rareza: 'raro'
  icono: '🎯'
  monedas: 150
  xp: 400
  criterio:
    tipo: 'ejercicios_perfectos_dia'
    valor: 10

# ÉPICOS (2)
francotirador:
  codigo: 'francotirador'
  nombre: 'Francotirador'
  descripcion: 'Completa 50 ejercicios con 100% de precisión'
  categoria: 'precision'
  rareza: 'epico'
  icono: '🎯🔥'
  monedas: 300
  xp: 800
  titulo: 'Francotirador'
  animacion: 'sniper_shot'
  criterio:
    tipo: 'ejercicios_perfectos'
    valor: 50

perfeccion_absoluta:
  codigo: 'perfeccion_absoluta'
  nombre: 'Perfección Absoluta'
  descripcion: '20 ejercicios perfectos consecutivos'
  categoria: 'precision'
  rareza: 'epico'
  icono: '💎'
  monedas: 400
  xp: 1000
  extras:
    - 'Efecto avatar: Destello al completar ejercicio'
  criterio:
    tipo: 'ejercicios_perfectos_consecutivos'
    valor: 20

# LEGENDARIO (1)
mente_brillante:
  codigo: 'mente_brillante'
  nombre: 'Mente Brillante'
  descripcion: 'Completa 100 ejercicios con 100% de precisión'
  categoria: 'precision'
  rareza: 'legendario'
  icono: '🧠💎'
  monedas: 500
  xp: 2000
  animacion: 'explosion_mental'
  titulo: 'Mente Brillante'
  extras:
    - 'Avatar con aura brillante permanente'
  criterio:
    tipo: 'ejercicios_perfectos'
    valor: 100
```

---

### **CATEGORÍA 4: VELOCIDAD** ⚡ (6 logros)

```yaml
# COMUNES (2)
primera_velocidad:
  codigo: 'primera_velocidad'
  nombre: 'Primera Velocidad'
  descripcion: 'Completa un ejercicio en menos de 30 segundos'
  categoria: 'velocidad'
  rareza: 'comun'
  icono: '⚡'
  monedas: 20
  xp: 40
  criterio:
    tipo: 'ejercicio_rapido'
    valor: 30

acelerado:
  codigo: 'acelerado'
  nombre: 'Acelerado'
  descripcion: 'Completa 5 ejercicios en menos de 30s cada uno'
  categoria: 'velocidad'
  rareza: 'comun'
  icono: '⚡⚡'
  monedas: 40
  xp: 80
  criterio:
    tipo: 'ejercicios_rapidos'
    valor: 5

# RAROS (2)
rapido_furioso:
  codigo: 'rapido_furioso'
  nombre: 'Rápido y Furioso'
  descripcion: 'Completa 10 ejercicios en menos de 30s cada uno'
  categoria: 'velocidad'
  rareza: 'raro'
  icono: '🏎️'
  monedas: 80
  xp: 150
  animacion: 'flash'
  criterio:
    tipo: 'ejercicios_rapidos'
    valor: 10

velocista:
  codigo: 'velocista'
  nombre: 'Velocista'
  descripcion: 'Completa 20 ejercicios rápidos (<30s)'
  categoria: 'velocidad'
  rareza: 'raro'
  icono: '🏃'
  monedas: 150
  xp: 300
  criterio:
    tipo: 'ejercicios_rapidos'
    valor: 20

# ÉPICO (1)
velocidad_luz:
  codigo: 'velocidad_luz'
  nombre: 'Velocidad de la Luz'
  descripcion: 'Completa 50 ejercicios en menos de 30s cada uno'
  categoria: 'velocidad'
  rareza: 'epico'
  icono: '⚡💫'
  monedas: 300
  xp: 600
  animacion: 'sonic'
  extras:
    - 'Efecto: Estela de velocidad al responder'
  criterio:
    tipo: 'ejercicios_rapidos'
    valor: 50

# LEGENDARIO (1)
taquion_humano:
  codigo: 'taquion_humano'
  nombre: 'Taquión Humano'
  descripcion: 'Completa un tema entero en una sesión (<1 hora)'
  categoria: 'velocidad'
  rareza: 'legendario'
  icono: '⚡👑'
  monedas: 500
  xp: 1000
  titulo: 'Taquión'
  extras:
    - 'Efecto: Rayo permanente en avatar'
  criterio:
    tipo: 'tema_rapido'
    valor: 60
```

---

### **CATEGORÍA 5: SOCIAL** 👥 (8 logros)

```yaml
# COMUNES (2)
primera_ayuda:
  codigo: 'primera_ayuda'
  nombre: 'Primera Ayuda'
  descripcion: 'Ayuda a un compañero'
  categoria: 'social'
  rareza: 'comun'
  icono: '🤝'
  monedas: 10
  xp: 20
  criterio:
    tipo: 'ayudas_dadas'
    valor: 1

mano_amiga:
  codigo: 'mano_amiga'
  nombre: 'Mano Amiga'
  descripcion: 'Ayuda a 3 compañeros'
  categoria: 'social'
  rareza: 'comun'
  icono: '🤝🤝'
  monedas: 30
  xp: 60
  criterio:
    tipo: 'ayudas_dadas'
    valor: 3

# RAROS (3)
buen_companero:
  codigo: 'buen_companero'
  nombre: 'Buen Compañero'
  descripcion: 'Ayuda a 10 estudiantes'
  categoria: 'social'
  rareza: 'raro'
  icono: '🤝✨'
  monedas: 80
  xp: 200
  animacion: 'high_five'
  criterio:
    tipo: 'ayudas_dadas'
    valor: 10

primer_recluta:
  codigo: 'primer_recluta'
  nombre: 'Primer Recluta'
  descripcion: 'Invita a un amigo que se registra'
  categoria: 'social'
  rareza: 'raro'
  icono: '📣'
  monedas: 50
  xp: 100
  criterio:
    tipo: 'invitaciones_registradas'
    valor: 1

reclutador:
  codigo: 'reclutador'
  nombre: 'Reclutador'
  descripcion: 'Invita a 2 amigos que completan 1 tema'
  categoria: 'social'
  rareza: 'raro'
  icono: '📣📣'
  monedas: 200
  xp: 300
  criterio:
    tipo: 'invitaciones_activas'
    valor: 2

# ÉPICOS (2)
mentor:
  codigo: 'mentor'
  nombre: 'Mentor'
  descripcion: 'Ayuda a 25 estudiantes'
  categoria: 'social'
  rareza: 'epico'
  icono: '👨‍🏫'
  monedas: 300
  xp: 800
  titulo: 'Mentor'
  animacion: 'maestro_shaolin'
  extras:
    - 'Desbloquea: Puede dar ayuda oficial'
  criterio:
    tipo: 'ayudas_dadas'
    valor: 25

embajador:
  codigo: 'embajador'
  nombre: 'Embajador'
  descripcion: 'Invita 5 amigos activos (completaron 1 tema)'
  categoria: 'social'
  rareza: 'epico'
  icono: '🌟'
  monedas: 500
  xp: 1000
  titulo: 'Embajador'
  badge: 'Badge especial en perfil'
  criterio:
    tipo: 'invitaciones_activas'
    valor: 5

# LEGENDARIO (1)
lider_nato:
  codigo: 'lider_nato'
  nombre: 'Líder Nato'
  descripcion: 'Invita 10 amigos activos + ayuda 50 estudiantes'
  categoria: 'social'
  rareza: 'legendario'
  icono: '👑🌟'
  monedas: 1000
  xp: 2000
  animacion: 'lider_inspirador'
  titulo: 'Líder Nato'
  extras:
    - 'Avatar con corona social'
    - 'Puede crear equipos propios'
  criterio:
    tipo: 'lider_completo'
    valor:
      invitaciones: 10
      ayudas: 50
```

---

### **CATEGORÍA 6: ASISTENCIA** 📅 (6 logros)

```yaml
# COMUNES (2)
primera_clase:
  codigo: 'primera_clase'
  nombre: 'Primera Clase'
  descripcion: 'Asiste a tu primera clase grupal'
  categoria: 'asistencia'
  rareza: 'comun'
  icono: '🎓'
  monedas: 10
  xp: 50
  criterio:
    tipo: 'clases_asistidas'
    valor: 1

alumno_regular:
  codigo: 'alumno_regular'
  nombre: 'Alumno Regular'
  descripcion: 'Asiste a 3 clases'
  categoria: 'asistencia'
  rareza: 'comun'
  icono: '📚'
  monedas: 30
  xp: 150
  criterio:
    tipo: 'clases_asistidas'
    valor: 3

# RAROS (2)
alumno_presente:
  codigo: 'alumno_presente'
  nombre: 'Alumno Presente'
  descripcion: 'Asiste a 4 clases en un mes (completo)'
  categoria: 'asistencia'
  rareza: 'raro'
  icono: '✅'
  monedas: 70
  xp: 300
  badge: 'Alumno del Mes'
  criterio:
    tipo: 'clases_asistidas_mes'
    valor: 4

nunca_falta:
  codigo: 'nunca_falta'
  nombre: 'Nunca Falta'
  descripcion: 'Asiste a 8 clases consecutivas'
  categoria: 'asistencia'
  rareza: 'raro'
  icono: '📆'
  monedas: 150
  xp: 500
  criterio:
    tipo: 'clases_consecutivas'
    valor: 8

# ÉPICO (1)
asistencia_perfecta_mensual:
  codigo: 'asistencia_perfecta_mensual'
  nombre: 'Asistencia Perfecta Mensual'
  descripcion: '4 clases asistidas + 0 inasistencias en el mes'
  categoria: 'asistencia'
  rareza: 'epico'
  icono: '🏆'
  monedas: 200
  xp: 800
  extras:
    - 'Certificado digital de asistencia perfecta'
  criterio:
    tipo: 'asistencia_perfecta_mes'
    valor: 4

# LEGENDARIO (1)
asistencia_perfecta_trimestral:
  codigo: 'asistencia_perfecta_trimestral'
  nombre: 'Asistencia Perfecta Trimestral'
  descripcion: '12 clases asistidas + 0 inasistencias en trimestre'
  categoria: 'asistencia'
  rareza: 'legendario'
  icono: '👑📅'
  monedas: 500
  xp: 2000
  titulo: 'Alumno Modelo'
  extras:
    - 'Certificado físico del director'
    - 'Mención en newsletter'
  criterio:
    tipo: 'asistencia_perfecta_trimestre'
    valor: 12
```

---

### **CATEGORÍA 7: DESAFÍOS SEMANALES** 📆 (5 logros - NUEVO)

```yaml
lunes_motivado:
  codigo: 'lunes_motivado'
  nombre: 'Lunes Motivado'
  descripcion: 'Completa 5 ejercicios un lunes'
  categoria: 'desafios_semanales'
  rareza: 'raro'
  icono: '🌅'
  monedas: 60
  xp: 150
  criterio:
    tipo: 'ejercicios_dia_semana'
    valor:
      dia: 1
      cantidad: 5

viernes_fuego:
  codigo: 'viernes_fuego'
  nombre: 'Viernes de Fuego'
  descripcion: 'Sesión de 1 hora un viernes'
  categoria: 'desafios_semanales'
  rareza: 'raro'
  icono: '🔥'
  monedas: 80
  xp: 200
  criterio:
    tipo: 'sesion_dia_semana'
    valor:
      dia: 5
      minutos: 60

fin_semana_warrior:
  codigo: 'fin_semana_warrior'
  nombre: 'Fin de Semana Warrior'
  descripcion: 'Completa 20 ejercicios sábado + domingo'
  categoria: 'desafios_semanales'
  rareza: 'epico'
  icono: '⚔️'
  monedas: 150
  xp: 400
  criterio:
    tipo: 'ejercicios_fin_semana'
    valor: 20

semana_perfecta:
  codigo: 'semana_perfecta'
  nombre: 'Semana Perfecta'
  descripcion: 'Actividad todos los días de lunes a domingo'
  categoria: 'desafios_semanales'
  rareza: 'epico'
  icono: '✨'
  monedas: 200
  xp: 500
  animacion: 'semana_perfecta'
  criterio:
    tipo: 'actividad_7_dias_semana'
    valor: 7

madrugador:
  codigo: 'madrugador'
  nombre: 'Madrugador'
  descripcion: 'Completa 10 ejercicios antes de las 7 AM'
  categoria: 'desafios_semanales'
  rareza: 'epico'
  icono: '🌅'
  monedas: 200
  xp: 500
  titulo: 'Madrugador'
  secreto: true
  criterio:
    tipo: 'ejercicios_horario'
    valor:
      cantidad: 10
      hora_max: 7
```

---

### **CATEGORÍA 8: ESPECIALIZACIÓN** 🎯 (4 logros - NUEVO)

```yaml
as_multiplicacion:
  codigo: 'as_multiplicacion'
  nombre: 'As de la Multiplicación'
  descripcion: '100% en 20 ejercicios de multiplicación'
  categoria: 'especializacion'
  rareza: 'raro'
  icono: '✖️'
  monedas: 150
  xp: 400
  badge: 'As Multiplicación'
  criterio:
    tipo: 'especializacion_tema'
    valor:
      tema: 'multiplicacion'
      cantidad: 20
      precision: 100

rey_fracciones:
  codigo: 'rey_fracciones'
  nombre: 'Rey de las Fracciones'
  descripcion: '100% en 20 ejercicios de fracciones'
  categoria: 'especializacion'
  rareza: 'raro'
  icono: '🎂'
  monedas: 150
  xp: 400
  badge: 'Rey Fracciones'
  criterio:
    tipo: 'especializacion_tema'
    valor:
      tema: 'fracciones'
      cantidad: 20
      precision: 100

maestro_ecuaciones:
  codigo: 'maestro_ecuaciones'
  nombre: 'Maestro de Ecuaciones'
  descripcion: '100% en 20 ejercicios de ecuaciones'
  categoria: 'especializacion'
  rareza: 'epico'
  icono: '📊'
  monedas: 200
  xp: 600
  badge: 'Maestro Ecuaciones'
  criterio:
    tipo: 'especializacion_tema'
    valor:
      tema: 'ecuaciones'
      cantidad: 20
      precision: 100

genio_calculo_mental:
  codigo: 'genio_calculo_mental'
  nombre: 'Genio del Cálculo Mental'
  descripcion: '50 ejercicios sin usar calculadora'
  categoria: 'especializacion'
  rareza: 'epico'
  icono: '🧠'
  monedas: 300
  xp: 800
  titulo: 'Calculadora Humana'
  criterio:
    tipo: 'ejercicios_sin_calculadora'
    valor: 50
```

---

### **CATEGORÍA 9: NIVELES** ⬆️ (4 logros)

```yaml
nivel_5:
  codigo: 'nivel_5'
  nombre: 'Nivel 5'
  descripcion: 'Alcanza el nivel 5'
  categoria: 'niveles'
  rareza: 'raro'
  icono: '⭐⭐⭐⭐⭐'
  monedas: 100
  xp: 200
  badge: 'Nivel 5 dorado'
  criterio:
    tipo: 'nivel_alcanzado'
    valor: 5

nivel_7:
  codigo: 'nivel_7'
  nombre: 'Nivel 7'
  descripcion: 'Alcanza el nivel 7'
  categoria: 'niveles'
  rareza: 'raro'
  icono: '⭐⭐⭐⭐⭐⭐⭐'
  monedas: 200
  xp: 500
  extras:
    - 'Marco avatar platino'
  criterio:
    tipo: 'nivel_alcanzado'
    valor: 7

nivel_10:
  codigo: 'nivel_10'
  nombre: 'Nivel 10'
  descripcion: 'Alcanza el nivel 10'
  categoria: 'niveles'
  rareza: 'epico'
  icono: '🌟'
  monedas: 500
  xp: 1000
  extras:
    - 'Avatar con aura legendaria'
    - 'Acceso VIP completo'
  criterio:
    tipo: 'nivel_alcanzado'
    valor: 10

maximo_nivel:
  codigo: 'maximo_nivel'
  nombre: 'Máximo Nivel'
  descripcion: 'Alcanza el nivel máximo del sistema (15+)'
  categoria: 'niveles'
  rareza: 'legendario'
  icono: '👑💎'
  monedas: 2000
  xp: 5000
  titulo: 'Leyenda Máxima'
  extras:
    - 'Hall of Fame permanente'
    - 'Placa física conmemorativa'
  criterio:
    tipo: 'nivel_alcanzado'
    valor: 15
```

---

### **CATEGORÍA 10: SECRETOS** 🎭 (10 logros - NUEVO)

```yaml
error_404:
  codigo: 'error_404'
  nombre: 'Error 404'
  descripcion: 'Responde incorrectamente un ejercicio fácil'
  categoria: 'secretos'
  rareza: 'comun'
  icono: '🐛'
  monedas: 50
  xp: 100
  secreto: true
  mensaje_desbloqueo: 'Hasta los genios se equivocan 😉'
  criterio:
    tipo: 'error_ejercicio_facil'
    valor: 1

detective:
  codigo: 'detective'
  nombre: 'Detective'
  descripcion: 'Revisa tu historial de progreso 10 veces'
  categoria: 'secretos'
  rareza: 'comun'
  icono: '🔍'
  monedas: 80
  xp: 150
  secreto: true
  badge: 'Detective'
  criterio:
    tipo: 'revisar_historial'
    valor: 10

curioso:
  codigo: 'curioso'
  nombre: 'Curioso'
  descripcion: 'Abre todos los módulos para explorar'
  categoria: 'secretos'
  rareza: 'raro'
  icono: '🤔'
  monedas: 100
  xp: 200
  secreto: true
  titulo: 'Explorador'
  criterio:
    tipo: 'explorar_todos_modulos'
    valor: 1

speedrunner:
  codigo: 'speedrunner'
  nombre: 'Speedrunner'
  descripcion: 'Completa un tema en menos de 30 minutos'
  categoria: 'secretos'
  rareza: 'epico'
  icono: '🏃💨'
  monedas: 300
  xp: 500
  secreto: true
  animacion: 'speedrun'
  criterio:
    tipo: 'tema_muy_rapido'
    valor: 30

ninja:
  codigo: 'ninja'
  nombre: 'Ninja'
  descripcion: 'Completa 5 ejercicios sin hacer ningún error'
  categoria: 'secretos'
  rareza: 'epico'
  icono: '🥷'
  monedas: 200
  xp: 400
  secreto: true
  extras:
    - 'Efecto: Sombras en avatar'
  criterio:
    tipo: 'ejercicios_perfectos_sesion'
    valor: 5

multitasker:
  codigo: 'multitasker'
  nombre: 'Multitasker'
  descripcion: 'Trabaja en 3 temas diferentes en un día'
  categoria: 'secretos'
  rareza: 'raro'
  icono: '🎯🎯'
  monedas: 150
  xp: 300
  secreto: true
  criterio:
    tipo: 'temas_diferentes_dia'
    valor: 3

comeback_kid:
  codigo: 'comeback_kid'
  nombre: 'Comeback Kid'
  descripcion: 'Vuelve después de perder racha de 7+ días'
  categoria: 'secretos'
  rareza: 'raro'
  icono: '💪'
  monedas: 100
  xp: 200
  secreto: true
  mensaje_desbloqueo: '¡Bienvenido de vuelta! 🎉'
  criterio:
    tipo: 'volver_despues_racha_perdida'
    valor: 7

perfeccionista_obsesivo:
  codigo: 'perfeccionista_obsesivo'
  nombre: 'Perfeccionista Obsesivo'
  descripcion: 'Repite un ejercicio 100% tres veces más'
  categoria: 'secretos'
  rareza: 'comun'
  icono: '😅'
  monedas: 50
  xp: 100
  secreto: true
  mensaje_desbloqueo: 'Ya estaba perfecto... ¡pero bueno! 😄'
  criterio:
    tipo: 'repetir_ejercicio_perfecto'
    valor: 3

social_butterfly:
  codigo: 'social_butterfly'
  nombre: 'Social Butterfly'
  descripcion: 'Ayuda a 3 compañeros diferentes en un día'
  categoria: 'secretos'
  rareza: 'raro'
  icono: '🦋'
  monedas: 150
  xp: 250
  secreto: true
  criterio:
    tipo: 'ayudas_diferentes_dia'
    valor: 3

noche_vela:
  codigo: 'noche_vela'
  nombre: 'Noche en Vela'
  descripcion: 'Completa 30 ejercicios entre 00:00-06:00'
  categoria: 'secretos'
  rareza: 'epico'
  icono: '🌃'
  monedas: 500
  xp: 800
  secreto: true
  titulo: 'Insomne Académico'
  criterio:
    tipo: 'ejercicios_madrugada'
    valor:
      cantidad: 30
      hora_min: 0
      hora_max: 6
```

---

## 📊 RESUMEN COMPLETO

```yaml
ESTADÍSTICAS_SISTEMA:
  total_logros: 67

  por_rareza:
    comunes: 17
    raros: 24
    epicos: 18
    legendarios: 8
    secretos: 10

  por_categoria:
    consistencia: 10
    maestria: 12
    precision: 8
    velocidad: 6
    social: 8
    asistencia: 6
    desafios_semanales: 5
    especializacion: 4
    niveles: 4
    secretos: 10

  recompensas_totales:
    monedas_total: 15750
    xp_total: 52120

  niveles_sistema:
    minimo: 1
    maximo: 15
    formula: 'nivel = floor(sqrt(xp / 100)) + 1'
```

---

**FIN DEL DOCUMENTO - Sistema completo listo para implementación**

_Última actualización: 30 de Octubre 2025_  
_Versión: 2.0 FINAL OPTIMIZADA_
