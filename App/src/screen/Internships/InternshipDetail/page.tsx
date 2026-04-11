"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineLocationMarker,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineShare,
  HiOutlineChevronLeft,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { useAuth } from "@/Components/contexts/AuthContext";
import { api } from "@/lib/api";
import { CompanyAvatar } from "../components/CompanyAvatar";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import { typeLabel, typeIcon, timeAgo } from "../utils";
import type { Internship } from "../types";

export default function InternshipDetailPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyModalOfferId, setApplyModalOfferId] = useState<string | null>(null);

  /* ---- Fetch internship detail ---- */
  useEffect(() => {
    async function fetchOffer() {
      try {
        const { data } = await api.get<{ success: true; data: Internship }>(`/api/offers/${id}`);
        setInternship(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchOffer();
  }, [id]);

  /* ---- Fetch saved IDs ---- */
  useEffect(() => {
    if (!user) return;
    api.get<{ success: true; data: string[] }>("/api/saved")
      .then(({ data }) => setSavedIds(new Set(data.data)))
      .catch(() => {});
  }, [user]);

  const toggleSave = async (offerId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const wasSaved = savedIds.has(offerId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(offerId);
      else next.add(offerId);
      return next;
    });
    try {
      await api.post(`/api/saved/${offerId}`);
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(offerId);
        else next.delete(offerId);
        return next;
      });
    }
  };

  const handleApplyClick = (offerId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "student") {
      setApplyError(t("internships.onlyStudents"));
      setTimeout(() => setApplyError(null), 4000);
      return;
    }
    setApplyModalOfferId(offerId);
  };

  const handleSubmitApplication = async (offerId: string, coverLetter: string, cvUrl: string) => {
    setApplyingId(offerId);
    setApplyError(null);
    setApplySuccess(null);

    try {
      await api.post("/api/applications", {
        offerId,
        coverLetter: coverLetter || undefined,
        cvUrl: cvUrl || undefined,
      });
      setAppliedIds((prev) => new Set(prev).add(offerId));
      setApplySuccess(t("internships.applicationSuccess"));
      setTimeout(() => setApplySuccess(null), 4000);
      setApplyModalOfferId(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = e.response?.data?.error?.message ?? t("internships.applicationFailed");
      setApplyError(msg);
      setTimeout(() => setApplyError(null), 4000);
    } finally {
      setApplyingId(null);
    }
  };

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <span className="animate-logo-breathe font-heading text-3xl font-bold tracking-tight select-none">
          <span className="text-coffee-dark">Stag</span>
          <span className="text-coffee-gold">.</span>
          <span className="text-logo-sage">io</span>
        </span>
      </div>
    );
  }

  /* ---- Not found ---- */
  if (notFound || !internship) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-surface-cream">
        <div className="h-16 w-16 rounded-2xl bg-surface-white border border-surface-sand flex items-center justify-center mb-4">
          <HiOutlineBriefcase size={28} className="text-text-muted/30" />
        </div>
        <p className="text-sm text-text-muted mb-4">{t("internships.notFound") || "Internship not found"}</p>
        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
        >
          <HiOutlineChevronLeft size={16} />
          {t("internships.backToList") || "Back to internships"}
        </Link>
      </div>
    );
  }

  const isSaved = savedIds.has(internship.id);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {/* ---- Top navigation bar ---- */}
      <div className="border-b border-surface-sand bg-surface-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/internships"
            className="flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
          >
            <HiOutlineChevronLeft size={18} />
            {t("internships.backToList") || "Back to internships"}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSave(internship.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
            >
              {isSaved ? <HiBookmark size={20} className="text-coffee-warm" /> : <HiOutlineBookmark size={20} />}
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/internships/${internship.id}`;
                if (navigator.share) {
                  navigator.share({ title: internship.title, text: `${internship.title} at ${internship.companyName}`, url });
                } else {
                  navigator.clipboard.writeText(url);
                  setApplySuccess("Link copied!");
                  setTimeout(() => setApplySuccess(null), 2000);
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
            >
              <HiOutlineShare size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Detail content ---- */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="rounded-2xl border border-surface-sand bg-surface-white overflow-hidden animate-fade-in">
          {/* Banner */}
          {internship.bannerUrl && (
            <div className="overflow-hidden">
              <img src={internship.bannerUrl} alt="" className="h-44 sm:h-56 w-full object-cover" />
            </div>
          )}

          {/* Header */}
          <div className="p-6 sm:p-8 pb-0">
            <div className="flex items-start gap-4">
              <CompanyAvatar name={internship.companyName} logoUrl={internship.companyLogoUrl} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-coffee-dark leading-tight">
                  {internship.title}
                </h1>
                <p className="mt-1 text-sm font-medium text-text-secondary">
                  {internship.companyName}
                  {internship.companyIndustry && (
                    <span className="font-normal text-text-muted"> · {internship.companyIndustry}</span>
                  )}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                    <HiOutlineLocationMarker size={13} className="text-text-muted" />
                    {internship.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                    {typeIcon(internship.type)}
                    {typeLabel(internship.type)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                    <HiOutlineCalendar size={13} className="text-text-muted" />
                    {internship.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-muted">
                    <HiOutlineClock size={13} />
                    {timeAgo(internship.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-2.5">
              <button
                onClick={() => handleApplyClick(internship.id)}
                disabled={applyingId === internship.id || appliedIds.has(internship.id)}
                className={`rounded-xl px-7 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  appliedIds.has(internship.id)
                    ? "bg-status-success text-white cursor-default"
                    : "bg-gradient-to-r from-coffee-warm to-coffee-gold text-white shadow-md shadow-coffee-warm/15 hover:shadow-lg hover:shadow-coffee-warm/25"
                } disabled:opacity-60`}
              >
                {applyingId === internship.id
                  ? t("common.applying")
                  : appliedIds.has(internship.id)
                  ? `${t("common.applied")} ✓`
                  : t("internships.applyNow")}
              </button>
              <button
                onClick={() => toggleSave(internship.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-sand text-text-muted transition-all hover:border-coffee-gold/30 hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
                aria-label={t("internships.save")}
              >
                {isSaved ? (
                  <HiBookmark size={18} className="text-coffee-warm" />
                ) : (
                  <HiOutlineBookmark size={18} />
                )}
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/internships/${internship.id}`;
                  if (navigator.share) {
                    navigator.share({ title: internship.title, text: `${internship.title} at ${internship.companyName}`, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    setApplySuccess("Link copied to clipboard!");
                    setTimeout(() => setApplySuccess(null), 2000);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-sand text-text-muted transition-all hover:border-coffee-gold/30 hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
                aria-label={t("internships.share")}
              >
                <HiOutlineShare size={18} />
              </button>
              <span className="ml-auto text-[12px] text-text-muted/60">
                <HiOutlineClock size={13} className="inline mr-0.5 -mt-0.5" />
                {timeAgo(internship.createdAt)}
              </span>
            </div>

            {/* Feedback */}
            {applyError && (
              <p className="mt-3 rounded-lg bg-status-error/5 border border-status-error/15 px-3 py-2 text-sm text-status-error">{applyError}</p>
            )}
            {applySuccess && (
              <p className="mt-3 rounded-lg bg-status-success/5 border border-status-success/15 px-3 py-2 text-sm text-status-success">{applySuccess}</p>
            )}
          </div>

          {/* Content area */}
          <div className="p-6 sm:p-8 pt-5 space-y-6 pb-8">
            <div className="h-px bg-surface-sand" />

            {/* Description */}
            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-coffee-warm" />
                {t("internships.detail.description")}
              </h2>
              <p className="text-sm leading-[1.7] text-text-secondary whitespace-pre-line">
                {internship.description}
              </p>
            </div>

            <div className="h-px bg-surface-sand" />

            {/* Requirements */}
            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-coffee-gold" />
                {t("internships.detail.requirements")}
              </h2>
              <p className="text-sm leading-[1.7] text-text-secondary whitespace-pre-line">
                {internship.requirements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Mobile sticky apply bar ---- */}
      <div className="sticky bottom-0 border-t border-surface-sand bg-surface-white/95 backdrop-blur-sm px-4 py-3 sm:hidden">
        <button
          onClick={() => handleApplyClick(internship.id)}
          disabled={applyingId === internship.id || appliedIds.has(internship.id)}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer ${
            appliedIds.has(internship.id)
              ? "bg-status-success text-white cursor-default"
              : "bg-gradient-to-r from-coffee-warm to-coffee-gold text-white shadow-md shadow-coffee-warm/15 hover:shadow-lg"
          } disabled:opacity-60`}
        >
          {applyingId === internship.id
            ? t("common.applying")
            : appliedIds.has(internship.id)
            ? `${t("common.applied")} ✓`
            : t("internships.applyNow")}
        </button>
      </div>

      {/* ---- Application Form Modal ---- */}
      {applyModalOfferId && (
        <ApplicationFormModal
          offerTitle={internship.title}
          companyName={internship.companyName}
          isSubmitting={applyingId === applyModalOfferId}
          onClose={() => setApplyModalOfferId(null)}
          onSubmit={(coverLetter, cvUrl) =>
            handleSubmitApplication(applyModalOfferId, coverLetter, cvUrl)
          }
          t={t}
        />
      )}
    </section>
  );
}
