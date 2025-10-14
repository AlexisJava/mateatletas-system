'use client';

import {
  Users,
  Calendar,
  Trophy,
  BookOpen,
  Plus,
  Star,
  Clock,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Home,
  DollarSign,
  UserCheck,
  Rocket,
  Heart,
  Download,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function TutorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const hasChildren = true;

  const tabs = [
    { id: 'dashboard', label: 'Resumen', icon: Home },
    { id: 'hijos', label: 'Mis Hijos', icon: Users },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'pagos', label: 'Pagos', icon: DollarSign },
    { id: 'ayuda', label: 'Ayuda', icon: UserCheck },
  ];

  if (!hasChildren) {
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
                  <h1 className="text-2xl font-bold text-gray-900">Mate atletas</h1>
                  <p className="text-xs text-gray-500">Entrena tu mente como un atleta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Carlos Rodríguez</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  C
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CreditCard className="w-4 h-4" />
              ¡Bienvenido a Mate atletas!
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Comienza el viaje de aprendizaje
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                de tu hijo hoy
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Estás a solo 3 pasos de darle a tu hijo acceso a clases en vivo, un tutor IA 24/7, y
              una comunidad de aprendizaje increíble.
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
                  Nombre, edad e intereses. Toma menos de 2 minutos y nos ayuda a personalizar su
                  experiencia.
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Agregar mi primer hijo
                </button>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300" />
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg opacity-60 border-t-4 border-gray-300">
                <div className="w-16 h-16 rounded-2xl bg-gray-300 flex items-center justify-center text-white text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Explora el catálogo</h3>
                <p className="text-gray-600 mb-6">
                  Descubre clases de matemáticas, ciencias, programación y más. Todas diseñadas para
                  hacer que aprender sea divertido.
                </p>
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                >
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
                Elige el horario que mejor funcione para tu familia. Clases en vivo con grupos
                pequeños y profesores expertos.
              </p>
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                ¿Qué hace especial a Mate atletas?
              </h3>
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
                    Eventos semanales, desafíos y una comunidad donde tu hijo hace amigos mientras
                    aprende.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Lo que dicen otros padres
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
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
              ].map((testimonial, idx) => (
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
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Esto es lo que tu hijo logrará
            </h3>
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
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg inline-flex items-center gap-3">
              <Plus className="w-6 h-6" />
              Agregar mi primer hijo
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <header className="bg-white border-b-2 border-gray-300 shadow-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                🎓
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mate atletas</h1>
                <p className="text-xs text-gray-500">Panel de Padres</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">Carlos Rodríguez</p>
                <p className="text-xs text-gray-500">Plan Familiar</p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                C
              </div>
            </div>
          </div>

          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <div className="h-full grid grid-rows-[auto_auto_1fr] gap-4">
              {/* Greeting section */}
              <div
                className="rounded-xl p-4 shadow-lg border-2 border-indigo-200"
                style={{
                  background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                }}
              >
                <h2 className="text-2xl font-bold text-white">¡Hola, Carlos! 👋</h2>
                <p className="text-indigo-100">
                  Bienvenido de vuelta. Aquí está el resumen de hoy.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                <h2 className="text-base font-bold text-gray-900 mb-3">Resumen de Hoy</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-indigo-200"
                    style={{
                      background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">Clases Hoy</p>
                        <p className="text-3xl font-bold">2</p>
                      </div>
                      <Calendar className="w-10 h-10 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estado Pago</p>
                        <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Al día
                        </p>
                      </div>
                      <CreditCard className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-200 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Asistencia</p>
                        <p className="text-3xl font-bold text-gray-900">100%</p>
                      </div>
                      <UserCheck className="w-10 h-10 text-gray-300" />
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-5 shadow-md border-2 border-amber-200"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-medium opacity-90">XP Total</p>
                        <p className="text-3xl font-bold">12.4K</p>
                      </div>
                      <Star className="w-10 h-10 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Content remains symmetrical 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Left Column */}
                <div className="space-y-4 overflow-hidden">
                  <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-900">Mis Hijos</h2>
                      <button
                        onClick={() => setActiveTab('hijos')}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                      >
                        Ver detalles
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          name: 'María',
                          age: 12,
                          xp: '8.4K',
                          streak: 7,
                          nextClass: 'Hoy 16:00',
                          initial: 'M',
                        },
                        {
                          name: 'Juan',
                          age: 9,
                          xp: '4.0K',
                          streak: 3,
                          nextClass: 'Mañana 15:00',
                          initial: 'J',
                        },
                      ].map((child, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                              style={{
                                background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                              }}
                            >
                              {child.initial}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{child.name}</h3>
                              <p className="text-sm text-gray-500">{child.age} años</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">XP</p>
                              <p className="font-bold text-indigo-600">{child.xp}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">🔥 {child.streak} días</span>
                            <span className="text-gray-600">📅 {child.nextClass}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 overflow-hidden">
                  <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-gray-900">Clases de Hoy</h2>
                      <button
                        onClick={() => setActiveTab('calendario')}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
                      >
                        Ver calendario
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          time: '16:00',
                          subject: 'Matemáticas Nivel 3',
                          child: 'María',
                          teacher: 'Prof. Ana García',
                          color: '#6366F1',
                        },
                        {
                          time: '18:00',
                          subject: 'Álgebra Básica',
                          child: 'Juan',
                          teacher: 'Prof. Carlos Ruiz',
                          color: '#F59E0B',
                        },
                      ].map((clase, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white shadow-md"
                                style={{
                                  background: `linear-gradient(135deg, ${clase.color} 0%, ${clase.color}dd 100%)`,
                                }}
                              >
                                <Clock className="w-5 h-5 mb-1" />
                                <span className="font-bold text-sm">{clase.time}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{clase.subject}</h3>
                                <p className="text-sm text-gray-600">
                                  {clase.child} • {clase.teacher}
                                </p>
                              </div>
                            </div>
                            <button
                              className="font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm text-white"
                              style={{
                                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                              }}
                            >
                              Unirse
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hijos' && (
            <div className="h-full grid grid-rows-[1fr_auto] gap-4 overflow-hidden">
              {/* Children Grid - Top Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
                {[
                  {
                    name: 'María Rodríguez',
                    age: 12,
                    initial: 'M',
                    xp: 8450,
                    streak: 7,
                    level: 12,
                    achievements: 15,
                    classesCompleted: 48,
                    nextClass: 'Hoy 16:00 - Matemáticas Nivel 3',
                    recentActivity: [
                      { action: 'Completó clase de Álgebra', time: 'Hace 2 horas', icon: '✅' },
                      { action: "Ganó insignia 'Maestro del Cálculo'", time: 'Ayer', icon: '🏆' },
                      { action: 'Racha de 7 días', time: 'Hoy', icon: '🔥' },
                    ],
                  },
                  {
                    name: 'Juan Rodríguez',
                    age: 9,
                    initial: 'J',
                    xp: 4020,
                    streak: 3,
                    level: 7,
                    achievements: 8,
                    classesCompleted: 23,
                    nextClass: 'Mañana 15:00 - Geometría Básica',
                    recentActivity: [
                      {
                        action: 'Completó ejercicios con Tutor IA',
                        time: 'Hace 1 hora',
                        icon: '🤖',
                      },
                      { action: 'Asistió a clase de Fracciones', time: 'Hace 3 horas', icon: '✅' },
                      { action: 'Subió al Nivel 7', time: 'Hace 2 días', icon: '⬆️' },
                    ],
                  },
                ].map((child, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-300">
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                        }}
                      >
                        {child.initial}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{child.name}</h2>
                        <p className="text-gray-600">
                          {child.age} años • Nivel {child.level}
                        </p>
                      </div>
                      <button className="bg-[#F59E0B] hover:bg-[#E67E00] text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all">
                        Reservar Clase
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-[#6366F1]" />
                          <p className="text-sm font-medium text-gray-600">XP Total</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {child.xp.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-5 h-5 text-[#F59E0B]" />
                          <p className="text-sm font-medium text-gray-600">Logros</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{child.achievements}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-gray-600">Racha</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{child.streak} días</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-medium text-gray-600">Clases</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{child.classesCompleted}</p>
                      </div>
                    </div>

                    {/* Next Class */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-[#6366F1]" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Próxima Clase</p>
                            <p className="font-bold text-gray-900">{child.nextClass}</p>
                          </div>
                        </div>
                        <button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm">
                          Ver Detalles
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Actividad Reciente</h3>
                      <div className="space-y-2">
                        {child.recentActivity.map((activity, actIdx) => (
                          <div
                            key={actIdx}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-3"
                          >
                            <span className="text-2xl">{activity.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.action}</p>
                              <p className="text-sm text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lambda AI Tutor card */}
              <div
                className="rounded-xl p-4 shadow-lg border-2 border-purple-300 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">Lambda - Tu Tutor de IA</h3>
                      <p className="text-sm text-purple-100">
                        Áreas detectadas donde tus hijos pueden mejorar
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                          M
                        </div>
                        <h4 className="font-bold text-white text-sm">María</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-semibold text-xs">
                          ⚠️ Ecuaciones Cuadráticas
                        </p>
                        <p className="text-purple-200 text-xs">💡 Reforzar factorización</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                          J
                        </div>
                        <h4 className="font-bold text-white text-sm">Juan</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-semibold text-xs">⚠️ Fracciones Mixtas</p>
                        <p className="text-purple-200 text-xs">💡 Ejercicios de conversión</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-purple-100 text-xs">
                      <span className="font-semibold">Actualizado:</span> Hace 2 horas
                    </p>
                    <button className="bg-white hover:bg-gray-100 text-purple-700 font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm">
                      <Plus className="w-4 h-4" />
                      Agregar Tareas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendario' && (
            <div className="h-full overflow-hidden">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Actividades de la Semana</h2>
                    <p className="text-gray-600">14 - 20 Octubre 2025</p>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md">
                    + Reservar Clase
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="space-y-4 h-full overflow-y-auto pr-2">
                    {[
                      {
                        day: 'Lunes 14',
                        classes: [
                          {
                            time: '16:00 - 17:00',
                            subject: 'Matemáticas Nivel 3',
                            child: 'María',
                            teacher: 'Prof. Ana García',
                            status: 'confirmed',
                          },
                          {
                            time: '18:00 - 19:00',
                            subject: 'Álgebra Básica',
                            child: 'Juan',
                            teacher: 'Prof. Carlos Ruiz',
                            status: 'confirmed',
                          },
                        ],
                      },
                      {
                        day: 'Martes 15',
                        classes: [
                          {
                            time: '15:00 - 16:00',
                            subject: 'Geometría Básica',
                            child: 'Juan',
                            teacher: 'Prof. Laura Pérez',
                            status: 'confirmed',
                          },
                        ],
                      },
                      {
                        day: 'Miércoles 16',
                        classes: [
                          {
                            time: '16:30 - 17:30',
                            subject: 'Cálculo Avanzado',
                            child: 'María',
                            teacher: 'Prof. Ana García',
                            status: 'confirmed',
                          },
                        ],
                      },
                      {
                        day: 'Jueves 17',
                        classes: [
                          {
                            time: '16:00 - 17:00',
                            subject: 'Fracciones Avanzadas',
                            child: 'Juan',
                            teacher: 'Prof. Carlos Ruiz',
                            status: 'pending',
                          },
                        ],
                      },
                      {
                        day: 'Viernes 18',
                        classes: [
                          {
                            time: '15:00 - 16:00',
                            subject: 'Trigonometría',
                            child: 'María',
                            teacher: 'Prof. Ana García',
                            status: 'pending',
                          },
                        ],
                      },
                    ].map((daySchedule, dayIdx) => (
                      <div key={dayIdx} className="border-l-4 border-indigo-600 pl-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{daySchedule.day}</h3>
                        <div className="space-y-3">
                          {daySchedule.classes.map((clase, claseIdx) => (
                            <div
                              key={claseIdx}
                              className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <div
                                    className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shadow-md"
                                    style={{
                                      background:
                                        'linear-gradient(135deg, #6366F1 0%, #6366F1dd 100%)',
                                    }}
                                  >
                                    <Clock className="w-5 h-5 mb-1" />
                                    <span className="font-bold text-xs">
                                      {clase.time.split(' - ')[0]}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">
                                      {clase.subject}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {clase.child} • {clase.teacher}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{clase.time}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {clase.status === 'confirmed' ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                      Confirmada
                                    </span>
                                  ) : (
                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                                      Pendiente
                                    </span>
                                  )}
                                  <button className="bg-[#F59E0B] hover:bg-[#E67E00] text-white font-semibold py-2 px-4 rounded-lg shadow-md text-sm">
                                    Unirse
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagos' && (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
              {/* Left Column - Payment Summary */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300 overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Estado de Pago</h2>

                {/* Status Badge */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-700">Al día</h3>
                      <p className="text-sm text-green-600">Tu membresía está activa</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Plan Actual</p>
                    <p className="text-2xl font-bold text-gray-900">Plan Familiar</p>
                    <p className="text-lg text-gray-600 mt-1">$49.99/mes</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Abonado</p>
                    <p className="text-3xl font-bold text-gray-900">$299.94</p>
                    <p className="text-sm text-gray-600 mt-1">6 meses de membresía</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Último Pago</p>
                    <p className="text-xl font-bold text-gray-900">15 Octubre 2025</p>
                    <p className="text-sm text-gray-600 mt-1">$49.99 • Visa •••• 4242</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-200">
                    <p className="text-sm font-medium text-gray-600 mb-2">Próximo Pago</p>
                    <p className="text-xl font-bold text-gray-900">15 Noviembre 2025</p>
                    <p className="text-sm text-gray-600 mt-1">$49.99 • Renovación automática</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Método de Pago</h3>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-lg mb-3">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-xl font-bold">VISA</div>
                      <div className="text-xl">💳</div>
                    </div>
                    <div className="text-lg font-mono mb-3">•••• •••• •••• 4242</div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="opacity-80 text-xs">Titular</p>
                        <p className="font-semibold">Carlos Rodríguez</p>
                      </div>
                      <div className="text-right">
                        <p className="opacity-80 text-xs">Vence</p>
                        <p className="font-semibold">12/27</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200">
                    Actualizar Método de Pago
                  </button>
                </div>
              </div>

              {/* Right Column - Payment History */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Historial de Pagos</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                </div>

                {/* Date Filter */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <select className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 font-semibold text-sm">
                      <option>Últimos 6 meses</option>
                      <option>Último año</option>
                      <option>Todo el historial</option>
                    </select>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                      Filtrar
                    </button>
                  </div>
                </div>

                {/* Payment History List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {[
                    {
                      date: '15 Oct 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Sep 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Ago 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Jul 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Jun 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 May 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Abr 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                    {
                      date: '15 Mar 2025',
                      amount: '$49.99',
                      status: 'Pagado',
                      method: 'Visa •••• 4242',
                    },
                  ].map((payment, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{payment.amount}</p>
                          <p className="text-sm text-gray-600">{payment.date}</p>
                          <p className="text-xs text-gray-500">{payment.method}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {payment.status}
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ayuda' && (
            <div className="h-full overflow-hidden">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Centro de Ayuda</h2>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {/* Contact Support */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                        }}
                      >
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Contactar Soporte</h3>
                        <p className="text-gray-600 mb-4">
                          Nuestro equipo está disponible de lunes a viernes de 9:00 a 18:00 para
                          ayudarte con cualquier consulta.
                        </p>
                        <div className="space-y-2">
                          <a
                            href="mailto:soporte@mateatletas.com"
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            📧 soporte@mate atletas.com
                          </a>
                          <a
                            href="tel:+5491112345678"
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            📞 +54 9 11 1234-5678
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Help Topics */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Temas Frecuentes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Reservar una Clase',
                          description: 'Aprende cómo reservar clases para tus hijos',
                          icon: '📅',
                        },
                        {
                          title: 'Gestionar Pagos',
                          description: 'Información sobre facturación y métodos de pago',
                          icon: '💳',
                        },
                        {
                          title: 'Problemas Técnicos',
                          description: 'Soluciona problemas de conexión o acceso',
                          icon: '🔧',
                        },
                        {
                          title: 'Seguimiento de Progreso',
                          description: 'Cómo ver el avance de tus hijos',
                          icon: '📊',
                        },
                      ].map((topic, idx) => (
                        <button
                          key={idx}
                          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 border-2 border-gray-200 text-left transition-all"
                        >
                          <div className="text-3xl mb-2">{topic.icon}</div>
                          <h4 className="font-bold text-gray-900 mb-1">{topic.title}</h4>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recursos Útiles</h3>
                    <div className="space-y-3">
                      {[
                        { title: 'Guía de Inicio Rápido', link: '#', icon: '📖' },
                        { title: 'Preguntas Frecuentes (FAQ)', link: '#', icon: '❓' },
                        { title: 'Tutoriales en Video', link: '#', icon: '🎥' },
                        { title: 'Comunidad de Padres', link: '#', icon: '👥' },
                      ].map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.link}
                          className="bg-white hover:bg-gray-50 rounded-lg p-4 border-2 border-gray-200 flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{resource.icon}</span>
                            <span className="font-semibold text-gray-900">{resource.title}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      ¿Necesitas ayuda urgente?
                    </h3>
                    <p className="text-red-700 mb-4">
                      Si tienes un problema urgente durante una clase o necesitas asistencia
                      inmediata, contáctanos por WhatsApp.
                    </p>
                    <a
                      href="https://wa.me/5491112345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
                    >
                      💬 WhatsApp de Emergencia
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
