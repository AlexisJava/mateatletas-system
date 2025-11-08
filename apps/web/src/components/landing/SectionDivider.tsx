interface SectionDividerProps {
  color?: 'blue' | 'yellow' | 'orange' | 'green' | 'purple';
}

const symbols = {
  blue: '◆',
  yellow: '★',
  orange: '◈',
  green: '◉',
  purple: '◊',
};

export default function SectionDivider({
  color = 'blue'
}: SectionDividerProps) {
  const symbol = symbols[color];

  return (
    <div className={`section-divider ${color}`}>
      <div className="section-divider-inner">
        {/* Línea central con gradiente */}
        <div className="divider-line" />

        {/* Puntos centrales pulsantes */}
        <div className="divider-dots">
          <div className="divider-dot" />
          <div className="divider-dot" />
          <div className="divider-dot" />
        </div>

        {/* Partículas flotantes */}
        <div className="divider-particles">
          <div className="divider-particle" />
          <div className="divider-particle" />
          <div className="divider-particle" />
          <div className="divider-particle" />
        </div>

        {/* Símbolos laterales decorativos */}
        <div className="divider-symbol left">{symbol}</div>
        <div className="divider-symbol right">{symbol}</div>
      </div>
    </div>
  );
}
