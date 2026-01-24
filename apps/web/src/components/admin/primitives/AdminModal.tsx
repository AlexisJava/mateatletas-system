'use client';

import { type ReactNode, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminButton } from './AdminButton';

type AdminModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: AdminModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
}

const SIZE_STYLES: Record<AdminModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw] max-h-[90vh]',
};

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
}: AdminModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full',
              '-translate-x-1/2 -translate-y-1/2',
              SIZE_STYLES[size],
            )}
            initial={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl',
                'bg-white/[0.03] backdrop-blur-xl',
                'border border-white/[0.08]',
                'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
              )}
            >
              {/* Top gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%)',
                }}
              />

              {/* Header */}
              <div className="relative z-10 flex items-start justify-between p-6 pb-0">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--admin-text)]">{title}</h2>
                  {description && (
                    <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="!p-2 -mr-2 -mt-2"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </AdminButton>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 max-h-[60vh] overflow-y-auto">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="relative z-10 flex items-center justify-end gap-3 p-6 pt-0">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
