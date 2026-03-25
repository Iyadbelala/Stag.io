interface SpinnerProps {
  /** Show the branded Stag.io breathing logo instead of a plain spinner */
  branded?: boolean;
}

export default function Spinner({ branded }: SpinnerProps) {
  if (branded) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <span className="animate-logo-breathe font-heading text-3xl font-bold tracking-tight select-none">
          <span className="text-coffee-dark">Stag</span>
          <span className="text-coffee-gold">.</span>
          <span className="text-logo-sage">io</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
    </div>
  );
}
