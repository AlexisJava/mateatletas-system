import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BellRing,
  ClipboardList,
  LayoutGrid,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'live', icon: Radio, label: 'En Vivo' },
    { id: 'alerts', icon: BellRing, label: 'Alertas' },
    { id: 'comisiones', icon: LayoutGrid, label: 'Comisiones' },
    { id: 'calendar', icon: Calendar, label: 'Calendario' },
    { id: 'plannings', icon: ClipboardList, label: 'Planificaciones' },
  ];

  return (
    <div className="w-full bg-slate-950/50 border-b border-slate-800/50 backdrop-blur-sm shrink-0">
      <nav className="flex items-center justify-center gap-2 px-4 py-2 max-w-[1600px] mx-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentView === item.id
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <item.icon
              size={16}
              className={`${currentView === item.id ? 'text-white' : 'text-slate-500'}`}
            />
            <span>{item.label}</span>
            {item.id === 'live' && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {item.id === 'alerts' && (
              <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                3
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
