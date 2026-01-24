'use client';

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: string;
}

export function MiniStat({ label, value, color = 'var(--admin-text)' }: MiniStatProps) {
  return (
    <div className="text-center py-7 px-2">
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-sm text-[var(--admin-text-muted)] mt-1">{label}</p>
    </div>
  );
}
