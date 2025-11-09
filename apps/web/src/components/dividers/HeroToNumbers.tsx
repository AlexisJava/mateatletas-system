export default function HeroToNumbers() {
  return (
    <div className="relative h-32 overflow-hidden bg-transparent" aria-hidden="true">
      {/* 6 partículas cayendo */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-particle-fall"
          style={{
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.5}s`,
            backgroundColor: i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#FF6B35' : '#fbbf24'
          }}
        />
      ))}
    </div>
  );
}
