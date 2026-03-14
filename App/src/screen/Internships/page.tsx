"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineRefresh,
  HiOutlineGlobeAlt,
  HiOutlineChevronRight,
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

interface MatchedInternship extends Internship {
  matchScore: number;
  matchedSkills: string[];
}

/* ============================================
   Company Avatar
   ============================================ */
function CompanyAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "from-coffee-warm to-coffee-gold",
    "from-amber-600 to-orange-400",
    "from-emerald-600 to-teal-400",
    "from-blue-600 to-cyan-400",
    "from-purple-600 to-pink-400",
    "from-rose-600 to-red-400",
    "from-indigo-600 to-violet-400",
  ];
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;

  const dim = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";

  return (
    <div className={`${dim} shrink-0 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

/* ============================================
   Circular Score Ring
   ============================================ */
function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 50 ? "#4A7C59" :
    score >= 35 ? "#C8A96A" :
    "#7A4E3A";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-sand)" strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="animate-score-ring"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-coffee-dark tabular-nums">
        {score}
      </span>
    </div>
  );
}

/* ============================================
   Smart Matching Overlay
   ============================================ */
function SmartMatchOverlay({ leaving, t }: { leaving: boolean; t: (k: string) => string }) {
  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-surface-cream/95 backdrop-blur-md transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <span className="animate-logo-breathe font-heading text-4xl font-bold tracking-tight select-none">
        <span className="text-coffee-dark">Smart</span>
        <span className="text-coffee-gold">Match</span>
        <sup className="text-xs text-coffee-warm">®</sup>
      </span>
      <p className="mt-3 text-sm text-text-muted animate-fade-in max-w-xs text-center" style={{ animationDelay: "150ms" }}>
        {t("internships.loadingMatches")}
      </p>
    </div>
  );
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
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-sand bg-surface-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto animate-modal-enter">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:bg-surface-cream hover:text-coffee-dark cursor-pointer transition-colors"
        >
          <HiOutlineX size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <CompanyAvatar name={companyName} size="md" />
          <div>
            <h2 className="text-lg font-heading font-bold text-coffee-dark">{offerTitle}</h2>
            <p className="text-sm text-text-muted">{companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full rounded-xl border border-surface-sand bg-surface-cream/40 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/50 focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10"
            />
            <p className="mt-1 text-xs text-text-muted">{t("internships.cvHint")}</p>
          </div>

          <div>
            <label htmlFor="coverLetter" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary">
              <HiOutlineDocumentText size={16} className="text-text-muted" />
              {t("internships.coverLetter")}
            </label>
            <textarea
              id="coverLetter"
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the company why you're a great fit..."
              className="w-full resize-none rounded-xl border border-surface-sand bg-surface-cream/40 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/50 focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold py-3.5 text-sm font-semibold text-white shadow-lg shadow-coffee-warm/15 transition-all hover:shadow-xl hover:shadow-coffee-warm/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

  /* ---- Smart Matching state ---- */
  const [matches, setMatches] = useState<MatchedInternship[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [matchesDone, setMatchesDone] = useState(false);
  const [overlayLeaving, setOverlayLeaving] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [smartMatchOn, setSmartMatchOn] = useState(false);
  const isStudent = user?.role === "student";

  /* ---- Fetch internships ---- */
  useEffect(() => {
    async function fetchInternships() {
      try {
        const { data } = await api.get<{ success: true; data: Internship[] }>("/api/offers");
        setInternships(data.data);
      } catch {
        setInternships([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInternships();
  }, []);

  /* ---- Fetch saved offer IDs from backend ---- */
  useEffect(() => {
    if (!user) return;
    api.get<{ success: true; data: string[] }>("/api/saved")
      .then(({ data }) => setSavedIds(new Set(data.data)))
      .catch(() => {});
  }, [user]);

  /* ---- Fetch smart matches (triggered by toggle) ---- */
  const fetchMatches = useCallback(async () => {
    if (!user || user.role !== "student") return;
    setMatchesLoading(true);
    setMatchesError(null);
    setOverlayVisible(true);
    setOverlayLeaving(false);
    try {
      const { data } = await api.get<{ success: true; data: MatchedInternship[] }>(
        "/api/matching?limit=30"
      );
      setMatches(data.data);
      setMatchesDone(true);
      setOverlayLeaving(true);
      setTimeout(() => setOverlayVisible(false), 500);
    } catch {
      setMatchesError(t("internships.matchError"));
      setSmartMatchOn(false);
      setOverlayLeaving(true);
      setTimeout(() => setOverlayVisible(false), 500);
    } finally {
      setMatchesLoading(false);
    }
  }, [user, t]);

  /* ---- Toggle handler ---- */
  const handleToggleSmartMatch = useCallback(() => {
    if (smartMatchOn) {
      // Turn off: clear matches, revert to normal list
      setSmartMatchOn(false);
      setMatchesDone(false);
      setMatches([]);
      setMatchesError(null);
    } else {
      // Turn on: fetch matches
      setSmartMatchOn(true);
      if (!matchesDone) fetchMatches();
    }
  }, [smartMatchOn, matchesDone, fetchMatches]);

  const matchMap = useMemo(() => {
    const map = new Map<string, MatchedInternship>();
    for (const m of matches) map.set(m.id, m);
    return map;
  }, [matches]);

  const displayList = useMemo(() => {
    const q = committedSearch.trim().toLowerCase();
    const loc = committedLocation.trim().toLowerCase();

    const base = internships.filter((i) => {
      const matchesSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.companyName.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q);
      const matchesLocation =
        !loc || i.location.toLowerCase().includes(loc);
      return matchesSearch && matchesLocation;
    });

    if (!isStudent || !smartMatchOn || matches.length === 0) return base;

    return [...base].sort((a, b) => {
      const sa = matchMap.get(a.id)?.matchScore ?? -1;
      const sb = matchMap.get(b.id)?.matchScore ?? -1;
      return sb - sa;
    });
  }, [committedSearch, committedLocation, internships, isStudent, smartMatchOn, matches, matchMap]);

  const locationSuggestions = useMemo(() => {
    const all = internships.map((i) => i.location).filter(Boolean);
    return [...new Set(all)];
  }, [internships]);

  const filteredLocations = useMemo(() => {
    const loc = location.trim().toLowerCase();
    if (!loc) return locationSuggestions;
    return locationSuggestions.filter((l) => l.toLowerCase().includes(loc));
  }, [location, locationSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Auto-select first item only on desktop (lg ≥ 1024px) */
  useEffect(() => {
    if (displayList.length > 0 && !selectedId && window.innerWidth >= 1024) {
      setSelectedId(displayList[0].id);
    }
  }, [displayList, selectedId]);

  const toggleSave = async (id: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Optimistic update
    const wasSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      await api.post(`/api/saved/${id}`);
    } catch {
      // Revert on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const handleSearch = () => {
    setCommittedSearch(search);
    setCommittedLocation(location);
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

  const selected = useMemo(() => {
    if (smartMatchOn) {
      const fromMatches = matchMap.get(selectedId ?? "");
      if (fromMatches) return fromMatches;
    }
    return internships.find((i) => i.id === selectedId) ?? null;
  }, [selectedId, internships, smartMatchOn, matchMap]);

  const typeLabel = (type: string) => {
    switch (type) {
      case "remote": return "Remote";
      case "hybrid": return "Hybrid";
      default: return "On-site";
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "remote": return <HiOutlineGlobeAlt size={12} />;
      case "hybrid": return <HiOutlineRefresh size={12} />;
      default: return <HiOutlineOfficeBuilding size={12} />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

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

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {overlayVisible && <SmartMatchOverlay leaving={overlayLeaving} t={t} />}

      {/* ---- Hero Search Area ---- */}
      <div className="bg-gradient-to-b from-surface-white to-surface-cream border-b border-surface-sand">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
          {/* Title row */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-coffee-dark">
                {t("internships.title")}
              </h1>
              <p className="mt-0.5 text-sm text-text-muted">
                {isStudent && smartMatchOn && matchesDone && (
                  <span className="inline-flex items-center gap-1 text-coffee-warm font-medium mr-1.5">
                    <HiOutlineLightningBolt size={13} />
                    Ranked for you
                    <span className="mx-1 text-surface-sand">|</span>
                  </span>
                )}
                {displayList.length} {t("internships.results")}
              </p>
            </div>

            {/* Smart Match Toggle */}
            {isStudent && (
              <div className="flex items-center gap-3">
                {matchesError && (
                  <span className="text-xs text-status-error">{matchesError}</span>
                )}
                <button
                  onClick={handleToggleSmartMatch}
                  disabled={matchesLoading}
                  className="group flex items-center gap-2.5 cursor-pointer disabled:cursor-wait"
                  aria-label="Toggle SmartMatch"
                >
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    smartMatchOn ? "text-coffee-warm" : "text-text-muted"
                  }`}>
                    SmartMatch<sup className="text-[8px]">®</sup>
                  </span>
                  {/* Animated switch track */}
                  <span className={`relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border-2 transition-all duration-400 ease-in-out ${
                    smartMatchOn
                      ? "border-coffee-warm bg-gradient-to-r from-coffee-warm to-coffee-gold shadow-md shadow-coffee-warm/20"
                      : "border-surface-sand bg-surface-sand/60 group-hover:border-coffee-gold/40"
                  }`}>
                    {/* Glow ring when active */}
                    {smartMatchOn && (
                      <span className="absolute inset-0 rounded-full animate-switch-glow" />
                    )}
                    {/* Thumb */}
                    <span className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-400 ease-in-out ${
                      smartMatchOn
                        ? "translate-x-[26px] bg-white"
                        : "translate-x-[3px] bg-white"
                    }`}>
                      <HiOutlineLightningBolt
                        size={11}
                        className={`transition-all duration-300 ${
                          smartMatchOn ? "text-coffee-warm scale-110" : "text-text-muted/40 scale-90"
                        }`}
                      />
                    </span>
                    {/* Sparkle particles when active */}
                    {smartMatchOn && matchesDone && (
                      <>
                        <span className="absolute -top-1 right-0 h-1 w-1 rounded-full bg-coffee-gold animate-switch-particle" style={{ animationDelay: '0ms' }} />
                        <span className="absolute -top-0.5 right-2 h-0.5 w-0.5 rounded-full bg-coffee-warm animate-switch-particle" style={{ animationDelay: '200ms' }} />
                        <span className="absolute -bottom-1 right-1 h-1 w-1 rounded-full bg-coffee-gold/70 animate-switch-particle" style={{ animationDelay: '400ms' }} />
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <HiOutlineSearch
                size={18}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted/60"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("internships.searchPlaceholder")}
                className="w-full rounded-xl border border-surface-sand bg-surface-white py-3 pl-11 pr-4 text-sm text-text-primary shadow-sm placeholder:text-text-muted/50 focus:border-coffee-gold focus:outline-none focus:ring-2 focus:ring-coffee-gold/10 transition-all"
              />
            </div>
            <div className="relative sm:w-52" ref={locationRef}>
              <HiOutlineLocationMarker
                size={18}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted/60 z-10"
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
                className="w-full rounded-xl border border-surface-sand bg-surface-white py-3 pl-11 pr-4 text-sm text-text-primary shadow-sm placeholder:text-text-muted/50 focus:border-coffee-gold focus:outline-none focus:ring-2 focus:ring-coffee-gold/10 transition-all"
              />
              {locationOpen && filteredLocations.length > 0 && (
                <ul className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-sand bg-surface-white shadow-xl">
                  {filteredLocations.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        onClick={() => { setLocation(loc); setLocationOpen(false); }}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-coffee-gold/5"
                      >
                        <HiOutlineLocationMarker size={14} className="shrink-0 text-text-muted/60" />
                        {loc}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-7 py-3 text-sm font-semibold text-white shadow-md shadow-coffee-warm/15 transition-all hover:shadow-lg hover:shadow-coffee-warm/25 cursor-pointer"
            >
              {t("internships.searchBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* ---- Main Content ---- */}
      <div className="mx-auto flex max-w-6xl gap-5 px-3 sm:px-6 py-4 sm:py-5">

        {/* ---- LEFT: Card List ---- */}
        <div
          className={`w-full lg:w-[400px] shrink-0 space-y-2 sm:space-y-2.5 overflow-y-auto lg:max-h-[calc(100vh-240px)] pr-1 ${
            selected ? "hidden lg:block" : ""
          }`}
        >
          {displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-white border border-surface-sand py-20 text-center">
              <HiOutlineSearch size={36} className="mb-3 text-text-muted/30" />
              <p className="text-sm text-text-muted">
                {internships.length === 0
                  ? t("internships.noInternshipsYet")
                  : t("internships.noResults")}
              </p>
            </div>
          ) : (
            displayList.map((item, idx) => {
              const matchData = smartMatchOn ? matchMap.get(item.id) : undefined;
              const isActive = selectedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`animate-card-slide-in group relative flex w-full cursor-pointer flex-col rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 ${
                    isActive
                      ? "border-coffee-warm/40 bg-surface-white shadow-md shadow-coffee-warm/8 ring-1 ring-coffee-warm/15"
                      : "border-surface-sand bg-surface-white hover:border-coffee-gold/30 hover:shadow-sm"
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Top row: avatar + info + bookmark */}
                  <div className="flex items-start gap-3 w-full">
                    <CompanyAvatar name={item.companyName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold leading-tight text-coffee-dark truncate pr-7">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[13px] text-text-secondary truncate">{item.companyName}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); toggleSave(item.id); } }}
                      className="shrink-0 rounded-lg p-1 text-text-muted/50 transition-colors hover:bg-surface-cream hover:text-coffee-warm"
                    >
                      {savedIds.has(item.id) ? (
                        <HiBookmark size={16} className="text-coffee-warm" />
                      ) : (
                        <HiOutlineBookmark size={16} />
                      )}
                    </span>
                  </div>

                  {/* Meta tags row */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      <HiOutlineLocationMarker size={11} />
                      {item.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      {typeIcon(item.type)}
                      {typeLabel(item.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      <HiOutlineClock size={11} />
                      {item.duration}
                    </span>
                  </div>

                  {/* Match section */}
                  {matchData ? (
                    <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-coffee-gold/5 to-coffee-warm/5 border border-coffee-gold/15 px-3 py-2">
                      <ScoreRing score={matchData.matchScore} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1">
                          {matchData.matchedSkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-coffee-gold/12 px-1.5 py-0.5 text-[10px] font-medium text-coffee-warm"
                            >
                              {skill}
                            </span>
                          ))}
                          {matchData.matchedSkills.length > 3 && (
                            <span className="text-[10px] text-text-muted">
                              +{matchData.matchedSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[11px] text-text-muted/70">{timeAgo(item.createdAt)}</span>
                      <HiOutlineChevronRight size={14} className="text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* ---- RIGHT: Detail Panel (desktop inline / mobile slide-up) ---- */}
        {/* Mobile overlay backdrop */}
        {selected && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setSelectedId(null)}
          />
        )}
        <div
          className={`
            ${selected
              ? "fixed inset-x-0 bottom-0 z-50 max-h-[90vh] rounded-t-3xl shadow-2xl lg:relative lg:inset-auto lg:z-auto lg:max-h-none lg:rounded-2xl lg:shadow-sm"
              : "hidden lg:flex lg:items-center lg:justify-center lg:rounded-2xl lg:shadow-sm"
            }
            flex-1 overflow-y-auto border border-surface-sand bg-surface-white lg:max-h-[calc(100vh-240px)]
          `}
          style={selected ? { animation: "chatbot-slide-up 0.3s ease-out" } : undefined}
        >
          {selected ? (
            <div>
              {/* Mobile drag handle */}
              <div className="sticky top-0 z-10 flex items-center justify-center pt-3 pb-1 bg-surface-white rounded-t-3xl lg:hidden">
                <div className="h-1 w-10 rounded-full bg-surface-sand" />
              </div>

              {/* Mobile back */}
              <button
                onClick={() => setSelectedId(null)}
                className="mx-4 mb-1 flex items-center gap-1 text-sm text-coffee-warm hover:text-coffee-gold lg:hidden cursor-pointer"
              >
                <HiOutlineChevronLeft size={16} />
                {t("internships.backToList")}
              </button>

              {/* Detail Header */}
              <div className="p-4 sm:p-6 lg:p-8 pb-0 sm:pb-0">
                {/* Match banner */}
                {"matchScore" in selected && (selected as MatchedInternship).matchScore > 0 && (
                  <div className="mb-5 rounded-xl bg-gradient-to-br from-coffee-gold/8 via-surface-cream to-coffee-warm/8 border border-coffee-gold/15 p-4">
                    <div className="flex items-center gap-4">
                      <ScoreRing score={(selected as MatchedInternship).matchScore} size={52} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-coffee-dark">
                          {t("internships.matchScore")}
                        </p>
                        {(selected as MatchedInternship).matchedSkills.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {(selected as MatchedInternship).matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg bg-coffee-gold/10 border border-coffee-gold/20 px-2 py-0.5 text-[11px] font-medium text-coffee-warm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Company + title */}
                <div className="flex items-start gap-4">
                  <CompanyAvatar name={selected.companyName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-heading font-bold text-coffee-dark leading-tight">
                      {selected.title}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-text-secondary">
                      {selected.companyName}
                      {selected.companyIndustry && (
                        <span className="font-normal text-text-muted"> · {selected.companyIndustry}</span>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[13px] text-text-muted">
                        <HiOutlineLocationMarker size={14} />
                        {selected.location}
                      </span>
                      <span className="text-surface-sand">|</span>
                      <span className="inline-flex items-center gap-1 text-[13px] text-text-muted">
                        {typeIcon(selected.type)}
                        {typeLabel(selected.type)}
                      </span>
                      <span className="text-surface-sand">|</span>
                      <span className="inline-flex items-center gap-1 text-[13px] text-text-muted">
                        <HiOutlineCalendar size={14} />
                        {selected.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    onClick={() => handleApplyClick(selected.id)}
                    disabled={applyingId === selected.id || appliedIds.has(selected.id)}
                    className={`rounded-xl px-7 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                      appliedIds.has(selected.id)
                        ? "bg-status-success text-white cursor-default"
                        : "bg-gradient-to-r from-coffee-warm to-coffee-gold text-white shadow-md shadow-coffee-warm/15 hover:shadow-lg hover:shadow-coffee-warm/25"
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-sand text-text-muted transition-all hover:border-coffee-gold/30 hover:bg-coffee-gold/5 hover:text-coffee-warm cursor-pointer"
                    aria-label={t("internships.save")}
                  >
                    {savedIds.has(selected.id) ? (
                      <HiBookmark size={18} className="text-coffee-warm" />
                    ) : (
                      <HiOutlineBookmark size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/internships?id=${selected.id}`;
                      if (navigator.share) {
                        navigator.share({ title: selected.title, text: `${selected.title} at ${selected.companyName}`, url });
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
                    {timeAgo(selected.createdAt)}
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
              <div className="p-4 sm:p-6 lg:p-8 pt-5 sm:pt-5 space-y-5 sm:space-y-6 pb-8">
                <div className="h-px bg-surface-sand" />

                {/* Description */}
                <div>
                  <h2 className="mb-3 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-coffee-warm" />
                    {t("internships.detail.description")}
                  </h2>
                  <p className="text-sm leading-[1.7] text-text-secondary whitespace-pre-line">
                    {selected.description}
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
                    {selected.requirements}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-surface-cream flex items-center justify-center mb-4">
                <HiOutlineBriefcase size={28} className="text-text-muted/30" />
              </div>
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
