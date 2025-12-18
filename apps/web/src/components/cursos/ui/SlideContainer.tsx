import { ReactNode } from 'react';

interface SlideContainerProps {
  children: ReactNode;
  className?: string;
}

export default function SlideContainer({ children, className = '' }: SlideContainerProps) {
  return <div className={`w-full mx-auto px-0 py-0 animate-fadeIn ${className}`}>{children}</div>;
}
