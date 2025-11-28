import React, { useState } from 'react';

interface StudentAvatarProps {
  nombre: string;
  apellido?: string;
  avatar_url?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

/**
 * Avatar component for students with fallback to initials
 *
 * Features:
 * - Shows profile picture if available
 * - Falls back to colored circle with initials
 * - Multiple size options
 * - Consistent styling across the app
 */
export function StudentAvatar({
  nombre,
  apellido,
  avatar_url,
  size = 'md',
  className = '',
}: StudentAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();

  // Generate consistent color based on name
  const getColorFromName = (name: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
    ];

    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const colorClass = getColorFromName(nombre + (apellido || ''));

  const showFallback = !avatar_url || imageError;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {showFallback ? (
        <div
          className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-black`}
        >
          {initials}
        </div>
      ) : (
        <img
          src={avatar_url}
          alt={`${nombre} ${apellido || ''}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
