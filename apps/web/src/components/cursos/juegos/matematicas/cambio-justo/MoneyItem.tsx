import { MoneyItemData } from '@/lib/types/juegos';
import { formatCurrency } from '@/lib/utils/currency-helpers';

interface MoneyItemProps {
  item: MoneyItemData;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (item: MoneyItemData) => void;
}

export default function MoneyItem({
  item,
  onRemove,
  isDraggable = true,
  onDragStart,
}: MoneyItemProps) {
  const isBill = item.type === 'bill';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('moneyItem', JSON.stringify(item));
    if (onDragStart) onDragStart(item);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Store touch data for mobile drag
    if (onDragStart) onDragStart(item);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      className={`
        ${isBill ? 'w-24 h-14 rounded-lg' : 'w-16 h-16 rounded-full'}
        flex items-center justify-center font-bold text-white shadow-lg
        cursor-grab active:cursor-grabbing transition-transform duration-200
        hover:scale-110 active:scale-95 relative group
      `}
      style={{ backgroundColor: item.color }}
    >
      <span className={isBill ? 'text-lg' : 'text-base'}>{formatCurrency(item.value)}</span>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
}
