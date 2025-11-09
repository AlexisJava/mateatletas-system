export default function FAQToCTA() {
  const rays = [
    { angle: -30, delay: '0s', color: 'rgba(14, 165, 233, 0.5)' },
    { angle: -15, delay: '0.5s', color: 'rgba(255, 107, 53, 0.5)' },
    { angle: 0, delay: '1s', color: 'rgba(14, 165, 233, 0.5)' },
    { angle: 15, delay: '1.5s', color: 'rgba(251, 191, 36, 0.5)' },
    { angle: 30, delay: '2s', color: 'rgba(14, 165, 233, 0.5)' }
  ];

  return (
    <div className="relative h-44 overflow-hidden bg-transparent" aria-hidden="true">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%]">
        {rays.map((ray, i) => (
          <div
            key={i}
            className="absolute bottom-0 left-1/2 w-0.5 h-full animate-ray-expand"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${ray.color} 100%)`,
              transform: `translateX(-50%) rotate(${ray.angle}deg)`,
              transformOrigin: 'bottom center',
              animationDelay: ray.delay
            }}
          />
        ))}
      </div>
    </div>
  );
}
