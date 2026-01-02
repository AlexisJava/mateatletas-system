'use client';

import { ListTodo, Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { TaskItemData } from '../hooks/useTareas';

/**
 * TasksPanel - Panel de tareas del dashboard
 *
 * Conectado al backend: GET /admin/tareas
 * Lista de tareas con scroll y botón para agregar.
 */

interface TasksPanelProps {
  tasks: TaskItemData[];
  isLoading?: boolean;
  error?: string | null;
  onToggleTask: (id: string) => void;
  onAddTask?: () => void;
}

export function TasksPanel({ tasks, isLoading, error, onToggleTask, onAddTask }: TasksPanelProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[var(--admin-accent)]" />
          Tareas
          {error && (
            <span className="text-xs text-[var(--status-warning)] font-normal" title={error}>
              (mock)
            </span>
          )}
        </h2>
        <button
          onClick={onAddTask}
          className="p-2 rounded-lg bg-[var(--admin-accent-muted)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent)] hover:text-black transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {isLoading ? (
          <div className="text-center py-4 text-[var(--admin-text-muted)]">Cargando...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-[var(--admin-text-muted)]">
            No hay tareas pendientes
          </div>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggleTask} />)
        )}
      </div>
    </div>
  );
}

export default TasksPanel;
