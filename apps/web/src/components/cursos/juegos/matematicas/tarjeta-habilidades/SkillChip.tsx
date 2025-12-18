interface SkillChipProps {
  label: string;
  icon: string;
  color: string;
  selected: boolean;
  onClick: () => void;
  isStrength?: boolean;
}

export default function SkillChip({
  label,
  icon,
  color,
  selected,
  onClick,
  isStrength = false,
}: SkillChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
        flex items-center gap-2 relative
        ${selected ? 'scale-105 shadow-lg' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
        ${isStrength ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
      `}
      style={{
        backgroundColor: selected ? color : undefined,
        color: selected ? '#fff' : undefined,
      }}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {selected && !isStrength && <span className="ml-1">✓</span>}
      {isStrength && (
        <span className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">
          ⭐
        </span>
      )}
    </button>
  );
}
