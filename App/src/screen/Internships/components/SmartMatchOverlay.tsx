"use client";

export function SmartMatchOverlay({ leaving, t }: { leaving: boolean; t: (k: string) => string }) {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-surface-cream/95 backdrop-blur-md transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <span className="animate-logo-breathe font-heading text-4xl font-bold tracking-tight select-none">
        <span className="text-coffee-dark">Smart</span>
        <span className="text-coffee-gold">Match</span>
        <sup className="text-xs text-coffee-warm">®</sup>
      </span>
      <p className="mt-3 text-sm text-text-muted animate-fade-in max-w-xs text-center" style={{ animationDelay: "150ms" }}>
        {t("internships.loadingMatches")}
      </p>
    </div>
  );
}
