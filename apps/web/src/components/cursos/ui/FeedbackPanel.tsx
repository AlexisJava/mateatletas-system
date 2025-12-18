interface FeedbackPanelProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function FeedbackPanel({ type, message }: FeedbackPanelProps) {
  const styles = {
    success: 'bg-orange-900/40 border-orange-500 text-orange-100',
    error: 'bg-red-900/40 border-red-500 text-red-100',
    info: 'bg-orange-900/40 border-orange-500 text-orange-100',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className={`mt-4 px-6 py-4 rounded-xl border-2 ${styles[type]} animate-fadeIn`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icons[type]}</span>
        <p className="text-base md:text-lg leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
