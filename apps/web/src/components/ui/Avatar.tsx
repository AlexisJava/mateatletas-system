interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

/**
 * Avatar Component - Crash Bandicoot Style
 * Avatar con borde chunky y fallback a iniciales
 */
export function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    return alt.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`${sizes[size]} rounded-full border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#ff6b35] to-[#f7b801] text-white font-bold`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{getFallbackText()}</span>
      )}
    </div>
  );
}
