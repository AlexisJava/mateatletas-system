import { ARGENTINE_BILLS, ARGENTINE_COINS } from '@/lib/utils/currency-helpers';
import { MoneyItemData } from '@/lib/types/juegos';
import { generateUniqueId } from '@/lib/utils/currency-helpers';
import MoneyItem from './MoneyItem';

interface MoneyPanelProps {
  onMoneyClick: (item: MoneyItemData) => void;
}

export default function MoneyPanel({ onMoneyClick }: MoneyPanelProps) {
  const handleClick = (value: number, type: 'bill' | 'coin', color: string) => {
    onMoneyClick({
      id: generateUniqueId(),
      type,
      value,
      color,
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Billetes</h3>
        <div className="flex flex-wrap gap-3">
          {ARGENTINE_BILLS.map((bill) => (
            <div key={bill.value} onClick={() => handleClick(bill.value, 'bill', bill.color)}>
              <MoneyItem
                item={{
                  id: generateUniqueId(),
                  type: 'bill',
                  value: bill.value,
                  color: bill.color,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Monedas</h3>
        <div className="flex flex-wrap gap-3">
          {ARGENTINE_COINS.map((coin) => (
            <div key={coin.value} onClick={() => handleClick(coin.value, 'coin', coin.color)}>
              <MoneyItem
                item={{
                  id: generateUniqueId(),
                  type: 'coin',
                  value: coin.value,
                  color: coin.color,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
