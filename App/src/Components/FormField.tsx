"use client";

import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import FieldError from "@/Components/FieldError";

/* ============================================
   Shared class helpers for glass-style inputs
   ============================================ */

export function inputBaseClass(hasError: boolean) {
  return `peer w-full rounded-[--radius-button] border ${
    hasError
      ? "border-status-error/60 focus:border-status-error"
      : "border-white/20 focus:border-coffee-gold/60"
  } bg-white/10 py-3 pl-11 pr-4 text-sm text-text-primary backdrop-blur-sm outline-none transition-all placeholder:text-text-muted/60`;
}

export function iconBaseClass(hasError: boolean) {
  return `pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
    hasError ? "text-status-error" : "text-text-muted/70"
  } transition-colors peer-focus:text-coffee-warm`;
}

/* ============================================
   FormField — labelled input with leading icon
   ============================================ */

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
  /** Optional hint shown below the input when there is no error */
  hint?: React.ReactNode;
}

export function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  error,
  hint,
}: FormFieldProps) {
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBaseClass(!!error)}
        />
        <span className={iconBaseClass(!!error)}>{icon}</span>
      </div>
      {error ? <FieldError message={error} /> : hint}
    </div>
  );
}

/* ============================================
   PasswordField — password input with toggle
   ============================================ */

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  icon,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBaseClass(!!error)} !pr-11`}
        />
        <span className={iconBaseClass(!!error)}>{icon}</span>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/70 transition-colors hover:text-coffee-warm cursor-pointer"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <HiOutlineEyeOff size={18} />
          ) : (
            <HiOutlineEye size={18} />
          )}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}
