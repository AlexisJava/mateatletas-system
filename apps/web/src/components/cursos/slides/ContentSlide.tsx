import { ContentSlide as ContentSlideType, NavigationButtons } from '@ciudad-mateatleta/lms-core';
import { motion } from 'framer-motion';
import { CourseTheme } from '../../themes/courseThemes';
import SlideCard from '../SlideCard';

interface ContentSlideProps {
  slide: ContentSlideType;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
  visualComponent?: React.ComponentType<any>; // Para visual-split
  hideNavigation?: boolean;
}

const titleGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400',
  programacion: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
  ciencias: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400',
};

const cardBorders: Record<CourseTheme, string> = {
  matematicas: 'border-orange-500/20',
  programacion: 'border-indigo-500/20',
  ciencias: 'border-emerald-500/20',
};

const cardShadows: Record<CourseTheme, string> = {
  matematicas: 'shadow-orange-500/10',
  programacion: 'shadow-indigo-500/10',
  ciencias: 'shadow-emerald-500/10',
};

/**
 * Procesa texto con markdown básico y colores épicos
 */
function processMarkdown(text: string): JSX.Element {
  if (!text) return <></>;

  const parts = text.split(/(\*\*.*?\*\*|\n)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Negrita con detección de palabras clave para colorear
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);

          // Palabras calientes
          if (content.match(/CALIENTE|RÁPIDO|MÁS|VELOCIDAD|MOVIÉNDOSE|ALTA|EXTREMO/i)) {
            return (
              <strong key={index} className="font-bold text-orange-400">
                {content}
              </strong>
            );
          }
          // Palabras frías
          if (content.match(/FRÍO|LENTO|MENOS|CONGELAD|BAJA|LÍMITE/i)) {
            return (
              <strong key={index} className="font-bold text-cyan-400">
                {content}
              </strong>
            );
          }
          // Palabras de énfasis
          if (content.match(/NO|ABSOLUTO|INCREÍBLE|BRUTAL|IMPOSIBLE|NUNCA/i)) {
            return (
              <strong key={index} className="font-bold text-emerald-400">
                {content}
              </strong>
            );
          }

          return (
            <strong key={index} className="font-bold text-white">
              {content}
            </strong>
          );
        }

        // Salto de línea
        if (part === '\n') {
          return <br key={index} />;
        }

        // Texto normal
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Renderiza un bloque de contenido individual con estilos épicos
 */
function RenderContentBlock({ block, theme }: { block: any; theme: CourseTheme }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <div className="text-white text-base leading-relaxed tracking-wide">
          {processMarkdown(block.content)}
        </div>
      );

    case 'heading':
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      const headingSizes = {
        1: 'text-3xl font-extrabold text-white tracking-tight',
        2: 'text-2xl font-bold text-white tracking-tight',
        3: 'text-xl font-bold text-white tracking-tight',
        4: 'text-lg font-bold text-white',
        5: 'text-base font-semibold text-white',
        6: 'text-sm font-semibold text-white',
      };
      return (
        <HeadingTag
          className={`${headingSizes[block.level as keyof typeof headingSizes] || 'text-2xl'} mt-6 mb-3`}
        >
          {block.content}
        </HeadingTag>
      );

    case 'callout':
      const calloutStyles = {
        info: 'bg-blue-900/40 border-2 border-blue-400/60 text-white',
        tip: 'bg-green-900/40 border-2 border-green-400/60 text-white',
        warning: 'bg-yellow-900/40 border-2 border-yellow-400/60 text-white',
        danger: 'bg-red-900/40 border-2 border-red-400/60 text-white',
        question: 'bg-purple-900/40 border-2 border-purple-400/60 text-white',
        epic: 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-400/60 text-white',
        success: 'bg-emerald-900/40 border-2 border-emerald-400/60 text-white',
        error: 'bg-red-900/40 border-2 border-red-400/60 text-white',
      };
      const calloutIcons = {
        info: 'ℹ️',
        tip: '💡',
        warning: '⚠️',
        danger: '🚨',
        question: '💭',
        epic: '❄️',
        success: '✅',
        error: '❌',
      };
      const calloutType = block.calloutType || 'info';
      return (
        <div
          className={`rounded-xl p-4 ${calloutStyles[calloutType as keyof typeof calloutStyles] || calloutStyles.info}`}
        >
          {block.calloutTitle && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {calloutIcons[calloutType as keyof typeof calloutIcons] || '💬'}
              </span>
              <h4 className="font-bold text-lg text-white">
                {processMarkdown(block.calloutTitle)}
              </h4>
            </div>
          )}
          <div className="leading-relaxed text-base text-white">
            {processMarkdown(block.content)}
          </div>
        </div>
      );

    case 'list':
      const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag
          className={`text-white space-y-2 text-base ${block.listType === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside pl-4`}
        >
          {block.items?.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed tracking-wide">
              <span className="text-white">{item}</span>
            </li>
          ))}
        </ListTag>
      );

    case 'code':
      return (
        <pre className="bg-slate-950/30 rounded-xl p-4 overflow-x-auto border border-slate-700">
          <code className="text-slate-300 text-sm font-mono">{block.content}</code>
        </pre>
      );

    default:
      return null;
  }
}

export default function ContentSlide({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
  visualComponent,
  hideNavigation = false,
}: ContentSlideProps) {
  // Si hay visualComponent, usar layout visual-split
  if (visualComponent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-6"
      >
        {/* Título FUERA de la card */}
        <h1
          className={`text-3xl md:text-4xl font-bold ${titleGradients[theme]} bg-clip-text text-transparent mb-6`}
        >
          {slide.title}
        </h1>

        {/* SlideCard con visual-split */}
        <SlideCard theme={theme} variant="visual-split" visualComponent={visualComponent}>
          {/* Contenido épico */}
          {slide.content && slide.content.length > 0 ? (
            slide.content.map((block, index) => (
              <div key={index}>
                <RenderContentBlock block={block} theme={theme} />
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic">No hay contenido disponible.</p>
          )}
        </SlideCard>

        {/* Botones FUERA de la card - solo si NO está hideNavigation */}
        {!hideNavigation && (
          <NavigationButtons
            onPrevious={onPrevious}
            onNext={onNext}
            nextLabel="Continuar"
            theme={theme}
          />
        )}
      </motion.div>
    );
  }

  // Layout normal (código existente sin cambios)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto space-y-6"
    >
      {/* Título del slide */}
      <h1
        className={`text-3xl md:text-4xl font-bold ${titleGradients[theme]} bg-clip-text text-transparent mb-6`}
      >
        {slide.title}
      </h1>

      {/* Renderizar bloques de contenido */}
      <SlideCard theme={theme} variant="default">
        <div className="space-y-4">
          {slide.content && slide.content.length > 0 ? (
            slide.content.map((block, index) => (
              <div key={index}>
                <RenderContentBlock block={block} theme={theme} />
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic">No hay contenido disponible para este slide.</p>
          )}
        </div>
      </SlideCard>

      {/* Notas adicionales si existen */}
      {slide.notes && slide.notes.length > 0 && (
        <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-400 mb-2">📝 Notas</h4>
          <ul className="text-xs text-slate-500 space-y-1">
            {slide.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botones de navegación - solo si NO está hideNavigation */}
      {!hideNavigation && (
        <NavigationButtons
          onPrevious={onPrevious}
          onNext={onNext}
          nextLabel="Continuar"
          theme={theme}
        />
      )}
    </motion.div>
  );
}
