"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineShare,
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineLink,
} from "react-icons/hi";
import { useLanguage } from "@/Components/LanguageContext";
import { useAuth } from "@/Components/AuthContext";
import { api } from "@/lib/api";

/* ============================================
   Types
   ============================================ */
interface Internship {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  companyName: string;
  companyIndustry: string | null;
  companyLocation: string | null;
  applicationCount: number;
  createdAt: string;
}

/* ============================================
   Application Form Modal
   ============================================ */
interface ApplicationFormModalProps {
  offerTitle: string;
  companyName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string, cvUrl: string) => void;
  t: (key: string) => string;
}

function ApplicationFormModal({ offerTitle, companyName, isSubmitting, onClose, onSubmit, t }: ApplicationFormModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(coverLetter, cvUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer"
        >
          <HiOutlineX size={20} />
        </button>

        <h2 className="mb-1 text-xl font-heading font-bold text-coffee-dark">
          {offerTitle}
        </h2>
        <p className="mb-6 text-sm text-text-muted">{companyName}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CV URL */}
          <div>
            <label htmlFor="cvUrl" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary">
              <HiOutlineLink size={16} className="text-text-muted" />
              {t("internships.cvResumeLink")}
            </label>
            <input
              id="cvUrl"
              type="url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://drive.google.com/your-cv or LinkedIn URL"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
            <p className="mt-1 text-xs text-text-muted">
              {t("internships.cvHint")}
            </p>
          </div>

          {/* Cover Letter */}
          <div>
            <label htmlFor="coverLetter" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary">
              <HiOutlineDocumentText size={16} className="text-text-muted" />
              {t("internships.coverLetter")}
            </label>
            <textarea
              id="coverLetter"
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the company why you're a great fit for this internship..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-button bg-coffee-warm py-3.5 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("common.submitting") : t("common.submitApplication")}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================
   Component
   ============================================ */
export default function InternshipsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyParam = searchParams.get("company") ?? "";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState(companyParam);
  const [location, setLocation] = useState("");
  const [committedSearch, setCommittedSearch] = useState(companyParam);
  const [committedLocation, setCommittedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyModalOfferId, setApplyModalOfferId] = useState<string | null>(null);

  /* ---- Fetch internships from API ---- */
  useEffect(() => {
    async function fetchInternships() {
      try {
        const { data } = await api.get<{ success: true; data: Internship[] }>("/api/offers");
        setInternships(data.data);
        if (data.data.length > 0) {
          setSelectedId(data.data[0].id);
        }
      } catch {
        setInternships([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInternships();
  }, []);

  // Unique locations for suggestions
  const locationSuggestions = useMemo(() => {
    const all = internships.map((i) => i.location).filter(Boolean);
    return [...new Set(all)];
  }, [internships]);

  const filteredLocations = useMemo(() => {
    const loc = location.trim().toLowerCase();
    if (!loc) return locationSuggestions;
    return locationSuggestions.filter((l) => l.toLowerCase().includes(loc));
  }, [location, locationSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = () => {
    setCommittedSearch(search);
    setCommittedLocation(location);
  };

  const handleApplyClick = (offerId: string) => {
    // Must be logged in as a student
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

  const filtered = useMemo(() => {
    const q = committedSearch.trim().toLowerCase();
    const loc = committedLocation.trim().toLowerCase();
    return internships.filter((i) => {
      const matchesSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.companyName.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q);
      const matchesLocation =
        !loc || i.location.toLowerCase().includes(loc);
      return matchesSearch && matchesLocation;
    });
  }, [committedSearch, committedLocation, internships]);

  const selected = internships.find((i) => i.id === selectedId) ?? null;

  const typeLabel = (type: string) => {
    switch (type) {
      case "remote": return "Remote";
      case "hybrid": return "Hybrid";
      default: return "On-site";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {/* Search bar */}
      <div className="border-b border-surface-sand bg-surface-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiOutlineSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("internships.searchPlaceholder")}
              className="w-full rounded-button border border-surface-sand bg-surface-cream py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-coffee-warm focus:outline-none"
            />
          </div>
          <div className="relative sm:w-56" ref={locationRef}>
            <HiOutlineLocationMarker
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted z-10"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocationOpen(true);
              }}
              onFocus={() => setLocationOpen(true)}
              placeholder={t("internships.locationPlaceholder")}
              className="w-full rounded-button border border-surface-sand bg-surface-cream py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-coffee-warm focus:outline-none"
            />
            {locationOpen && filteredLocations.length > 0 && (
              <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-card border border-surface-sand bg-surface-white shadow-lg">
                {filteredLocations.map((loc) => (
                  <li key={loc}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setLocationOpen(false);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-coffee-gold/10"
                    >
                      <HiOutlineLocationMarker size={14} className="shrink-0 text-text-muted" />
                      {loc}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={handleSearch} className="rounded-button bg-coffee-warm px-6 py-2.5 text-sm font-medium text-text-inverse shadow-sm transition-all hover:bg-coffee-gold cursor-pointer">
            {t("internships.searchBtn")}
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="border-b border-surface-sand bg-surface-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
          <p className="text-sm text-text-muted">
            {t("internships.sortBy")}{" "}
            <button className="font-medium text-coffee-warm hover:text-coffee-gold cursor-pointer">
              {t("internships.relevance")}
            </button>
            {" · "}
            <button className="font-medium text-coffee-warm hover:text-coffee-gold cursor-pointer">
              {t("internships.date")}
            </button>
          </p>
          <p className="text-sm text-text-muted">
            {filtered.length} {t("internships.results")}
          </p>
        </div>
      </div>

      {/* Main split layout */}
      <div className="mx-auto flex max-w-7xl gap-0 px-0 lg:px-6 py-0 lg:py-6">
        {/* ---- LEFT: Card list ---- */}
        <div
          className={`w-full lg:w-[420px] shrink-0 overflow-y-auto bg-surface-white lg:rounded-card lg:border lg:border-surface-sand lg:max-h-[calc(100vh-220px)] ${
            selected ? "hidden lg:block" : ""
          }`}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HiOutlineSearch size={40} className="mb-3 text-text-muted/50" />
              <p className="text-sm text-text-muted">
                {internships.length === 0
                  ? t("internships.noInternshipsYet")
                  : t("internships.noResults")}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`relative flex w-full cursor-pointer flex-col gap-1.5 border-b border-surface-sand px-5 py-4 text-left transition-all duration-300 ease-out hover:bg-coffee-gold/5 ${
                  selectedId === item.id
                    ? "border-l-[3px] border-l-coffee-warm bg-coffee-gold/5"
                    : "border-l-[3px] border-l-transparent"
                }`}
              >
                {/* Bookmark top-right */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(item.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      toggleSave(item.id);
                    }
                  }}
                  className="absolute right-4 top-4 text-text-muted transition-colors hover:text-coffee-warm"
                >
                  {savedIds.has(item.id) ? (
                    <HiBookmark size={18} className="text-coffee-warm" />
                  ) : (
                    <HiOutlineBookmark size={18} />
                  )}
                </span>

                {/* Posted badge */}
                <span className="w-fit rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-coffee-warm">
                  {timeAgo(item.createdAt)}
                </span>

                {/* Title */}
                <h3 className="pr-8 text-[15px] font-semibold leading-snug text-coffee-dark">
                  {item.title}
                </h3>

                {/* Company */}
                <p className="text-sm text-text-secondary">{item.companyName}</p>

                {/* Location */}
                <p className="text-[13px] text-text-muted">{item.location}</p>

                {/* Tags row */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded border border-surface-sand bg-surface-cream px-2 py-0.5 text-[11px] text-text-muted">
                    {typeLabel(item.type)}
                  </span>
                  <span className="rounded border border-surface-sand bg-surface-cream px-2 py-0.5 text-[11px] text-text-muted">
                    {item.duration}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ---- RIGHT: Detail panel ---- */}
        <div
          className={`flex-1 overflow-y-auto bg-surface-white lg:rounded-card lg:border lg:border-surface-sand lg:max-h-[calc(100vh-220px)] ${
            selected ? "" : "hidden lg:flex lg:items-center lg:justify-center"
          }`}
        >
          {selected ? (
            <div className="p-6 sm:p-8">
              {/* Mobile back button */}
              <button
                onClick={() => setSelectedId(null)}
                className="mb-4 flex items-center gap-1 text-sm text-coffee-warm hover:text-coffee-gold lg:hidden cursor-pointer"
              >
                <HiOutlineChevronLeft size={16} />
                {t("internships.backToList")}
              </button>

              {/* Header */}
              <div className="mb-4">
                <h1 className="text-xl font-bold text-coffee-dark sm:text-2xl">
                  {selected.title}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  {selected.companyName}
                </p>
                <p className="mt-0.5 text-[13px] text-text-muted">
                  {selected.location}
                </p>
              </div>

              {/* Actions */}
              <div className="mb-2 flex items-center gap-3">
                <button
                  onClick={() => handleApplyClick(selected.id)}
                  disabled={applyingId === selected.id || appliedIds.has(selected.id)}
                  className={`rounded-button px-6 py-2.5 text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                    appliedIds.has(selected.id)
                      ? "bg-green-600 text-white cursor-default"
                      : "bg-coffee-warm text-text-inverse hover:bg-coffee-gold"
                  } disabled:opacity-60`}
                >
                  {applyingId === selected.id
                    ? t("common.applying")
                    : appliedIds.has(selected.id)
                    ? `${t("common.applied")} ✓`
                    : t("internships.applyNow")}
                </button>
                <button
                  onClick={() => toggleSave(selected.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-button border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                  aria-label={t("internships.save")}
                >
                  {savedIds.has(selected.id) ? (
                    <HiBookmark size={18} className="text-coffee-warm" />
                  ) : (
                    <HiOutlineBookmark size={18} />
                  )}
                </button>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-button border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                  aria-label={t("internships.share")}
                >
                  <HiOutlineShare size={18} />
                </button>
              </div>

              {/* Apply feedback */}
              {applyError && (
                <p className="mb-4 text-sm text-red-500">{applyError}</p>
              )}
              {applySuccess && (
                <p className="mb-4 text-sm text-green-600">{applySuccess}</p>
              )}

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Job details section */}
              <div className="mb-6">
                <h2 className="mb-4 text-base font-semibold text-coffee-dark">
                  {t("internships.detail.jobDetails")}
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.type")}</p>
                      <p className="text-[13px] text-text-muted">{typeLabel(selected.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineOfficeBuilding size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.company")}</p>
                      <p className="text-[13px] text-text-muted">{selected.companyName}{selected.companyIndustry ? ` · ${selected.companyIndustry}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineCalendar size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.duration")}</p>
                      <p className="text-[13px] text-text-muted">{selected.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineClock size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.posted")}</p>
                      <p className="text-[13px] text-text-muted">{timeAgo(selected.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-3 text-base font-semibold text-coffee-dark">
                  {t("internships.detail.description")}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {selected.description}
                </p>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Requirements */}
              <div>
                <h2 className="mb-3 text-base font-semibold text-coffee-dark">
                  {t("internships.detail.requirements")}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                  {selected.requirements}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HiOutlineBriefcase size={48} className="mb-4 text-text-muted/30" />
              <p className="text-sm text-text-muted">
                {t("internships.selectPrompt")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Application Form Modal ---- */}
      {applyModalOfferId && (() => {
        const offer = internships.find((i) => i.id === applyModalOfferId);
        return (
          <ApplicationFormModal
            offerTitle={offer?.title ?? ""}
            companyName={offer?.companyName ?? ""}
            isSubmitting={applyingId === applyModalOfferId}
            onClose={() => setApplyModalOfferId(null)}
            onSubmit={(coverLetter, cvUrl) =>
              handleSubmitApplication(applyModalOfferId, coverLetter, cvUrl)
            }
            t={t}
          />
        );
      })()}
    </section>
  );
}
