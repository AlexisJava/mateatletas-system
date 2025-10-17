'use client';

import { motion } from 'framer-motion';
import { FileText, Users, Trash2 } from 'lucide-react';
import { SavedResource } from '../hooks/usePlanificador';

interface ResourceCardProps {
  resource: SavedResource;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: (resource: SavedResource) => void;
  onAssign: (resource: SavedResource) => void;
  onDelete: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  icon: Icon = FileText,
  onSelect,
  onAssign,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este recurso?')) {
      onDelete(resource.id);
    }
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign(resource);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 hover-lift cursor-pointer"
      onClick={() => onSelect(resource)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900 dark:text-white">
              {resource.title}
            </h3>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              {new Date(resource.createdAt).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-sm font-medium text-indigo-900 dark:text-white mb-1">
          {resource.topic}
        </p>
        <div className="flex gap-2 text-xs text-purple-600 dark:text-purple-300">
          <span>📚 {resource.grade}</span>
          <span>•</span>
          <span>⏱️ {resource.duration}</span>
        </div>
      </div>

      {/* Assignments */}
      {resource.assignedTo.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-purple-600 dark:text-purple-300">
            Asignado a {resource.assignedTo.length}{' '}
            {resource.assignedTo.length === 1 ? 'estudiante' : 'estudiantes'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-purple-200/30 dark:border-purple-700/30">
        <button
          onClick={handleAssign}
          className="flex-1 px-3 py-1.5 text-xs glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white"
        >
          Asignar
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs glass-card hover:bg-red-100/60 dark:hover:bg-red-900/40 rounded-lg transition-colors text-red-600 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
