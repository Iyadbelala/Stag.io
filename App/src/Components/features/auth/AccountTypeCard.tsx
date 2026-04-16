"use client";

import type { ReactNode } from "react";
import { HiCheck } from "react-icons/hi";

interface AccountTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features?: string[];
  selected: boolean;
  onClick: () => void;
  accent?: "warm" | "gold" | "sage";
}

const ACCENT: Record<NonNullable<AccountTypeCardProps["accent"]>, {
  ring: string;
  icon: string;
  gradient: string;
}> = {
  warm: {
    ring: "border-coffee-warm/50 ring-coffee-warm/20",
    icon: "from-coffee-warm/20 to-coffee-warm/5 text-coffee-warm",
    gradient: "from-coffee-warm/8 to-transparent",
  },
  gold: {
    ring: "border-coffee-gold/50 ring-coffee-gold/20",
    icon: "from-coffee-gold/25 to-coffee-gold/5 text-coffee-gold",
    gradient: "from-coffee-gold/10 to-transparent",
  },
  sage: {
    ring: "border-logo-sage/50 ring-logo-sage/20",
    icon: "from-logo-sage/20 to-logo-sage/5 text-logo-sage",
    gradient: "from-logo-sage/8 to-transparent",
  },
};

export default function AccountTypeCard({
  icon,
  title,
  description,
  features,
  selected,
  onClick,
  accent = "warm",
}: AccountTypeCardProps) {
  const theme = ACCENT[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 cursor-pointer ${
        selected
          ? `${theme.ring} ring-4 shadow-xl shadow-coffee-warm/10 -translate-y-0.5 bg-surface-white`
          : "border-surface-sand bg-surface-white/60 hover:border-surface-sand/90 hover:shadow-lg hover:shadow-coffee-warm/5 hover:-translate-y-0.5"
      }`}
    >
      {/* Decorative gradient */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 transition-opacity duration-500 ${
          selected ? "opacity-100" : "group-hover:opacity-60"
        }`}
      />

      {/* Check badge */}
      <div
        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-coffee-warm text-white transition-all duration-300 ${
          selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <HiCheck size={14} />
      </div>

      <div className="relative">
        {/* Icon */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          {icon}
        </div>

        {/* Text */}
        <h3 className="mb-1.5 text-base font-semibold text-coffee-dark">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-text-muted">
          {description}
        </p>

        {/* Feature bullets */}
        {features && features.length > 0 && (
          <ul className="mt-3.5 space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span className="h-1 w-1 rounded-full bg-coffee-gold" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}
