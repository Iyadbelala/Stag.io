"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMail } from "react-icons/hi";
import FloatingOrbs from "@/Components/FloatingOrbs";
import AuthBrandPanel from "@/Components/AuthBrandPanel";
import { useAuth } from "@/Components/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { pendingVerificationEmail, verifyEmail, resendCode, user } = useAuth();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no pending email or already logged in
  useEffect(() => {
    if (user) {
      router.replace("/student");
      return;
    }
    if (!pendingVerificationEmail) {
      router.replace("/login");
    }
  }, [pendingVerificationEmail, user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...digits];
      next[index] = value.slice(-1);
      setDigits(next);
      setError(null);

      // Auto-focus next
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = digits.join("");
      if (code.length !== 6) {
        setError("Please enter all 6 digits");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const resultUser = await verifyEmail(pendingVerificationEmail!, code);
        setSuccess(true);
        setTimeout(() => {
          router.push(
            resultUser.role === "company"
              ? "/company"
              : resultUser.role === "admin"
                ? "/admin"
                : resultUser.role === "superadmin"
                  ? "/superadmin"
                  : resultUser.role === "university"
                    ? "/university"
                    : "/student"
          );
        }, 500);
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { error?: { message?: string } } };
        };
        setError(axiosErr.response?.data?.error?.message ?? "Invalid or expired code");
      } finally {
        setIsSubmitting(false);
      }
    },
    [digits, pendingVerificationEmail, verifyEmail, router]
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || !pendingVerificationEmail) return;
    try {
      await resendCode(pendingVerificationEmail);
      setResendCooldown(60);
    } catch {
      setError("Failed to resend code");
    }
  }, [resendCooldown, pendingVerificationEmail, resendCode]);

  if (!pendingVerificationEmail) return null;

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] overflow-hidden bg-surface-cream">
      <AuthBrandPanel />

      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <FloatingOrbs />

        <div className="relative z-10 w-full max-w-md rounded-card border border-surface-sand bg-surface-white/80 p-8 shadow-card backdrop-blur-sm">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coffee-gold/20">
            <HiOutlineMail className="h-7 w-7 text-coffee-warm" />
          </div>

          <h2 className="mb-2 text-center font-heading text-2xl font-semibold text-coffee-dark">
            Verify your email
          </h2>
          <p className="mb-6 text-center text-sm text-text-muted">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-coffee-warm">{pendingVerificationEmail}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-12 rounded-lg border border-surface-sand bg-surface-cream text-center text-xl font-bold text-coffee-dark outline-none transition-all focus:border-coffee-warm focus:ring-2 focus:ring-coffee-gold/30"
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm text-status-error">{error}</p>
            )}

            {success && (
              <p className="text-center text-sm text-green-600">Email verified! Redirecting...</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-button bg-coffee-warm py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>

            <p className="text-center text-sm text-text-muted">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-medium text-coffee-warm hover:text-coffee-dark disabled:text-text-muted cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
