'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AuthUser } from '@/lib/api/auth.api';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Rocket,
  Heart,
  Plus,
  Star,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface OnboardingViewProps {
  user: AuthUser;
}

export default function OnboardingView({ user }: OnboardingViewProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  const testimonials = [
    {
      name: 'María González',
      role: 'Madre de 2 hijos',
      text: 'Mis hijos están más motivados que nunca. La flexibilidad de horarios es perfecta para nuestra familia.',
      rating: 5,
    },
    {
      name: 'Roberto Martínez',
      role: 'Padre de Sofía (10 años)',
      text: 'El tutor IA es increíble. Mi hija puede practicar a su ritmo y siempre tiene ayuda disponible.',
      rating: 5,
    },
    {
      name: 'Ana Fernández',
      role: 'Madre de Lucas (8 años)',
      text: 'Lucas pasó de odiar las matemáticas a pedirme que reserve más clases. ¡Es un milagro!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                🎓
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mateatletas</h1>
                <p className="text-xs text-gray-500">Entrena tu mente como un atleta</p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative">
              <span className="text-sm text-gray-600 hidden sm:block">{user?.nombre} {user?.apellido}</span>

              {/* User Menu Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.nombre?.[0]?.toUpperCase() || 'T'}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop para cerrar el menú */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 overflow-hidden">
                    {/* User Info */}
                    <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <CreditCard className="w-4 h-4" />
            ¡Bienvenido a Mateatletas!
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Comienza el viaje de aprendizaje
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              de tu hijo hoy
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Estás a solo 3 pasos de darle a tu hijo acceso a clases en vivo, un tutor IA 24/7, y una comunidad de aprendizaje increíble.
          </p>
        </div>

        {/* Onboarding Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-blue-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Crea el perfil de tu hijo</h3>
              <p className="text-gray-600 mb-6">
                Nombre, edad e intereses. Toma menos de 2 minutos y nos ayuda a personalizar su experiencia.
              </p>
              <Link href="/estudiantes">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Agregar mi primer hijo
                </button>
              </Link>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300" />
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-lg opacity-60 border-t-4 border-gray-300">
              <div className="w-16 h-16 rounded-2xl bg-gray-300 flex items-center justify-center text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Explora el catálogo</h3>
              <p className="text-gray-600 mb-6">
                Descubre clases de matemáticas, ciencias, programación y más. Todas diseñadas para hacer que aprender sea divertido.
              </p>
              <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed">
                Próximamente
              </button>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200" />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg opacity-60 border-t-4 border-gray-300">
            <div className="w-16 h-16 rounded-2xl bg-gray-300 flex items-center justify-center text-white text-2xl font-bold mb-6">
              3
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Reserva la primera clase</h3>
            <p className="text-gray-600 mb-6">
              Elige el horario que mejor funcione para tu familia. Clases en vivo con grupos pequeños y profesores expertos.
            </p>
            <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed">
              Próximamente
            </button>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">¿Qué hace especial a Mateatletas?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-4xl">
                  📅
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Flexibilidad Total</h4>
                <p className="text-blue-100">
                  Clases en vivo cuando te convenga. Sin horarios fijos ni compromisos rígidos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-4xl">
                  🤖
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Tutor IA 24/7</h4>
                <p className="text-blue-100">
                  Tu hijo puede practicar y resolver dudas en cualquier momento, día o noche.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-4xl">
                  👥
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Comunidad Activa</h4>
                <p className="text-blue-100">
                  Eventos semanales, desafíos y una comunidad donde tu hijo hace amigos mientras aprende.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Lo que dicen otros padres</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="bg-white rounded-3xl p-12 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Esto es lo que tu hijo logrará</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">23+</p>
              <p className="text-gray-600">Insignias por desbloquear</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">50+</p>
              <p className="text-gray-600">Clases disponibles</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">500+</p>
              <p className="text-gray-600">Estudiantes activos</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">98%</p>
              <p className="text-gray-600">Padres satisfechos</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para comenzar?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Crea el perfil de tu hijo y reserva su primera clase hoy mismo.
          </p>
          <Link href="/estudiantes">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg inline-flex items-center gap-3">
              <Plus className="w-6 h-6" />
              Agregar mi primer hijo
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
