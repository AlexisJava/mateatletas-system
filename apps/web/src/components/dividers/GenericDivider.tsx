interface GenericDividerProps {
  color?: 'blue' | 'yellow' | 'purple' | 'green' | 'orange';
  height?: 'sm' | 'md' | 'lg';
}

export default function GenericDivider({
  color = 'blue',
  height = 'md'
}: GenericDividerProps) {
  const colors = {
    blue: 'rgba(14, 165, 233, 0.5)',
    yellow: 'rgba(251, 191, 36, 0.5)',
    purple: 'rgba(168, 85, 247, 0.5)',
    green: 'rgba(16, 185, 129, 0.5)',
    orange: 'rgba(255, 107, 53, 0.5)'
  };

  const heights = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16'
  };

  return (
    <div className={`relative ${heights[height]} overflow-hidden`} aria-hidden="true">
      <div
        className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors[color]}, transparent)`
        }}
      />
    </div>
  );
}
