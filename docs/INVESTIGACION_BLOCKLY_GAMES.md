# Investigacion: Integracion de Blockly Games en Mateatletas

> **Fecha**: Diciembre 2024
> **Objetivo**: Evaluar opciones para integrar Blockly Games como "preescolar" de programacion antes de Scratch
> **Repositorio**: https://github.com/google/blockly-games

---

## Resumen Ejecutivo

Blockly Games es una coleccion de 8 juegos educativos de Google para enseniar programacion de forma progresiva. Tras analizar el repositorio, las opciones de integracion y los requisitos de Mateatletas, la recomendacion es:

| Opcion                          | Recomendacion      | Esfuerzo | Personalizacion |
| ------------------------------- | ------------------ | -------- | --------------- |
| **Opcion B: Fork + Adaptacion** | **RECOMENDADA**    | Alto     | Total           |
| Opcion A: Iframe                | Alternativa rapida | Bajo     | Ninguna         |
| Opcion C: Extraer componentes   | No recomendada     | Muy Alto | Total           |

**Recomendacion Final**: **Opcion B (Fork)** para integracion completa con sistema de XP, o **Opcion A (Iframe)** como MVP rapido para validar el concepto.

---

## Estructura del Proyecto

### Arbol de Carpetas Principal

```
blockly-games/
├── appengine/                    # Aplicacion principal
│   ├── bird/                     # Juego: Pajaro (condicionales)
│   ├── maze/                     # Juego: Laberinto (secuencias)
│   ├── movie/                    # Juego: Pelicula (funciones)
│   ├── music/                    # Juego: Musica (loops/patrones)
│   ├── pond/                     # Juegos: Estanque (IA/batalla)
│   │   ├── tutor/                # Tutorial del estanque
│   │   ├── duck/                 # Batalla de patos
│   │   └── battle/               # Modo competitivo
│   ├── puzzle/                   # Juego: Rompecabezas (intro bloques)
│   ├── turtle/                   # Juego: Tortuga (geometria/arte)
│   ├── common/                   # Recursos compartidos
│   ├── src/                      # Librerias JavaScript
│   ├── gallery/                  # Galeria de proyectos
│   ├── gallery_api/              # API para galeria
│   ├── third-party/              # Dependencias (Blockly, Ace, etc.)
│   ├── index/                    # Pagina principal
│   ├── storage.py                # Backend Python (App Engine)
│   ├── app.yaml                  # Config Google App Engine
│   └── *.html                    # Paginas de cada juego
├── build/                        # Scripts de compilacion
│   ├── compress.py               # Compilador Closure
│   ├── messages_to_json.py       # Exportar traducciones
│   └── json_to_js.py             # Importar traducciones
├── json/                         # 111 idiomas (traducciones)
│   ├── es.json                   # Espaniol completo
│   ├── en.json                   # Ingles
│   └── ...
├── third-party/                  # Dependencias base
├── externs/                      # Definiciones externas
├── Makefile                      # Comandos de build
└── LICENSE                       # Apache 2.0
```

### Dependencias del Proyecto

| Dependencia             | Version     | Proposito              |
| ----------------------- | ----------- | ---------------------- |
| Google Closure Compiler | Latest      | Compilar/minificar JS  |
| Blockly                 | Fork propio | Editor de bloques      |
| Ace Editor              | Latest      | Editor de texto        |
| SoundJS                 | Latest      | Efectos de sonido      |
| JS-Interpreter          | Fork propio | Ejecutar codigo seguro |
| Python 2.7/3.x          | N/A         | Scripts de build       |
| Java                    | N/A         | Closure Compiler       |
| SVN                     | N/A         | Descargar dependencias |

### Requisitos de Build

```bash
# Dependencias requeridas
REQUIRED_BINS = svn wget java python

# Comando principal
make deps    # Descargar dependencias
make games   # Compilar todos los juegos
make offline # Generar version sin servidor
```

---

## Juegos Disponibles (8 Total)

### 1. Puzzle (Rompecabezas)

- **Concepto**: Introduccion a bloques, arrastrar y soltar
- **Niveles**: 1
- **Habilidades**: Reconocer patrones, clasificacion
- **Audiencia**: 6-8 anios (Quantum)
- **Assets**: 4 imagenes de animales (pato, gato, abeja, caracol)

### 2. Maze (Laberinto)

- **Concepto**: Secuencias, direcciones, bucles simples
- **Niveles**: 10
- **Habilidades**: Pensamiento secuencial, depuracion
- **Audiencia**: 6-10 anios (Quantum/Vertex)
- **Assets**: 3 skins (Pegman, Astronauta, Panda)
- **Theming**: Facil de cambiar sprites

### 3. Bird (Pajaro)

- **Concepto**: Condicionales (if/else), angulos
- **Niveles**: 10
- **Habilidades**: Toma de decisiones, geometria basica
- **Audiencia**: 8-12 anios (Vertex)
- **Assets**: Pajaro, nido, gusano, paredes

### 4. Turtle (Tortuga)

- **Concepto**: Geometria, arte, funciones
- **Niveles**: 10+ (modo libre)
- **Habilidades**: Creatividad, patrones geometricos
- **Audiencia**: 8-14 anios (Vertex/Pulsar)
- **Assets**: Canvas de dibujo
- **Galeria**: Permite compartir creaciones

### 5. Movie (Pelicula)

- **Concepto**: Animacion, funciones, tiempo
- **Niveles**: 10+ (modo libre)
- **Habilidades**: Storytelling, secuenciacion temporal
- **Audiencia**: 8-12 anios (Vertex)
- **Assets**: Formas geometricas basicas

### 6. Music (Musica)

- **Concepto**: Patrones, loops, composicion
- **Niveles**: 10+ (modo libre)
- **Habilidades**: Patrones musicales, creatividad
- **Audiencia**: 6-12 anios (Quantum/Vertex)
- **Assets**: Soundfonts de instrumentos
- **Galeria**: Permite compartir composiciones

### 7. Pond Tutor (Tutor del Estanque)

- **Concepto**: Programacion de IA, estrategia
- **Niveles**: 10
- **Habilidades**: Algoritmos, pensamiento estrategico
- **Audiencia**: 12-17 anios (Pulsar)
- **Assets**: Patos, estanque, proyectiles

### 8. Pond Duck (Estanque - Batalla)

- **Concepto**: Competencia, IA avanzada
- **Niveles**: Modo libre
- **Habilidades**: Optimizacion, estrategia avanzada
- **Audiencia**: 14-17 anios (Pulsar)
- **Caracteristica**: Puede usar JavaScript directo

---

## Progresion Pedagogica Recomendada

```
Casa QUANTUM (6-10 anios)
├── 1. Puzzle (introduccion)
├── 2. Maze niveles 1-5
└── 3. Music (creatividad)

Casa VERTEX (10-14 anios)
├── 4. Maze niveles 6-10
├── 5. Bird (condicionales)
├── 6. Turtle (geometria)
└── 7. Movie (animacion)

Casa PULSAR (14-17 anios)
├── 8. Pond Tutor (IA basica)
├── 9. Pond Duck (IA avanzada)
└── 10. → Scratch/JavaScript
```

---

## Sistema de Progreso Actual

### Almacenamiento Local

```javascript
// lib-games.js - Usa localStorage
window.localStorage[name + level] = xml;

// Ejemplo: maze3 = "<xml>...</xml>"
```

### Backend (App Engine)

```python
# storage.py - Google Datastore (NDB)
class Xml(ndb.Model):
    xml_hash = ndb.IntegerProperty()
    xml_content = ndb.TextProperty()

# Genera keys de 6 caracteres para compartir
# Ejemplo: https://blockly.games/maze?level=1#abc123
```

### Limitaciones

- Solo guarda XML de bloques, no progreso de niveles
- No hay sistema de usuarios/cuentas
- No hay tracking de intentos o tiempo
- No hay XP ni achievements

---

## Opciones de Integracion

### Opcion A: Iframe (MVP Rapido)

**Implementacion:**

```typescript
// BlocklyGamesEmbed.tsx
export function BlocklyGamesEmbed({ game, level, lang = 'es' }: Props) {
  return (
    <iframe
      src={`https://blockly.games/${game}?lang=${lang}&level=${level}`}
      className="w-full h-[600px] border-0 rounded-xl"
      allow="autoplay"
    />
  );
}
```

**Ventajas:**

- Implementacion en 1 dia
- Sin mantenimiento de codigo
- Siempre actualizado
- Funciona inmediatamente

**Desventajas:**

- Sin integracion de XP/progreso
- Sin theming de Casas
- Sin control sobre UX
- Dependencia externa
- Sin tracking de analiticas

**Esfuerzo:** 1-2 dias

---

### Opcion B: Fork + Adaptacion (RECOMENDADA)

**Pasos:**

1. Forkear repositorio
2. Modificar sistema de build para Next.js
3. Crear wrapper React para cada juego
4. Integrar con API de Mateatletas para progreso
5. Aplicar theming de Casas
6. Traducir/ajustar textos

**Arquitectura:**

```
mateatletas/
├── apps/web/
│   └── src/
│       └── components/
│           └── blockly-games/
│               ├── BlocklyGamesWrapper.tsx
│               ├── MazeGame.tsx
│               ├── PuzzleGame.tsx
│               ├── hooks/
│               │   ├── useBlocklyProgress.ts
│               │   └── useBlocklyXP.ts
│               ├── themes/
│               │   ├── quantum.css
│               │   ├── vertex.css
│               │   └── pulsar.css
│               └── assets/
│                   ├── sprites/      # Personajes custom
│                   └── sounds/       # Sonidos custom
└── packages/
    └── blockly-games/              # Fork adaptado
        ├── src/
        ├── games/
        └── package.json
```

**Integracion con XP:**

```typescript
// useBlocklyProgress.ts
export function useBlocklyProgress(gameId: string, level: number) {
  const { data: estudiante } = useEstudiante();

  const completarNivel = async (codigo: string, intentos: number) => {
    const xp = calcularXP(gameId, level, intentos);

    await api.post('/estudiantes/progreso', {
      estudianteId: estudiante.id,
      tipo: 'BLOCKLY_GAMES',
      gameId,
      level,
      codigo,
      intentos,
      xpGanado: xp,
    });
  };

  return { completarNivel };
}

function calcularXP(game: string, level: number, intentos: number): number {
  const baseXP = { puzzle: 50, maze: 100, bird: 150, turtle: 200 }[game] || 100;
  const bonusPrimerIntento = intentos === 1 ? 50 : 0;
  return baseXP * level + bonusPrimerIntento;
}
```

**Theming de Casas:**

```css
/* quantum.css - 6-10 anios */
.blockly-games {
  --primary: #ffd93d; /* Amarillo brillante */
  --secondary: #6bcb77; /* Verde suave */
  --background: #fff8e7; /* Crema calido */
  font-size: 18px; /* Texto grande */
}

/* vertex.css - 10-14 anios */
.blockly-games {
  --primary: #4ecdc4; /* Turquesa */
  --secondary: #ff6b6b; /* Coral */
  --background: #f7f7f7; /* Gris claro */
  font-size: 16px;
}

/* pulsar.css - 14-17 anios */
.blockly-games {
  --primary: #667eea; /* Indigo */
  --secondary: #764ba2; /* Purpura */
  --background: #1a1a2e; /* Oscuro */
  font-size: 14px;
}
```

**Ventajas:**

- Control total sobre UX
- Integracion con XP y progreso
- Theming por Casa
- Assets personalizados
- Analiticas detalladas
- Sin dependencia externa

**Desventajas:**

- Requiere mantener fork
- Build system complejo (Closure Compiler)
- Mas tiempo de implementacion

**Esfuerzo:** 2-3 semanas

---

### Opcion C: Extraer Componentes (No Recomendada)

**Concepto:** Reimplementar cada juego en React/TypeScript usando solo la logica core.

**Problemas:**

- Closure Compiler genera codigo dificil de portar
- Mucho codigo acoplado al sistema de Google
- Perdida de tiempo vs beneficio
- Riesgo de bugs al reimplementar

**Esfuerzo:** 2-3 meses

---

## Matriz Comparativa

| Criterio              | Opcion A (Iframe) | Opcion B (Fork) | Opcion C (Extraer) |
| --------------------- | ----------------- | --------------- | ------------------ |
| Tiempo implementacion | 1-2 dias          | 2-3 semanas     | 2-3 meses          |
| Integracion XP        | No                | Si              | Si                 |
| Theming Casas         | No                | Si              | Si                 |
| Mantenibilidad        | Alta              | Media           | Baja               |
| Control UX            | Ninguno           | Total           | Total              |
| Bundle size           | 0 (externo)       | ~2MB            | ~500KB             |
| Riesgo                | Bajo              | Medio           | Alto               |

---

## Respuestas a Preguntas Clave

### 1. Se puede buildear facilmente?

**Parcialmente.** Requiere Python, Java, SVN y wget. El Makefile descarga ~100MB de dependencias. Funciona pero es anticuado.

### 2. Que tan facil es cambiar assets graficos?

**Facil para sprites.** El juego Maze tiene 3 skins diferentes (pegman, astronauta, panda). Solo hay que reemplazar:

- `sprite.png` - Sprite sheet 1029x51 con 21 frames
- `tiles.png` - Tiles del mapa 250x200
- `background.jpg` - Fondo opcional

### 3. Hay sistema de i18n para espaniol?

**Si, completo.** El archivo `json/es.json` tiene 111 idiomas incluyendo espaniol con:

- Nombres de juegos
- Instrucciones
- Mensajes de error/exito
- Bloques de codigo

### 4. Como se trackea el progreso?

**localStorage solamente.** Guarda el XML de bloques por nivel. No hay backend para usuarios autenticados. Hay que implementar tracking propio.

### 5. Se puede conectar con backend externo?

**Si, con modificaciones.** Hay que:

- Interceptar eventos de completar nivel
- Enviar datos a nuestra API
- Reemplazar storage.py con nuestro backend

### 6. Cuanto pesa el bundle final?

**~2MB compilado** (todos los juegos). Individualmente:

- Maze: ~400KB
- Puzzle: ~300KB
- Bird: ~350KB
- Turtle: ~500KB

---

## Plan de Accion Recomendado

### Fase 1: MVP con Iframe (1-2 dias)

1. Crear componente `BlocklyGamesIframe`
2. Agregar a seccion de Programacion
3. Validar engagement con estudiantes

### Fase 2: Fork Basico (1 semana)

1. Forkear repositorio
2. Configurar build en monorepo
3. Crear wrapper React basico
4. Hostear en subdominio (games.mateatletas.com)

### Fase 3: Integracion Completa (2 semanas)

1. Integrar con sistema de XP
2. Aplicar theming de Casas
3. Crear sprites personalizados
4. Tracking de analiticas

### Fase 4: Optimizaciones (1 semana)

1. Lazy loading por juego
2. Service worker para offline
3. PWA para tablets

---

## Riesgos y Mitigaciones

| Riesgo                        | Probabilidad | Impacto | Mitigacion                    |
| ----------------------------- | ------------ | ------- | ----------------------------- |
| Closure Compiler incompatible | Media        | Alto    | Mantener build separado       |
| Fork desactualizado           | Media        | Medio   | Monitorear upstream           |
| Estudiantes prefieren Scratch | Media        | Medio   | Usar como intro, no reemplazo |
| Bundle muy grande             | Baja         | Bajo    | Code splitting por juego      |

---

## Referencias

### Recursos Oficiales

- [Blockly Games](https://blockly.games/) - Sitio oficial
- [Wiki del proyecto](https://github.com/google/blockly-games/wiki)
- [Repositorio GitHub](https://github.com/google/blockly-games)

### Documentacion Relacionada

- [Blockly Editor](https://developers.google.com/blockly)
- [INVESTIGACION_EDITOR_BLOQUES.md](./INVESTIGACION_EDITOR_BLOQUES.md) - Para BlockEditor

### Licencia

- **Apache 2.0** - Libre para uso comercial y modificacion

---

## Conclusion

**Blockly Games es una excelente opcion** como "preescolar" de programacion para Mateatletas:

1. **8 juegos progresivos** que cubren desde bloques basicos hasta IA
2. **Espaniol completo** con 111 idiomas disponibles
3. **Licencia permisiva** (Apache 2.0)
4. **Assets modificables** para theming de Casas
5. **Progresion pedagogica** clara y probada

La **Opcion B (Fork)** es la recomendada para integracion completa, pero la **Opcion A (Iframe)** sirve como MVP rapido para validar el concepto con estudiantes antes de invertir en el fork completo.

---

_Documento generado: Diciembre 2024_
