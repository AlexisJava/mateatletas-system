'use client';

import React, { useState, useContext, createContext } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// VIEWPORT CONTEXT (Mobile Simulation)
// ─────────────────────────────────────────────────────────────────────────────

export const ViewportContext = createContext({ isMobile: false });

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface StageProps {
  children: React.ReactNode;
  pattern?: 'dots' | 'grid' | 'waves' | 'solid' | 'cyber-grid' | 'stars' | 'aurora' | 'matrix';
  background?: string;
}

export function Stage({ children, pattern = 'dots', background }: StageProps) {
  const getBackgroundStyle = (): React.CSSProperties => {
    // Custom Image (URL or Base64)
    if (background && (background.startsWith('http') || background.startsWith('data:'))) {
      return {
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.6,
      };
    }

    // Presets
    switch (background || pattern) {
      case 'cyber-grid':
        return {
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(3, 0, 20, 0) 0%, #030014 90%)
          `,
          backgroundSize: '50px 50px, 50px 50px, 100% 100%',
          opacity: 1,
        };
      case 'stars':
        return {
          backgroundImage: `
            radial-gradient(white, rgba(255,255,255,.3) 1px, transparent 2px),
            radial-gradient(rgba(168, 85, 247, 0.4) 2px, transparent 3px),
            radial-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 2px)
          `,
          backgroundSize: '350px 350px, 200px 200px, 150px 150px',
          backgroundPosition: '0 0, 40px 60px, 80px 20px',
          opacity: 0.6,
        };
      case 'aurora':
        return {
          backgroundImage: `
            radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.15), transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.15), transparent 40%),
            conic-gradient(from 180deg at 50% 50%, #030014 0deg, #1e1b4b 180deg, #030014 360deg)
          `,
          opacity: 1,
        };
      case 'matrix':
        return {
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(6, 182, 212, .1) 25%, rgba(6, 182, 212, .1) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, .1) 75%, rgba(168, 85, 247, .1) 76%, transparent 77%, transparent)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
        };
      case 'dots':
      default:
        return {
          backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
          opacity: 0.4,
        };
    }
  };

  return (
    <div className="w-full h-full min-h-full flex flex-col animate-in fade-in duration-700 overflow-hidden relative text-slate-100 font-sans">
      {/* Base Background */}
      <div className="absolute inset-0 bg-[#030014] z-0" />

      {/* Pattern Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out"
        style={getBackgroundStyle()}
      />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto custom-scrollbar scroll-smooth">
        <div className="w-full min-h-full p-6 md:p-8 md:pt-12 md:pb-20 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ContentZoneProps {
  children: React.ReactNode;
  variant?: 'center' | 'top' | 'bottom';
}

export function ContentZone({ children, variant = 'center' }: ContentZoneProps) {
  const alignments = {
    top: 'justify-start',
    center: 'justify-center my-auto',
    bottom: 'justify-end mt-auto',
  };

  return (
    <div
      className={`flex flex-col ${alignments[variant]} w-full max-w-6xl mx-auto space-y-6 py-4 flex-grow relative z-10`}
    >
      {children}
    </div>
  );
}

interface ColumnsProps {
  children: React.ReactNode;
  gap?: number;
}

export function Columns({ children, gap = 6 }: ColumnsProps) {
  const { isMobile } = useContext(ViewportContext);
  return (
    <div
      className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} w-full items-stretch`}
      style={{ gap: `${gap * 4}px` }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

interface LessonHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function LessonHeader({ title, subtitle, icon }: LessonHeaderProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex items-start gap-6">
        {icon && (
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-[#1e1b4b]/50 border border-[#a855f7]/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] text-white backdrop-blur-md">
            {icon}
          </div>
        )}
        <div className="pt-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200 tracking-tight leading-none mb-2 drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--house-primary)]/10 border border-[var(--house-primary)]/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--house-primary)] shadow-[0_0_8px_currentColor]" />
              <p className="text-[10px] font-bold text-[var(--house-primary)] uppercase tracking-widest">
                {subtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
  active?: boolean;
}

export function ActionCard({ title, description, icon, onClick, active }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl text-left transition-all duration-300 border w-full h-full flex flex-col group relative overflow-hidden backdrop-blur-md ${
        active
          ? 'bg-[var(--house-primary)] text-black border-[var(--house-primary)] shadow-[0_0_30px_var(--house-primary-alpha)]'
          : 'bg-[#0f0720]/40 border-[#a855f7]/20 hover:border-[#06b6d4]/50 hover:bg-[#1a0b38]/60 text-[#e2e8f0] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
      }`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`text-3xl p-3 rounded-xl transition-colors ${active ? 'bg-black/10' : 'bg-[#1e1b4b]/50 border border-white/5 group-hover:border-[#06b6d4]/30'}`}
          >
            {icon}
          </span>
          {active && <div className="w-2 h-2 rounded-full bg-black animate-pulse" />}
        </div>
        <h4 className="font-bold text-lg mb-2 leading-tight tracking-tight">{title}</h4>
        <p
          className={`text-xs leading-relaxed font-medium ${active ? 'text-black/70' : 'text-[#94a3b8] group-hover:text-white'}`}
        >
          {description}
        </p>
      </div>
    </button>
  );
}

interface STEAMChallengeProps {
  question: string;
  options: string[];
  correctIndex: number;
}

export function STEAMChallenge({ question, options, correctIndex }: STEAMChallengeProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="bg-[#0f0720]/60 border border-[#a855f7]/20 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl w-full h-full flex flex-col justify-center shadow-2xl">
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--house-primary)] opacity-10 blur-[100px] rounded-full pointer-events-none" />

      <div className="mb-6 relative z-10">
        <span className="inline-block px-3 py-1 rounded bg-[#1e1b4b] border border-[#a855f7]/30 text-[#a855f7] text-[9px] font-bold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          Challenge
        </span>
        <h3 className="text-xl font-bold text-white leading-snug">{question}</h3>
      </div>

      <div className="space-y-3 relative z-10 w-full">
        {options.map((opt, idx) => (
          <button
            key={idx}
            disabled={showResult}
            onClick={() => setSelected(idx)}
            className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all border flex justify-between items-center text-sm ${
              selected === idx
                ? 'border-[var(--house-primary)] bg-[var(--house-primary)]/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.3)]'
                : 'border-white/5 bg-[#1e1b4b]/40 hover:bg-[#2e1065]/60 hover:border-[#a855f7]/40 text-[#94a3b8] hover:text-white'
            } ${showResult && idx === correctIndex ? '!border-[#06b6d4]/50 !bg-[#06b6d4]/10 !text-[#06b6d4]' : ''}
              ${showResult && selected === idx && selected !== correctIndex ? '!border-red-500/50 !bg-red-500/10 !text-red-300' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded text-[10px] font-black ${selected === idx ? 'bg-[var(--house-primary)] text-black' : 'bg-[#030014] text-[#64748b]'}`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>
            {showResult && idx === correctIndex && (
              <span className="text-[#06b6d4] text-lg">✓</span>
            )}
          </button>
        ))}
      </div>

      {selected !== null && !showResult && (
        <button
          onClick={() => setShowResult(true)}
          className="mt-6 w-full py-4 bg-[var(--house-primary)] text-black rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_var(--house-primary-alpha)]"
        >
          Confirmar Respuesta
        </button>
      )}

      {showResult && (
        <div
          className={`mt-6 p-4 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-bottom-2 ${selected === correctIndex ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {selected === correctIndex
            ? '✨ ¡Correcto! ¡Excelente trabajo!'
            : '❌ Incorrecto. ¡Intenta de nuevo!'}
        </div>
      )}
    </div>
  );
}

interface MathHeroProps {
  character: string;
  quote: string;
}

export function MathHero({ character, quote }: MathHeroProps) {
  return (
    <div className="flex flex-col md:flex-row gap-5 items-center p-6 rounded-3xl bg-[#0f0720]/60 border border-white/5 w-full h-full relative overflow-hidden group hover:border-[#06b6d4]/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 rounded-full bg-[#030014] flex items-center justify-center text-3xl shrink-0 shadow-lg border border-white/10 relative z-10 group-hover:scale-110 transition-transform duration-500">
        👤
      </div>
      <div className="text-center md:text-left relative z-10">
        <p className="text-xs font-black text-[var(--house-primary)] uppercase tracking-widest mb-2">
          {character}
        </p>
        <p className="text-base text-[#e2e8f0] italic font-serif leading-relaxed">"{quote}"</p>
      </div>
    </div>
  );
}

interface InfoAlertProps {
  type?: 'info' | 'tip' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function InfoAlert({ type = 'info', title, children }: InfoAlertProps) {
  const colors = {
    info: 'bg-[#06b6d4]/10 border-[#06b6d4]/20 text-[#06b6d4]',
    tip: 'bg-[#a855f7]/10 border-[#a855f7]/20 text-[#a855f7]',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };
  const icons = { info: 'ℹ️', tip: '💡', warning: '⚠️' };

  return (
    <div
      className={`p-5 rounded-2xl border ${colors[type]} flex gap-4 w-full items-start backdrop-blur-sm`}
    >
      <span className="text-xl mt-0.5 filter grayscale-[0.3]">{icons[type]}</span>
      <div>
        {title && (
          <h5 className="font-bold text-xs uppercase opacity-80 mb-1 tracking-wider">{title}</h5>
        )}
        <p className="text-sm leading-relaxed opacity-90 font-medium">{children}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-[#0f0720]/40 border border-white/5 rounded-2xl p-6 text-center hover:bg-[#1e1b4b]/60 transition-colors w-full h-full flex flex-col justify-center gap-1 backdrop-blur-sm group">
      <div className="text-3xl md:text-4xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
        {value}
      </div>
      <div className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest group-hover:text-[#94a3b8]">
        {label}
      </div>
    </div>
  );
}

interface FormulaProps {
  tex: string;
  label?: string;
}

export function Formula({ tex, label }: FormulaProps) {
  return (
    <div className="my-2 py-8 px-6 bg-[#030014]/60 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--house-accent)] opacity-[0.03]" />
      <span
        className="font-serif text-3xl md:text-4xl text-[var(--house-accent)] italic tracking-wide relative z-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {tex}
      </span>
      {label && (
        <span className="mt-4 text-[9px] text-[#64748b] uppercase tracking-widest border-t border-white/5 pt-3 w-1/2 relative z-10">
          {label}
        </span>
      )}
    </div>
  );
}

interface TimelineStep {
  title: string;
  desc: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative pl-6 border-l-2 border-[#1e1b4b] space-y-8 my-6 w-full ml-3">
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#030014] border-4 border-[#1e1b4b] group-hover:border-[var(--house-primary)] transition-colors" />
          <h5 className="text-sm font-bold text-white mb-1 group-hover:text-[var(--house-primary)] transition-colors">
            {step.title}
          </h5>
          <p className="text-xs text-[#94a3b8] leading-relaxed max-w-sm">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT COMPONENTS (for simple text content)
// ─────────────────────────────────────────────────────────────────────────────

interface TextBlockProps {
  children: React.ReactNode;
}

export function TextBlock({ children }: TextBlockProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <p className="text-slate-300 leading-relaxed text-base">{children}</p>
    </div>
  );
}

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
}

export function Heading({ children, level = 2 }: HeadingProps) {
  const sizes = {
    1: 'text-3xl md:text-4xl',
    2: 'text-2xl md:text-3xl',
    3: 'text-xl md:text-2xl',
  };

  return <h2 className={`${sizes[level]} font-bold text-white mb-4`}>{children}</h2>;
}
