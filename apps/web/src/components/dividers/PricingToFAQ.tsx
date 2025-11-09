export default function PricingToFAQ() {
  return (
    <div className="relative h-28 overflow-hidden bg-transparent flex items-center justify-center gap-8" aria-hidden="true">
      {/* Línea izquierda */}
      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />

      {/* Icono */}
      <div className="text-5xl animate-question-pulse">❓</div>

      {/* Línea derecha */}
      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
    </div>
  );
}
