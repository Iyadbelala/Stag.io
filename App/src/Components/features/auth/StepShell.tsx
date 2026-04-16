"use client";

import type { ReactNode } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiCheck } from "react-icons/hi";

interface StepShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isFinal?: boolean;
  canProceed?: boolean;
}

export default function StepShell({
  title,
  subtitle,
  icon,
  children,
  onBack,
  onNext,
  onSubmit,
  nextLabel = "Continue",
  backLabel = "Back",
  submitLabel = "Create account",
  isSubmitting = false,
  isFinal = false,
  canProceed = true,
}: StepShellProps) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-gold/20 to-coffee-warm/10 text-coffee-warm">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-xl font-bold text-coffee-dark sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-0.5">{children}</div>

      {/* Footer nav */}
      <div className="mt-7 flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="group inline-flex items-center gap-1.5 rounded-xl border border-surface-sand bg-surface-white/60 px-4 py-2.5 text-sm font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-coffee-warm/30 hover:bg-surface-white hover:text-coffee-warm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <HiOutlineArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </button>
        )}

        {isFinal && onSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed}
            className="group relative ml-auto inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-coffee-warm/25 transition-all hover:shadow-xl hover:shadow-coffee-gold/30 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{isSubmitting ? "Creating..." : submitLabel}</span>
            {!isSubmitting && <HiCheck size={16} className="relative" />}
          </button>
        ) : (
          onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="group ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-coffee-warm/20 transition-all hover:shadow-lg hover:shadow-coffee-gold/25 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {nextLabel}
              <HiOutlineArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
