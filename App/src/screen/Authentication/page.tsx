"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineUser,
} from "react-icons/hi";

import Logo from "@/Components/Logo";
import FloatingOrbs from "@/Components/FloatingOrbs";
import FieldError from "@/Components/FieldError";
import { FormField, PasswordField } from "@/Components/FormField";
import AuthBrandPanel from "@/Components/AuthBrandPanel";
import { useLanguage } from "@/Components/LanguageContext";
import { useAuth } from "@/Components/AuthContext";

/* ============================================
   Email validation
   ============================================ */
const UNIV_EMAIL_REGEX = /^[^\s@]+@univ-[a-zA-Z0-9]+\.dz$/;

/* ============================================
   Component
   ============================================ */
export default function AuthenticationPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  /* ---- Shared fields ---- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---- Register-only fields ---- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* ---- State ---- */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

    if (!email) errs.email = t("auth.error.emailRequired");
    else if (!UNIV_EMAIL_REGEX.test(email))
      errs.email = t("auth.error.invalidEmail");

    if (!password) errs.password = t("auth.error.passwordRequired");
    else if (password.length < 8)
      errs.password = t("auth.error.passwordMin");

    if (mode === "register") {
      if (!firstName.trim()) errs.firstName = t("auth.error.firstNameRequired");
      if (!lastName.trim()) errs.lastName = t("auth.error.lastNameRequired");
      if (!confirmPassword)
        errs.confirmPassword = t("auth.error.confirmRequired");
      else if (confirmPassword !== password)
        errs.confirmPassword = t("auth.error.passwordMismatch");
      if (!agreeTerms) errs.terms = t("auth.error.termsRequired");
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, password, firstName, lastName, confirmPassword, agreeTerms, mode, t]);

  const isLogin = mode === "login";

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError(null);
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        if (isLogin) {
          await login(email, password);
        } else {
          await register({
            email,
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            university,
          });
        }
        router.push("/student");
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { error?: { message?: string } } };
        };
        setApiError(
          axiosErr.response?.data?.error?.message ??
            "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, isLogin, email, password, firstName, lastName, university, login, register, router]
  );

  /* ---- Switch mode ---- */
  const switchMode = useCallback(() => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
    setApiError(null);
  }, []);

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
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {isLogin
                ? t("auth.signInSubtitle")
                : t("auth.registerSubtitle")}
            </p>
          </div>

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
                  {m === "login" ? t("auth.tabSignIn") : t("auth.tabRegister")}
                </button>
              ))}
            </div>

            {/* First Name & Last Name (register only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="firstName"
                  label={t("auth.firstName")}
                  type="text"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder={t("auth.firstNamePlaceholder")}
                  icon={<HiOutlineUser size={18} />}
                  error={errors.firstName}
                />
                <FormField
                  id="lastName"
                  label={t("auth.lastName")}
                  type="text"
                  value={lastName}
                  onChange={setLastName}
                  placeholder={t("auth.lastNamePlaceholder")}
                  icon={<HiOutlineUser size={18} />}
                  error={errors.lastName}
                />
              </div>
            )}

            {/* Email */}
            <FormField
              id="email"
              label={t("auth.emailLabel")}
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t("auth.emailPlaceholder")}
              icon={<HiOutlineMail size={18} />}
              error={errors.email}
              hint={
                <p className="mt-1 text-xs text-text-muted">
                  {t("auth.emailHint")}
                  <span className="font-medium text-coffee-warm">
                    {t("auth.emailHintDomain")}
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
                  {t("auth.detected")}
                  <span className="font-medium text-coffee-dark">
                    {university}
                  </span>
                </span>
              </div>
            )}

            {/* Password */}
            <PasswordField
              id="password"
              label={t("auth.password")}
              value={password}
              onChange={setPassword}
              icon={<HiOutlineLockClosed size={18} />}
              error={errors.password}
            />

            {/* Confirm Password (register) */}
            {!isLogin && (
              <PasswordField
                id="confirmPassword"
                label={t("auth.confirmPassword")}
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
                  {t("auth.rememberMe")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-coffee-warm transition-colors hover:text-coffee-gold"
                >
                  {t("auth.forgotPassword")}
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
                    {t("auth.agreePrefix")}
                    <Link
                      href="/terms"
                      className="font-medium text-coffee-warm hover:text-coffee-gold"
                    >
                      {t("auth.termsLink")}
                    </Link>
                    {t("auth.agreeAnd")}
                    <Link
                      href="/privacy"
                      className="font-medium text-coffee-warm hover:text-coffee-gold"
                    >
                      {t("auth.privacyLink")}
                    </Link>
                    .
                  </span>
                </label>
                <FieldError message={errors.terms} />
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="mb-4 rounded-button border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-button bg-coffee-warm py-3.5 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? t("auth.signInBtn")
                  : t("auth.createAccountBtn")}
            </button>

            {/* Switch mode text */}
            <p className="mt-6 text-center text-sm text-text-muted">
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
              <button
                type="button"
                onClick={switchMode}
                className="font-medium text-coffee-warm transition-colors hover:text-coffee-gold cursor-pointer"
              >
                {isLogin ? t("auth.registerLink") : t("auth.signInLink")}
              </button>
            </p>
          </form>

          {/* Helper note */}
          <p className="mt-5 text-center text-xs text-text-muted lg:text-left">
            {t("auth.helperNote")}
            <span className="font-medium">{t("auth.emailHintDomain")}</span>
            {t("auth.helperNoteEnd")}
          </p>
        </div>
      </div>
    </section>
  );
}
