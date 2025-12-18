import Link from 'next/link';
import { OutroPreviewSlide as OutroPreviewSlideType } from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import { CourseTheme } from '../../themes/courseThemes';

interface OutroPreviewSlideProps {
  slide: OutroPreviewSlideType;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const previewGradients: Record<CourseTheme, string> = {
  matematicas: 'from-orange-900 to-amber-900',
  programacion: 'from-indigo-900 to-purple-900',
  ciencias: 'from-emerald-900 to-teal-900',
};

const checkColors: Record<CourseTheme, string> = {
  matematicas: 'text-orange-500',
  programacion: 'text-indigo-500',
  ciencias: 'text-emerald-500',
};

const primaryButtonGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-r from-orange-500 to-amber-600',
  programacion: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  ciencias: 'bg-gradient-to-r from-emerald-500 to-teal-600',
};

const primaryButtonHoverGradients: Record<CourseTheme, string> = {
  matematicas: 'hover:from-orange-600 hover:to-amber-700',
  programacion: 'hover:from-indigo-600 hover:to-purple-700',
  ciencias: 'hover:from-emerald-600 hover:to-teal-700',
};

export default function OutroPreviewSlide({
  slide,
  onPrevious,
  theme = 'matematicas',
}: OutroPreviewSlideProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-100 mb-4">
        {slide.title}
      </h1>

      <div
        className={`relative w-full h-64 rounded-2xl bg-gradient-to-br ${previewGradients[theme]} overflow-hidden flex items-center justify-center`}
      >
        <div className="text-8xl">🏪</div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
          {slide.content.preview_title}
        </h2>
        <p className="text-slate-400 text-lg">{slide.content.unlock_message}</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-slate-100 mb-4">Lo que vas a aprender:</h3>
        <ul className="space-y-3">
          {slide.content.preview_topics.map((topic: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <span className={`${checkColors[theme]} text-xl flex-shrink-0`}>✓</span>
              <span className="text-slate-300 text-lg">{topic}</span>
            </li>
          ))}
        </ul>
      </div>

      <LambdaMessage message={slide.content.lambda_closing} theme={theme} />

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        {slide.content.ctas.map((cta: { text: string; route: string }, index: number) => (
          <Link
            key={index}
            href={cta.route}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold text-center transition-all min-h-12 flex items-center justify-center ${
              index === 0
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : `${primaryButtonGradients[theme]} ${primaryButtonHoverGradients[theme]} text-white shadow-lg`
            }`}
          >
            {cta.text}
          </Link>
        ))}
      </div>

      <button
        onClick={onPrevious}
        className="w-full px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
      >
        ← Volver atrás
      </button>
    </div>
  );
}
