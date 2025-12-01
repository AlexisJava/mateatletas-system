'use client';

export function WizardHeader() {
  return (
    <header className="py-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="font-bold text-base text-black">M</span>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-white/50 uppercase">
            Mateatletas
          </p>
          <p className="text-sm font-light text-white/70 -mt-0.5">Studio</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-white/50 font-medium tracking-wide">SISTEMA ACTIVO</span>
      </div>
    </header>
  );
}
