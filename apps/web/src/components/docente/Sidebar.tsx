import React from 'react';
import { Sun, Users, Calendar } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'hoy', icon: Sun, label: 'Hoy' },
    { id: 'grupos', icon: Users, label: 'Mis Grupos' },
    { id: 'calendario', icon: Calendar, label: 'Calendario' },
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
          </button>
        ))}
      </nav>
    </div>
  );
};
