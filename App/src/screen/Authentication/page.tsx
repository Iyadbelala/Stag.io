"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
} from "react-icons/hi";

import Logo from "@/Components/Logo";
import FloatingOrbs from "@/Components/FloatingOrbs";
import FieldError from "@/Components/FieldError";
import { FormField, PasswordField } from "@/Components/FormField";
import AuthBrandPanel from "@/Components/AuthBrandPanel";

/* ============================================
   Email validation
   ============================================ */
const UNIV_EMAIL_REGEX = /^[^\s@]+@univ-[a-zA-Z0-9]+\.dz$/;

function validateUnivEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!UNIV_EMAIL_REGEX.test(email))
    return "Please use your university email (name@univ-xxxx.dz).";
  return null;
}

/* ============================================
   Component
   ============================================ */
export default function AuthenticationPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  /* ---- Shared fields ---- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---- Register-only fields ---- */
  const [university, setUniversity] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* ---- Errors ---- */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  /* ---- Auto-detect university from email ---- */
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    const match = value.match(/@univ-([a-zA-Z0-9]+)\.dz$/);
    if (match) {
      const slug = match[1];
      setUniversity(
        `Université ${slug.charAt(0).toUpperCase()}${slug.slice(1)}`
      );
    }
  }, []);

  /* ---- Validate ---- */
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};

    const emailErr = validateUnivEmail(email);
    if (emailErr) errs.email = emailErr;

    if (!password) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";

    if (mode === "register") {
      if (!confirmPassword)
        errs.confirmPassword = "Please confirm your password.";
      else if (confirmPassword !== password)
        errs.confirmPassword = "Passwords do not match.";
      if (!agreeTerms) errs.terms = "You must accept the terms.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, password, confirmPassword, agreeTerms, mode]);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setSubmitted(true);
    },
    [validate]
  );

  /* ---- Switch mode ---- */
  const switchMode = useCallback(() => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
    setSubmitted(false);
  }, []);

  const isLogin = mode === "login";

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] overflow-hidden bg-surface-cream">
      {/* ---- Left brand panel (lg+) ---- */}
      <AuthBrandPanel />

      {/* ---- Right panel — form + floating orbs ---- */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <FloatingOrbs />

        {/* Mobile logo (small screens only) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Logo />
        </div>

        {/* ---- Glass card ---- */}
        <div className="relative z-10 w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-heading font-bold text-coffee-dark sm:text-3xl">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {isLogin
                ? "Sign in with your university email to continue."
                : "Register with your Algerian university email."}
            </p>
          </div>

          {/* Success state */}
          {submitted ? (
            <div className="rounded-card border border-status-success/20 bg-status-success/10 p-8 text-center backdrop-blur-xl">
              <HiOutlineCheckCircle
                size={48}
                className="mx-auto mb-4 text-status-success"
              />
              <h2 className="font-heading text-xl font-semibold text-coffee-dark">
                {isLogin ? "Signed In!" : "Account Created!"}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {isLogin
                  ? "Redirecting you to your dashboard…"
                  : "A verification email has been sent. Check your inbox."}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-card border border-white/30 bg-surface-white/60 p-8 shadow-xl shadow-coffee-dark/5 backdrop-blur-xl sm:p-10"
            >
              {/* Mode tabs */}
              <div className="mb-8 flex rounded-button bg-surface-cream/80 p-1 backdrop-blur-sm">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (m !== mode) switchMode();
                    }}
                    className={`flex-1 rounded-[6px] py-2.5 text-sm font-medium transition-all cursor-pointer ${
                      mode === m
                        ? "bg-surface-white text-coffee-dark shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Email */}
              <FormField
                id="email"
                label="University Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@univ-constantine2.dz"
                icon={<HiOutlineMail size={18} />}
                error={errors.email}
                hint={
                  <p className="mt-1 text-xs text-text-muted">
                    Must end with{" "}
                    <span className="font-medium text-coffee-warm">
                      @univ-xxxx.dz
                    </span>
                  </p>
                }
              />

              {/* Auto-detected university */}
              {!isLogin && university && (
                <div className="mb-5 flex items-center gap-2 rounded-button bg-coffee-gold/10 px-4 py-2.5 text-sm backdrop-blur-sm">
                  <HiOutlineAcademicCap
                    size={18}
                    className="shrink-0 text-coffee-warm"
                  />
                  <span className="text-text-secondary">
                    Detected:{" "}
                    <span className="font-medium text-coffee-dark">
                      {university}
                    </span>
                  </span>
                </div>
              )}

              {/* Password */}
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                icon={<HiOutlineLockClosed size={18} />}
                error={errors.password}
              />

              {/* Confirm Password (register) */}
              {!isLogin && (
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<HiOutlineLockClosed size={18} />}
                  error={errors.confirmPassword}
                />
              )}

              {/* Remember / Forgot (login) */}
              {isLogin && (
                <div className="mb-6 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-surface-sand accent-coffee-warm"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-coffee-warm transition-colors hover:text-coffee-gold"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Terms checkbox (register) */}
              {!isLogin && (
                <div className="mb-6">
                  <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-surface-sand accent-coffee-warm"
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-coffee-warm hover:text-coffee-gold"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-coffee-warm hover:text-coffee-gold"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  <FieldError message={errors.terms} />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-button bg-coffee-warm py-3.5 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>

              {/* Switch mode text */}
              <p className="mt-6 text-center text-sm text-text-muted">
                {isLogin
                  ? "Don\u2019t have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-coffee-warm transition-colors hover:text-coffee-gold cursor-pointer"
                >
                  {isLogin ? "Register" : "Sign In"}
                </button>
              </p>
            </form>
          )}

          {/* Helper note */}
          <p className="mt-5 text-center text-xs text-text-muted lg:text-left">
            Only Algerian university emails (
            <span className="font-medium">@univ-xxxx.dz</span>) are accepted.
          </p>
        </div>
      </div>
    </section>
  );
}
