'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Users } from 'lucide-react';
import { SavedResource } from '../hooks/usePlanificador';

interface ResourceDetailModalProps {
  resource: SavedResource | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: () => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  onAssign,
}) => {
  if (!resource) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.content);
    alert('Contenido copiado al portapapeles');
  };

  const handleDownload = () => {
    const blob = new Blob([resource.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.type}-${resource.topic.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card-strong p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-2">
                  {resource.title}
                </h2>
                <p className="text-lg text-purple-600 dark:text-purple-300">
                  {resource.topic}
                </p>
                <div className="flex gap-3 mt-2 text-sm text-purple-600 dark:text-purple-300">
                  <span>📚 {resource.grade}</span>
                  <span>⏱️ {resource.duration}</span>
                  <span>📅 {new Date(resource.createdAt).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-indigo-900 dark:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="bg-white/40 dark:bg-indigo-950/40 rounded-lg p-6 border border-purple-200/30 dark:border-purple-700/30 mb-6 max-h-96 overflow-y-auto">
              <pre className="text-sm text-indigo-900 dark:text-white whitespace-pre-wrap font-mono">
                {resource.content}
              </pre>
            </div>

            {/* Assignments */}
            {resource.assignedTo.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Asignaciones
                </h3>
                <div className="space-y-2">
                  {resource.assignedTo.map((assignment, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            assignment.type === 'estudiante'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}
                        >
                          {assignment.type === 'estudiante' ? '👤' : '👥'}
                        </div>
                        <div>
                          <p className="font-medium text-indigo-900 dark:text-white">
                            {assignment.name}
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-300">
                            {assignment.type === 'estudiante' ? 'Estudiante' : 'Clase'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-purple-600 dark:text-purple-300">
                        {new Date(assignment.date).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={onAssign}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Asignar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
