'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SavedResource, Assignment } from '../hooks/usePlanificador';

interface AssignResourceModalProps {
  resource: SavedResource | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignment: Assignment) => void;
}

export const AssignResourceModal: React.FC<AssignResourceModalProps> = ({
  resource,
  isOpen,
  onClose,
  onAssign,
}) => {
  if (!resource) return null;

  const handleAssignToStudent = () => {
    onAssign({
      type: 'estudiante',
      id: 'demo-1',
      name: 'Estudiante Demo',
      date: new Date().toISOString(),
    });
    onClose();
    alert('✅ Recurso asignado correctamente (demo)');
  };

  const handleAssignToClass = () => {
    onAssign({
      type: 'clase',
      id: 'demo-2',
      name: 'Clase Demo',
      date: new Date().toISOString(),
    });
    onClose();
    alert('✅ Recurso asignado a clase (demo)');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card-strong p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-indigo-900 dark:text-white mb-4">
              Asignar Recurso
            </h3>
            <p className="text-purple-600 dark:text-purple-300 mb-6">
              Esta funcionalidad permite asignar este recurso a estudiantes o clases. Por ahora,
              esto es una demostración visual.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleAssignToStudent}
                className="w-full px-4 py-3 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  👤
                </div>
                <div className="text-left">
                  <p className="font-medium">Asignar a un estudiante</p>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    Enviar recurso individual
                  </p>
                </div>
              </button>
              <button
                onClick={handleAssignToClass}
                className="w-full px-4 py-3 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  👥
                </div>
                <div className="text-left">
                  <p className="font-medium">Asignar a una clase</p>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    Enviar a toda la clase
                  </p>
                </div>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
