'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { Card, Button } from '@/components/ui';

/**
 * Dashboard del Tutor - Página principal después del login
 * Ruta: /dashboard
 *
 * Esta página está protegida por el ProtectedLayout
 * Muestra resumen de la cuenta y acciones rápidas
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { total, isLoading, fetchEstudiantes } = useEstudiantesStore();

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  /**
   * Genera saludo según la hora del día
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  /**
   * Frases motivacionales aleatorias
   */
  const motivationalPhrases = [
    '¡Listo para seguir aprendiendo y creciendo!',
    'Cada día es una nueva oportunidad para crecer',
    '¡El éxito comienza con el primer paso!',
    'Hoy es un gran día para alcanzar tus metas',
    '¡Sigue adelante, estás haciendo un gran trabajo!',
  ];

  const randomPhrase =
    motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sección 1: Bienvenida personalizada */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7b801] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          {getGreeting()}, {user?.nombre}! 👋
        </h1>
        <p className="text-lg opacity-90">{randomPhrase}</p>
      </div>

      {/* Sección 2: Resumen de cuenta (cards) */}
      <div>
        <h2 className="text-2xl font-bold text-[#2a1a5e] mb-4">
          Resumen de tu cuenta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Membresía */}
          <StatCard
            icon="💳"
            title="Membresía"
            value="Inactiva"
            badge="inactive"
            color="gray"
          />

          {/* Card 2: Estudiantes */}
          <StatCard
            icon="👥"
            title="Estudiantes"
            value={isLoading ? '...' : total}
            subtitle="hijos registrados"
            color="blue"
          />

          {/* Card 3: Próximas clases */}
          <StatCard
            icon="📅"
            title="Clases esta semana"
            value="0"
            subtitle="clases reservadas"
            color="green"
          />

          {/* Card 4: Puntos del equipo */}
          <StatCard
            icon="🏆"
            title="Puntos del equipo"
            value="0"
            subtitle="puntos acumulados"
            color="yellow"
          />
        </div>
      </div>

      {/* Sección 3: Acciones rápidas (botones grandes) */}
      <Card>
        <h2 className="text-2xl font-bold text-[#2a1a5e] mb-6">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Botón 1: Reservar Clases */}
          <Link href="/clases">
            <Button
              variant="primary"
              className="w-full h-20 text-lg flex items-center justify-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                📚
              </span>
              Reservar Clases
            </Button>
          </Link>

          {/* Botón 2: Mis Clases */}
          <Link href="/mis-clases">
            <Button
              variant="secondary"
              className="w-full h-20 text-lg flex items-center justify-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🎫
              </span>
              Mis Clases
            </Button>
          </Link>

          {/* Botón 3: Agregar Estudiante */}
          <Link href="/estudiantes">
            <Button
              variant="outline"
              className="w-full h-20 text-lg flex items-center justify-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                ➕
              </span>
              Agregar Estudiante
            </Button>
          </Link>

          {/* Botón 4: Ver Catálogo */}
          <Link href="/catalogo">
            <Button
              variant="outline"
              className="w-full h-20 text-lg flex items-center justify-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🎓
              </span>
              Ver Catálogo
            </Button>
          </Link>
        </div>
      </Card>

      {/* Call to action si no tiene membresía */}
      <Card className="bg-gradient-to-r from-[#00d9ff]/20 to-[#f7b801]/20 border-2 border-[#00d9ff]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🎯</span>
              <h3 className="text-2xl font-bold text-[#2a1a5e]">
                ¡Activa tu membresía!
              </h3>
            </div>
            <p className="text-[#2a1a5e]/70 text-lg">
              Accede a clases ilimitadas, contenido exclusivo y mucho más.
            </p>
          </div>

          <Link href="/dashboard/membresia/planes">
            <Button variant="primary" size="lg" className="whitespace-nowrap">
              Ver planes →
            </Button>
          </Link>
        </div>
      </Card>

      {/* Información adicional del perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Información del perfil */}
        <Card title="Tu información">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nombre completo</p>
              <p className="font-semibold text-[#2a1a5e]">
                {user?.nombre} {user?.apellido}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-[#2a1a5e] break-all">
                {user?.email}
              </p>
            </div>
            {user?.telefono && (
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-semibold text-[#2a1a5e]">
                  {user.telefono}
                </p>
              </div>
            )}
            <Link
              href="/dashboard/perfil"
              className="inline-flex items-center gap-1 mt-4 text-sm text-[#ff6b35] hover:underline font-semibold"
            >
              Editar perfil
              <span>→</span>
            </Link>
          </div>
        </Card>

        {/* Card: Progreso del perfil */}
        <Card title="Completitud del perfil">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-24 h-24 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Círculo de fondo */}
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Círculo de progreso (0% por defecto) */}
                <circle
                  className="text-[#ff6b35] transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#2a1a5e]">0%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Completa tu perfil para desbloquear todas las funcionalidades
            </p>
            <Link
              href="/dashboard/perfil"
              className="mt-3 text-sm text-[#ff6b35] hover:underline font-semibold"
            >
              Completar ahora
            </Link>
          </div>
        </Card>

        {/* Card: Próximos pasos */}
        <Card title="Próximos pasos">
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">☐</span>
              <span className="text-gray-700">
                Agregar tu primer estudiante
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">☐</span>
              <span className="text-gray-700">
                Explorar el catálogo de clases
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">☐</span>
              <span className="text-gray-700">
                Activar tu membresía
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">☐</span>
              <span className="text-gray-700">
                Reservar tu primera clase
              </span>
            </li>
          </ul>
          <Link
            href="/dashboard/guia"
            className="inline-flex items-center gap-1 mt-4 text-sm text-[#ff6b35] hover:underline font-semibold"
          >
            Ver guía completa
            <span>→</span>
          </Link>
        </Card>
      </div>
    </div>
  );
}

/**
 * Componente auxiliar para cards de estadísticas
 */
interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: 'active' | 'inactive';
  color: 'gray' | 'blue' | 'green' | 'yellow';
}

function StatCard({ icon, title, value, subtitle, badge, color }: StatCardProps) {
  const colorClasses = {
    gray: 'from-gray-100 to-gray-50 text-gray-700',
    blue: 'from-blue-100 to-blue-50 text-blue-700',
    green: 'from-green-100 to-green-50 text-green-700',
    yellow: 'from-yellow-100 to-yellow-50 text-yellow-700',
  };

  const badgeClasses = {
    active: 'bg-green-100 text-green-700 border-green-300',
    inactive: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
      {/* Icono */}
      <div
        className={`inline-flex p-3 rounded-full mb-4 bg-gradient-to-br ${colorClasses[color]}`}
      >
        <span className="text-3xl">{icon}</span>
      </div>

      {/* Título */}
      <p className="text-sm text-[#2a1a5e]/70 mb-2 font-medium">{title}</p>

      {/* Valor principal */}
      <div className="mb-2">
        {badge ? (
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${badgeClasses[badge]}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-4xl font-bold text-[#2a1a5e]">{value}</p>
        )}
      </div>

      {/* Subtítulo */}
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </Card>
  );
}
