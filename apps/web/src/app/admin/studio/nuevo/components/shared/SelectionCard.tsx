'use client';

import { ReactNode } from 'react';

type ColorKey =
  | 'orange'
  | 'emerald'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'violet'
  | 'amber'
  | 'teal'
  | 'sky'
  | 'rose';

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentColor?: ColorKey;
  size?: 'sm' | 'md' | 'lg';
}

const COLOR_MAP: Record<ColorKey, { border: string; bg: string; text: string; iconBg: string }> = {
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/5',
    text: 'text-orange-500',
    iconBg: 'bg-orange-500/20',
  },
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500/5',
    text: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
  violet: {
    border: 'border-violet-500',
    bg: 'bg-violet-500/5',
    text: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
  teal: {
    border: 'border-teal-500',
    bg: 'bg-teal-500/5',
    text: 'text-teal-400',
    iconBg: 'bg-teal-500/20',
  },
  sky: {
    border: 'border-sky-500',
    bg: 'bg-sky-500/5',
    text: 'text-sky-400',
    iconBg: 'bg-sky-500/20',
  },
  rose: {
    border: 'border-rose-500',
    bg: 'bg-rose-500/5',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
  },
};

const SIZE_CONFIG = {
  sm: {
    padding: 'p-5',
    iconSize: 'w-10 h-10 text-xl',
    titleSize: 'text-base',
    checkSize: 'w-5 h-5',
    checkIconSize: 'w-3 h-3',
    checkPosition: 'top-4 right-4',
  },
  md: {
    padding: 'p-6',
    iconSize: 'w-12 h-12 text-2xl',
    titleSize: 'text-lg',
    checkSize: 'w-6 h-6',
    checkIconSize: 'w-3.5 h-3.5',
    checkPosition: 'top-5 right-5',
  },
  lg: {
    padding: 'p-6',
    iconSize: 'w-12 h-12 text-2xl',
    titleSize: 'text-lg',
    checkSize: 'w-6 h-6',
    checkIconSize: 'w-3.5 h-3.5',
    checkPosition: 'top-5 right-5',
  },
};

export function SelectionCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  description,
  accentColor = 'orange',
  size = 'md',
}: SelectionCardProps) {
  const colors = COLOR_MAP[accentColor];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <button
      onClick={onClick}
      className={`
        group relative text-left ${sizeConfig.padding} rounded-xl transition-all duration-300
        border-2
        ${
          selected
            ? `${colors.border} ${colors.bg}`
            : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div
          className={`absolute ${sizeConfig.checkPosition} ${sizeConfig.checkSize} rounded-full ${colors.border.replace('border-', 'bg-')} flex items-center justify-center`}
        >
          <svg
            className={`${sizeConfig.checkIconSize} text-black`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className={size === 'sm' ? 'mb-3' : 'mb-5'}>
        <div
          className={`
            ${sizeConfig.iconSize} rounded-lg flex items-center justify-center
            transition-colors duration-300
            ${selected ? colors.iconBg : 'bg-white/5 group-hover:bg-white/10'}
          `}
        >
          {icon}
        </div>
      </div>

      <h3 className={`${sizeConfig.titleSize} font-semibold text-white mb-2 leading-snug`}>
        {title}
      </h3>

      <p className={`${colors.text} text-xs font-semibold mb-1`}>{subtitle}</p>

      <p className="text-white/40 text-xs">{description}</p>
    </button>
  );
}
