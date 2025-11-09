export default function NumbersToGamification() {
  return (
    <div className="relative h-40 overflow-hidden bg-transparent" aria-hidden="true">
      {/* Rayo horizontal */}
      <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 animate-beam-pulse">
        <div
          className="w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)'
          }}
        />
      </div>

      {/* Ícono flotante */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-icon-float">
        ⚡
      </div>
    </div>
  );
}
