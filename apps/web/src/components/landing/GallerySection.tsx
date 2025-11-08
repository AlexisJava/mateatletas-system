export default function GallerySection() {
  const avatarPlaceholders = [
    { gradient: 'from-[#0ea5e9] to-[#0284c7]', label: 'Avatar Fénix' },
    { gradient: 'from-[#FF6B35] to-[#f59e0b]', label: 'Avatar Dragón' },
    { gradient: 'from-[#fbbf24] to-[#f59e0b]', label: 'Avatar Tigre' },
    { gradient: 'from-[#10b981] to-[#059669]', label: 'Avatar Águila' },
    { gradient: 'from-[#8b5cf6] to-[#7c3aed]', label: 'Avatar Épico' },
    { gradient: 'from-[#ec4899] to-[#db2777]', label: 'Avatar Legendario' },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b5cf6]/10 to-[#ec4899]/10 rounded-full border border-[#8b5cf6]/20 mb-6">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent font-semibold text-sm">
              Ready Player Me Integration
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Avatares 3D personalizables
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
            Cada estudiante crea su propio avatar 3D con Ready Player Me. Personaliza ropa, accesorios y desbloquea items exclusivos en la tienda virtual.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {avatarPlaceholders.map((avatar, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${avatar.gradient} opacity-20`} />

                {/* Avatar Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-24 h-24 bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center shadow-xl`}>
                    <span className="text-4xl font-black text-white">3D</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-bold text-sm">{avatar.label}</span>
                </div>

                {/* Gradient Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${avatar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`} />
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">✨</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Personalización total
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Elige peinado, ropa, accesorios y colores. Tu avatar es único como tú.
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">🏪</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Tienda virtual
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Usa tus monedas para comprar items exclusivos y mejorar tu avatar.
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">🏆</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
              Items desbloqueables
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Completa logros para desbloquear accesorios épicos y legendarios.
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#8b5cf6]/10 via-[#ec4899]/10 to-[#0ea5e9]/10 rounded-2xl border border-[#8b5cf6]/20">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            Integración oficial con Ready Player Me
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Plataforma líder en avatares 3D, compatible con múltiples aplicaciones y juegos
          </p>
        </div>
      </div>
    </section>
  );
}
