'use client';

interface OptionButtonProps {
  label: string;
  type: 'comprar' | 'usar' | 'compartir';
  cost?: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
}

export default function OptionButton({
  label,
  type,
  cost,
  icon,
  onClick,
  disabled,
}: OptionButtonProps) {
  const typeColors = {
    comprar: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    usar: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    compartir: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-6 rounded-xl bg-gradient-to-r ${typeColors[type]}
        text-white font-semibold text-lg
        transform transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        shadow-lg hover:shadow-xl
        flex items-center justify-between gap-4
      `}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="text-left">
          <div className="font-bold">{label}</div>
          {cost && <div className="text-sm opacity-90 mt-1">Costo: {cost}</div>}
        </div>
      </div>
      <span className="text-2xl">→</span>
    </button>
  );
}
