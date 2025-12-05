# Investigacion: Editor de Programacion Visual por Bloques

> **Fecha**: Diciembre 2024
> **Objetivo**: Evaluar opciones para integrar un editor de programacion visual tipo Scratch en Mateatletas Studio
> **Componente destino**: `BlockEditor` (orden 51, categoria EDITOR_CODIGO)

---

## Resumen Ejecutivo

Se evaluaron tres opciones principales para implementar un editor de programacion visual por bloques:

| Opcion                     | Recomendacion   | Esfuerzo | Bundle Size |
| -------------------------- | --------------- | -------- | ----------- |
| **Google Blockly**         | **RECOMENDADA** | Medio    | ~500KB gzip |
| Scratch GUI Oficial        | No recomendada  | Alto     | ~5-10MB     |
| Hibrido (Blockly + Canvas) | Futuro          | Muy Alto | Variable    |

**Recomendacion Final**: Usar **Google Blockly** con `react-blockly` para el MVP, con posibilidad de agregar un canvas de ejecucion visual en el futuro.

---

## Contexto del Proyecto

### Requisitos Clave

- **Audiencia**: Estudiantes de 6-17 anios (Casas Quantum, Vertex, Pulsar)
- **Integracion**: Next.js 15 + React + Tailwind CSS
- **Idioma**: Espaniol (obligatorio)
- **Persistencia**: Guardar/cargar proyectos de estudiantes en base de datos
- **Performance**: Bundle size critico para experiencia movil

### Componente Existente en Catalogo

```typescript
// componentes-catalogo.seed.ts (linea 875)
{
  tipo: 'BlockEditor',
  nombre: 'Editor de Bloques',
  descripcion: 'Bloques tipo Scratch para programacion visual',
  categoria: CategoriaComponente.EDITOR_CODIGO,
  icono: '🧩',
  implementado: false,
}
```

---

## Opcion 1: Scratch GUI Oficial

### Paquetes NPM

- `@scratch/scratch-gui` v11.6.0 (mono-repo nuevo)
- `scratch-gui` v5.2.16 (repositorio legacy, archivado)

### Dependencias Principales

```
scratch-blocks, scratch-vm, scratch-render, scratch-paint,
scratch-audio, scratch-storage, scratch-l10n (~60+ dependencias)
```

### Ventajas

- Experiencia Scratch autentica y completa
- Biblioteca de sprites, sonidos y fondos incluida
- VM completa para ejecucion de proyectos
- Comunidad enorme (90+ millones de proyectos)
- Soporte completo para espaniol via `scratch-l10n`

### Desventajas

- **Bundle size masivo**: Estimado 5-10MB minificado
- **65+ dependencias directas**: Complejidad de mantenimiento
- **React legacy**: Usa React 16/17 patterns (class components)
- **Redux antiguo**: v3.7.2 (actual es v5.x)
- **Integracion compleja**: Pensado como aplicacion standalone
- **Dificultad de personalizacion**: Modificar comportamiento requiere forks

### Arquitectura

```
+-----------------------------------------------------+
|                  scratch-gui                        |
|  +------------+  +------------+  +------------+    |
|  | scratch-   |  | scratch-   |  | scratch-   |    |
|  | blocks     |  | vm         |  | render     |    |
|  | (Blockly   |  | (Virtual   |  | (WebGL     |    |
|  |  fork)     |  |  Machine)  |  |  Engine)   |    |
|  +------------+  +------------+  +------------+    |
|  +------------+  +------------+  +------------+    |
|  | scratch-   |  | scratch-   |  | scratch-   |    |
|  | paint      |  | audio      |  | storage    |    |
|  +------------+  +------------+  +------------+    |
+-----------------------------------------------------+
```

### Evaluacion

| Criterio                 | Puntuacion (1-5) | Notas                                           |
| ------------------------ | ---------------- | ----------------------------------------------- |
| Facilidad de integracion | 2                | Requiere configuracion webpack compleja         |
| Mantenibilidad           | 2                | Muchas dependencias, actualizaciones frecuentes |
| UX para ninios           | 5                | Disenio probado mundialmente                    |
| Bundle size              | 1                | Muy grande para carga inicial                   |
| Personalizacion          | 2                | Dificil modificar sin fork                      |
| Persistencia             | 3                | Formato sb3 propietario                         |
| Licencia                 | 5                | BSD-3-Clause                                    |
| **TOTAL**                | **20/35**        |                                                 |

---

## Opcion 2: Google Blockly Directo

### Paquetes NPM

- `blockly` v12.3.1 (core library)
- `react-blockly` v9.0.0 (React wrapper)

### Dependencias

```
blockly: 0 dependencias directas
react-blockly: blockly >= 11.0.0, prop-types
```

### Ventajas

- **Bundle size moderado**: ~500KB gzip (solo editor)
- **Cero dependencias** en el core
- **React moderno**: Compatible con React 16.8, 17, 18
- **Alta personalizacion**: Bloques custom, renderers, generadores
- **Soporte i18n nativo**: Incluye espaniol (`blockly/msg/es`)
- **Generadores incluidos**: JavaScript, Python, Lua, Dart, PHP
- **Documentacion excelente**: Codelabs, guias oficiales de Google
- **Mantenimiento activo**: Google lo usa en muchos productos

### Desventajas

- **Sin entorno de ejecucion visual**: Solo genera codigo
- **Requiere implementar ejecucion**: Para ver sprites/animaciones
- **Sin biblioteca de assets**: Sprites, sonidos deben agregarse aparte
- **Curva de aprendizaje**: Crear bloques custom requiere estudio

### Arquitectura

```
+-----------------------------------------------------+
|                    Mateatletas                      |
|  +----------------+  +------------------------+    |
|  |  react-blockly |  |   Panel de Ejecucion   |    |
|  |  +----------+  |  |   (implementar)        |    |
|  |  | blockly  |  |  |   - Console output     |    |
|  |  | core     |  |  |   - Canvas (opcional)  |    |
|  |  +----------+  |  |   - Variables watch    |    |
|  +----------------+  +------------------------+    |
+-----------------------------------------------------+
```

### Integracion con React

```typescript
import { BlocklyWorkspace } from 'react-blockly';
import * as Es from 'blockly/msg/es';
import { javascriptGenerator } from 'blockly/javascript';

Blockly.setLocale(Es);

function BlockEditorPreview() {
  const [xml, setXml] = useState(initialXml);

  const handleWorkspaceChange = (workspace) => {
    const code = javascriptGenerator.workspaceToCode(workspace);
    // Ejecutar codigo generado
  };

  return (
    <BlocklyWorkspace
      toolboxConfiguration={toolboxConfig}
      workspaceConfiguration={{
        renderer: 'zelos', // Estilo Scratch
        theme: Blockly.Themes.Zelos,
      }}
      initialXml={xml}
      onXmlChange={setXml}
      onWorkspaceChange={handleWorkspaceChange}
    />
  );
}
```

### Serializacion (Guardar/Cargar)

```typescript
// Guardar (nuevo formato JSON - recomendado)
const state = Blockly.serialization.workspaces.save(workspace);
const jsonString = JSON.stringify(state);

// Cargar
const state = JSON.parse(jsonString);
Blockly.serialization.workspaces.load(state, workspace);

// Legacy XML (aun soportado)
const xml = Blockly.Xml.workspaceToDom(workspace);
const xmlText = Blockly.Xml.domToPrettyText(xml);
```

### Evaluacion

| Criterio                 | Puntuacion (1-5) | Notas                               |
| ------------------------ | ---------------- | ----------------------------------- |
| Facilidad de integracion | 4                | react-blockly simplifica mucho      |
| Mantenibilidad           | 5                | Pocas dependencias, Google mantiene |
| UX para ninios           | 4                | Renderer Zelos imita Scratch        |
| Bundle size              | 4                | ~500KB es aceptable                 |
| Personalizacion          | 5                | Totalmente extensible               |
| Persistencia             | 5                | JSON nativo, facil de almacenar     |
| Licencia                 | 5                | Apache 2.0                          |
| **TOTAL**                | **32/35**        |                                     |

---

## Opcion 3: Hibrido (Blockly + Canvas/WebGL)

### Concepto

Combinar Blockly para la interfaz de bloques con un canvas personalizado para ejecucion visual de sprites/animaciones.

### Componentes

```
+-----------------------------------------------------+
|                    Hibrido                          |
|  +----------------+  +------------------------+    |
|  |    Blockly     |  |   Canvas de Ejecucion  |    |
|  |  (bloques)     |  |   - scratch-render     |    |
|  |                |  |   - spritejs           |    |
|  |                |  |   - pixi.js            |    |
|  |                |  |   - custom WebGL       |    |
|  +----------------+  +------------------------+    |
+-----------------------------------------------------+
```

### Bibliotecas de Rendering Candidatas

| Biblioteca     | Bundle | Caracteristicas                     |
| -------------- | ------ | ----------------------------------- |
| scratch-render | ~200KB | WebGL, efectos Scratch nativos      |
| spritejs       | ~150KB | Agnostico (WebGL2, WebGL, Canvas2D) |
| pixi.js        | ~300KB | WebGL, muy maduro, gran comunidad   |
| konva.js       | ~150KB | Canvas 2D, mas simple               |

### Ventajas

- **Maxima flexibilidad**: Control total sobre ambos componentes
- **Bundle optimizado**: Cargar solo lo necesario
- **UX personalizada**: Disenio unico para Mateatletas
- **Escalabilidad**: Agregar features gradualmente

### Desventajas

- **Complejidad muy alta**: Requiere implementar VM propia
- **Tiempo de desarrollo**: Meses de trabajo
- **Riesgo tecnico**: Muchas incognitas
- **Mantenimiento**: Dos sistemas a mantener

### Evaluacion

| Criterio                 | Puntuacion (1-5) | Notas                        |
| ------------------------ | ---------------- | ---------------------------- |
| Facilidad de integracion | 1                | Requiere desarrollo extenso  |
| Mantenibilidad           | 2                | Codigo custom complejo       |
| UX para ninios           | 5                | Totalmente personalizable    |
| Bundle size              | 4                | Controlable                  |
| Personalizacion          | 5                | Ilimitada                    |
| Persistencia             | 5                | Disenio propio               |
| Licencia                 | 5                | Sin restricciones            |
| **TOTAL**                | **27/35**        | Alto riesgo, alta recompensa |

---

## Matriz Comparativa Final

| Criterio                 | Scratch GUI | Blockly   | Hibrido  |
| ------------------------ | ----------- | --------- | -------- |
| Facilidad de integracion | \*\*        | \*\*\*\*  | \*       |
| Mantenibilidad           | \*\*        | **\***    | \*\*     |
| UX para ninios           | **\***      | \*\*\*\*  | **\***   |
| Bundle size              | \*          | \*\*\*\*  | \*\*\*\* |
| Personalizacion          | \*\*        | **\***    | **\***   |
| Persistencia             | \*\*\*      | **\***    | **\***   |
| Tiempo desarrollo        | \*\*\*      | \*\*\*\*  | \*       |
| **TOTAL**                | 17/35       | **31/35** | 23/35    |

---

## Recomendacion

### Fase 1: MVP con Blockly (Recomendado)

**Implementar `BlockEditor` usando `blockly` + `react-blockly`**

#### Alcance MVP

1. Editor de bloques con renderer Zelos (estilo Scratch)
2. Bloques basicos: movimiento, control, operadores, variables
3. Generacion de codigo JavaScript
4. Ejecucion en consola (similar a LuaPlayground/JavaScriptPlayground)
5. Guardar/cargar proyectos en JSON
6. Localizacion completa en espaniol

#### Esfuerzo Estimado

- **Implementacion base**: 2-3 dias
- **Bloques personalizados**: 2-3 dias
- **Integracion Studio**: 1 dia
- **Testing**: 1 dia
- **Total**: ~1 semana

#### Dependencias a Instalar

```bash
npm install blockly react-blockly
```

### Fase 2: Mejoras Incrementales (Futuro)

1. **Canvas de sprites simple**: Agregar visualizacion basica
2. **Mas categorias de bloques**: Sonido, dibujo, sensores
3. **Modo stepping**: Ejecutar paso a paso
4. **Exportar a Python/Lua**: Usar generadores de Blockly

### Fase 3: Experiencia Completa (Largo Plazo)

1. **Integrar scratch-render** o **pixi.js** para sprites
2. **Biblioteca de assets**: Personajes, fondos, sonidos
3. **Proyectos colaborativos**: Compartir entre estudiantes

---

## Implementacion Sugerida

### Estructura de Archivos

```
apps/web/src/components/studio/biblioteca/preview/previews/
├── BlockEditorPreview.tsx      # Componente preview
├── blockly/
│   ├── toolbox.ts              # Configuracion toolbox espaniol
│   ├── custom-blocks.ts        # Bloques personalizados Mateatletas
│   ├── theme.ts                # Tema visual
│   └── generators.ts           # Extensiones de generadores
```

### Configuracion del Toolbox (Espaniol)

```typescript
export const mateAtletasToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Movimiento',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'move_forward' },
        { kind: 'block', type: 'turn_right' },
        { kind: 'block', type: 'turn_left' },
      ],
    },
    {
      kind: 'category',
      name: 'Control',
      colour: '#FFAB19',
      contents: [
        { kind: 'block', type: 'controls_repeat' },
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_whileUntil' },
      ],
    },
    {
      kind: 'category',
      name: 'Operadores',
      colour: '#59C059',
      contents: [
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'logic_compare' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '#FF8C1A',
      custom: 'VARIABLE',
    },
  ],
};
```

---

## Riesgos y Mitigaciones

| Riesgo                             | Probabilidad | Impacto | Mitigacion                       |
| ---------------------------------- | ------------ | ------- | -------------------------------- |
| Blockly no renderiza bien en movil | Media        | Alto    | Probar temprano, usar responsive |
| Performance con muchos bloques     | Baja         | Medio   | Limitar cantidad, lazy loading   |
| Conflictos CSS con Tailwind        | Media        | Bajo    | Encapsular estilos, CSS modules  |
| Usuarios esperan Scratch completo  | Alta         | Medio   | Comunicar que es "inspirado en"  |

---

## Referencias

### Documentacion Oficial

- [Blockly Developer Guides](https://developers.google.com/blockly/guides/overview)
- [Blockly Codelabs](https://blocklycodelabs.dev/)
- [react-blockly GitHub](https://github.com/nbudin/react-blockly)
- [Blockly Localization](https://developers.google.com/blockly/guides/create-custom-blocks/localize-blocks)

### Ejemplos y Demos

- [Blockly Games](https://blockly.games/)
- [Code.org (usa Blockly)](https://studio.code.org/)
- [MakeCode (fork de Blockly)](https://makecode.com/)

### Paquetes NPM

- [blockly](https://www.npmjs.com/package/blockly) - v12.3.1
- [react-blockly](https://www.npmjs.com/package/react-blockly) - v9.0.0
- [@scratch/scratch-gui](https://www.npmjs.com/package/@scratch/scratch-gui) - v11.6.0

---

## Conclusion

**Google Blockly es la opcion optima** para el `BlockEditor` de Mateatletas Studio:

1. **Balance ideal** entre funcionalidad y complejidad
2. **Bundle size aceptable** (~500KB)
3. **Excelente soporte** para espaniol
4. **Alta personalizacion** para adaptar a cada Casa
5. **Persistencia simple** en JSON
6. **Ruta de evolucion clara** hacia experiencia mas completa

La implementacion puede comenzar inmediatamente con el patron establecido por `LuaPlaygroundPreview` y `JavaScriptPlaygroundPreview`, aprovechando Monaco Editor para mostrar el codigo generado y una consola para la salida.

---

_Documento generado: Diciembre 2024_
