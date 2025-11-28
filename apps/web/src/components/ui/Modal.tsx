'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  contentClassName?: string;
}

/**
 * Modal Component - Crash Bandicoot Style
 * Modal dialog con diseño chunky y vibrante
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  contentClassName = '',
  ...rest
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in ${className}`}
      {...rest}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl border-2 border-gray-300 w-full ${sizes[size]} animate-scale-in ${contentClassName}`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b-2 border-gray-200"
          style={{
            background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
          }}
        >
          {title !== undefined ? (
            <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-fredoka)]">
              {title}
            </h2>
          ) : (
            <span className="text-2xl font-bold text-white sr-only">Modal</span>
          )}
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
