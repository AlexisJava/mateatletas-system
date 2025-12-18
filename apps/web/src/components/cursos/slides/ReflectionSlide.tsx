import { useState } from 'react';
import {
  ReflectionSlide as ReflectionSlideType,
  NavigationButtons,
} from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import { CourseTheme } from '../../themes/courseThemes';

interface ReflectionSlideProps {
  slide: ReflectionSlideType;
  onNext: () => void;
  onPrevious: () => void;
  onReflectionChange: (reflection: string) => void;
  initialReflection?: string;
  theme?: CourseTheme;
}

const focusRingColors: Record<CourseTheme, string> = {
  matematicas: 'focus:ring-orange-500',
  programacion: 'focus:ring-indigo-500',
  ciencias: 'focus:ring-emerald-500',
};

const closingGradients: Record<CourseTheme, string> = {
  matematicas: 'from-amber-900/40 to-orange-900/40',
  programacion: 'from-indigo-900/40 to-purple-900/40',
  ciencias: 'from-emerald-900/40 to-teal-900/40',
};

const closingBorders: Record<CourseTheme, string> = {
  matematicas: 'border-amber-500',
  programacion: 'border-indigo-500',
  ciencias: 'border-emerald-500',
};

export default function ReflectionSlide({
  slide,
  onNext,
  onPrevious,
  onReflectionChange,
  initialReflection = '',
  theme = 'matematicas',
}: ReflectionSlideProps) {
  const [reflection, setReflection] = useState(initialReflection);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, slide.content.input_config.max_chars);
    setReflection(value);
    onReflectionChange(value);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{slide.title}</h1>

      <LambdaMessage message={slide.content.lambda_message} theme={theme} />

      <div className="bg-slate-800 rounded-xl p-6">
        <textarea
          value={reflection}
          onChange={handleChange}
          placeholder={slide.content.input_config.placeholder}
          className={`w-full bg-slate-700 text-slate-100 rounded-lg p-4 min-h-32 focus:outline-none focus:ring-2 ${focusRingColors[theme]} resize-none`}
          rows={5}
        />
        <div className="text-right text-slate-400 text-sm mt-2">
          {reflection.length} / {slide.content.input_config.max_chars}
        </div>
      </div>

      <div
        className={`bg-gradient-to-r ${closingGradients[theme]} rounded-xl p-6 border-2 ${closingBorders[theme]}`}
      >
        <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-line">
          {slide.content.closing_message.split('**').map((part: string, index: number) => {
            if (index % 2 === 1) {
              return (
                <strong key={index} className="font-bold text-slate-100">
                  {part}
                </strong>
              );
            }
            return part;
          })}
        </div>
      </div>

      <NavigationButtons
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel={slide.content.cta}
        theme={theme}
      />
    </div>
  );
}
