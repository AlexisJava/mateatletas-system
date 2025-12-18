'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SlideContainer, ProgressBar } from '@/components/ui';
import {
  IntroSlide,
  InteractiveQuizSlide,
  ContentSlide,
  QuizSlideComponent,
  RecapSlide,
  GameDashboardSlide,
  ReflectionSlide,
  OutroPreviewSlide,
} from '@ciudad-mateatleta/design-system/slides';
import { useSlidesProgress } from '@/lib/hooks/useSlidesProgress';

interface WeekViewerProps {
  curso: 'matematicas' | 'astro' | 'roblox';
  semana: number;
  slidesData: any[];
  courseTitle?: string;
  courseColor?: string;
  games?: Array<{ path: string; title: string }>;
}

export default function WeekViewer({
  curso,
  semana,
  slidesData,
  courseTitle = 'Curso',
  courseColor = 'indigo',
  games = [],
}: WeekViewerProps) {
  const router = useRouter();
  const [showNavMenu, setShowNavMenu] = useState(false);
  const { progress, isLoading, saveProgress, saveConversatorioAnswer, saveReflection } =
    useSlidesProgress({ curso, semana });

  const [currentSlide, setCurrentSlide] = useState(progress.currentSlide);

  // Sincronizar currentSlide local con el progreso cargado
  useEffect(() => {
    setCurrentSlide(progress.currentSlide);
  }, [progress.currentSlide]);

  const handleNext = () => {
    if (currentSlide < slidesData.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      saveProgress({ currentSlide: nextSlide });
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      saveProgress({ currentSlide: prevSlide });
    }
  };

  const handleReflectionChange = (reflection: string) => {
    const slide = slidesData[currentSlide];
    if (slide.type === 'reflection') {
      saveReflection(slide.id, slide.title, reflection);
    }
  };

  const handleConversatorioAnswer = (slideId: string, slideTitle: string, opciones: string[]) => {
    saveConversatorioAnswer(slideId, slideTitle, opciones);
  };

  const jumpToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    saveProgress({ currentSlide: slideIndex });
    setShowNavMenu(false);
  };

  const slide = slidesData[currentSlide];

  const renderSlide = () => {
    switch (slide.type) {
      case 'intro':
        return <IntroSlide slide={slide} onNext={handleNext} />;

      case 'interactive_quiz':
        return (
          <InteractiveQuizSlide
            slide={slide}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onAnswerSave={handleConversatorioAnswer}
          />
        );

      case 'content':
        return <ContentSlide slide={slide} onNext={handleNext} onPrevious={handlePrevious} />;

      case 'quiz':
        return <QuizSlideComponent slide={slide} onNext={handleNext} onPrevious={handlePrevious} />;

      case 'recap':
        return <RecapSlide slide={slide} onNext={handleNext} onPrevious={handlePrevious} />;

      case 'game_dashboard':
        return (
          <GameDashboardSlide
            slide={slide}
            onNext={handleNext}
            onPrevious={handlePrevious}
            completedGames={progress.completedGames}
          />
        );

      case 'reflection':
        return (
          <ReflectionSlide
            slide={slide}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onReflectionChange={handleReflectionChange}
            initialReflection={progress.reflection}
          />
        );

      case 'outro_preview':
        return <OutroPreviewSlide slide={slide} onPrevious={handlePrevious} />;

      default:
        return <div className="text-white">Slide type not implemented</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20">
      {/* Progress Bar - debajo del header principal */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Slide {currentSlide + 1} / {slidesData.length}
            </span>
            <span className={`text-sm font-semibold text-${courseColor}-400`}>
              {courseTitle} - Semana {semana}
            </span>
          </div>
          <ProgressBar current={currentSlide} total={slidesData.length} />
        </div>
      </div>

      {/* Navigation Menu Button - Fixed Bottom Right */}
      <button
        onClick={() => setShowNavMenu(!showNavMenu)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl"
        title="Menú de navegación"
      >
        {showNavMenu ? '✕' : '☰'}
      </button>

      {/* Navigation Menu Overlay */}
      {showNavMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowNavMenu(false)}
        >
          <div
            className="fixed right-6 bottom-24 w-96 max-h-[80vh] bg-slate-800 border-2 border-emerald-500/50 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white mb-1">🎯 Navegación Rápida</h3>
              <p className="text-sm text-slate-300">
                Saltá a cualquier diapositiva{games.length > 0 ? ' o juego' : ''}
              </p>
            </div>

            {/* Quick Access to Games */}
            {games.length > 0 && (
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3">
                  🎮 Acceso Directo a Juegos
                </h4>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {games.map((game, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(game.path)}
                      className="w-full px-4 py-2 rounded-lg bg-emerald-700/50 hover:bg-emerald-700 text-white text-sm font-semibold transition-all text-left"
                    >
                      🎯 {game.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Slides Navigation */}
            <div className="p-4 max-h-[40vh] overflow-y-auto">
              <h4 className="text-sm font-semibold text-emerald-400 mb-3">📑 Diapositivas</h4>
              <div className="space-y-2">
                {slidesData.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToSlide(index)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                      index === currentSlide
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : index <= progress.currentSlide
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-slate-700/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {index + 1}. {s.title}
                      </span>
                      {index <= progress.currentSlide && (
                        <span className="text-emerald-300 text-xs">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
              <button
                onClick={() => router.push(`/cursos/${curso}`)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all"
              >
                ← Volver al curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Content */}
      <div className="pt-24 pb-8">
        <SlideContainer>{renderSlide()}</SlideContainer>
      </div>
    </div>
  );
}
