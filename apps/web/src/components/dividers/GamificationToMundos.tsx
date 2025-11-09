export default function GamificationToMundos() {
  const orbs = [
    { color: 'rgba(14, 165, 233, 0.6)', shadow: '0 0 40px rgba(14, 165, 233, 0.8)', delay: '0s' },
    { color: 'rgba(255, 107, 53, 0.6)', shadow: '0 0 40px rgba(255, 107, 53, 0.8)', delay: '0.5s' },
    { color: 'rgba(251, 191, 36, 0.6)', shadow: '0 0 40px rgba(251, 191, 36, 0.8)', delay: '1s' }
  ];

  return (
    <div className="relative h-48 overflow-hidden bg-transparent" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-10">
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-full animate-orb-float"
            style={{
              background: `radial-gradient(circle, ${orb.color}, transparent)`,
              boxShadow: orb.shadow,
              animationDelay: orb.delay
            }}
          />
        ))}
      </div>
    </div>
  );
}
