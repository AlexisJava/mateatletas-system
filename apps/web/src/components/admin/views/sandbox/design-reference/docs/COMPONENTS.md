# Componentes del Sandbox Editor

Documentación extraída de `sandbox_refactorizado.pen` - Enero 2026

## Resumen de Pantallas

| #   | Nombre               | Descripción                                                   | Frame ID |
| --- | -------------------- | ------------------------------------------------------------- | -------- |
| 1   | Selector de Tipo     | Pantalla inicial - elegir Micro-lección o Planificación       | `xJinG`  |
| 2a  | Config Micro-lección | Configurar estructura de lección (Intro → Contenido → Cierre) | `sfnml`  |
| 2b  | Config Planificación | Seleccionar cantidad de clases (4-20)                         | `v0Q2w`  |
| 3   | Editor Principal     | Layout con sidebar, editor JSON y preview                     | `ualHD`  |
| 4   | Hover + Tooltip      | Estado con tooltip de intent visible                          | `6FgJp`  |
| 5   | JSON Error           | Estado con error de sintaxis JSON                             | `Nbceq`  |
| 6   | Keyboard Shortcuts   | Modal de atajos de teclado                                    | `SG17P`  |
| 7   | Onboarding           | Tutorial inicial con spotlights                               | `Kpws4`  |
| 8   | Editor Focus         | Modo focus (editor expandido)                                 | `T9ttZ`  |
| 9   | Loading              | Estado de carga con toast                                     | `7WLAy`  |
| 10  | Vista Estudiante     | Fullscreen preview para estudiantes                           | `W2jz5`  |
| 11  | Intent Seleccionado  | Editor con un intent activo y library visible                 | `lg1nw`  |
| 12  | Seleccionar Intent   | Estado para elegir intent de la library                       | `2QtA6`  |

---

## Componentes Identificados

### 1. Layout Principal

#### Header

- **Altura**: 56px
- **Background**: `#0c0c1280` (glass con 50% opacity)
- **Blur**: 20px backdrop-blur
- **Border**: bottom 1px `#ffffff08`
- **Padding**: horizontal 20px
- **Layout**: `justify-content: space-between`, `align-items: center`

```tsx
// Estructura
<Header>
  <Left>
    <Logo />
    <DocumentName editable />
  </Left>
  <Center>
    <Tabs>
      <Tab active>JSON/Form</Tab>
      <Tab>Preview</Tab>
    </Tabs>
  </Center>
  <Right>
    <SaveButton />
    <PublishButton primary />
  </Right>
</Header>
```

#### Sidebar (Izquierda)

- **Width**: ~200px
- **Secciones**:
  - Presentación (collapsible)
  - Variables (hover muestra +)
  - Array-edits
  - Numeros
  - Introduccion (collapsible, con subsecciones)
  - Narración (collapsible)
  - Gamificación (collapsible)
  - Layout (collapsible)
  - Extras (collapsible)
- **Item activo**: background cyan sutil, texto cyan

#### Intent Library (Derecha)

- **Width**: ~280px
- **Secciones con iconos coloridos**:
  - Introducción/cierre (icons violetas)
  - Narrativa (icons verdes)
  - Feedback (icons naranjas/púrpuras)
- **Búsqueda**: input con placeholder "Buscar intents..."
- **Vista previa**: card pequeña en la parte inferior

---

### 2. Cards de Selección (Pantalla 1)

```tsx
// Card de tipo
<TypeCard>
  <Icon gradient />
  <Title>Micro-lección / Planificación</Title>
  <Description muted>...</Description>
  <FeatureList>
    <Feature icon="check">Punto 1</Feature>
    <Feature icon="check">Punto 2</Feature>
  </FeatureList>
  <Button variant="primary/secondary">Crear →</Button>
</TypeCard>
```

**Estilos Card**:

- Background: glass effect
- Border: `#ffffff10`
- Border-radius: 16px
- Padding: 24px
- Hover: glow violet sutil

---

### 3. Selector de Cantidad (Pantalla 2b)

```tsx
<QuantitySelector>
  {[4, 6, 8, 12, 16, 20].map((n) => (
    <QuantityOption key={n} selected={n === 8} label={n === 8 ? 'clases' : 'meses'} />
  ))}
</QuantitySelector>
```

**Estilos**:

- Option normal: border sutil, texto muted
- Option selected: border violet, glow violet
- Border-radius: 12px
- Size: ~64x64px

---

### 4. Structure Preview (Pantalla 2a)

```tsx
<StructurePreview>
  <Step icon="play" label="Intro" sublabel="Pregunta o..." active />
  <Connector />
  <Step icon="content" label="Contenido" sublabel="Lo principal..." />
  <Connector />
  <Step icon="flag" label="Cierre" sublabel="Resumen..." />
</StructurePreview>
```

**Estilos**:

- Container: glass card con border-radius 24px
- Steps: iconos con fondo colored (cyan/violet)
- Conectores: líneas punteadas o flechas

---

### 5. Tooltip

```tsx
<Tooltip>
  <TooltipHeader>
    <Icon colored />
    <Title>Nombre del Intent</Title>
  </TooltipHeader>
  <Description>Descripción del intent...</Description>
  <Divider />
  <Meta>
    <MetaItem icon="slides">3-5 slides</MetaItem>
    <MetaItem icon="time">~2 min</MetaItem>
  </Meta>
  <Shortcut>
    <Kbd>⌘</Kbd> + <Kbd>I</Kbd>
  </Shortcut>
</Tooltip>
```

**Estilos**:

- Background: `#1c1c28f0`
- Blur: 16px
- Border: `#ffffff12`
- Shadow: `0 8px 20px rgba(0,0,0,0.31)`
- Border-radius: 12px
- Padding: 12px
- Width: 220px

---

### 6. Modal de Shortcuts

```tsx
<ShortcutsModal>
  <ModalHeader>
    <Title>Keyboard Shortcuts</Title>
    <CloseButton />
  </ModalHeader>
  <ModalBody>
    <Section title="Edición">
      <Shortcut keys={['⌘', 'S']} action="Guardar" />
      <Shortcut keys={['⌘', 'Z']} action="Deshacer" />
    </Section>
    <Section title="Navegación">
      <Shortcut keys={['↑', '↓']} action="Navegar slides" />
    </Section>
  </ModalBody>
</ShortcutsModal>
```

**Estilos**:

- Overlay: `#00000080`
- Modal background: `#1a1a24f5`
- Blur: 24px
- Border-radius: 20px
- Width: 560px
- Shadow: `0 16px 60px rgba(0,0,0,0.38)`

---

### 7. Toast Notification

```tsx
<Toast variant="loading">
  <ToastIcon spinning />
  <ToastContent>
    <ToastTitle>Sincronizando cambios</ToastTitle>
    <ToastDescription>Guardando automáticamente...</ToastDescription>
  </ToastContent>
</Toast>
```

**Estilos**:

- Background: `#1c1c28f0`
- Border: `#8b5cf630`
- Border-radius: 12px
- Padding: 12px 16px
- Position: bottom center
- Icon container: 32x32, border-radius 8px, bg `#8b5cf620`

---

### 8. Onboarding Spotlight

```tsx
<OnboardingOverlay>
  <Spotlight target="sidebar" />
  <TooltipArrow />
  <OnboardingTooltip>
    <StepIndicator>1 de 4</StepIndicator>
    <Title>Explora los Intents</Title>
    <Description>...</Description>
    <Actions>
      <Button variant="ghost">Salir</Button>
      <Button variant="primary">Explorar →</Button>
    </Actions>
  </OnboardingTooltip>
  <WelcomeBadge>
    <WaveEmoji />
    Bienvenido al Sandbox Editor
  </WelcomeBadge>
</OnboardingOverlay>
```

**Estilos Spotlight**:

- Overlay: radial gradient de transparente a negro
- Tooltip: glow violet fuerte (`#8b5cf630` border, shadow)
- Arrow: path SVG con mismo estilo
- Badge: pill con glass effect

---

### 9. Vista Estudiante (Fullscreen)

```tsx
<StudentView>
  <TopBar glass>
    <BackButton>← Micro-lección</BackButton>
    <Title>Introduction to Variables</Title>
    <Progress>1 / 7</Progress>
    <CloseButton />
  </TopBar>

  <MainContent centered>
    <SlideContent>
      <CodePreview gradient>let x = 5</CodePreview>
      <SlideTitle>Introduction to Variables</SlideTitle>
      <SlideDescription>Learn how to store...</SlideDescription>
    </SlideContent>
  </MainContent>

  <BottomBar glass>
    <Button variant="ghost">← Anterior</Button>
    <Button variant="primary">Continuar →</Button>
  </BottomBar>
</StudentView>
```

**Estilos**:

- Full viewport (100vh)
- Background: `#0a0a10` con glows
- Bars: glass effect con blur
- Code preview: gradient cyan-violet background

---

### 10. Botones

#### Primary Button

```css
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  /* o solid */
  background: #8b5cf6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}
```

#### Secondary/Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #a0a0b8;
  padding: 10px 20px;
  border-radius: 8px;
}
.btn-ghost:hover {
  background: #ffffff08;
}
```

#### Cyan Accent Button

```css
.btn-cyan {
  background: #06b6d4;
  color: white;
}
```

---

### 11. Input Fields

```css
.input {
  background: transparent;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
}
.input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}
.input::placeholder {
  color: #606078;
}
```

---

### 12. Background Glows

Siempre presentes en todas las pantallas:

```tsx
<BackgroundGlows>
  {/* Esquina superior izquierda - Violet */}
  <Ellipse
    gradient="radial"
    colors={['#8b5cf612', 'transparent']}
    size={600}
    position={{ x: -100, y: -100 }}
  />

  {/* Esquina inferior derecha - Cyan */}
  <Ellipse
    gradient="radial"
    colors={['#06b6d410', 'transparent']}
    size={500}
    position={{ x: 950, y: 450 }}
  />
</BackgroundGlows>
```

---

## Patrones de Interacción

### Hover States

- Cards: glow sutil, border más visible
- Buttons: lighten o glow
- List items: background `#ffffff05`

### Focus States

- Input/Button: ring violet `0 0 0 2px rgba(139, 92, 246, 0.2)`

### Active/Selected States

- Background cyan/violet sutil
- Border colored
- Text colored

### Transitions

- Duration: 200-300ms
- Easing: ease-out
- Properties: background, border-color, box-shadow, transform
