"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlineLockClosed } from "react-icons/hi";
import FloatingOrbs from "@/Components/FloatingOrbs";
import AuthBrandPanel from "@/Components/AuthBrandPanel";
import { useAuth } from "@/Components/AuthContext";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!token) {
        setError("Invalid reset link. Please request a new one.");
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPassword(token, password);
        setSuccess(true);
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { error?: { message?: string } } };
        };
        setError(axiosErr.response?.data?.error?.message ?? "Invalid or expired reset link");
      } finally {
        setIsSubmitting(false);
      }
    },
    [password, confirmPassword, token, resetPassword]
  );

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-status-error">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm font-medium text-coffee-warm hover:text-coffee-dark"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return success ? (
    <div className="space-y-4 text-center">
      <div className="rounded-lg bg-green-50 p-4">
        <p className="text-sm font-medium text-green-700">
          Password reset successfully!
        </p>
      </div>
      <Link
        href="/login"
        className="inline-block rounded-button bg-coffee-warm px-6 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold"
      >
        Go to login
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-surface-sand bg-surface-cream px-4 py-3 text-sm text-coffee-dark outline-none transition-all focus:border-coffee-warm focus:ring-2 focus:ring-coffee-gold/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
          placeholder="Repeat your password"
          className="w-full rounded-lg border border-surface-sand bg-surface-cream px-4 py-3 text-sm text-coffee-dark outline-none transition-all focus:border-coffee-warm focus:ring-2 focus:ring-coffee-gold/30"
        />
      </div>

      {error && <p className="text-sm text-status-error">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-button bg-coffee-warm py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? "Resetting..." : "Reset password"}
      </button>

      <p className="text-center text-sm text-text-muted">
        <Link href="/login" className="font-medium text-coffee-warm hover:text-coffee-dark">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-80px)] overflow-hidden bg-surface-cream">
      <AuthBrandPanel />

      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <FloatingOrbs />

        <div className="relative z-10 w-full max-w-md rounded-card border border-surface-sand bg-surface-white/80 p-8 shadow-card backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coffee-gold/20">
            <HiOutlineLockClosed className="h-7 w-7 text-coffee-warm" />
          </div>

          <h2 className="mb-2 text-center font-heading text-2xl font-semibold text-coffee-dark">
            Reset your password
          </h2>
          <p className="mb-6 text-center text-sm text-text-muted">
            Enter your new password below.
          </p>

          <Suspense fallback={<div className="text-center text-sm text-text-muted">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
