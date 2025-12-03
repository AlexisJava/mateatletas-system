'use client';

import React, { ReactElement, useState } from 'react';
import { Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para FillBlanks
 */
interface FillBlanksExampleData {
  texto: string;
  blanks: BlankDefinition[];
  caseSensitive: boolean;
  showHints: boolean;
}

interface BlankDefinition {
  id: string;
  correctAnswer: string;
  hint?: string;
  alternatives?: string[];
}

/**
 * Parsea el texto y extrae las posiciones de los blanks
 */
function parseTextWithBlanks(texto: string): Array<{ type: 'text' | 'blank'; content: string }> {
  const parts: Array<{ type: 'text' | 'blank'; content: string }> = [];
  const regex = /\[blank:(\w+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    // Add text before blank
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: texto.slice(lastIndex, match.index) });
    }
    // Add blank
    parts.push({ type: 'blank', content: match[1] ?? '' });
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < texto.length) {
    parts.push({ type: 'text', content: texto.slice(lastIndex) });
  }

  return parts;
}

/**
 * Preview interactivo del componente FillBlanks
 */
function FillBlanksPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as FillBlanksExampleData;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const parts = parseTextWithBlanks(data.texto);

  const handleChange = (blankId: string, value: string): void => {
    if (!interactive || submitted) return;
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const checkAnswer = (blankId: string): boolean => {
    const blank = data.blanks.find((b) => b.id === blankId);
    if (!blank) return false;

    const userAnswer = answers[blankId] ?? '';
    const correct = data.caseSensitive
      ? userAnswer === blank.correctAnswer
      : userAnswer.toLowerCase() === blank.correctAnswer.toLowerCase();

    if (correct) return true;

    // Check alternatives
    if (blank.alternatives) {
      return blank.alternatives.some((alt) =>
        data.caseSensitive ? userAnswer === alt : userAnswer.toLowerCase() === alt.toLowerCase(),
      );
    }

    return false;
  };

  const handleSubmit = (): void => {
    if (!interactive) return;
    setSubmitted(true);
  };

  const handleReset = (): void => {
    setAnswers({});
    setSubmitted(false);
  };

  const allCorrect = submitted && data.blanks.every((b) => checkAnswer(b.id));
  const filledCount = Object.values(answers).filter((a) => a.trim() !== '').length;

  return (
    <div className="space-y-4">
      {/* Texto con blanks */}
      <div className="text-lg text-white/80 leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          }

          const blankId = part.content;
          const blank = data.blanks.find((b) => b.id === blankId);
          const value = answers[blankId] ?? '';
          const isCorrect = submitted && checkAnswer(blankId);
          const isIncorrect = submitted && !checkAnswer(blankId);

          return (
            <span key={index} className="inline-block mx-1 align-middle">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(blankId, e.target.value)}
                disabled={!interactive || submitted}
                placeholder={data.showHints && blank?.hint ? blank.hint : '...'}
                className={`
                  w-32 px-3 py-1 rounded-lg border text-center font-medium
                  bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-orange-500
                  ${!submitted ? 'border-white/20 text-white' : ''}
                  ${isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : ''}
                  ${isIncorrect ? 'border-red-500 bg-red-500/10 text-red-400' : ''}
                  ${!interactive || submitted ? 'cursor-default' : ''}
                `}
              />
              {submitted && (
                <span className="inline-flex items-center ml-1">
                  {isCorrect ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Show correct answers if incorrect */}
      {submitted && !allCorrect && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="font-medium text-amber-400">Respuestas correctas:</span>
          </div>
          <ul className="text-sm text-white/60 space-y-1 ml-7">
            {data.blanks.map((blank) => (
              <li key={blank.id}>
                <span className="text-white/40">{blank.id}:</span>{' '}
                <span className="text-emerald-400 font-medium">{blank.correctAnswer}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success message */}
      {allCorrect && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-emerald-400">
              ¡Todas las respuestas son correctas!
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {interactive && (
        <div className="flex items-center gap-3">
          {!submitted ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={filledCount < data.blanks.length}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    filledCount < data.blanks.length
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }
                `}
              >
                Verificar
              </button>
              <span className="text-xs text-white/40">
                {filledCount}/{data.blanks.length} completados
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para FillBlanks
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'texto',
    type: 'string',
    description: 'Texto con marcadores [blank:id] donde van los espacios',
    required: true,
  },
  {
    name: 'blanks',
    type: 'array',
    description: 'Array de objetos con id, correctAnswer, hint y alternatives',
    required: true,
  },
  {
    name: 'caseSensitive',
    type: 'boolean',
    description: 'Si la validación distingue mayúsculas/minúsculas',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'showHints',
    type: 'boolean',
    description: 'Si se muestran pistas en los placeholders',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: FillBlanksExampleData = {
  texto: 'El resultado de [blank:op1] + [blank:op2] es igual a [blank:resultado].',
  blanks: [
    { id: 'op1', correctAnswer: '5', hint: 'primer número' },
    { id: 'op2', correctAnswer: '3', hint: 'segundo número' },
    { id: 'resultado', correctAnswer: '8', hint: '?' },
  ],
  caseSensitive: false,
  showHints: true,
};

/**
 * Definición del preview para el registry
 */
export const FillBlanksPreview: PreviewDefinition = {
  component: FillBlanksPreviewComponent,
  exampleData,
  propsDocumentation,
};
