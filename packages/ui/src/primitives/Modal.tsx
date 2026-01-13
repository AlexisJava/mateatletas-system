import { forwardRef, type ReactNode, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { backgrounds, borders, blur, lessonSprings } from '../tokens/lesson';

/**
 * Modal size variants
 */
const modalVariants = cva(
  // Base styles
  ['relative w-full mx-auto', 'flex flex-col', 'max-h-[90vh]'],
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        full: 'max-w-[95vw]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

/**
 * Backdrop animation variants
 */
const backdropAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Modal content animation variants
 */
const modalAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description/subtitle */
  description?: string;
  /** Modal content */
  children: ReactNode;
  /** Footer content (buttons, etc.) */
  footer?: ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Custom header content (replaces title/description) */
  header?: ReactNode;
  /** Additional class names for modal container */
  className?: string;
  /** Additional class names for modal content */
  contentClassName?: string;
  /** Z-index for modal (default: 50) */
  zIndex?: number;
}

/**
 * Modal - Reusable modal/dialog primitive
 *
 * Glassmorphism modal with consistent styling, animations, and accessibility.
 * Designed to be the base for all 35+ modal components in the app.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar Acción"
 *   description="¿Estás seguro de que deseas continuar?"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirmar</Button>
 *     </>
 *   }
 * >
 *   <p>Contenido del modal aquí...</p>
 * </Modal>
 * ```
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      children,
      footer,
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      header,
      size = 'md',
      className,
      contentClassName,
      zIndex = 50,
    },
    ref,
  ) => {
    // Handle escape key
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [open, handleKeyDown]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0"
            style={{ zIndex }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60"
              style={{ backdropFilter: `blur(${blur.sm})` }}
              variants={backdropAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
            />

            {/* Modal Container - Centered */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
              onClick={handleBackdropClick}
            >
              {/* Modal Content */}
              <motion.div
                ref={ref}
                className={clsx(
                  modalVariants({ size }),
                  'pointer-events-auto',
                  'rounded-3xl',
                  'overflow-hidden',
                  className,
                )}
                style={{
                  background: backgrounds.card,
                  backdropFilter: `blur(${blur.lg})`,
                  border: `1px solid ${borders.subtle}`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
                variants={modalAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={lessonSprings.card}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {(header || title || showCloseButton) && (
                  <div
                    className="flex items-start justify-between gap-4 p-6 border-b"
                    style={{ borderColor: borders.subtle }}
                  >
                    {header || (
                      <div className="flex-1 min-w-0">
                        {title && (
                          <h2 id="modal-title" className="text-xl font-bold text-white">
                            {title}
                          </h2>
                        )}
                        {description && (
                          <p className="mt-1 text-sm text-slate-400">{description}</p>
                        )}
                      </div>
                    )}

                    {showCloseButton && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Cerrar modal"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={clsx('flex-1 overflow-y-auto p-6', contentClassName)}>
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div
                    className="flex items-center justify-end gap-3 p-6 border-t"
                    style={{ borderColor: borders.subtle }}
                  >
                    {footer}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  },
);

Modal.displayName = 'Modal';

/**
 * ConfirmModal - Pre-configured confirmation dialog
 */
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  loading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      buttonBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
    },
    warning: {
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      buttonBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    info: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      buttonBg: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-white font-medium transition-all disabled:opacity-50"
            style={{ background: styles.buttonBg }}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-slate-300">{message}</p>
    </Modal>
  );
}

ConfirmModal.displayName = 'ConfirmModal';
