'use client';

import { ListTodo, Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import type { MockTask } from '@/lib/constants/admin-mock-data';

/**
 * TasksPanel - Panel de tareas del dashboard
 *
 * Lista de tareas con scroll y botón para agregar.
 */

interface TasksPanelProps {
  tasks: MockTask[];
  onToggleTask: (id: string) => void;
}

export function TasksPanel({ tasks, onToggleTask }: TasksPanelProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[var(--admin-accent)]" />
          Tareas
        </h2>
        <button className="p-2 rounded-lg bg-[var(--admin-accent-muted)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent)] hover:text-black transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </div>
  );
}

export default TasksPanel;
