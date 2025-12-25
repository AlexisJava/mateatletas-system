'use client';

import { CheckCircle } from 'lucide-react';
import { getTaskPriorityColor } from '@/lib/constants/admin-mock-data';
import type { TaskItemProps } from '../types/dashboard.types';

/**
 * TaskItem - Ítem de tarea con checkbox
 *
 * Muestra una tarea con estado, prioridad y acción de toggle.
 */

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-colors ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          isCompleted
            ? 'bg-[var(--status-success)] border-[var(--status-success)]'
            : 'border-[var(--admin-border)] hover:border-[var(--admin-accent)]'
        }`}
      >
        {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${isCompleted ? 'line-through text-[var(--admin-text-muted)]' : 'text-[var(--admin-text)]'}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-[var(--admin-text-muted)] truncate">{task.description}</p>
        )}
      </div>
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTaskPriorityColor(task.priority)}`}
      >
        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
      </span>
    </div>
  );
}

export default TaskItem;
