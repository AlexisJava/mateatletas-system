/**
 * Overlay Stack Manager - Renderiza todo el stack de overlays
 * Coordina múltiples overlays simultáneos con depth-aware rendering
 */

'use client';

import { AnimatePresence } from 'framer-motion';
import { useOverlayStack } from '../contexts/OverlayStackProvider';
import { useAuthStore } from '@/store/auth.store';
import { OverlayRenderer } from './OverlayRenderer';
import type { OverlayConfig, OverlayMetadata, OverlayComponentProps } from '../types/overlay.types';

// Importar vistas de overlays
import { MiGrupoView } from '../views/MiGrupoView';
import { MiProgresoView } from '../views/MiProgresoView';
import { MisLogrosView } from '../views/MisLogrosView';
import { RankingView } from '../views/RankingView';
import { NotificacionesView } from '../views/NotificacionesView';
import { AjustesView } from '../views/AjustesView';
import { ProximamenteView } from '../views/ProximamenteView';
import { CursosView } from '../views/CursosView';
import { MisCursosView } from '../views/MisCursosView';
import { AnimacionesView } from '../views/AnimacionesView';
import { PlanificacionView } from './overlays/PlanificacionView';
import { ActividadView } from './overlays/ActividadView';
import { EjecutarActividadView } from './overlays/EjecutarActividadView';
import { LaboratorioEcosistema } from './overlays/LaboratorioEcosistema';
import { TareasAsignadasOverlay } from './overlays/TareasAsignadasOverlay';
import { PlanificacionesSectorOverlay } from './overlays/PlanificacionesSectorOverlay';
import { TiendaView } from '../views/TiendaView';

/**
 * Configuración de metadatos para cada tipo de overlay
 */
const OVERLAY_METADATA: Record<OverlayConfig['type'], OverlayMetadata> = {
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
  'ranking': {
    gradient: 'from-indigo-600 via-purple-600 to-pink-700',
    renderType: 'modal',
  },
  'entrenamientos': {
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    renderType: 'modal',
  },
  'planificacion': {
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    renderType: 'fullscreen',
  },
  'tareas-asignadas': {
    gradient: 'from-purple-900 via-violet-900 to-indigo-900',
    renderType: 'modal',
  },
  'planificaciones-sector': {
    gradient: 'from-slate-900 via-purple-900 to-slate-900',
    renderType: 'modal',
  },
  'actividad': {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    renderType: 'fullscreen',
  },
  'laboratorio-ecosistema': {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    renderType: 'fullscreen',
  },
  'ejecutar-actividad': {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    renderType: 'fullscreen',
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
  'animaciones': {
    gradient: 'from-purple-900 via-indigo-900 to-blue-900',
    renderType: 'fullscreen',
  },
};

type OverlayComponent = React.ComponentType<OverlayComponentProps>;

const MiGrupoOverlay: OverlayComponent = ({ estudiante }) => (
  <MiGrupoView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      apellido: estudiante.apellido ?? '',
    }}
  />
);
const MiProgresoOverlay: OverlayComponent = ({ estudiante }) => (
  <MiProgresoView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      puntos_totales: estudiante.puntos_totales ?? 0,
    }}
  />
);
const MisLogrosOverlay: OverlayComponent = ({ estudiante }) => (
  <MisLogrosView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
    }}
  />
);
const RankingOverlay: OverlayComponent = ({ estudiante }) => (
  <RankingView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      apellido: estudiante.apellido ?? '',
    }}
  />
);
const NotificacionesOverlay: OverlayComponent = ({ estudiante }) => (
  <NotificacionesView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      apellido: estudiante.apellido ?? '',
    }}
  />
);
const ProximamenteOverlay: OverlayComponent = () => <ProximamenteView />;
const CursosOverlay: OverlayComponent = ({ estudiante }) => (
  <CursosView
    estudiante={{
      id: estudiante.id ?? '',
      username: estudiante.nombre || 'Estudiante',
      nivel_actual: estudiante.nivel_actual ?? 1,
    }}
  />
);
const MisCursosOverlay: OverlayComponent = ({ estudiante }) => (
  <MisCursosView
    estudiante={{
      id: estudiante.id ?? '',
      username: estudiante.nombre || 'Estudiante',
    }}
  />
);
const AnimacionesOverlay: OverlayComponent = ({ estudiante }) => (
  <AnimacionesView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      puntos_totales: estudiante.puntos_totales ?? 0,
      avatar_url: estudiante.avatar_url,
    }}
  />
);
const AjustesOverlay: OverlayComponent = () => <AjustesView />;
const PlanificacionOverlay: OverlayComponent = (props) => <PlanificacionView {...props} />;
const PlanificacionesSectorComponent: OverlayComponent = ({ config }) => (
  <PlanificacionesSectorOverlay config={config?.type === 'planificaciones-sector' ? config : undefined} />
);
const ActividadOverlay: OverlayComponent = ({ estudiante, config }) => {
  if (!config || config.type !== 'actividad' || !config.semanaId) {
    console.warn('ActividadOverlay requiere config.type "actividad" con semanaId definido');
    return null;
  }
  return (
    <ActividadView
      estudiante={estudiante}
      config={{ ...config, semanaId: config.semanaId }}
    />
  );
};
const LaboratorioOverlay: OverlayComponent = ({ config }) => {
  if (!config || config.type !== 'laboratorio-ecosistema' || !config.semanaId) {
    console.warn('LaboratorioOverlay requiere config.type "laboratorio-ecosistema" con semanaId');
    return null;
  }
  return <LaboratorioEcosistema semanaId={config.semanaId} />;
};
const EjecutarActividadOverlay: OverlayComponent = ({ estudiante, config }) => {
  if (!config || config.type !== 'ejecutar-actividad' || !config.actividadId || !config.semanaId) {
    console.warn('EjecutarActividadOverlay requiere config.type "ejecutar-actividad" con actividadId y semanaId');
    return null;
  }
  return (
    <EjecutarActividadView
      estudiante={estudiante}
      config={{
        ...config,
        actividadId: config.actividadId,
        semanaId: config.semanaId,
      }}
    />
  );
};
const TareasAsignadasComponent: OverlayComponent = () => <TareasAsignadasOverlay />;
const TiendaOverlay: OverlayComponent = ({ estudiante }) => (
  <TiendaView
    estudiante={{
      id: estudiante.id ?? '',
      nombre: estudiante.nombre || 'Estudiante',
      nivel_actual: estudiante.nivel_actual ?? 1,
    }}
  />
);

const overlayComponentMap: Record<OverlayConfig['type'], OverlayComponent> = {
  'mi-grupo': MiGrupoOverlay,
  'mi-progreso': MiProgresoOverlay,
  'mis-logros': MisLogrosOverlay,
  ranking: RankingOverlay,
  entrenamientos: ProximamenteOverlay,
  planificacion: PlanificacionOverlay,
  'tareas-asignadas': TareasAsignadasComponent,
  'planificaciones-sector': PlanificacionesSectorComponent,
  actividad: ActividadOverlay,
  'laboratorio-ecosistema': LaboratorioOverlay,
  'ejecutar-actividad': EjecutarActividadOverlay,
  'mis-cursos': MisCursosOverlay,
  tienda: TiendaOverlay,
  notificaciones: NotificacionesOverlay,
  ajustes: AjustesOverlay,
  animaciones: AnimacionesOverlay,
};

/**
 * Mapeo de tipos de overlay a componentes
 */
function getOverlayComponent(config: OverlayConfig): OverlayComponent {
  return overlayComponentMap[config.type] ?? PlaceholderView;
}

/**
 * Componente placeholder para overlays no implementados
 */
const PlaceholderView: OverlayComponent = ({ config }) => {
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
};

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

  // SOLO renderizar la vista actual (top del stack) - UNA SOLA VISTA LIMPIA
  const currentView = stack.length > 0 ? stack[stack.length - 1] : null;

  if (!currentView) {
    return null; // No hay vistas abiertas
  }

  // Obtener metadatos y componente
  const metadata = OVERLAY_METADATA[currentView.type] || {
    gradient: 'from-blue-900 via-indigo-900 to-purple-900',
    renderType: 'modal' as const,
  };
  const component = getOverlayComponent(currentView);

  // Key único para AnimatePresence (basado en tipo + params)
  const key = currentView.type === 'planificacion' && 'codigo' in currentView
    ? `${currentView.type}-${currentView.codigo}`
    : currentView.type === 'actividad' && 'semanaId' in currentView
    ? `${currentView.type}-${currentView.semanaId}`
    : currentView.type === 'ejecutar-actividad' && 'actividadId' in currentView
    ? `${currentView.type}-${currentView.actividadId}`
    : currentView.type === 'planificaciones-sector' && 'sectorNombre' in currentView
    ? `${currentView.type}-${currentView.sectorNombre}`
    : currentView.type;

  return (
    <AnimatePresence mode="wait">
      <OverlayRenderer
        key={key}
        config={currentView}
        depth={0}
        isTop={true}
        onBackdropClick={pop}
        component={component}
        gradient={metadata.gradient}
        renderType={metadata.renderType}
        estudiante={estudiante}
      />
    </AnimatePresence>
  );
}
