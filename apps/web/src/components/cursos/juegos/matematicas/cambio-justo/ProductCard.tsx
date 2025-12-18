import { formatCurrency } from '@/lib/utils/currency-helpers';

interface ProductCardProps {
  name: string;
  price: number;
  imageSearch: string;
}

export default function ProductCard({ name, price, imageSearch }: ProductCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 text-center">
      <div className="w-full h-40 bg-slate-700 rounded-lg mb-4 flex items-center justify-center text-6xl">
        🏪
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">{name}</h2>
      <div className="text-4xl font-bold text-yellow-400 tabular-nums">{formatCurrency(price)}</div>
    </div>
  );
}
