/**
 * components/slides/UniversalSlideViewer.tsx
 * ============================================
 * Componente universal para renderizar cualquier tipo de slide
 *
 * SIMPLIFICADO: Solo acepta slides del sistema nuevo (Slide).
 * Los adapters legacy fueron eliminados.
 */

'use client';

// Tipos del sistema
import type {
  Slide,
  ContentSlide,
  CodeSlide,
  RobloxSlide,
  GameDashboardSlide,
  SummarySlide,
  CertificateSlide,
  MathSlide,
  PhysicsSlide,
  ChemistrySlide,
  AstronomySlide,
} from '../../types/registry';
import type { RichTextContent } from '../../types/components';
import { isValidSlide } from '../../adapters/validation';

// Renderizadores específicos
import IntroSlideRenderer from './renderers/IntroSlideRenderer';
import ContentSlideRenderer from './renderers/ContentSlideRenderer';
import QuizSlideRenderer from './renderers/QuizSlideRenderer';
import ReflectionSlideRenderer from './renderers/ReflectionSlideRenderer';
import GameSlideRenderer from './renderers/GameSlideRenderer';
import CodeSlideRenderer from './renderers/CodeSlideRenderer';
import SimpleSlideRenderer from './renderers/SimpleSlideRenderer';

// ============================================================================
// TIPOS Y PROPS
// ============================================================================

export interface UniversalSlideViewerProps {
  /** Slide a renderizar */
  slide: Slide;

  /** Callback al avanzar al siguiente slide */
  onNext: () => void;

  /** Callback al retroceder (opcional) */
  onPrevious?: () => void;

  /** Mostrar botón de retroceder */
  showPrevious?: boolean;

  /** Es el primer slide de la secuencia */
  isFirst?: boolean;

  /** Es el último slide de la secuencia */
  isLast?: boolean;

  /** Total de slides en la secuencia */
  totalSlides?: number;

  /** Índice actual del slide */
  currentSlideIndex?: number;

  /** Ocultar botones de navegación internos de los slides */
  hideNavigation?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente principal que renderiza cualquier tipo de slide
 */
export default function UniversalSlideViewer({
  slide,
  onNext,
  onPrevious,
  showPrevious = true,
  isFirst = false,
  isLast = false,
  hideNavigation = false,
}: UniversalSlideViewerProps) {
  // Validar slide
  if (!isValidSlide(slide)) {
    console.error('[UniversalSlideViewer] Slide inválido:', slide);
    return <div className="p-8 text-center text-red-500">Error: Slide inválido</div>;
  }

  // Props comunes que se pasan a todos los renderizadores
  const commonProps = {
    onNext,
    onPrevious,
    showPrevious,
    isFirst,
    isLast,
    hideNavigation,
  };

  // ============================================================================
  // ROUTING: Determinar renderizador según tipo del slide
  // ============================================================================

  switch (slide.type) {
    // Slides de introducción
    case 'intro':
      return <IntroSlideRenderer slide={slide} {...commonProps} />;

    // Slides de quiz/evaluación
    case 'quiz':
      return <QuizSlideRenderer slide={slide} {...commonProps} />;

    // Slides de reflexión
    case 'reflection':
      return <ReflectionSlideRenderer slide={slide} {...commonProps} />;

    // Slides de contenido
    case 'content':
      return <ContentSlideRenderer slide={slide} {...commonProps} />;

    // Slides de código
    case 'code':
      return <CodeSlideRenderer slide={slide as CodeSlide} {...commonProps} />;

    // Slides de Roblox (actividades interactivas)
    case 'roblox': {
      const codeSlide = robloxToCodeSlide(slide as RobloxSlide);
      return <CodeSlideRenderer slide={codeSlide} {...commonProps} />;
    }

    // Slides de juegos (dashboard)
    case 'game-dashboard':
      return <GameSlideRenderer slide={slide as GameDashboardSlide} {...commonProps} />;

    case 'game':
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;

    // Slides de resumen/cierre
    case 'summary': {
      const contentSlide = summaryToContentSlide(slide as SummarySlide);
      return <ContentSlideRenderer slide={contentSlide} {...commonProps} />;
    }

    case 'certificate': {
      const contentSlide = certificateToContentSlide(slide as CertificateSlide);
      return <ContentSlideRenderer slide={contentSlide} {...commonProps} />;
    }

    // Slides específicos de cursos (mapean a contenido genérico)
    case 'math':
    case 'physics':
    case 'chemistry':
    case 'astronomy': {
      const contentSlide = academicSlideToContentSlide(slide as AcademicSlide);
      return <ContentSlideRenderer slide={contentSlide} {...commonProps} />;
    }

    // Slides de multimedia
    case 'video':
    case 'interactive-image':
    case 'image-gallery':
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;

    // Slides simples (title, progress, etc.)
    case 'title':
    case 'progress':
    case 'table-of-contents':
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;

    // Slides de simulación
    case 'simulation':
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;

    // Examen final
    case 'final-exam':
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;

    // Fallback: renderizar como slide simple
    default:
      console.warn(`[UniversalSlideViewer] Tipo de slide no reconocido: ${(slide as Slide).type}`);
      return <SimpleSlideRenderer slide={slide} {...commonProps} />;
  }
}

type AcademicSlide = MathSlide | PhysicsSlide | ChemistrySlide | AstronomySlide;

function robloxToCodeSlide(slide: RobloxSlide): CodeSlide {
  return {
    type: 'code',
    id: slide.id,
    title: slide.title || slide.concept || 'Actividad Roblox',
    codeConfig: {
      language: 'lua',
      code: slide.starterCode || '-- Escribe tu código aquí',
      showLineNumbers: true,
    },
    instructions:
      slide.robloxInstructions || 'Sigue las instrucciones en el editor de Roblox Studio.',
    allowExecution: true,
  };
}

function summaryToContentSlide(slide: SummarySlide): ContentSlide {
  const content: RichTextContent[] = [];

  if (slide.description) {
    content.push({ type: 'paragraph', content: slide.description });
  }

  if (slide.mainPoints && slide.mainPoints.length > 0) {
    content.push({
      type: 'list',
      content: '',
      items: slide.mainPoints,
      listType: 'unordered',
    });
  }

  if (slide.nextSteps && slide.nextSteps.length > 0) {
    content.push({
      type: 'callout',
      content: slide.nextSteps.join('\n'),
      calloutType: 'info',
      calloutTitle: 'Próximos pasos',
    });
  }

  return {
    type: 'content',
    id: slide.id,
    title: slide.title || 'Resumen',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: 'Resumen del módulo.' }],
  };
}

function certificateToContentSlide(slide: CertificateSlide): ContentSlide {
  const details = [
    `¡Felicitaciones ${slide.studentName}!`,
    `Curso completado: ${slide.courseName}`,
  ];

  if (slide.finalScore !== undefined) {
    details.push(`Puntaje final: ${slide.finalScore}`);
  }

  if (slide.studyHours !== undefined) {
    details.push(`Horas de estudio: ${slide.studyHours}`);
  }

  return {
    type: 'content',
    id: slide.id,
    title: slide.title || 'Certificado',
    content: [
      {
        type: 'callout',
        content: details.join('\n'),
        calloutType: 'success',
        calloutTitle: 'Logro desbloqueado',
      },
    ],
  };
}

function academicSlideToContentSlide(slide: AcademicSlide): ContentSlide {
  const content: RichTextContent[] = [];

  if (slide.description) {
    content.push({ type: 'paragraph', content: slide.description });
  }

  if ('concept' in slide && slide.concept) {
    content.push({
      type: 'callout',
      content: slide.concept,
      calloutType: 'tip',
      calloutTitle: 'Concepto clave',
    });
  }

  return {
    type: 'content',
    id: slide.id,
    title: slide.title || 'Contenido del curso',
    content:
      content.length > 0
        ? content
        : [{ type: 'paragraph', content: 'Revisa la descripción del curso para más detalles.' }],
  };
}
