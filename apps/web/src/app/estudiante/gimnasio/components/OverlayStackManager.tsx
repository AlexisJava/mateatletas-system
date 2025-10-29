/**
 * Overlay Stack Manager - Renderiza todo el stack de overlays
 * Coordina múltiples overlays simultáneos con depth-aware rendering
 */

'use client';

import { AnimatePresence } from 'framer-motion';
import { useOverlayStack } from '../contexts/OverlayStackProvider';
import { useAuthStore } from '@/store/auth.store';
import { OverlayRenderer } from './OverlayRenderer';
import type { OverlayConfig, OverlayMetadata } from '../types/overlay.types';

// Importar vistas de overlays
import { MiGrupoView } from '../views/MiGrupoView';
import { MiProgresoView } from '../views/MiProgresoView';
import { NotificacionesView } from '../views/NotificacionesView';
import { AjustesView } from '../views/AjustesView';
import { EntrenamientosView } from '../views/EntrenamientosView';
import { PlanificacionClient } from '@/app/estudiante/planificaciones/[codigo]/PlanificacionClient';

/**
 * Configuración de metadatos para cada tipo de overlay
 */
const OVERLAY_METADATA: Record<string, OverlayMetadata> = {
  'mi-grupo': {
    gradient: 'from-cyan-400/20 to-blue-600/20',
    renderType: 'modal',
  },
  'mi-progreso': {
    gradient: 'from-cyan-600 via-blue-600 to-purple-700',
    renderType: 'modal',
  },
  'mis-logros': {
    gradient: 'from-yellow-600 via-amber-600 to-orange-700',
    renderType: 'modal',
  },
  'entrenamientos': {
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    renderType: 'modal',
  },
  'planificacion': {
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    renderType: 'modal',
  },
  'actividad': {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    renderType: 'modal',
  },
  'mis-cursos': {
    gradient: 'from-purple-600 via-violet-600 to-indigo-700',
    renderType: 'modal',
  },
  'tienda': {
    gradient: 'from-pink-600 via-rose-600 to-red-700',
    renderType: 'modal',
  },
  'notificaciones': {
    gradient: 'from-slate-800 via-gray-800 to-zinc-900',
    renderType: 'sidebar',
  },
  'ajustes': {
    gradient: 'from-slate-700 via-gray-700 to-zinc-800',
    renderType: 'modal',
  },
};

/**
 * Mapeo de tipos de overlay a componentes
 */
function getOverlayComponent(config: OverlayConfig): React.ComponentType<any> {
  switch (config.type) {
    case 'mi-grupo':
      return MiGrupoView;
    case 'mi-progreso':
      return MiProgresoView;
    case 'entrenamientos':
      return EntrenamientosView;
    case 'planificacion':
      return PlanificacionClient;
    case 'actividad':
      return PlaceholderView; // TODO: Implementar
    case 'mis-cursos':
      return PlaceholderView;
    case 'tienda':
      return PlaceholderView;
    case 'notificaciones':
      return NotificacionesView;
    case 'ajustes':
      return AjustesView;
    case 'mis-logros':
      return PlaceholderView;
    default:
      return PlaceholderView;
  }
}

/**
 * Componente placeholder para overlays no implementados
 */
function PlaceholderView({ config }: { config?: OverlayConfig }) {
  const emojiMap: Record<string, string> = {
    'mis-logros': '🏆',
    'mis-cursos': '📚',
    'tienda': '🛒',
    'actividad': '🎯',
  };

  const titleMap: Record<string, string> = {
    'mis-logros': 'MIS LOGROS',
    'mis-cursos': 'MIS CURSOS',
    'tienda': 'TIENDA',
    'actividad': 'ACTIVIDAD',
  };

  const emoji = config ? emojiMap[config.type] || '🚀' : '🚀';
  const title = config ? titleMap[config.type] || config.type.toUpperCase() : 'PRÓXIMAMENTE';

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-9xl mb-6">{emoji}</div>
        <h2 className="text-white text-6xl font-black mb-4 font-[family-name:var(--font-lilita)]">
          {title}
        </h2>
        <p className="text-white/80 text-2xl font-bold">Próximamente...</p>
      </div>
    </div>
  );
}

export function OverlayStackManager() {
  const { stack, pop } = useOverlayStack();
  const { user } = useAuthStore();

  // Datos del estudiante
  const estudiante = {
    nombre: user?.nombre || 'Estudiante',
    apellido: user?.apellido || '',
    nivel_actual: user?.nivel_actual || 1,
    puntos_totales: user?.puntos_totales || 0,
    avatar_url: user?.avatar_url || null,
    id: user?.sub || user?.id || '',
  };

  // Limitar renderizado a últimos 3 overlays para performance
  const visibleStack = stack.slice(-3);

  return (
    <AnimatePresence mode="sync">
      {visibleStack.map((config, index) => {
        // Calcular depth invertido (el último en array es depth 0)
        const depth = visibleStack.length - 1 - index;
        const isTop = depth === 0;

        // Obtener metadatos y componente
        const metadata = OVERLAY_METADATA[config.type] || {
          gradient: 'from-blue-900 via-indigo-900 to-purple-900',
          renderType: 'modal' as const,
        };
        const component = getOverlayComponent(config);

        // Key único para AnimatePresence
        const key = `${config.type}-${index}-${
          config.type === 'planificacion' ? config.codigo : ''
        }`;

        return (
          <OverlayRenderer
            key={key}
            config={config}
            depth={depth}
            isTop={isTop}
            onBackdropClick={pop}
            component={component}
            gradient={metadata.gradient}
            renderType={metadata.renderType}
            estudiante={estudiante}
          />
        );
      })}
    </AnimatePresence>
  );
}
