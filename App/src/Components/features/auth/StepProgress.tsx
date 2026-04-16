"use client";

import { HiCheck } from "react-icons/hi";

interface StepProgressProps {
  steps: string[];
  current: number;
  onStepClick?: (index: number) => void;
}

export default function StepProgress({ steps, current, onStepClick }: StepProgressProps) {
  return (
    <div className="w-full">
      {/* Step markers */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {steps.map((label, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const clickable = onStepClick && i <= current;

          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
              <div className="relative flex w-full items-center">
                {/* Left connector */}
                {i > 0 && (
                  <div className="absolute -left-1/2 right-1/2 h-0.5 bg-surface-sand overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-coffee-warm to-coffee-gold transition-all duration-500 ${
                        isDone || isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}

                {/* Marker */}
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onStepClick?.(i)}
                  className={`relative z-10 mx-auto flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    isDone
                      ? "bg-gradient-to-br from-coffee-warm to-coffee-gold text-white shadow-md shadow-coffee-warm/25 cursor-pointer hover:scale-110"
                      : isActive
                      ? "bg-surface-white text-coffee-warm ring-4 ring-coffee-gold/25 shadow-md shadow-coffee-warm/15 scale-110"
                      : "bg-surface-cream text-text-muted/60 border border-surface-sand"
                  } ${!clickable ? "cursor-default" : ""}`}
                >
                  {isDone ? <HiCheck size={16} /> : i + 1}
                </button>
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-xs font-medium truncate w-full text-center transition-colors ${
                  isActive
                    ? "text-coffee-dark"
                    : isDone
                    ? "text-coffee-warm"
                    : "text-text-muted/60"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
