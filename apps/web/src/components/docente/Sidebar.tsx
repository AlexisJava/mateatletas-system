'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Users, Calendar, Bell } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  /** Contador de notificaciones no leídas (opcional) */
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  notificationCount = 0,
}) => {
  const router = useRouter();

  const menuItems = [
    { id: 'hoy', icon: Sun, label: 'Hoy' },
    { id: 'grupos', icon: Users, label: 'Mis Grupos' },
    { id: 'calendario', icon: Calendar, label: 'Calendario' },
  ];

  const handleNotificationsClick = () => {
    router.push('/docente/notificaciones');
  };

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

        {/* Separador */}
        <div className="w-px h-6 bg-slate-800 mx-2" />

        {/* Link a Notificaciones */}
        <button
          onClick={handleNotificationsClick}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
        >
          <Bell size={16} className="text-slate-500" />
          <span>Notificaciones</span>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
