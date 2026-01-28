'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type AuthUser } from '@/lib/api/auth.api';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  RefreshCw,
  Loader2,
  CheckCircle,
  Key,
  Users,
} from 'lucide-react';
import { tutoresApi } from '@/lib/api/tutores.api';

export default function TutorPerfilPage(): React.ReactNode {
  const router = useRouter();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hijosCount, setHijosCount] = useState(0);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [profileData, dashboardData] = await Promise.all([
        authApi.getProfile(),
        tutoresApi.getDashboardResumen(),
      ]);
      setProfile(profileData);
      setHijosCount(dashboardData.hijos.length);
    } catch (err) {
      setError(getErrorMessage(err, 'Error al cargar perfil'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tutor/dashboard')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-7 h-7 text-purple-400" />
            Mi Perfil
          </h1>
          <p className="text-gray-400 mt-1">Información de tu cuenta</p>
        </div>
        <button
          onClick={loadProfile}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.nombre.charAt(0)}
              {profile.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profile.nombre} {profile.apellido}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Tutor
                </span>
                {profile.haCompletadoOnboarding && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            {profile.telefono && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p className="text-white">{profile.telefono}</p>
                </div>
              </div>
            )}

            {/* DNI */}
            {profile.dni && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">DNI</p>
                  <p className="text-white">{profile.dni}</p>
                </div>
              </div>
            )}

            {/* Registration Date */}
            {profile.fechaRegistro && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Miembro desde</p>
                  <p className="text-white">
                    {new Date(profile.fechaRegistro).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Hijos Count */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Hijos registrados</p>
                <p className="text-white">{hijosCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-400" />
            Seguridad
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/reset-password')}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-yellow-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Cambiar contraseña</p>
                  <p className="text-xs text-gray-400">Actualiza tu contraseña de acceso</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Accesos rápidos</h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/tutor/notificaciones')}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white text-sm">Notificaciones</span>
            </button>

            <button
              onClick={() => router.push('/tutor/historial-pagos')}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white text-sm">Historial Pagos</span>
            </button>

            <button
              onClick={() => router.push('/tutor/verano')}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
            >
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-white text-sm">Verano</span>
            </button>

            <button
              onClick={() => router.push('/tutor/dashboard')}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white text-sm">Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
