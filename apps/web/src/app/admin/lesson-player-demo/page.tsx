'use client';

import { useState, useEffect } from 'react';
import {
  LessonPlayer,
  type LessonDefinition,
  type LessonResult,
  registerAllIntents,
  areIntentsRegistered,
} from '@mateatletas/lesson-engine';

// =============================================================================
// DEMO LESSON DATA
// =============================================================================

const DEMO_LESSON: LessonDefinition = {
  metadata: {
    id: 'demo-fracciones-001',
    title: 'Introducción a las Fracciones',
    area: 'math',
    house: 'quantum',
    duration: 5,
    xpTotal: 100,
  },
  slides: [
    // Slide 1: Hero - Bienvenida
    {
      id: 'slide-hero',
      intent: 'presentation:hero',
      props: {
        title: '¡Aventura de Fracciones!',
        subtitle: 'Descubre el mundo de las partes y los enteros',
        description:
          'En esta lección aprenderás qué son las fracciones y cómo usarlas en la vida real.',
        category: 'Matemáticas',
        ctaText: '¡Comenzar!',
      },
    },
    // Slide 2: Define - ¿Qué es una fracción?
    {
      id: 'slide-define',
      intent: 'presentation:define',
      props: {
        term: 'Fracción',
        definition:
          'Una fracción representa una o más partes iguales de un todo. Se escribe con dos números separados por una línea.',
        example: '½ significa "una de dos partes iguales"',
        category: 'Concepto Clave',
      },
    },
    // Slide 3: Explain - Partes de una fracción
    {
      id: 'slide-explain',
      intent: 'presentation:explain',
      props: {
        title: 'Partes de una Fracción',
        points: [
          {
            id: 'numerador',
            title: 'Numerador',
            description: 'El número de arriba. Indica cuántas partes tomamos.',
            icon: '⬆️',
          },
          {
            id: 'denominador',
            title: 'Denominador',
            description: 'El número de abajo. Indica en cuántas partes se divide el todo.',
            icon: '⬇️',
          },
          {
            id: 'linea',
            title: 'Línea de Fracción',
            description: 'Separa el numerador del denominador. Significa "dividido entre".',
            icon: '➖',
          },
        ],
      },
    },
    // Slide 4: Quiz MC - Verificar comprensión
    {
      id: 'slide-quiz-1',
      intent: 'interaction:quiz-mc',
      props: {
        question: 'En la fracción ¾, ¿cuál es el numerador?',
        options: [
          { id: 'a', text: '3', isCorrect: true },
          { id: 'b', text: '4', isCorrect: false },
          { id: 'c', text: '7', isCorrect: false },
          { id: 'd', text: '1', isCorrect: false },
        ],
        explanation: '¡Correcto! El numerador es 3 porque está arriba de la línea de fracción.',
        category: 'Quiz',
      },
      xp: 20,
    },
    // Slide 5: Highlight - Dato importante
    {
      id: 'slide-highlight',
      intent: 'presentation:highlight',
      props: {
        title: '¡Recuerda!',
        content: 'El denominador NUNCA puede ser cero. No podemos dividir algo en cero partes.',
        variant: 'warning',
        category: 'Importante',
      },
    },
    // Slide 6: Quiz TF - Verdadero o Falso
    {
      id: 'slide-quiz-2',
      intent: 'interaction:quiz-tf',
      props: {
        statement: 'En la fracción ⅔, el denominador es 2.',
        isTrue: false,
        explanationTrue: 'Incorrecto. El denominador es 3 (el número de abajo).',
        explanationFalse: '¡Correcto! El denominador es 3, no 2. El 2 es el numerador.',
        category: 'Verdadero o Falso',
      },
      xp: 15,
    },
    // Slide 7: Summary - Resumen
    {
      id: 'slide-summary',
      intent: 'closure:summary',
      props: {
        title: '¡Lo que aprendiste!',
        points: [
          { id: '1', text: 'Una fracción representa partes de un todo' },
          { id: '2', text: 'El numerador está arriba y dice cuántas partes tomamos' },
          { id: '3', text: 'El denominador está abajo y dice en cuántas partes se divide' },
          { id: '4', text: 'El denominador nunca puede ser cero' },
        ],
        closingMessage: '¡Excelente trabajo completando esta lección!',
        showMascot: true,
        mascotMood: 'celebrating',
      },
    },
    // Slide 8: Certificate - Finalización
    {
      id: 'slide-certificate',
      intent: 'closure:certificate',
      props: {
        title: '¡Lección Completada!',
        subtitle: 'Introducción a las Fracciones',
        studentName: 'Estudiante Demo',
        achievement: 'Explorador de Fracciones',
        date: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
      xp: 25,
    },
  ],
};

// House color presets
const HOUSE_COLORS = {
  quantum: { primary: '#00d4ff', secondary: '#0066ff', accent: '#00ffaa' },
  vertex: { primary: '#ff00ff', secondary: '#9900ff', accent: '#ff66ff' },
  pulsar: { primary: '#ffaa00', secondary: '#ff6600', accent: '#ffdd00' },
};

// =============================================================================
// DEMO PAGE COMPONENT
// =============================================================================

export default function LessonPlayerDemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<LessonResult | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<'quantum' | 'vertex' | 'pulsar'>('quantum');

  // Register intents on mount
  useEffect(() => {
    if (!areIntentsRegistered()) {
      registerAllIntents();
    }
  }, []);

  const handleComplete = (lessonResult: LessonResult) => {
    setResult(lessonResult);
    setIsPlaying(false);
  };

  const handleSlideComplete = (slideId: string, index: number, slideResult?: unknown) => {
    console.log(`Slide ${index + 1} completed:`, slideId, slideResult);
  };

  // Show player fullscreen when playing
  if (isPlaying) {
    return (
      <LessonPlayer
        lesson={DEMO_LESSON}
        onComplete={handleComplete}
        onSlideComplete={handleSlideComplete}
        houseColors={HOUSE_COLORS[selectedHouse]}
      />
    );
  }

  // Start screen
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-8"
      style={{ background: '#030014' }}
    >
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">LessonPlayer Demo</h1>
          <p className="text-white/60">
            Visualiza cómo un estudiante experimenta una lección completa
          </p>
        </div>

        {/* Lesson info card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: 'rgba(15, 7, 32, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📐</span>
            <div>
              <h2 className="text-xl font-semibold text-white">{DEMO_LESSON.metadata.title}</h2>
              <p className="text-white/50 text-sm">
                {DEMO_LESSON.slides.length} slides • ~{DEMO_LESSON.metadata.duration} min
              </p>
            </div>
          </div>

          <div className="flex gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/70">
              📚 {DEMO_LESSON.metadata.area}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/70">
              ⭐ {DEMO_LESSON.metadata.xpTotal} XP
            </span>
          </div>
        </div>

        {/* House selector */}
        <div className="space-y-3">
          <p className="text-white/60 text-sm">Selecciona una casa para ver los colores:</p>
          <div className="flex gap-3">
            {(['quantum', 'vertex', 'pulsar'] as const).map((house) => (
              <button
                key={house}
                onClick={() => setSelectedHouse(house)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedHouse === house
                    ? 'ring-2 ring-offset-2 ring-offset-[#030014]'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${HOUSE_COLORS[house].primary}, ${HOUSE_COLORS[house].secondary})`,
                }}
              >
                <span className="text-white text-sm capitalize">{house}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() => setIsPlaying(true)}
          className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${HOUSE_COLORS[selectedHouse].primary}, ${HOUSE_COLORS[selectedHouse].secondary})`,
            boxShadow: `0 10px 30px -5px ${HOUSE_COLORS[selectedHouse].primary}40`,
          }}
        >
          ▶️ Iniciar Lección Demo
        </button>

        {/* Result display */}
        {result && (
          <div
            className="rounded-2xl p-6 space-y-3"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <h3 className="text-green-400 font-semibold">✅ Lección Completada</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">XP Ganado</p>
                <p className="text-white font-bold text-lg">{result.totalXp} XP</p>
              </div>
              <div>
                <p className="text-white/50">Slides Completados</p>
                <p className="text-white font-bold text-lg">{result.completedSlides}</p>
              </div>
              <div>
                <p className="text-white/50">Duración</p>
                <p className="text-white font-bold text-lg">{result.duration}s</p>
              </div>
              <div>
                <p className="text-white/50">Respuestas</p>
                <p className="text-white font-bold text-lg">{Object.keys(result.answers).length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-center text-white/40 text-xs">
          Esta es una demo del sistema de intents. <br />
          En producción, las lecciones se cargan desde la API.
        </p>
      </div>
    </div>
  );
}
