import Link from 'next/link';
import { GameInfo } from '@/lib/types/cursos/matematicas';

interface GameCardProps {
  game: GameInfo;
  completed?: boolean;
}

export default function GameCard({ game, completed = false }: GameCardProps) {
  return (
    <Link
      href={game.route}
      className="block group relative bg-slate-800 rounded-xl p-6 border-2 border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:scale-105"
    >
      {completed && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="text-4xl mb-4">{game.icon}</div>

      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
        {game.title}
      </h3>

      <p className="text-slate-400 text-base mb-4 leading-relaxed">{game.description}</p>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>⏱️ {game.estimated_time}</span>
        <span className="text-indigo-400 group-hover:text-indigo-300 font-semibold">Jugar →</span>
      </div>
    </Link>
  );
}
