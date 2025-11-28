'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade-in';
  delay?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const { elementRef, isVisible } = useScrollAnimation(0.1);

  const animationClasses = {
    'fade-up': 'translate-y-12 opacity-0',
    'fade-down': '-translate-y-12 opacity-0',
    'fade-left': 'translate-x-12 opacity-0',
    'fade-right': '-translate-x-12 opacity-0',
    'zoom-in': 'scale-95 opacity-0',
    'fade-in': 'opacity-0',
  };

  const visibleClasses = 'translate-y-0 translate-x-0 scale-100 opacity-100';

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? visibleClasses : animationClasses[animation]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
