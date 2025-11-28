'use client';

export function BrawlBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Gradiente simple estilo Brawl Stars */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center top, #5dade2 0%, #3498db 50%, #2874a6 100%)',
        }}
      />

      {/* Patrón MUY sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, #1a1a1a 100px, transparent 200px)`,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
