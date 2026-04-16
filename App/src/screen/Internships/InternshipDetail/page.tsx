"use client";

import { useState, useEffect, useRef } from "react";
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
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiPlay,
  HiPause,
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

  /* ---- Video state ---- */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const revealControls = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2200);
  };

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
  const hasMedia = !!(internship.bannerUrl || internship.videoUrl);

  const handleShare = () => {
    const url = `${window.location.origin}/internships/${internship.id}`;
    if (navigator.share) {
      navigator.share({ title: internship.title, text: `${internship.title} at ${internship.companyName}`, url });
    } else {
      navigator.clipboard.writeText(url);
      setApplySuccess("Link copied!");
      setTimeout(() => setApplySuccess(null), 2000);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-surface-cream via-surface-cream to-surface-white">
      {/* ---- Top navigation bar ---- */}
      <div className="sticky top-0 z-20 border-b border-surface-sand/70 bg-surface-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/internships"
            className="group flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
          >
            <HiOutlineChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            {t("internships.backToList") || "Back to internships"}
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleSave(internship.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-all hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
              aria-label={t("internships.save")}
            >
              {isSaved ? <HiBookmark size={20} className="text-coffee-warm" /> : <HiOutlineBookmark size={20} />}
            </button>
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-all hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
              aria-label={t("internships.share")}
            >
              <HiOutlineShare size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Detail content ---- */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="rounded-3xl border border-surface-sand/70 bg-surface-white shadow-sm shadow-coffee-warm/5 overflow-hidden animate-fade-in">
          {/* Media (banner / video) */}
          {hasMedia && (
            <div className="relative">
              {internship.videoUrl ? (
                <div
                  className="relative bg-coffee-dark group/video cursor-pointer select-none"
                  onClick={togglePlay}
                  onMouseMove={revealControls}
                  onMouseLeave={() => {
                    if (videoRef.current && !videoRef.current.paused) setShowControls(false);
                  }}
                >
                  <video
                    ref={videoRef}
                    src={internship.videoUrl}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    poster={internship.bannerUrl || undefined}
                    onPlay={() => { setIsPlaying(true); revealControls(); }}
                    onPause={() => { setIsPlaying(false); setShowControls(true); }}
                    className="h-60 sm:h-96 w-full object-cover"
                  />

                  {/* Gradient for legibility */}
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-coffee-dark/50 via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`} />

                  {/* Center play/pause button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-surface-white/90 backdrop-blur-sm text-coffee-dark shadow-2xl shadow-coffee-dark/40 transition-all duration-300 hover:scale-110 hover:bg-surface-white cursor-pointer ${showControls || !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}
                  >
                    {isPlaying ? (
                      <HiPause size={32} className="sm:w-10 sm:h-10" />
                    ) : (
                      <HiPlay size={32} className="sm:w-10 sm:h-10 translate-x-0.5" />
                    )}
                  </button>

                  {/* Mute toggle — top-right so it's not covered by the floating header */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-coffee-dark/70 backdrop-blur-sm text-surface-white shadow-lg shadow-coffee-dark/30 transition-all hover:bg-coffee-dark/90 hover:scale-105 cursor-pointer"
                  >
                    {isMuted ? <HiOutlineVolumeOff size={18} /> : <HiOutlineVolumeUp size={18} />}
                  </button>
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <img src={internship.bannerUrl!} alt="" className="h-48 sm:h-64 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-white/60 via-transparent to-transparent" />
                </div>
              )}
            </div>
          )}

          {/* Header — floats over media when present */}
          <div className={`px-6 sm:px-10 ${hasMedia ? "-mt-10 sm:-mt-14 relative z-10" : "pt-8 sm:pt-10"}`}>
            <div className="flex items-start gap-4 sm:gap-5">
              <div className={`${hasMedia ? "rounded-2xl bg-surface-white p-1.5 shadow-md shadow-coffee-dark/10 ring-1 ring-surface-sand" : ""}`}>
                <CompanyAvatar name={internship.companyName} logoUrl={internship.companyLogoUrl} size="lg" />
              </div>
              <div className="flex-1 min-w-0 pt-2 sm:pt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-coffee-warm uppercase tracking-wider">
                    {typeIcon(internship.type)}
                    {typeLabel(internship.type)}
                  </span>
                  <span className="text-[11px] text-text-muted/70 flex items-center gap-1">
                    <HiOutlineClock size={12} />
                    {timeAgo(internship.createdAt)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-coffee-dark leading-tight tracking-tight">
                  {internship.title}
                </h1>
                <p className="mt-1.5 text-sm font-medium text-text-secondary">
                  {internship.companyName}
                  {internship.companyIndustry && (
                    <span className="font-normal text-text-muted"> · {internship.companyIndustry}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Info chips grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-cream/60 border border-surface-sand/60 px-3.5 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coffee-warm/10 text-coffee-warm shrink-0">
                  <HiOutlineLocationMarker size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">{t("internships.detail.location") || "Location"}</p>
                  <p className="text-xs font-semibold text-coffee-dark truncate">{internship.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-cream/60 border border-surface-sand/60 px-3.5 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coffee-gold/15 text-coffee-gold shrink-0">
                  <HiOutlineCalendar size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">{t("internships.detail.duration") || "Duration"}</p>
                  <p className="text-xs font-semibold text-coffee-dark truncate">{internship.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-surface-cream/60 border border-surface-sand/60 px-3.5 py-2.5 col-span-2 sm:col-span-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-logo-sage/15 text-logo-sage shrink-0">
                  <HiOutlineBriefcase size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">{t("internships.detail.type") || "Type"}</p>
                  <p className="text-xs font-semibold text-coffee-dark truncate">{typeLabel(internship.type)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-2.5">
              <button
                onClick={() => handleApplyClick(internship.id)}
                disabled={applyingId === internship.id || appliedIds.has(internship.id)}
                className={`flex-1 sm:flex-none rounded-xl px-8 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  appliedIds.has(internship.id)
                    ? "bg-status-success text-white cursor-default"
                    : "bg-gradient-to-r from-coffee-warm to-coffee-gold text-white shadow-lg shadow-coffee-warm/20 hover:shadow-xl hover:shadow-coffee-warm/30 hover:-translate-y-0.5"
                } disabled:opacity-60 disabled:hover:translate-y-0`}
              >
                {applyingId === internship.id
                  ? t("common.applying")
                  : appliedIds.has(internship.id)
                  ? `${t("common.applied")} ✓`
                  : t("internships.applyNow")}
              </button>
              <button
                onClick={() => toggleSave(internship.id)}
                className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl border border-surface-sand bg-surface-white text-text-muted transition-all hover:border-coffee-gold/40 hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
                aria-label={t("internships.save")}
              >
                {isSaved ? (
                  <HiBookmark size={18} className="text-coffee-warm" />
                ) : (
                  <HiOutlineBookmark size={18} />
                )}
              </button>
              <button
                onClick={handleShare}
                className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl border border-surface-sand bg-surface-white text-text-muted transition-all hover:border-coffee-gold/40 hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
                aria-label={t("internships.share")}
              >
                <HiOutlineShare size={18} />
              </button>
            </div>

            {/* Feedback */}
            {applyError && (
              <p className="mt-3 rounded-lg bg-status-error/5 border border-status-error/15 px-3 py-2 text-sm text-status-error animate-fade-in">{applyError}</p>
            )}
            {applySuccess && (
              <p className="mt-3 rounded-lg bg-status-success/5 border border-status-success/15 px-3 py-2 text-sm text-status-success animate-fade-in">{applySuccess}</p>
            )}
          </div>

          {/* Content area */}
          <div className="px-6 sm:px-10 pt-8 pb-10 mt-2 space-y-8">
            {/* Description */}
            <div className="relative">
              <h2 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-coffee-dark">
                <span className="flex h-7 w-1 rounded-full bg-gradient-to-b from-coffee-warm to-coffee-gold" />
                {t("internships.detail.description")}
              </h2>
              <p className="text-[15px] leading-[1.75] text-text-secondary whitespace-pre-line">
                {internship.description}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-surface-sand to-transparent" />

            {/* Requirements */}
            <div className="relative">
              <h2 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-coffee-dark">
                <span className="flex h-7 w-1 rounded-full bg-gradient-to-b from-coffee-gold to-logo-sage" />
                {t("internships.detail.requirements")}
              </h2>
              <p className="text-[15px] leading-[1.75] text-text-secondary whitespace-pre-line">
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
