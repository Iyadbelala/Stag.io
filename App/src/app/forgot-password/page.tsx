"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { HiOutlineMail } from "react-icons/hi";
import FloatingOrbs from "@/Components/FloatingOrbs";
import AuthBrandPanel from "@/Components/AuthBrandPanel";
import { useAuth } from "@/Components/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        await forgotPassword(email);
        setSent(true);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, forgotPassword]
  );

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] overflow-hidden bg-surface-cream">
      <AuthBrandPanel />

      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <FloatingOrbs />

        <div className="relative z-10 w-full max-w-md rounded-card border border-surface-sand bg-surface-white/80 p-8 shadow-card backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coffee-gold/20">
            <HiOutlineMail className="h-7 w-7 text-coffee-warm" />
          </div>

          <h2 className="mb-2 text-center font-heading text-2xl font-semibold text-coffee-dark">
            Forgot password?
          </h2>
          <p className="mb-6 text-center text-sm text-text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  If an account exists with that email, we&apos;ve sent a reset link.
                </p>
              </div>
              <p className="text-sm text-text-muted">
                Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm font-medium text-coffee-warm hover:text-coffee-dark"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-surface-sand bg-surface-cream px-4 py-3 text-sm text-coffee-dark outline-none transition-all focus:border-coffee-warm focus:ring-2 focus:ring-coffee-gold/30"
                />
              </div>

              {error && (
                <p className="text-sm text-status-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-button bg-coffee-warm py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm text-text-muted">
                Remember your password?{" "}
                <Link href="/login" className="font-medium text-coffee-warm hover:text-coffee-dark">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
