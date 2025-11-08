import Link from 'next/link';

export default function Hero() {
  return (
    <section className="section-landing" style={{ paddingTop: '160px', paddingBottom: '120px' }} id="mundos">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            <span className="title-gradient">3 Mundos,</span>
            <br />
            <span className="text-white">Infinitas</span>
            <br />
            <span className="title-gradient">Posibilidades</span>
          </h1>

          <p className="text-xl text-white/80 leading-relaxed max-w-xl">
            Explora nuestros mundos de Programación, Matemáticas y Ciencias.
            Gamificación real, proyectos épicos y comunidad activa.
          </p>

          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                💻
              </div>
              <span className="text-white font-semibold text-base">
                Mundo Programación: Roblox, Python, JS
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🔢
              </div>
              <span className="text-white font-semibold text-base">
                Mundo Matemáticas: Olimpiadas, Financieras
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🔬
              </div>
              <span className="text-white font-semibold text-base">
                Mundo Ciencias: Astronomía, Química, Física
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <span className="text-white font-semibold text-base">
                Sistema de casas y torneos épicos
              </span>
            </li>
          </ul>

          <div className="flex gap-5 pt-4">
            <Link href="/register" className="btn-pulse">
              Comenzar Ahora
            </Link>
            <Link href="#mundos" className="btn-arrow">
              Ver Mundos
            </Link>
          </div>
        </div>

        {/* Right Column - World Cards */}
        <div className="flex flex-col gap-6">
          {/* Programación Card */}
          <div className="world-card prog">
            <span className="world-icon">💻</span>
            <div className="flex-1">
              <div className="world-title">Programación</div>
              <div className="world-desc">
                Roblox, Python, JavaScript, desarrollo web y apps móviles
              </div>
            </div>
          </div>

          {/* Matemáticas Card */}
          <div className="world-card math">
            <span className="world-icon">🔢</span>
            <div className="flex-1">
              <div className="world-title">Matemáticas</div>
              <div className="world-desc">
                Álgebra, olimpiadas matemáticas, financieras y cálculo
              </div>
            </div>
          </div>

          {/* Ciencias Card */}
          <div className="world-card science">
            <span className="world-icon">🔬</span>
            <div className="flex-1">
              <div className="world-title">Ciencias</div>
              <div className="world-desc">
                Astronomía, química experimental y física aplicada
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
