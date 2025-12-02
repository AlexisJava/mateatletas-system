import { type LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">
        <Icon />
      </div>
      <h3 className="admin-empty-state-title">{title}</h3>
      {description && <p className="admin-empty-state-description">{description}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href} className="admin-btn admin-btn-primary">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="admin-btn admin-btn-primary">
            {action.label}
          </button>
        ))}
    </div>
  );
}
