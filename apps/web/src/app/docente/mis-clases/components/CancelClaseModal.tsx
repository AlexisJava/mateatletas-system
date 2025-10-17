import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';

interface CancelClaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CancelClaseModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelClaseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 max-w-md w-full shadow-2xl shadow-purple-900/40"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900 dark:text-white">
                  ¿Cancelar clase?
                </h3>
                <p className="text-purple-600 dark:text-purple-300 mt-1 text-sm font-medium">
                  Esta acción no se puede deshacer y se notificará a todos los estudiantes
                  inscritos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-indigo-900 dark:text-white font-semibold hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all disabled:opacity-50"
              >
                No, mantener
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
