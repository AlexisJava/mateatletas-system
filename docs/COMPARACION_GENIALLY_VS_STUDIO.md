# Comparativa: Genially vs Mateatletas Studio

## Resumen Ejecutivo

**Genially** es un editor visual de canvas libre donde posicionás elementos libremente en un lienzo 2D/3D, como Canva o PowerPoint.

**Mateatletas Studio** es un editor de bloques apilados verticalmente (como Notion o WordPress Gutenberg).

**Son paradigmas fundamentalmente diferentes.**

---

## 1. Flujo de Creación

### Genially

```
1. Elegir template (2000+ opciones) o canvas en blanco
2. Canvas libre: arrastrar elementos a cualquier posición XY
3. Cada elemento tiene:
   - Posición libre (x, y)
   - Profundidad (z-index, capas)
   - Rotación
   - Escala
   - Interactividad (hover, click → acción)
   - Animaciones de entrada/salida
4. Agregar páginas/slides
5. Preview en tiempo real
6. Publicar → URL compartible
```

### Mateatletas Studio (actual)

```
1. Crear curso → Crear semana
2. Editor de bloques verticales:
   - Agregar bloque (ej: Quiz, DragAndDrop)
   - Editar JSON de configuración manualmente
   - Reordenar bloques (arriba/abajo)
3. Preview en modal separado
4. Guardar → BD
```

---

## 2. Tabla Comparativa Detallada

| Aspecto                  | Genially                                        | Mateatletas Studio                                | Gap        |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------- | ---------- |
| **Canvas**               | Libre (x, y, z) - posicionar donde quieras      | Bloques apilados verticalmente                    | 🔴 CRÍTICO |
| **Agregar elementos**    | Click en biblioteca → aparece en canvas → mover | Seleccionar tipo → aparece al final → editar JSON | 🔴 CRÍTICO |
| **Posicionamiento**      | Drag libre + snap to grid + alineación          | Solo reordenar arriba/abajo                       | 🔴 CRÍTICO |
| **Configurar elemento**  | Panel lateral visual con inputs                 | Editor JSON crudo                                 | 🔴 CRÍTICO |
| **Preview**              | En vivo mientras editás                         | Modal separado (click extra)                      | 🟡 MEDIO   |
| **Interactividad**       | Click en elemento → menú de acciones            | Hardcoded en código del componente                | 🟡 MEDIO   |
| **Animaciones**          | Biblioteca de animaciones + timeline            | No existe                                         | 🟡 MEDIO   |
| **Templates**            | 2000+ templates profesionales                   | 0 templates                                       | 🟡 MEDIO   |
| **Capas/profundidad**    | Sí (z-index visual)                             | No aplica (es vertical)                           | ⚪ N/A     |
| **Múltiples páginas**    | Sí (slides)                                     | Sí (semanas)                                      | ✅ OK      |
| **Colaboración**         | Tiempo real                                     | No                                                | 🟡 MEDIO   |
| **Assets/media**         | Biblioteca integrada + upload                   | Solo upload                                       | 🟡 MEDIO   |
| **Responsive**           | Configuración por breakpoint                    | Depende del componente                            | 🟡 MEDIO   |
| **Exportar**             | URL, embed, SCORM, PDF                          | Solo visualizar en app                            | 🟡 MEDIO   |
| **Curva de aprendizaje** | Baja (visual, intuitivo)                        | Alta (requiere saber JSON)                        | 🔴 CRÍTICO |

---

## 3. El Problema Real

### Lo que Genially resuelve bien:

- **Diseño libre**: El usuario tiene control total del layout
- **WYSIWYG puro**: Lo que ves es lo que obtenés
- **Sin código**: Cero JSON, cero configuración técnica
- **Feedback inmediato**: Ves cambios al instante

### Lo que Mateatletas Studio tiene hoy:

- **Bloques potentes**: 17 componentes interactivos bien implementados
- **Sistema de temas**: Personalización por Casa
- **Estructura de cursos**: Semanas, bloques, progreso
- **Backend sólido**: Validación, guardado, API

### El gap crítico:

```
Genially = Editor visual de diseño libre
Mateatletas = Editor técnico de bloques con JSON

El usuario de Mateatletas espera Genially pero tiene algo más parecido a un CMS técnico.
```

---

## 4. Arquitectura Actual de Studio

```
apps/web/src/components/studio/
├── editor/
│   ├── SemanaEditor.tsx      # Contenedor principal
│   ├── EditorVisual.tsx      # Lista de bloques draggable
│   ├── EditorJSON.tsx        # Editor JSON (alternativo)
│   └── EditorPreview.tsx     # Modal de preview
├── blocks/
│   ├── registry.ts           # Registro de componentes
│   └── interactivo/          # 17 componentes
│       ├── Quiz.tsx
│       ├── DragAndDrop.tsx
│       └── ... (15 más)
├── sidebar/
│   ├── ComponentePicker.tsx  # Selector de bloques
│   └── PropiedadesPanel.tsx  # Editor JSON de props
└── theme/                    # Sistema de temas por Casa
```

### Problemas de arquitectura identificados:

1. **Estado fragmentado** (useState + Zustand mezclados)
2. **EditorService hace demasiado** (cargar + transformar + validar + guardar)
3. **Props drilling profundo** (5+ niveles)
4. **Validación solo en backend** (JSON puede ser inválido)
5. **Sin persistencia de borradores** (se pierde al cerrar)
6. **Componentes acoplados al tema** (difícil reutilizar)

---

## 5. Opciones de Camino a Seguir

### Opción A: Evolucionar a Canvas Libre (como Genially)

**Qué implica:**

- Reescribir el editor desde cero
- Sistema de posicionamiento libre (x, y, width, height, rotation)
- Sistema de capas (z-index)
- Snap to grid, guías de alineación
- Panel de propiedades visual (no JSON)
- Timeline de animaciones
- ~3-6 meses de desarrollo

**Pros:**

- UX equivalente a Genially
- Máxima flexibilidad de diseño

**Contras:**

- Esfuerzo enorme
- Los 17 componentes actuales necesitan adaptarse
- Complejidad de mantenimiento alta

### Opción B: Mejorar Editor de Bloques (como Notion/Gutenberg)

**Qué implica:**

- Mantener paradigma de bloques verticales
- Agregar editor visual de propiedades (no JSON)
- Preview en tiempo real (split view)
- Validación con feedback inmediato
- Templates de bloques pre-configurados
- ~1-2 meses de desarrollo

**Pros:**

- Aprovecha todo lo construido
- Menor esfuerzo
- Más fácil de mantener

**Contras:**

- No es "canvas libre"
- Menos flexibilidad de diseño que Genially

### Opción C: Híbrido (Bloques + Canvas para layouts)

**Qué implica:**

- Bloques como unidad principal
- Dentro de ciertos bloques (ej: "Layout"), permitir posicionamiento libre
- Editor visual de propiedades
- ~2-3 meses de desarrollo

**Pros:**

- Balance entre flexibilidad y estructura
- Reutiliza componentes existentes

**Contras:**

- Complejidad conceptual
- Puede confundir al usuario

---

## 6. Recomendación

### Para MVP rápido: **Opción B** (Mejorar Editor de Bloques)

**Razón:**

1. Ya tenés 17 componentes funcionando
2. El problema principal es la **UX de configuración** (JSON), no el paradigma
3. Con un editor visual de propiedades + preview en vivo, la experiencia mejora 10x
4. Menor riesgo, menor tiempo

### Mejoras concretas:

1. **Reemplazar PropiedadesPanel (JSON) por formularios visuales**

   ```
   Antes: { "instruccion": "...", "opciones": [...] }
   Después: [Input Instrucción] [Lista de Opciones con +/-]
   ```

2. **Preview en tiempo real (split view)**

   ```
   | Editor (izq)  |  Preview (der) |
   |---------------|----------------|
   | Formulario    |  Componente    |
   |               |  actualizado   |
   ```

3. **Templates de bloques**

   ```
   Quiz básico → 3 preguntas pre-llenadas
   DragAndDrop → Ejemplo de clasificación
   ```

4. **Validación en tiempo real**

   ```
   Campo requerido: [          ] ← "Este campo es requerido"
   ```

5. **Auto-guardado**
   ```
   Guardar borrador cada 30s en localStorage
   ```

---

## 7. Estimación de Esfuerzo

### Opción B (Recomendada): Mejorar Editor de Bloques

| Tarea                                                     | Tiempo          |
| --------------------------------------------------------- | --------------- |
| Editor visual de propiedades (formularios por componente) | 2-3 semanas     |
| Split view con preview en tiempo real                     | 1 semana        |
| Sistema de templates de bloques                           | 1 semana        |
| Validación en tiempo real con feedback                    | 1 semana        |
| Auto-guardado y recuperación de borradores                | 3-4 días        |
| Refactoring de estado (consolidar en Zustand)             | 3-4 días        |
| Testing y pulido                                          | 1 semana        |
| **Total**                                                 | **6-8 semanas** |

---

## 8. Siguiente Paso Sugerido

1. **Validar con usuarios**: ¿El paradigma de bloques es aceptable si la UX mejora?
2. **Prototipo rápido**: Crear un editor visual para UN componente (Quiz)
3. **Iterar**: Si funciona, replicar para los otros 16

---

## Fuentes

- [Genially - Interactions and animations](https://genially.com/features/interactions-and-animations/)
- [Genially Help - Positioning elements](https://help.genially.com/en_us/designer-mode-in-genially-positioning-elements-SkVDovB3j)
- [Genially Help - Interactive elements](https://support.genial.ly/en/support/solutions/articles/80000969600-interactive-elements-in-genially)
- [Genially Help - Drag elements](https://support.genial.ly/en/support/solutions/articles/80000497077-how-to-allow-your-audience-to-drag-the-elements-in-your-genially)
