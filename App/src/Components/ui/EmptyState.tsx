interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  submessage?: string;
}

export default function EmptyState({ icon, message, submessage }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 text-text-muted/30">{icon}</div>
      <p className="text-sm text-text-muted">{message}</p>
      {submessage && (
        <p className="mt-1 text-xs text-text-muted/60">{submessage}</p>
      )}
    </div>
  );
}
