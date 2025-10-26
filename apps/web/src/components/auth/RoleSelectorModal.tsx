'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, GraduationCap, ArrowRight } from 'lucide-react';
import { UserRole } from '@/store/auth.store';

interface RoleSelectorModalProps {
  roles: UserRole[];
  onSelectRole: (role: UserRole) => void;
  userName: string;
}

/**
 * Modal de selección de rol/portal
 * Aparece cuando el usuario tiene múltiples roles (ej: ["docente", "admin"])
 */
export function RoleSelectorModal({
  roles,
  onSelectRole,
  userName,
}: RoleSelectorModalProps) {
  const roleConfig = {
    admin: {
      title: 'Portal Admin',
      description: 'Gestión completa del sistema',
      icon: Shield,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-500/10 to-indigo-600/10',
      borderColor: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/60',
      shadowColor: 'shadow-purple-500/20',
    },
    docente: {
      title: 'Portal Docente',
      description: 'Clases, estudiantes y planificaciones',
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/10 to-teal-600/10',
      borderColor: 'border-emerald-500/30',
      hoverBorder: 'hover:border-emerald-500/60',
      shadowColor: 'shadow-emerald-500/20',
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 blur-[80px] opacity-50" />

          {/* Modal content */}
          <div className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

            <div className="p-10">
              {/* Header */}
              <div className="text-center mb-8 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                >
                  <span className="text-sm text-emerald-400 font-semibold">
                    Bienvenido, {userName}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold tracking-tight"
                >
                  Selecciona tu portal
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-base"
                >
                  Tienes acceso a múltiples portales. ¿A cuál querés ingresar?
                </motion.p>
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles
                  .filter((role) => role === 'admin' || role === 'docente')
                  .map((role, index) => {
                    const config = roleConfig[role as 'admin' | 'docente'];
                    const Icon = config.icon;

                    return (
                      <motion.button
                        key={role}
                        initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => onSelectRole(role)}
                        className={`group relative p-6 rounded-2xl bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} ${config.hoverBorder} transition-all hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        {/* Icon */}
                        <div
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadowColor} mb-4`}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>

                        {/* Content */}
                        <div className="text-left space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                            {config.title}
                          </h3>
                          <p className="text-sm text-white/50 group-hover:text-white/60 transition-colors">
                            {config.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight
                            className="w-5 h-5 text-white/60"
                            strokeWidth={2.5}
                          />
                        </div>
                      </motion.button>
                    );
                  })}
              </div>

              {/* Footer note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-white/40">
                  Puedes cambiar de portal en cualquier momento desde la configuración
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
