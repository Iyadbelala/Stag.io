const statusConfig: Record<string, { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-status-warning/10 text-status-warning" },
  accepted:  { label: "Accepted",  classes: "bg-blue-100 text-blue-700" },
  rejected:  { label: "Rejected",  classes: "bg-status-error/10 text-status-error" },
  withdrawn: { label: "Withdrawn", classes: "bg-text-muted/10 text-text-muted" },
  validated: { label: "Validated", classes: "bg-status-success/10 text-status-success" },
};

interface StatusBadgeProps {
  status: string;
  /** Override the default label map with translated labels */
  labels?: Record<string, string>;
}

export default function StatusBadge({ status, labels }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const label = labels?.[status] ?? config.label;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.classes}`}>
      {label}
    </span>
  );
}
