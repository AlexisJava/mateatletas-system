import { RecapSlide as RecapSlideType, NavigationButtons } from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import { CourseTheme } from '../../themes/courseThemes';

interface RecapSlideProps {
  slide: RecapSlideType;
  onNext: () => void;
  onPrevious: () => void;
  theme?: CourseTheme;
}

const borderColors: Record<CourseTheme, string> = {
  matematicas: 'border-orange-500',
  programacion: 'border-indigo-500',
  ciencias: 'border-emerald-500',
};

const closingCardGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-orange-900/40',
  programacion: 'bg-indigo-900/40',
  ciencias: 'bg-emerald-900/40',
};

const closingCardBorders: Record<CourseTheme, string> = {
  matematicas: 'border-orange-500',
  programacion: 'border-indigo-500',
  ciencias: 'border-emerald-500',
};

export default function RecapSlide({
  slide,
  onNext,
  onPrevious,
  theme = 'matematicas',
}: RecapSlideProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{slide.title}</h1>

      {slide.lambda_message && <LambdaMessage message={slide.lambda_message} theme={theme} />}

      <div className="space-y-4 mt-8">
        {slide.key_learnings?.map((learning, index: number) => (
          <div
            key={index}
            className={`bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border-l-4 ${borderColors[theme]}`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">{learning.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{learning.title}</h3>
                <p className="text-slate-300 leading-relaxed">{learning.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slide.closing_message && (
        <div
          className={`${closingCardGradients[theme]} rounded-xl p-6 border-2 ${closingCardBorders[theme]} mt-8`}
        >
          <p className="text-slate-200 text-lg leading-relaxed">{slide.closing_message}</p>
        </div>
      )}

      <NavigationButtons
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel="Continuar"
        theme={theme}
      />
    </div>
  );
}
