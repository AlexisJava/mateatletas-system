'use client';

import { getGradientById, getInitials } from '@/lib/avatar-gradients';

interface AvatarWithInitialsProps {
  nombre: string;
  apellido: string;
  gradientId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

export default function AvatarWithInitials({
  nombre,
  apellido,
  gradientId,
  size = 'md',
  className = '',
}: AvatarWithInitialsProps) {
  const gradient = getGradientById(gradientId);
  const initials = getInitials(nombre, apellido);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        font-bold
        shadow-sm
        ${className}
      `}
      style={{
        background: gradient.gradient,
        color: gradient.textColor,
      }}
      title={`${nombre} ${apellido}`}
    >
      {initials}
    </div>
  );
}
