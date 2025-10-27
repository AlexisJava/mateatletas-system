'use client';

import { motion } from 'framer-motion';
import { Shield, GraduationCap, Users, User } from 'lucide-react';
import type { UserRole } from '@/store/auth.store';

interface ModalSelectorRolProps {
  isOpen: boolean;
  roles: UserRole[];
  onSelectRole: (_role: UserRole) => void;
}

const ROLE_CONFIG = {
  admin: {
    title: 'Administrador',
    description: 'Gestión completa del sistema',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    shadowColor: 'shadow-purple-500/30',
  },
  docente: {
    title: 'Docente',
    description: 'Portal de clases y estudiantes',
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-600',
    shadowColor: 'shadow-blue-500/30',
  },
  tutor: {
    title: 'Tutor/Padre',
    description: 'Seguimiento de estudiantes',
    icon: Users,
    color: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-500/30',
  },
  estudiante: {
    title: 'Estudiante',
    description: 'Portal de aprendizaje',
    icon: User,
    color: 'from-orange-500 to-orange-600',
    shadowColor: 'shadow-orange-500/30',
  },
} as const;

export default function ModalSelectorRol({
  isOpen,
  roles,
  onSelectRole,
}: ModalSelectorRolProps) {
  if (!isOpen || roles.length <= 1) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl border border-slate-700"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Selecciona tu Rol
          </h2>
          <p className="mt-2 text-slate-400">
            Tienes múltiples roles disponibles. ¿Cómo querés ingresar?
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const config = ROLE_CONFIG[role];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <motion.button
                key={role}
                onClick={() => onSelectRole(role)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${config.color} p-6 text-left shadow-lg ${config.shadowColor} transition-all hover:shadow-xl`}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {config.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {config.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-all group-hover:translate-x-1 group-hover:text-white">
                  →
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Podrás cambiar de rol más tarde si lo necesitas
        </p>
      </motion.div>
    </div>
  );
}
