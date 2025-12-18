import { MoneyItemData } from '@/lib/types/juegos';
import MoneyItem from './MoneyItem';

interface PaymentZoneProps {
  items: MoneyItemData[];
  onDrop: (item: MoneyItemData) => void;
  onRemoveItem: (id: string) => void;
}

export default function PaymentZone({ items, onDrop, onRemoveItem }: PaymentZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('moneyItem');
    if (data) {
      const item = JSON.parse(data);
      onDrop(item);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        min-h-48 bg-slate-800/50 border-2 border-dashed rounded-xl p-4
        ${items.length === 0 ? 'border-slate-600' : 'border-indigo-500'}
        transition-colors duration-200
      `}
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-500 text-lg">
          Arrastrá billetes y monedas aquí
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {items.map((item) => (
            <MoneyItem
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
              isDraggable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
