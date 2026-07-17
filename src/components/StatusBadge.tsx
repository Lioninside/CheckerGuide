interface StatusBadgeProps {
  children: string;
  tone?: "neutral" | "good" | "warning";
}

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
