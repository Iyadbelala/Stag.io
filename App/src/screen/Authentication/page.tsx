"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineDocumentAdd,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
  HiOutlineSparkles,
  HiCheck,
} from "react-icons/hi";

import Logo from "@/Components/ui/Logo";
import FloatingOrbs from "@/Components/ui/FloatingOrbs";
import FieldError from "@/Components/ui/FieldError";
import Turnstile from "@/Components/ui/Turnstile";
import { FormField, PasswordField } from "@/Components/ui/FormField";
import AuthBrandPanel from "@/Components/features/AuthBrandPanel";
import AccountTypeCard from "@/Components/features/auth/AccountTypeCard";
import StepProgress from "@/Components/features/auth/StepProgress";
import StepShell from "@/Components/features/auth/StepShell";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { useAuth } from "@/Components/contexts/AuthContext";

/* ============================================
   Email validation
   ============================================ */
const GENERAL_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccountType = "student" | "company" | "university";

/* ============================================
   Component
   ============================================ */
interface AuthenticationPageProps {
  initialMode?: "login" | "register";
}

export default function AuthenticationPage({ initialMode = "login" }: AuthenticationPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoading, login, register, registerCompany, registerUniversity } = useAuth();

  /* ---- Redirect if already logged in ---- */
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(
        user.role === "company" ? "/company"
          : user.role === "admin" ? "/admin"
            : user.role === "superadmin" ? "/superadmin"
              : user.role === "university" ? "/university"
                : "/student"
      );
    }
  }, [user, isLoading, router]);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("student");

  /* ---- Shared fields ---- */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---- Student register fields ---- */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* ---- Company register fields ---- */
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);

  /* ---- University register fields ---- */
  const [universityName, setUniversityName] = useState("");
  const [domain, setDomain] = useState("");
  const [uniWebsite, setUniWebsite] = useState("");
  const [uniLocation, setUniLocation] = useState("");

  /* ---- State ---- */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isLogin = mode === "login";
  const isCompany = accountType === "company";
  const isUniversity = accountType === "university";

  const stepLabels = ["Type", "Details", "Email", "Security", "Finish"];

  /* ---- Email change (student auto-detect university) ---- */
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (accountType === "student") {
      const match = value.match(/@univ-([a-zA-Z0-9]+)\.dz$/);
      if (match) {
        const slug = match[1];
        setUniversity(`Université ${slug.charAt(0).toUpperCase()}${slug.slice(1)}`);
      } else {
        setUniversity("");
      }
    }
  }, [accountType]);

  /* ---- Per-step validation ---- */
  const validateStep = useCallback((s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (isCompany) {
        if (!companyName.trim()) errs.companyName = t("auth.error.companyNameRequired");
      } else if (isUniversity) {
        if (!universityName.trim()) errs.universityName = t("auth.error.universityNameRequired");
        if (!domain.trim()) errs.domain = t("auth.error.domainRequired");
      } else {
        if (!firstName.trim()) errs.firstName = t("auth.error.firstNameRequired");
        if (!lastName.trim()) errs.lastName = t("auth.error.lastNameRequired");
      }
    }

    if (s === 2) {
      if (!email) errs.email = t("auth.error.emailRequired");
      else if (!GENERAL_EMAIL_REGEX.test(email)) errs.email = t("auth.error.invalidEmailGeneral");
    }

    if (s === 3) {
      if (!password) errs.password = t("auth.error.passwordRequired");
      else if (password.length < 8) errs.password = t("auth.error.passwordMin");
      if (!confirmPassword) errs.confirmPassword = t("auth.error.confirmRequired");
      else if (confirmPassword !== password) errs.confirmPassword = t("auth.error.passwordMismatch");
    }

    if (s === 4) {
      if (!agreeTerms) errs.terms = t("auth.error.termsRequired");
      if (!turnstileToken) errs.turnstile = "Please complete the security check";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [isCompany, isUniversity, companyName, universityName, domain, firstName, lastName, email, password, confirmPassword, agreeTerms, turnstileToken, t]);

  /* ---- Login validation (single step) ---- */
  const validateLogin = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = t("auth.error.emailRequired");
    else if (!GENERAL_EMAIL_REGEX.test(email)) errs.email = t("auth.error.invalidEmailGeneral");
    if (!password) errs.password = t("auth.error.passwordRequired");
    if (!turnstileToken) errs.turnstile = "Please complete the security check";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, password, turnstileToken, t]);

  /* ---- Navigation ---- */
  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, stepLabels.length - 1));
  };
  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ---- Submit (register final) ---- */
  const handleRegisterSubmit = useCallback(async () => {
    if (!validateStep(4)) return;
    setApiError(null);
    setIsSubmitting(true);
    try {
      let resultUser;
      const cfToken = turnstileToken || undefined;
      if (isCompany) {
        resultUser = await registerCompany({
          email,
          password,
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim() || undefined,
          industry: industry.trim() || undefined,
          location: location.trim() || undefined,
          verificationDocument: verificationDocument || undefined,
        }, cfToken);
      } else if (isUniversity) {
        resultUser = await registerUniversity({
          email,
          password,
          universityName: universityName.trim(),
          domain: domain.trim(),
          website: uniWebsite.trim() || undefined,
          location: uniLocation.trim() || undefined,
        }, cfToken);
      } else {
        resultUser = await register({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          university,
        }, cfToken);
      }

      if (!resultUser) {
        router.push("/verify-email");
        return;
      }

      router.push(
        resultUser.role === "company" ? "/company"
          : resultUser.role === "admin" ? "/admin"
            : resultUser.role === "superadmin" ? "/superadmin"
              : resultUser.role === "university" ? "/university"
                : "/student"
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setApiError(axiosErr.response?.data?.error?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateStep, turnstileToken, isCompany, isUniversity, email, password, companyName, contactPerson, industry, location, verificationDocument, universityName, domain, uniWebsite, uniLocation, firstName, lastName, university, register, registerCompany, registerUniversity, router]);

  /* ---- Submit (login) ---- */
  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      const resultUser = await login(email, password, turnstileToken || undefined);
      if (!resultUser) {
        router.push("/verify-email");
        return;
      }
      router.push(
        resultUser.role === "company" ? "/company"
          : resultUser.role === "admin" ? "/admin"
            : resultUser.role === "superadmin" ? "/superadmin"
              : resultUser.role === "university" ? "/university"
                : "/student"
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setApiError(axiosErr.response?.data?.error?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateLogin, email, password, turnstileToken, login, router]);

  /* ---- Switch mode ---- */
  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setStep(0);
    setErrors({});
    setApiError(null);
  };

  /* ---- Step progress / done-check for cosmetic indicator ---- */
  const canProceedStep = useMemo(() => {
    if (step === 1) {
      if (isCompany) return !!companyName.trim();
      if (isUniversity) return !!universityName.trim() && !!domain.trim();
      return !!firstName.trim() && !!lastName.trim();
    }
    if (step === 2) return !!email && GENERAL_EMAIL_REGEX.test(email);
    if (step === 3) return password.length >= 8 && confirmPassword === password;
    if (step === 4) return agreeTerms && !!turnstileToken;
    return true;
  }, [step, isCompany, isUniversity, companyName, universityName, domain, firstName, lastName, email, password, confirmPassword, agreeTerms, turnstileToken]);

  /* ============================================
     Render
     ============================================ */
  return (
    <section className="relative flex min-h-[calc(100vh-80px)] overflow-hidden bg-surface-cream">
      <AuthBrandPanel />

      <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <FloatingOrbs />

        <div className="absolute top-4 left-4 lg:hidden">
          <Logo />
        </div>

        <div className="relative z-10 w-full max-w-[520px] mt-12 sm:mt-0">
          {/* Mode tabs (outside card, pill style) */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full border border-surface-sand/70 bg-surface-white/60 p-1 backdrop-blur-sm shadow-sm shadow-coffee-warm/5">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => m !== mode && switchMode()}
                  className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all cursor-pointer ${mode === m
                      ? "bg-gradient-to-r from-coffee-warm to-coffee-gold text-white shadow-md shadow-coffee-warm/20"
                      : "text-text-muted hover:text-coffee-warm"
                    }`}
                >
                  {m === "login" ? t("auth.tabSignIn") : t("auth.tabRegister")}
                </button>
              ))}
            </div>
          </div>

          {/* ===== LOGIN MODE ===== */}
          {isLogin && (
            <div className="animate-fade-in">
              <div className="mb-6 text-center lg:text-left">
                <h1 className="font-heading text-2xl font-bold text-coffee-dark sm:text-3xl">
                  {t("auth.welcomeBack")}
                </h1>
                <p className="mt-1.5 text-sm text-text-muted">{t("auth.signInSubtitle")}</p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                noValidate
                className="rounded-3xl border border-white/30 bg-surface-white/70 p-6 sm:p-8 shadow-xl shadow-coffee-dark/5 backdrop-blur-xl"
              >
                <FormField
                  id="email"
                  label={t("auth.loginEmailLabel")}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={t("auth.loginEmailPlaceholder")}
                  icon={<HiOutlineMail size={18} />}
                  error={errors.email}
                />
                <PasswordField
                  id="password"
                  label={t("auth.password")}
                  value={password}
                  onChange={setPassword}
                  icon={<HiOutlineLockClosed size={18} />}
                  error={errors.password}
                />

                <div className="mb-4 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-surface-sand accent-coffee-warm" />
                    {t("auth.rememberMe")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm font-medium text-coffee-warm transition-colors hover:text-coffee-gold"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                <div className="mb-4">
                  <Turnstile
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    className="flex justify-center"
                  />
                  <FieldError message={errors.turnstile} />
                </div>

                {apiError && (
                  <div className="mb-4 rounded-xl border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold py-3.5 text-sm font-semibold text-white shadow-lg shadow-coffee-warm/25 transition-all hover:shadow-xl hover:shadow-coffee-gold/30 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{isSubmitting ? t("common.signingIn") : t("auth.signInBtn")}</span>
                </button>

                <p className="mt-5 text-center text-sm text-text-muted">
                  {t("auth.noAccount")}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-medium text-coffee-warm transition-colors hover:text-coffee-gold cursor-pointer"
                  >
                    {t("auth.registerLink")}
                  </button>
                </p>
              </form>
            </div>
          )}

          {/* ===== REGISTER MODE — STEPPED ===== */}
          {!isLogin && (
            <div>
              {/* Progress */}
              <div className="mb-6 px-2">
                <StepProgress
                  steps={stepLabels}
                  current={step}
                  onStepClick={(i) => i < step && setStep(i)}
                />
              </div>

              <div className="rounded-3xl border border-white/30 bg-surface-white/70 p-6 sm:p-8 shadow-xl shadow-coffee-dark/5 backdrop-blur-xl">
                {/* ===== STEP 0: Account type ===== */}
                {step === 0 && (
                  <StepShell
                    title="How will you use Stag.io?"
                    subtitle="Choose the account type that matches you. You can't change this later."
                    icon={<HiOutlineSparkles size={22} />}
                    onNext={goNext}
                    canProceed={!!accountType}
                    nextLabel="Continue"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      <AccountTypeCard
                        icon={<HiOutlineAcademicCap size={24} />}
                        title="Student"
                        description="Find internships matched to your skills and studies."
                        features={["Smart matching", "Easy apply", "Track applications"]}
                        selected={accountType === "student"}
                        onClick={() => setAccountType("student")}
                        accent="warm"
                      />
                      <AccountTypeCard
                        icon={<HiOutlineOfficeBuilding size={24} />}
                        title="Company"
                        description="Post offers and hire the best talent from local universities."
                        features={["Post offers", "Screen candidates", "Verified badge"]}
                        selected={accountType === "company"}
                        onClick={() => setAccountType("company")}
                        accent="gold"
                      />
                      <AccountTypeCard
                        icon={<HiOutlineIdentification size={24} />}
                        title="University"
                        description="Connect your students with top internship opportunities."
                        features={["Manage students", "Partner network", "Analytics"]}
                        selected={accountType === "university"}
                        onClick={() => setAccountType("university")}
                        accent="sage"
                      />
                    </div>
                  </StepShell>
                )}

                {/* ===== STEP 1: Identity ===== */}
                {step === 1 && (
                  <StepShell
                    title={
                      isCompany ? "Tell us about your company"
                        : isUniversity ? "Tell us about your institution"
                          : "What's your name?"
                    }
                    subtitle={
                      isCompany ? "Basics about the organization — you can refine these later."
                        : isUniversity ? "We'll use this to verify your institution."
                          : "Your name as it should appear on your profile."
                    }
                    icon={<HiOutlineIdentification size={22} />}
                    onBack={goBack}
                    onNext={goNext}
                    canProceed={canProceedStep}
                  >
                    {!isCompany && !isUniversity && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
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

                    {isCompany && (
                      <>
                        <FormField
                          id="companyName"
                          label={t("auth.companyName")}
                          type="text"
                          value={companyName}
                          onChange={setCompanyName}
                          placeholder={t("auth.companyNamePlaceholder")}
                          icon={<HiOutlineOfficeBuilding size={18} />}
                          error={errors.companyName}
                        />
                        <FormField
                          id="contactPerson"
                          label={t("auth.contactPerson")}
                          type="text"
                          value={contactPerson}
                          onChange={setContactPerson}
                          placeholder={t("auth.contactPersonPlaceholder")}
                          icon={<HiOutlineUser size={18} />}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                          <FormField
                            id="industry"
                            label={t("auth.industry")}
                            type="text"
                            value={industry}
                            onChange={setIndustry}
                            placeholder={t("auth.industryPlaceholder")}
                            icon={<HiOutlineBriefcase size={18} />}
                          />
                          <FormField
                            id="location"
                            label={t("auth.location")}
                            type="text"
                            value={location}
                            onChange={setLocation}
                            placeholder={t("auth.locationPlaceholder")}
                            icon={<HiOutlineLocationMarker size={18} />}
                          />
                        </div>
                      </>
                    )}

                    {isUniversity && (
                      <>
                        <FormField
                          id="universityName"
                          label={t("auth.universityName")}
                          type="text"
                          value={universityName}
                          onChange={setUniversityName}
                          placeholder={t("auth.universityNamePlaceholder")}
                          icon={<HiOutlineAcademicCap size={18} />}
                          error={errors.universityName}
                        />
                        <FormField
                          id="domain"
                          label={t("auth.domain")}
                          type="text"
                          value={domain}
                          onChange={setDomain}
                          placeholder={t("auth.domainPlaceholder")}
                          icon={<HiOutlineGlobe size={18} />}
                          error={errors.domain}
                          hint={<p className="mt-1 text-xs text-text-muted">{t("auth.domainHint")}</p>}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                          <FormField
                            id="uniWebsite"
                            label={t("auth.website")}
                            type="text"
                            value={uniWebsite}
                            onChange={setUniWebsite}
                            placeholder={t("auth.websitePlaceholder")}
                            icon={<HiOutlineGlobe size={18} />}
                          />
                          <FormField
                            id="uniLocation"
                            label={t("auth.location")}
                            type="text"
                            value={uniLocation}
                            onChange={setUniLocation}
                            placeholder={t("auth.locationPlaceholder")}
                            icon={<HiOutlineLocationMarker size={18} />}
                          />
                        </div>
                      </>
                    )}
                  </StepShell>
                )}

                {/* ===== STEP 2: Email ===== */}
                {step === 2 && (
                  <StepShell
                    title="Your email address"
                    subtitle={
                      !isCompany && !isUniversity
                        ? "Use your university email for automatic verification."
                        : "We'll send a verification link here."
                    }
                    icon={<HiOutlineMail size={22} />}
                    onBack={goBack}
                    onNext={goNext}
                    canProceed={canProceedStep}
                  >
                    <FormField
                      id="email"
                      label={
                        isCompany ? t("auth.companyEmailLabel")
                          : isUniversity ? t("auth.universityEmailLabel")
                            : t("auth.emailLabel")
                      }
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder={
                        isCompany ? t("auth.companyEmailPlaceholder")
                          : isUniversity ? t("auth.universityEmailPlaceholder")
                            : t("auth.emailPlaceholder")
                      }
                      icon={<HiOutlineMail size={18} />}
                      error={errors.email}
                      hint={
                        !isCompany && !isUniversity ? (
                          <p className="mt-1 text-xs text-text-muted">
                            {t("auth.emailHint")}
                            <span className="font-medium text-coffee-warm">{t("auth.emailHintDomain")}</span>
                          </p>
                        ) : undefined
                      }
                    />

                    {!isCompany && !isUniversity && university && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl bg-coffee-gold/10 border border-coffee-gold/20 px-4 py-3 text-sm animate-fade-in">
                        <HiOutlineAcademicCap size={18} className="shrink-0 text-coffee-warm" />
                        <span className="text-text-secondary">
                          {t("auth.detected")}
                          <span className="font-medium text-coffee-dark">{university}</span>
                        </span>
                        <HiCheck size={16} className="ml-auto text-status-success" />
                      </div>
                    )}
                  </StepShell>
                )}

                {/* ===== STEP 3: Security ===== */}
                {step === 3 && (
                  <StepShell
                    title="Secure your account"
                    subtitle="Choose a strong password (at least 8 characters)."
                    icon={<HiOutlineLockClosed size={22} />}
                    onBack={goBack}
                    onNext={goNext}
                    canProceed={canProceedStep}
                  >
                    <PasswordField
                      id="password"
                      label={t("auth.password")}
                      value={password}
                      onChange={setPassword}
                      icon={<HiOutlineLockClosed size={18} />}
                      error={errors.password}
                    />
                    <PasswordField
                      id="confirmPassword"
                      label={t("auth.confirmPassword")}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      icon={<HiOutlineLockClosed size={18} />}
                      error={errors.confirmPassword}
                    />

                    {/* Password strength hints */}
                    {password && (
                      <div className="mb-2 grid grid-cols-2 gap-2 text-[11px]">
                        <PasswordHint met={password.length >= 8} label="8+ characters" />
                        <PasswordHint met={/[A-Z]/.test(password)} label="Uppercase letter" />
                        <PasswordHint met={/[0-9]/.test(password)} label="Number" />
                        <PasswordHint met={password === confirmPassword && !!confirmPassword} label="Passwords match" />
                      </div>
                    )}
                  </StepShell>
                )}

                {/* ===== STEP 4: Finish ===== */}
                {step === 4 && (
                  <StepShell
                    title="Almost there!"
                    subtitle="Review and complete the last details to create your account."
                    icon={<HiOutlineShieldCheck size={22} />}
                    onBack={goBack}
                    onSubmit={handleRegisterSubmit}
                    isFinal
                    isSubmitting={isSubmitting}
                    canProceed={canProceedStep}
                    submitLabel={t("auth.createAccountBtn")}
                  >
                    {/* Summary card */}
                    <div className="mb-5 rounded-2xl border border-surface-sand/70 bg-surface-cream/40 p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Review</p>
                      <div className="space-y-1.5 text-sm">
                        <SummaryRow label="Account" value={accountType.charAt(0).toUpperCase() + accountType.slice(1)} />
                        <SummaryRow
                          label="Name"
                          value={
                            isCompany ? companyName
                              : isUniversity ? universityName
                                : `${firstName} ${lastName}`.trim()
                          }
                        />
                        <SummaryRow label="Email" value={email} />
                        {!isCompany && !isUniversity && university && (
                          <SummaryRow label="University" value={university} />
                        )}
                      </div>
                    </div>

                    {/* Verification doc (company only) */}
                    {isCompany && (
                      <div className="mb-5">
                        <label htmlFor="verificationDocument" className="mb-1.5 block text-sm font-medium text-text-primary">
                          {t("auth.verificationDocument")}
                        </label>
                        <label
                          htmlFor="verificationDocument"
                          className={`flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 text-sm cursor-pointer transition-all ${verificationDocument
                              ? "border-coffee-gold/50 bg-coffee-gold/5"
                              : "border-surface-sand hover:border-coffee-gold/40 hover:bg-surface-cream/50"
                            }`}
                        >
                          <HiOutlineDocumentAdd size={20} className="shrink-0 text-coffee-warm" />
                          <span className={verificationDocument ? "text-text-primary font-medium" : "text-text-muted/70"}>
                            {verificationDocument ? verificationDocument.name : t("auth.verificationDocumentPlaceholder")}
                          </span>
                          {verificationDocument && (
                            <HiCheck size={16} className="ml-auto text-status-success" />
                          )}
                        </label>
                        <input
                          id="verificationDocument"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => setVerificationDocument(e.target.files?.[0] || null)}
                        />
                        <p className="mt-1 text-xs text-text-muted">{t("auth.verificationDocumentHint")}</p>
                      </div>
                    )}

                    {/* Terms */}
                    <div className="mb-4">
                      <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-surface-sand accent-coffee-warm"
                        />
                        <span>
                          {t("auth.agreePrefix")}
                          <Link href="/terms" className="font-medium text-coffee-warm hover:text-coffee-gold">
                            {t("auth.termsLink")}
                          </Link>
                          {t("auth.agreeAnd")}
                          <Link href="/privacy" className="font-medium text-coffee-warm hover:text-coffee-gold">
                            {t("auth.privacyLink")}
                          </Link>.
                        </span>
                      </label>
                      <FieldError message={errors.terms} />
                    </div>

                    {/* Turnstile */}
                    <div className="mb-4">
                      <Turnstile
                        onVerify={(token) => setTurnstileToken(token)}
                        onExpire={() => setTurnstileToken(null)}
                        className="flex justify-center"
                      />
                      <FieldError message={errors.turnstile} />
                    </div>

                    {apiError && (
                      <div className="mb-4 rounded-xl border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
                        {apiError}
                      </div>
                    )}
                  </StepShell>
                )}
              </div>

              <p className="mt-5 text-center text-sm text-text-muted">
                {t("auth.hasAccount")}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-coffee-warm transition-colors hover:text-coffee-gold cursor-pointer"
                >
                  {t("auth.signInLink")}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   Small helpers
   ============================================ */
function PasswordHint({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 transition-colors ${met ? "text-status-success" : "text-text-muted/60"}`}>
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-all ${met ? "bg-status-success/15" : "bg-surface-sand"}`}>
        {met && <HiCheck size={10} />}
      </span>
      {label}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-coffee-dark truncate">{value || "—"}</span>
    </div>
  );
}
