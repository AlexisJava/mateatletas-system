import { useState } from 'react';
import {
  InteractiveQuizSlide as InteractiveQuizSlideType,
  NavigationButtons,
} from '@ciudad-mateatleta/lms-core';
import LambdaMessage from './LambdaMessage';
import FeedbackPanel from './FeedbackPanel';
import { CourseTheme } from '../../themes/courseThemes';

interface InteractiveQuizSlideProps {
  slide: InteractiveQuizSlideType;
  onNext: () => void;
  onPrevious: () => void;
  onAnswerSave?: (slideId: string, slideTitle: string, opciones: string[]) => void;
  theme?: CourseTheme;
}

const selectedColors: Record<CourseTheme, string> = {
  matematicas: 'bg-orange-600 border-orange-500',
  programacion: 'bg-indigo-600 border-indigo-500',
  ciencias: 'bg-emerald-600 border-emerald-500',
};

const hoverBorderColors: Record<CourseTheme, string> = {
  matematicas: 'hover:border-orange-500',
  programacion: 'hover:border-indigo-500',
  ciencias: 'hover:border-emerald-500',
};

const conclusionButtonColors: Record<CourseTheme, string> = {
  matematicas: 'bg-amber-600 hover:bg-amber-700',
  programacion: 'bg-purple-600 hover:bg-purple-700',
  ciencias: 'bg-teal-600 hover:bg-teal-700',
};

export default function InteractiveQuizSlide({
  slide,
  onNext,
  onPrevious,
  onAnswerSave,
  theme = 'matematicas',
}: InteractiveQuizSlideProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (!selectedOptions.includes(optionId)) {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleShowFinal = () => {
    if (selectedOptions.length > 0) {
      setShowFinalMessage(true);
      // Guardar respuesta en la DB
      if (onAnswerSave) {
        onAnswerSave(slide.id, slide.title, selectedOptions);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">{slide.title}</h1>

      {slide.lambda_message && <LambdaMessage message={slide.lambda_message} theme={theme} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {slide.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? selectedColors[theme]
                  : `bg-slate-800 border-slate-700 ${hoverBorderColors[theme]}`
              }`}
            >
              <div className="text-4xl mb-3">{option.icon}</div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">{option.label}</h3>
              <p className="text-sm text-slate-400">{option.description}</p>

              {isSelected && (
                <div className="mt-4 text-slate-200 text-sm animate-fadeIn">{option.feedback}</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedOptions.length > 0 && !showFinalMessage && (
        <div className="flex justify-center">
          <button
            onClick={handleShowFinal}
            className={`px-6 py-3 rounded-lg ${conclusionButtonColors[theme]} text-white font-semibold transition-all`}
          >
            Ver conclusión
          </button>
        </div>
      )}

      {showFinalMessage && slide.final_message && (
        <FeedbackPanel type="info" message={slide.final_message} />
      )}

      <NavigationButtons
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel="Continuar"
        nextDisabled={!showFinalMessage}
        theme={theme}
      />
    </div>
  );
}
