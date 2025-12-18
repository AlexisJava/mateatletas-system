import { CourseTheme } from '../../themes/courseThemes';

interface LambdaMessageProps {
  message: string;
  className?: string;
  theme?: CourseTheme;
}

const avatarGradients: Record<CourseTheme, string> = {
  matematicas: 'bg-gradient-to-br from-orange-500 to-amber-600',
  programacion: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  ciencias: 'bg-gradient-to-br from-emerald-500 to-teal-600',
};

const nameColors: Record<CourseTheme, string> = {
  matematicas: 'text-orange-400',
  programacion: 'text-indigo-400',
  ciencias: 'text-emerald-400',
};

export default function LambdaMessage({
  message,
  className = '',
  theme = 'matematicas',
}: LambdaMessageProps) {
  // Convert markdown-style bold to HTML
  const formatMessage = (text: string) => {
    if (!text) return null;
    return text.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-bold text-slate-100">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${avatarGradients[theme]} flex items-center justify-center text-2xl md:text-3xl shadow-lg`}
        >
          🤖
        </div>
      </div>
      <div className="flex-1">
        <div className={`text-sm font-semibold ${nameColors[theme]} mb-1`}>Lambda</div>
        <div className="text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
          {formatMessage(message)}
        </div>
      </div>
    </div>
  );
}
