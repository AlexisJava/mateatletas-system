export default function MundosToTestimonials() {
  return (
    <div className="relative h-28 overflow-hidden bg-transparent" aria-hidden="true">
      {/* Línea horizontal */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Comillas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-5 items-center">
        <span className="text-5xl text-blue-500/50 animate-quote-fade">"</span>
        <span className="text-5xl text-blue-500/50 animate-quote-fade" style={{ animationDelay: '1s' }}>"</span>
      </div>
    </div>
  );
}
