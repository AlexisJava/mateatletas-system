import Link from 'next/link';

export default function Hero() {
  return (
    <section className="section-landing" style={{ paddingTop: '160px', paddingBottom: '120px' }} id="mundos">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            <span className="text-white">Donde tus hijos </span>
            <span className="title-gradient">descubren</span>
            <br />
            <span className="text-white">que aprender puede ser</span>
            <br />
            <span className="title-gradient">su nueva pasión</span>
          </h1>

          <p className="text-xl text-white/80 leading-relaxed max-w-xl">
            De crear juegos en Roblox a resolver ecuaciones complejas. De experimentos químicos a explorar el universo.
            <br />
            <strong>Más de 500 familias confían en nosotros</strong> para transformar la relación de sus hijos con el aprendizaje.
          </p>

          <ul className="space-y-5">
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                <span role="img" aria-label="Computadora - Mundo Programación">💻</span>
              </div>
              <span className="text-white font-semibold text-base">
                <strong>Programación:</strong> Desde crear juegos en Roblox hasta apps reales
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                <span role="img" aria-label="Números - Mundo Matemáticas">🔢</span>
              </div>
              <span className="text-white font-semibold text-base">
                <strong>Matemática:</strong> De olimpiadas a finanzas personales
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                <span role="img" aria-label="Microscopio - Mundo Ciencias">🔬</span>
              </div>
              <span className="text-white font-semibold text-base">
                <strong>Ciencias:</strong> Experimentos que despiertan curiosidad
              </span>
            </li>
            <li className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                <span role="img" aria-label="Trofeo - Sistema de torneos">🏆</span>
              </div>
              <span className="text-white font-semibold text-base">
                <strong>Comunidad:</strong> Desafíos, competencias y amistades reales
              </span>
            </li>
          </ul>

          <div className="flex gap-5 pt-4">
            <Link href="/register" className="btn-pulse">
              Quiero que mis hijos aprendan así
            </Link>
            <Link href="#mundos" className="btn-arrow">
              Ver cómo funciona
            </Link>
          </div>
        </div>

        {/* Right Column - World Cards */}
        <div className="flex flex-col gap-6">
          {/* Programación Card */}
          <div className="world-card prog">
            <span className="world-icon" role="img" aria-label="Computadora - Programación">💻</span>
            <div className="flex-1">
              <div className="world-title">Programación</div>
              <div className="world-desc">
                Crean sus propios juegos, páginas web y aplicaciones desde cero
              </div>
            </div>
          </div>

          {/* Matemáticas Card */}
          <div className="world-card math">
            <span className="world-icon" role="img" aria-label="Números - Matemáticas">🔢</span>
            <div className="flex-1">
              <div className="world-title">Matemática</div>
              <div className="world-desc">
                Del álgebra divertida al cálculo desafiante, con aplicaciones reales
              </div>
            </div>
          </div>

          {/* Ciencias Card */}
          <div className="world-card science">
            <span className="world-icon" role="img" aria-label="Microscopio - Ciencias">🔬</span>
            <div className="flex-1">
              <div className="world-title">Ciencias</div>
              <div className="world-desc">
                Experimentos fascinantes que revelan cómo funciona el mundo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
