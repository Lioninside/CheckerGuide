import { AlertTriangle, RefreshCcw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-live="polite">
      <AlertTriangle aria-hidden="true" size={24} />
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
        {actionLabel && onAction ? (
          <button className="button secondary" type="button" onClick={onAction}>
            <RefreshCcw aria-hidden="true" size={18} />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
