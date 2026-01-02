import { useState, useEffect, useCallback } from 'react';
import {
  getTareas,
  createTarea,
  toggleTarea as apiToggleTarea,
  deleteTarea,
  type TareaAdmin,
  type CreateTareaDto,
  type TareaPrioridad,
  type TareaEstado,
} from '@/lib/api/admin.api';
import { MOCK_TASKS } from '@/lib/constants/admin-mock-data';

/** Tarea adaptada para el componente TaskItem (compatibilidad con mock) */
export interface TaskItemData {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string | null;
  assignee: string | null;
  createdAt: string;
}

/** Mapeo de prioridades backend -> frontend */
const mapPrioridad = (p: TareaPrioridad): 'high' | 'medium' | 'low' => {
  switch (p) {
    case 'URGENTE':
    case 'ALTA':
      return 'high';
    case 'MEDIA':
      return 'medium';
    case 'BAJA':
      return 'low';
    default:
      return 'medium';
  }
};

/** Mapeo de estados backend -> frontend */
const mapEstado = (e: TareaEstado): 'pending' | 'in_progress' | 'completed' => {
  switch (e) {
    case 'PENDIENTE':
      return 'pending';
    case 'EN_PROGRESO':
      return 'in_progress';
    case 'COMPLETADA':
    case 'CANCELADA':
      return 'completed';
    default:
      return 'pending';
  }
};

/** Convierte TareaAdmin a TaskItemData */
const adaptTarea = (tarea: TareaAdmin): TaskItemData => ({
  id: tarea.id,
  title: tarea.title,
  description: tarea.description,
  priority: mapPrioridad(tarea.priority),
  status: mapEstado(tarea.status),
  dueDate: tarea.dueDate,
  assignee: tarea.assignee,
  createdAt: tarea.createdAt,
});

interface UseTareasReturn {
  tasks: TaskItemData[];
  isLoading: boolean;
  error: string | null;
  toggleTask: (id: string) => Promise<void>;
  addTask: (dto: CreateTareaDto) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useTareas - Hook para gestionar tareas del dashboard
 *
 * Llama al backend GET /admin/tareas
 * Fallback a mock data si hay error
 */
export function useTareas(): UseTareasReturn {
  const [tasks, setTasks] = useState<TaskItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getTareas();
      setTasks(data.map(adaptTarea));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(message);
      console.warn('useTareas: Usando datos mock por error:', message);
      // Fallback a mock data
      setTasks(
        MOCK_TASKS.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description ?? null,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate ?? null,
          assignee: t.assignee ?? null,
          createdAt: t.createdAt,
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    try {
      const updated = await apiToggleTarea(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? adaptTarea(updated) : t)));
    } catch (err) {
      console.error('Error al toggle tarea:', err);
      // Optimistic update fallback
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t,
        ),
      );
    }
  }, []);

  const addTask = useCallback(async (dto: CreateTareaDto) => {
    try {
      const created = await createTarea(dto);
      setTasks((prev) => [adaptTarea(created), ...prev]);
    } catch (err) {
      console.error('Error al crear tarea:', err);
      throw err;
    }
  }, []);

  const removeTask = useCallback(async (id: string) => {
    try {
      await deleteTarea(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      throw err;
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    toggleTask,
    addTask,
    removeTask,
    refetch: fetchTasks,
  };
}
