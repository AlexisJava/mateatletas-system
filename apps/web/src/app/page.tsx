'use client';

import Link from 'next/link';

export default function Home() {
  const portales = [
    {
      id: 'tutor',
      titulo: 'Portal Tutor',
      descripcion: 'Dashboard de tutores y padres',
      icon: '👨‍👩‍👧‍👦',
      ruta: '/login',
      color: 'from-[#ff6b35] to-[#f7b801]',
    },
    {
      id: 'estudiante',
      titulo: 'Portal Estudiante',
      descripcion: 'Dashboard con gamificación épica',
      icon: '🎮',
      ruta: '/estudiante/dashboard',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'docente',
      titulo: 'Portal Docente',
      descripcion: 'Gestión de clases y asistencia',
      icon: '👨‍🏫',
      ruta: '/docente/dashboard',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'admin',
      titulo: 'Portal Admin',
      descripcion: 'Panel de administración completo',
      icon: '⚙️',
      ruta: '/admin/dashboard',
      color: 'from-red-500 to-orange-500',
    },
  ];

  const accionesRapidas = [
    { titulo: 'Catálogo', icon: '📚', ruta: '/catalogo' },
    { titulo: 'Registro', icon: '📝', ruta: '/register' },
    { titulo: 'Equipos', icon: '🏆', ruta: '/equipos' },
    { titulo: 'Clases', icon: '📅', ruta: '/clases' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🏆</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mateatletas</h1>
                <p className="text-white/80 text-sm">Ecosistema de Aprendizaje</p>
              </div>
            </div>
            <div className="text-white/80 text-sm">
              <p>🚀 Modo Desarrollo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Bienvenido al Ecosistema 🎉
          </h2>
          <p className="text-xl text-white/90">
            Selecciona el portal al que quieres acceder
          </p>
        </div>

        {/* Portales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {portales.map((portal) => (
            <Link key={portal.id} href={portal.ruta}>
              <div className="bg-white rounded-2xl p-6 border-3 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all duration-200 cursor-pointer h-full">
                <div className="text-6xl mb-4">{portal.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {portal.titulo}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{portal.descripcion}</p>
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${portal.color} text-white text-xs font-bold`}>
                  Acceder →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            🔥 Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accionesRapidas.map((accion) => (
              <Link key={accion.titulo} href={accion.ruta}>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-4 text-white text-center hover:scale-105 transition-transform cursor-pointer border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <div className="text-4xl mb-2">{accion.icon}</div>
                  <p className="font-bold text-sm">{accion.titulo}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h4 className="text-lg font-bold text-white mb-4">ℹ️ Información</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-sm">
            <div>
              <p className="font-bold mb-1">Portal Estudiante</p>
              <p>✅ Modo MOCK activo</p>
              <p>✅ No requiere login</p>
            </div>
            <div>
              <p className="font-bold mb-1">Otros Portales</p>
              <p>🔐 Requieren autenticación</p>
            </div>
            <div>
              <p className="font-bold mb-1">Estado</p>
              <p>✅ Backend: :3001</p>
              <p>✅ Frontend: :3000</p>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-white/60 text-sm">
          <p>🤖 Desarrollado con Claude Code</p>
          <p className="mt-1">Fase 4 completada al 100%</p>
        </div>
      </main>
    </div>
  );
}
