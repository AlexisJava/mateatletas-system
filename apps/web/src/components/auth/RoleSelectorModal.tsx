'use client';

import { Shield, GraduationCap, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserRole } from '@/store/auth.store';

interface RoleSelectorModalProps {
  roles: UserRole[];
  onSelectRole: (role: UserRole) => void;
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: typeof Shield;
    gradient: string;
    shadow: string;
  }
> = {
  admin: {
    label: 'Administrador',
    description: 'Gestionar sistema, usuarios y configuración',
    icon: Shield,
    gradient: 'from-purple-600 to-violet-600',
    shadow: 'shadow-purple-500/50',
  },
  docente: {
    label: 'Docente',
    description: 'Gestionar clases, alumnos y contenido',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-cyan-600',
    shadow: 'shadow-blue-500/50',
  },
  tutor: {
    label: 'Padre/Madre',
    description: 'Ver progreso de tus hijos y gestionar inscripciones',
    icon: Heart,
    gradient: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/50',
  },
  estudiante: {
    label: 'Estudiante',
    description: 'Acceder a clases, ejercicios y tu perfil',
    icon: Users,
    gradient: 'from-orange-600 to-amber-600',
    shadow: 'shadow-orange-500/50',
  },
};

/**
 * Modal para seleccionar el rol con el que iniciar sesión
 * Se muestra cuando el usuario tiene múltiples roles (ej: ADMIN + DOCENTE)
 */
export default function RoleSelectorModal({ roles, onSelectRole }: RoleSelectorModalProps) {
  // Filtrar solo roles válidos que tienen configuración
  const availableRoles = roles.filter((role): role is UserRole => role in ROLE_CONFIG);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl max-w-2xl w-full shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="p-8 text-center border-b border-white/10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-2xl shadow-purple-500/50 mb-6"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-3">
              Selecciona tu Rol
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Tienes múltiples roles asignados. ¿Cómo quieres acceder hoy?
            </p>
          </div>

          {/* Role Cards */}
          <div className="p-8 space-y-4">
            {availableRoles.map((role, index) => {
              const config = ROLE_CONFIG[role];
              const Icon = config.icon;

              return (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => onSelectRole(role)}
                  className={`w-full p-6 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-2xl ${config.shadow} hover:scale-105 transition-all group`}
                >
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-all">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-2xl font-black text-white mb-1">{config.label}</div>
                      <div className="text-base text-white/90 font-medium">
                        {config.description}
                      </div>
                    </div>
                    <div className="text-white/80 text-2xl group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 bg-white/5 rounded-b-3xl">
            <p className="text-center text-sm text-white/60 font-medium">
              💡 Podrás cambiar de rol más tarde desde la configuración de tu perfil
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
