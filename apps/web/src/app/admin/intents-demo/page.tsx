'use client';

import { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  HelpCircle,
  Target,
  Sparkles,
  MessageCircle,
  Trophy,
  Gamepad2,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';

/**
 * IntentsDemo - Página de showcase para visualizar todos los intents
 *
 * Esta página permite ver cada intent del lesson-engine en acción,
 * con ejemplos de props y diferentes variantes.
 */

// =============================================================================
// TYPES
// =============================================================================

interface IntentCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  intents: IntentDemo[];
}

interface IntentDemo {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'pending' | 'wip';
  component?: React.ComponentType<IntentDemoProps>;
}

interface IntentDemoProps {
  onComplete?: () => void;
}

// =============================================================================
// PLACEHOLDER COMPONENTS (Se reemplazarán con los reales del lesson-engine)
// =============================================================================

function PlaceholderIntent({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-center h-64 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]">
      <div className="text-center">
        <p className="text-lg font-medium text-white/60">{name}</p>
        <p className="text-sm text-white/40 mt-1">
          {status === 'pending' ? 'Pendiente de implementación' : 'En desarrollo'}
        </p>
      </div>
    </div>
  );
}

// Demo intent components (ejemplos visuales)
function HeroIntentDemo() {
  return (
    <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-white/10">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">¡Bienvenido a Fracciones!</h2>
        <p className="text-lg text-white/70 max-w-md">
          Aprenderás a dividir pizzas, chocolates y muchas cosas más
        </p>
        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-semibold hover:scale-105 transition-transform">
          ¡Empezar!
        </button>
      </div>
    </div>
  );
}

function DefineIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
            Definición
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Numerador</h3>
        </div>
      </div>
      <p className="text-lg text-white/80 leading-relaxed mb-6">
        El <span className="text-cyan-400 font-semibold">numerador</span> es el número que está
        arriba de la línea de fracción. Indica cuántas partes tomamos del total.
      </p>
      <div className="flex items-center justify-center p-6 bg-white/[0.03] rounded-xl">
        <div className="text-center">
          <span className="text-4xl font-bold text-cyan-400">3</span>
          <div className="w-16 h-1 bg-white/30 my-2" />
          <span className="text-4xl font-bold text-white/50">4</span>
        </div>
        <div className="ml-8 text-left">
          <p className="text-sm text-cyan-400">← Numerador (3 partes)</p>
          <p className="text-sm text-white/40 mt-4">← Denominador (de 4 total)</p>
        </div>
      </div>
    </div>
  );
}

function ExplainIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            Explicación
          </span>
          <h3 className="text-xl font-bold text-white mt-1">¿Cómo sumar fracciones?</h3>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { step: 1, text: 'Verifica que los denominadores sean iguales' },
          { step: 2, text: 'Suma los numeradores' },
          { step: 3, text: 'Mantén el mismo denominador' },
          { step: 4, text: 'Simplifica si es posible' },
        ].map((item) => (
          <div
            key={item.step}
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
              {item.step}
            </div>
            <p className="text-white/80">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizMCIntentDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
            Quiz - Opción Múltiple
          </span>
          <h3 className="text-lg font-bold text-white mt-1">¿Cuánto es 1/2 + 1/2?</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['1/4', '1', '2/4', '1/2'].map((option, i) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`p-4 rounded-xl border-2 transition-all text-lg font-semibold ${
              selected === option
                ? option === '1'
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-red-500 bg-red-500/20 text-red-400'
                : 'border-white/10 bg-white/[0.03] text-white hover:border-white/20'
            }`}
          >
            {String.fromCharCode(65 + i)}. {option}
          </button>
        ))}
      </div>
      {selected && (
        <p className={`mt-4 text-center ${selected === '1' ? 'text-green-400' : 'text-red-400'}`}>
          {selected === '1' ? '¡Correcto! 1/2 + 1/2 = 2/2 = 1' : 'Intenta de nuevo'}
        </p>
      )}
    </div>
  );
}

function RewardIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20 p-6 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-sm font-bold">+50</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mt-6">¡Excelente trabajo!</h3>
      <p className="text-white/60 mt-2">Has ganado 50 XP</p>
      <div className="flex items-center gap-4 mt-6">
        <div className="px-4 py-2 bg-white/[0.05] rounded-lg">
          <p className="text-xs text-white/40">Racha</p>
          <p className="text-lg font-bold text-amber-400">🔥 5 días</p>
        </div>
        <div className="px-4 py-2 bg-white/[0.05] rounded-lg">
          <p className="text-xs text-white/40">Nivel</p>
          <p className="text-lg font-bold text-cyan-400">⭐ 12</p>
        </div>
      </div>
    </div>
  );
}

function StoryIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex gap-4">
        {/* Bit mascot */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
          <div className="text-4xl">🤖</div>
        </div>
        {/* Speech bubble */}
        <div className="flex-1 relative">
          <div className="bg-white/[0.05] rounded-2xl rounded-tl-none p-4">
            <p className="text-white/90 leading-relaxed">
              ¡Hola! Soy <span className="text-cyan-400 font-semibold">Bit</span>, tu compañero de
              aventuras matemáticas. Hoy vamos a descubrir el mundo de las fracciones juntos.
            </p>
          </div>
          <div className="absolute -left-2 top-0 w-4 h-4 bg-white/[0.05] transform rotate-45" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-sm text-white/40">Bit continúa...</p>
        <p className="text-white/70">
          ¿Sabías que las fracciones están en todas partes? Cuando compartes una pizza con tus
          amigos, ¡estás usando fracciones!
        </p>
      </div>
      <button className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2">
        Continuar
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ShowcaseIntentDemo() {
  const [current, setCurrent] = useState(0);
  const items = [
    { title: 'Pizza dividida', desc: '1/4 de pizza' },
    { title: 'Pastel cortado', desc: '1/2 de pastel' },
    { title: 'Chocolate partido', desc: '3/4 de barra' },
  ];

  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-xs font-medium text-emerald-400 uppercase">Galería</span>
        <span className="text-xs text-white/40 ml-auto">
          {current + 1} / {items.length}
        </span>
      </div>
      <div className="h-36 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 mb-4">
        <div className="text-6xl">🍕</div>
      </div>
      <h4 className="text-lg font-semibold text-white">{items[current].title}</h4>
      <p className="text-white/60 text-sm">{items[current].desc}</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'w-6 bg-emerald-400' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function HighlightIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20 p-6 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center mb-4">
        <Lightbulb className="w-8 h-8 text-purple-400" />
      </div>
      <span className="text-xs font-medium text-purple-400 uppercase mb-3">Fórmula</span>
      <div className="p-6 rounded-2xl bg-white/[0.05] border-2 border-purple-500/50 text-center">
        <p className="text-3xl font-mono font-bold text-white">A = π × r²</p>
      </div>
      <p className="text-white/60 text-sm mt-4 text-center max-w-xs">
        Donde r es el radio del círculo
      </p>
      <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
        <p className="text-xs text-white/40">Ejemplo:</p>
        <p className="text-white/70 text-sm">Si r = 5cm, entonces A = 78.54 cm²</p>
      </div>
    </div>
  );
}

function QuizTFIntentDemo() {
  const [selected, setSelected] = useState<boolean | null>(null);
  const correctAnswer = false;

  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="text-xs font-medium text-indigo-400 uppercase">Verdadero o Falso</span>
      </div>
      <div className="p-4 rounded-xl bg-white/[0.03] mb-6">
        <p className="text-lg text-white font-medium text-center">
          El número π es exactamente igual a 3.14
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelected(true)}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            selected === true
              ? correctAnswer === true
                ? 'border-2 border-green-500 bg-green-500/20'
                : 'border-2 border-red-500 bg-red-500/20'
              : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selected === true
                ? correctAnswer
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : 'bg-green-500/20'
            }`}
          >
            <span className="text-xl">✓</span>
          </div>
          <span className="font-semibold text-white">Verdadero</span>
        </button>
        <button
          onClick={() => setSelected(false)}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            selected === false
              ? correctAnswer === false
                ? 'border-2 border-green-500 bg-green-500/20'
                : 'border-2 border-red-500 bg-red-500/20'
              : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              selected === false
                ? correctAnswer === false
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : 'bg-red-500/20'
            }`}
          >
            <span className="text-xl">✗</span>
          </div>
          <span className="font-semibold text-white">Falso</span>
        </button>
      </div>
      {selected !== null && (
        <p
          className={`mt-4 text-center text-sm ${selected === correctAnswer ? 'text-green-400' : 'text-red-400'}`}
        >
          {selected === correctAnswer ? '¡Correcto! π es un número irracional' : 'Intenta de nuevo'}
        </p>
      )}
    </div>
  );
}

function MatchingIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-teal-400" />
        </div>
        <span className="text-xs font-medium text-teal-400 uppercase">Conectar Pares</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          {['1/2', '1/4', '3/4'].map((item, i) => (
            <div
              key={item}
              className="p-3 rounded-xl bg-white/[0.05] border border-teal-500/30 text-white font-medium flex items-center justify-between"
            >
              {item}
              <span className="w-3 h-3 rounded-full bg-teal-500" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {['Tres cuartos', 'Mitad', 'Cuarto'].map((item) => (
            <div
              key={item}
              className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-white/20" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-white/40 text-sm mt-4">
        Selecciona un elemento de cada columna para conectarlos
      </p>
    </div>
  );
}

function FillBlankIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-orange-400" />
        </div>
        <span className="text-xs font-medium text-orange-400 uppercase">Completar</span>
      </div>
      <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
        <p className="text-lg text-white leading-loose">
          La fracción{' '}
          <input
            type="text"
            placeholder="?"
            className="w-12 px-2 py-1 rounded-lg bg-orange-500/20 border-2 border-orange-500/50 text-center text-orange-400 font-bold focus:outline-none focus:border-orange-500"
          />
          /
          <input
            type="text"
            placeholder="?"
            className="w-12 px-2 py-1 rounded-lg bg-orange-500/20 border-2 border-orange-500/50 text-center text-orange-400 font-bold focus:outline-none focus:border-orange-500"
          />{' '}
          se lee como{' '}
          <span className="text-orange-400 font-semibold">&quot;tres cuartos&quot;</span>
        </p>
      </div>
      <div className="flex justify-center mt-6">
        <button className="px-6 py-2 bg-orange-500/20 border border-orange-500/50 rounded-xl text-orange-400 font-medium hover:bg-orange-500/30 transition-colors">
          Verificar
        </button>
      </div>
    </div>
  );
}

function DragDropIntentDemo() {
  return (
    <div className="h-80 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-rose-400" />
        </div>
        <span className="text-xs font-medium text-rose-400 uppercase">Ordenar</span>
      </div>
      <p className="text-white/60 mb-4">Ordena las fracciones de menor a mayor:</p>
      <div className="space-y-2">
        {['3/4', '1/2', '1/4'].map((item, i) => (
          <div
            key={item}
            className="p-4 rounded-xl bg-white/[0.05] border border-white/10 flex items-center gap-3 cursor-move hover:bg-white/[0.08] transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <span className="text-xl font-bold text-white">{item}</span>
            <span className="ml-auto text-white/30">⋮⋮</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORIES DATA
// =============================================================================

const INTENT_CATEGORIES: IntentCategory[] = [
  {
    id: 'presentation',
    name: 'Presentación',
    icon: Sparkles,
    description: 'Intents para mostrar contenido educativo',
    intents: [
      {
        id: 'hero',
        name: 'Hero',
        description: 'Slide de bienvenida/introducción',
        status: 'implemented',
        component: HeroIntentDemo,
      },
      {
        id: 'define',
        name: 'Define',
        description: 'Definición de un término con ejemplo visual',
        status: 'implemented',
        component: DefineIntentDemo,
      },
      {
        id: 'explain',
        name: 'Explain',
        description: 'Explicación paso a paso',
        status: 'implemented',
        component: ExplainIntentDemo,
      },
      {
        id: 'showcase',
        name: 'Showcase',
        description: 'Galería de ejemplos visuales',
        status: 'implemented',
        component: ShowcaseIntentDemo,
      },
      {
        id: 'highlight',
        name: 'Highlight',
        description: 'Resaltar concepto importante',
        status: 'implemented',
        component: HighlightIntentDemo,
      },
    ],
  },
  {
    id: 'interaction',
    name: 'Interacción',
    icon: Target,
    description: 'Intents para evaluar comprensión',
    intents: [
      {
        id: 'quiz-mc',
        name: 'Quiz Multiple Choice',
        description: 'Pregunta de opción múltiple',
        status: 'implemented',
        component: QuizMCIntentDemo,
      },
      {
        id: 'quiz-tf',
        name: 'Quiz True/False',
        description: 'Pregunta verdadero/falso',
        status: 'implemented',
        component: QuizTFIntentDemo,
      },
      {
        id: 'drag-drop',
        name: 'Drag & Drop',
        description: 'Arrastrar y ordenar elementos',
        status: 'implemented',
        component: DragDropIntentDemo,
      },
      {
        id: 'matching',
        name: 'Matching',
        description: 'Conectar pares relacionados',
        status: 'implemented',
        component: MatchingIntentDemo,
      },
      {
        id: 'fill-blank',
        name: 'Fill in the Blank',
        description: 'Completar espacios en blanco',
        status: 'implemented',
        component: FillBlankIntentDemo,
      },
      {
        id: 'sorting',
        name: 'Sorting',
        description: 'Ordenar elementos',
        status: 'pending',
      },
    ],
  },
  {
    id: 'narrative',
    name: 'Narrativa',
    icon: MessageCircle,
    description: 'Intents para contar historias con Bit',
    intents: [
      {
        id: 'story',
        name: 'Story',
        description: 'Narrativa con Bit mascota',
        status: 'implemented',
        component: StoryIntentDemo,
      },
      {
        id: 'dialogue',
        name: 'Dialogue',
        description: 'Conversación interactiva',
        status: 'pending',
      },
      {
        id: 'mascot-speech',
        name: 'Mascot Speech',
        description: 'Bit da un mensaje motivacional',
        status: 'pending',
      },
    ],
  },
  {
    id: 'gamification',
    name: 'Gamificación',
    icon: Trophy,
    description: 'Intents para recompensas y logros',
    intents: [
      {
        id: 'reward',
        name: 'Reward',
        description: 'Mostrar XP y logros ganados',
        status: 'implemented',
        component: RewardIntentDemo,
      },
      {
        id: 'achievement',
        name: 'Achievement',
        description: 'Desbloquear un logro',
        status: 'pending',
      },
      {
        id: 'challenge',
        name: 'Challenge',
        description: 'Reto con tiempo límite',
        status: 'pending',
      },
      {
        id: 'leaderboard',
        name: 'Leaderboard',
        description: 'Tabla de posiciones',
        status: 'pending',
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: LayoutGrid,
    description: 'Intents para organizar contenido',
    intents: [
      {
        id: 'split',
        name: 'Split View',
        description: 'Dividir pantalla en 2 columnas',
        status: 'pending',
      },
      {
        id: 'bento',
        name: 'Bento Grid',
        description: 'Grid estilo Apple/bento',
        status: 'pending',
      },
      {
        id: 'tabs',
        name: 'Tabs',
        description: 'Contenido en pestañas',
        status: 'pending',
      },
      {
        id: 'carousel',
        name: 'Carousel',
        description: 'Carrusel de slides',
        status: 'pending',
      },
    ],
  },
  {
    id: 'closure',
    name: 'Cierre',
    icon: Gamepad2,
    description: 'Intents para finalizar lecciones',
    intents: [
      {
        id: 'summary',
        name: 'Summary',
        description: 'Resumen de lo aprendido',
        status: 'pending',
      },
      {
        id: 'next-steps',
        name: 'Next Steps',
        description: 'Qué sigue después',
        status: 'pending',
      },
      {
        id: 'certificate',
        name: 'Certificate',
        description: 'Certificado de completitud',
        status: 'pending',
      },
    ],
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function IntentsDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('presentation');
  const [selectedIntent, setSelectedIntent] = useState<string>('hero');

  const category = INTENT_CATEGORIES.find((c) => c.id === selectedCategory);
  const intent = category?.intents.find((i) => i.id === selectedIntent);

  // Stats
  const totalIntents = INTENT_CATEGORIES.reduce((acc, c) => acc + c.intents.length, 0);
  const implementedIntents = INTENT_CATEGORIES.reduce(
    (acc, c) => acc + c.intents.filter((i) => i.status === 'implemented').length,
    0,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Intent Showcase</h1>
              <p className="text-sm text-white/50 mt-1">
                Visualiza todos los intents del lesson-engine
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/[0.05] rounded-lg">
                <p className="text-xs text-white/40">Progreso</p>
                <p className="text-lg font-bold text-white">
                  <span className="text-green-400">{implementedIntents}</span>
                  <span className="text-white/30"> / {totalIntents}</span>
                </p>
              </div>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                  style={{ width: `${(implementedIntents / totalIntents) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Categories */}
          <div className="col-span-3">
            <div className="sticky top-8 space-y-2">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4 px-3">
                Categorías
              </p>
              {INTENT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const implemented = cat.intents.filter((i) => i.status === 'implemented').length;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedIntent(cat.intents[0].id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-white/40">
                        {implemented}/{cat.intents.length} implementados
                      </p>
                    </div>
                    {implemented === cat.intents.length && (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Category Header */}
            {category && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">{category.name}</h2>
                <p className="text-white/50">{category.description}</p>
              </div>
            )}

            {/* Intent Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {category?.intents.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setSelectedIntent(i.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedIntent === i.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {i.name}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      i.status === 'implemented'
                        ? 'bg-green-400'
                        : i.status === 'wip'
                          ? 'bg-amber-400'
                          : 'bg-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Intent Preview */}
            {intent && (
              <div className="space-y-6">
                {/* Info */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/10">
                  <div>
                    <h3 className="font-semibold text-white">{intent.name}</h3>
                    <p className="text-sm text-white/50">{intent.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      intent.status === 'implemented'
                        ? 'bg-green-500/20 text-green-400'
                        : intent.status === 'wip'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {intent.status === 'implemented'
                      ? 'Implementado'
                      : intent.status === 'wip'
                        ? 'En progreso'
                        : 'Pendiente'}
                  </span>
                </div>

                {/* Preview */}
                <div className="relative">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Preview
                  </p>
                  {intent.component ? (
                    <intent.component />
                  ) : (
                    <PlaceholderIntent name={intent.name} status={intent.status} />
                  )}
                </div>

                {/* Code Example */}
                <div>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Uso en JSON de lección
                  </p>
                  <pre className="p-4 bg-[#1a1a2e] rounded-xl border border-white/10 overflow-x-auto">
                    <code className="text-sm text-white/80">
                      {JSON.stringify(
                        {
                          intent: `${category?.id}:${intent.id}`,
                          props: {
                            title: 'Ejemplo de título',
                            content: 'Contenido del slide...',
                          },
                        },
                        null,
                        2,
                      )}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
