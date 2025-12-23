'use client';

/**
 * Mateatletas Design System - Theme Preview Page
 * Vista de todos los temas y componentes disponibles
 */

import { useState } from 'react';
import {
  ThemeProvider,
  useTheme,
  // Layout
  Card,
  Container,
  Divider,
  // Typography
  HeaderBlock,
  TextBlock,
  // Feedback
  CalloutBlock,
  PostItNote,
  Badge,
  Tooltip,
  // Form
  Button,
  Input,
  // Data
  ConceptCard,
  VariableBadge,
  // Code
  CodeEditor,
  TerminalOutput,
  // Interactive
  QuizBlock,
  DraggableChip,
  DragDropZone,
  // Progress
  ProgressBar,
  XPCounter,
  // Mascot
  MascotBIT,
  BitSpeech,
  AchievementPopup,
  // Themes
  allThemeList,
  programmingThemeList,
  mathThemeList,
  scienceThemeList,
} from '@/design-system';
import '@/design-system/styles/global.css';
import type { ThemeConfig, ThemeId } from '@/design-system';

function ThemeCard({ themeConfig }: { themeConfig: ThemeConfig }) {
  return (
    <div className={`${themeConfig.classes.container} p-6 rounded-xl transition-all duration-300`}>
      <div className={themeConfig.classes.card + ' p-4'}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{themeConfig.emoji}</span>
          <div>
            <h3 className={`font-bold text-lg ${themeConfig.classes.text}`}>{themeConfig.name}</h3>
            <p className="text-sm opacity-70">{themeConfig.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Color palette */}
          <div className="flex gap-1">
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: themeConfig.colors.primary }}
              title="Primary"
            />
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: themeConfig.colors.secondary }}
              title="Secondary"
            />
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: themeConfig.colors.accent }}
              title="Accent"
            />
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: themeConfig.colors.success }}
              title="Success"
            />
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: themeConfig.colors.xp }}
              title="XP"
            />
          </div>

          {/* Code sample */}
          <div
            className="p-3 rounded font-mono text-sm"
            style={{ backgroundColor: themeConfig.colors.codeBg }}
          >
            <span style={{ color: themeConfig.syntax.keyword }}>local</span>{' '}
            <span style={{ color: themeConfig.syntax.variable }}>message</span>{' '}
            <span style={{ color: themeConfig.syntax.operator }}>=</span>{' '}
            <span style={{ color: themeConfig.syntax.string }}>&quot;Hola!&quot;</span>
          </div>

          {/* Button sample */}
          <button className={`${themeConfig.classes.button} px-4 py-2 w-full`}>
            Botón de ejemplo
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeSection({
  title,
  emoji,
  themes,
}: {
  title: string;
  emoji: string;
  themes: ThemeConfig[];
}) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        {title}
        <span className="text-sm font-normal opacity-60">({themes.length} temas)</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} themeConfig={theme} />
        ))}
      </div>
    </section>
  );
}

function ComponentsShowcase() {
  const { theme } = useTheme();
  const [showAchievement, setShowAchievement] = useState(false);

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-white">Componentes del Design System</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Typography */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Typography</h3>
          <div className="space-y-4">
            <HeaderBlock level={1}>Heading 1</HeaderBlock>
            <HeaderBlock level={2}>Heading 2</HeaderBlock>
            <HeaderBlock level={3} gradient>
              Heading con Gradiente
            </HeaderBlock>
            <TextBlock>Texto normal del design system</TextBlock>
            <TextBlock muted size="sm">
              Texto muted pequeño
            </TextBlock>
          </div>
        </div>

        {/* Buttons */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Cargando</Button>
          </div>
        </div>

        {/* Badges */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Badges</h3>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="accent" pulse>
              Pulse!
            </Badge>
          </div>
        </div>

        {/* Input */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Input</h3>
          <div className="space-y-4">
            <Input label="Nombre" placeholder="Escribe tu nombre..." />
            <Input label="Con error" error="Este campo es requerido" />
            <Input variant="filled" placeholder="Variant filled" />
          </div>
        </div>

        {/* Callouts */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Callouts</h3>
          <div className="space-y-3">
            <CalloutBlock variant="info" title="Info">
              Este es un mensaje informativo
            </CalloutBlock>
            <CalloutBlock variant="success" title="Éxito">
              Operación completada
            </CalloutBlock>
            <CalloutBlock variant="warning" title="Atención">
              Ten cuidado con esto
            </CalloutBlock>
            <CalloutBlock variant="tip" title="Tip">
              Un consejo útil
            </CalloutBlock>
          </div>
        </div>

        {/* PostIt Notes */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">PostIt Notes</h3>
          <div className="flex flex-wrap gap-4 items-start">
            <PostItNote color="yellow" title="Recordatorio">
              No olvides practicar
            </PostItNote>
            <PostItNote color="pink" rotation={-2}>
              Nota importante
            </PostItNote>
            <PostItNote color="green" pinStyle="tape">
              Con tape
            </PostItNote>
          </div>
        </div>

        {/* Code Editor */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Code Editor</h3>
          <CodeEditor
            language="lua"
            code={`-- Mi primer programa
local nombre = "Mateatleta"
print("¡Hola, " .. nombre .. "!")

function sumar(a, b)
  return a + b
end`}
            highlightedLines={[2, 3]}
          />
        </div>

        {/* Terminal Output */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Terminal Output</h3>
          <TerminalOutput
            title="Consola"
            lines={[
              { type: 'input', content: 'print("Hola mundo")' },
              { type: 'output', content: 'Hola mundo' },
              { type: 'input', content: 'print(2 + 2)' },
              { type: 'success', content: '4' },
              { type: 'error', content: 'Error: variable no definida' },
            ]}
          />
        </div>

        {/* Variable Badges */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Variable Badges</h3>
          <div className="flex flex-wrap gap-3">
            <VariableBadge name="nombre" value="Juan" type="string" />
            <VariableBadge name="edad" value="12" type="number" />
            <VariableBadge name="activo" value="true" type="boolean" />
            <VariableBadge name="datos" value="{...}" type="table" />
          </div>
        </div>

        {/* Concept Card */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Concept Card</h3>
          <ConceptCard title="Variables" icon="📦" variant="highlighted">
            Una variable es como una caja donde guardamos información. Puede contener números, texto
            o cualquier dato.
          </ConceptCard>
        </div>

        {/* Progress */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Progress</h3>
          <div className="space-y-4">
            <ProgressBar value={75} showLabel label="Progreso del curso" />
            <ProgressBar value={40} variant="success" size="lg" showLabel />
            <ProgressBar value={90} variant="xp" showLabel label="XP hasta nivel 5" />
          </div>
        </div>

        {/* XP Counter */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">XP Counter</h3>
          <XPCounter currentXP={2450} maxXP={3000} level={4} />
        </div>

        {/* Mascot BIT */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Mascot BIT</h3>
          <div className="flex flex-wrap gap-6 items-end">
            <MascotBIT mood="happy" size="sm" />
            <MascotBIT mood="excited" size="md" showMessage />
            <MascotBIT mood="thinking" size="lg" />
          </div>
        </div>

        {/* Bit Speech */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Bit Speech</h3>
          <BitSpeech mood="encouraging">
            ¡Muy bien! Estás aprendiendo rápido. Sigue así y serás un experto programador.
          </BitSpeech>
        </div>

        {/* Quiz Block */}
        <div className={`${theme.classes.container} p-6 rounded-xl lg:col-span-2`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Quiz Block</h3>
          <QuizBlock
            question="¿Qué valor imprimirá print(5 + 3)?"
            options={['53', '8', 'Error', '5 + 3']}
            correctIndex={1}
            explanation="En Lua, el operador + suma números. 5 + 3 = 8"
          />
        </div>

        {/* Drag & Drop */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Drag & Drop</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <DraggableChip>print</DraggableChip>
              <DraggableChip>local</DraggableChip>
              <DraggableChip>function</DraggableChip>
            </div>
            <DragDropZone label="Arrastra aquí" />
          </div>
        </div>

        {/* Achievement */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Achievement Popup</h3>
          <Button onClick={() => setShowAchievement(true)}>Mostrar Achievement</Button>
          <AchievementPopup
            isVisible={showAchievement}
            title="Primer Código"
            description="Escribiste tu primer programa en Lua"
            xpReward={50}
            icon="🎯"
            onClose={() => setShowAchievement(false)}
          />
        </div>

        {/* Tooltip */}
        <div className={`${theme.classes.container} p-6 rounded-xl`}>
          <h3 className="text-xl font-bold mb-4 text-white/80">Tooltip</h3>
          <div className="flex gap-4">
            <Tooltip content="Tooltip arriba" position="top">
              <Button>Hover me (top)</Button>
            </Tooltip>
            <Tooltip content="Tooltip abajo" position="bottom">
              <Button variant="secondary">Hover me (bottom)</Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </section>
  );
}

function InteractivePreview() {
  const { theme, setTheme, themeId } = useTheme();

  return (
    <section className="mb-12 p-8 bg-gray-900 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white">Selector de Tema</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {allThemeList.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as ThemeId)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              themeId === t.id
                ? 'bg-white text-black font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t.emoji} {t.name}
          </button>
        ))}
      </div>

      <p className="text-gray-400 text-sm">
        Tema actual: <strong className="text-white">{theme.name}</strong> ({theme.area})
      </p>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <ThemeProvider initialTheme="terminal">
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            Mateatletas Design System
          </h1>
          <p className="text-xl text-gray-400">15 temas | 22 componentes | 30+ animaciones</p>
        </header>

        <InteractivePreview />

        <ComponentsShowcase />

        <Divider label="Catálogo de Temas" />

        <ThemeSection title="Programación" emoji="💻" themes={programmingThemeList} />
        <ThemeSection title="Matemáticas" emoji="📐" themes={mathThemeList} />
        <ThemeSection title="Ciencias" emoji="🔬" themes={scienceThemeList} />

        <footer className="text-center text-gray-500 mt-16 pb-8">
          <p>Mateatletas Design System v1.0</p>
          <p className="text-sm mt-2">
            {allThemeList.length} temas | 22 componentes | TypeScript estricto
          </p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
