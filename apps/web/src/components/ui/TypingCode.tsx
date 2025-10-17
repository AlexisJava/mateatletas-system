'use client';

import { useState, useEffect } from 'react';
import type { CodeLine } from '@/app/(landing)/data/landing-data';

interface TypingCodeProps {
  codeLines: CodeLine[];
}

export function TypingCode({ codeLines }: TypingCodeProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const currentLine = codeLines[currentLineIndex];
    if (!currentLine) {
      setIsComplete(true);
      return;
    }

    if (currentCharIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.text.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(currentCharIndex + 1);
      }, 40);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
        setCurrentCharIndex(0);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentLineIndex, isComplete, codeLines]);

  return (
    <div className="relative pl-14">
      <pre className="text-[13.5px] font-mono leading-[1.9] tracking-wide">
        {displayedLines.map((line, index) => {
          const lineData = codeLines[index];
          if (!lineData) return null;

          // Si tiene keyword separada
          if (lineData.isKeyword && lineData.rest) {
            const keyword = line.substring(0, lineData.text.length);
            const rest = line.substring(lineData.text.length);
            return (
              <div key={index} className="min-h-[27px] hover:bg-emerald-500/[0.02] transition-colors">
                <code>
                  <span className={lineData.color + ' font-extrabold'}>{keyword}</span>
                  <span className={lineData.restColor || 'text-white/85'}>{rest}</span>
                </code>
              </div>
            );
          }

          // Si tiene dos colores (texto + rest)
          if (lineData.rest && lineData.restColor) {
            return (
              <div key={index} className="min-h-[27px] hover:bg-emerald-500/[0.02] transition-colors">
                <code>
                  <span className={lineData.color}>{line}</span>
                  <span className={lineData.restColor + ' font-medium'}>{lineData.rest}</span>
                </code>
              </div>
            );
          }

          // Línea normal
          return (
            <div key={index} className="min-h-[27px] hover:bg-emerald-500/[0.02] transition-colors">
              <code className={lineData.color}>
                {line}
              </code>
            </div>
          );
        })}
        {!isComplete && (
          <span className="inline-block w-2 h-5 bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse ml-1 rounded-sm shadow-lg shadow-emerald-400/50" />
        )}
      </pre>

      {/* Números de línea mejorados */}
      <div className="absolute left-0 top-0 text-[11px] text-emerald-400/30 font-mono select-none pointer-events-none w-12 pr-4 text-right font-semibold">
        {displayedLines.map((_, index) => (
          <div key={index} className="min-h-[27px] leading-[1.9]">
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
