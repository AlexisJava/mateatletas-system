export default function ComparisonToPricing() {
  return (
    <div className="relative h-56 overflow-hidden bg-transparent" aria-hidden="true">
      {/* Spotlight giratorio */}
      <div
        className="absolute -top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 animate-spotlight-rotate"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
          transformOrigin: 'center'
        }}
      />

      {/* Flecha */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl animate-arrow-bounce">
        <span className="bg-gradient-to-b from-orange-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.8))' }}>
          ↓
        </span>
      </div>

      {/* Línea brillante inferior */}
      <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
        <div
          className="w-full h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 animate-glow-shift"
          style={{
            backgroundSize: '300% 100%',
            boxShadow: '0 0 40px rgba(255, 107, 53, 0.8)'
          }}
        />
      </div>
    </div>
  );
}
