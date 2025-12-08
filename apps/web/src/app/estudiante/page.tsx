'use client';

import { useAuthStore } from '@/store/auth.store';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Portal Estudiante - Página Placeholder
 * El nuevo frontend se está construyendo en otro repositorio
 */
export default function EstudiantePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/estudiante-login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚀</span>
        </div>

        <h1 className="text-3xl font-black mb-2">Portal Estudiante</h1>

        {user && (
          <p className="text-purple-300 mb-6">
            Bienvenido, <span className="font-bold">{user.nombre}</span>
          </p>
        )}

        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
          <p className="text-slate-400 mb-2">Nuevo frontend en construcción</p>
          <p className="text-sm text-slate-500">
            El portal de estudiantes está siendo rediseñado. Pronto tendrás acceso a todas las
            funcionalidades.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
