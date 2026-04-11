"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineX,
} from "react-icons/hi";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { useAuth } from "@/Components/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Internship, MatchedInternship } from "./types";
import { SmartMatchOverlay } from "./components/SmartMatchOverlay";
import { InternshipCard } from "./components/InternshipCard";

export default function InternshipsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyParam = searchParams.get("company") ?? "";
  const qParam = searchParams.get("q") ?? "";
  const locParam = searchParams.get("loc") ?? "";

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(companyParam || qParam);
  const [location, setLocation] = useState(locParam);
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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
      setSmartMatchOn(false);
      setMatchesDone(false);
      setMatches([]);
      setMatchesError(null);
    } else {
      setSmartMatchOn(true);
      if (!matchesDone) fetchMatches();
    }
  }, [smartMatchOn, matchesDone, fetchMatches]);

  const matchMap = useMemo(() => {
    const map = new Map<string, MatchedInternship>();
    for (const m of matches) map.set(m.id, m);
    return map;
  }, [matches]);

  /* ---- Live filtering ---- */
  const displayList = useMemo(() => {
    const q = search.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

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
  }, [search, location, internships, isStudent, smartMatchOn, matches, matchMap]);

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

  const toggleSave = async (id: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
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
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
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

      {/* ======== COMPACT SEARCH BAR ======== */}
      <div className="sticky top-0 z-30 border-b border-surface-sand bg-surface-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3">
          <div className="flex items-center gap-2.5">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <HiOutlineSearch size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("internships.searchPlaceholder")}
                className="w-full rounded-lg border border-surface-sand bg-surface-cream/50 py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-coffee-gold focus:bg-surface-white focus:outline-none focus:ring-1 focus:ring-coffee-gold/15 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-muted/40 hover:text-text-muted cursor-pointer"
                >
                  <HiOutlineX size={14} />
                </button>
              )}
            </div>

            {/* Location input */}
            <div className="relative hidden sm:block w-44" ref={locationRef}>
              <HiOutlineLocationMarker size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted/50 z-10" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLocationOpen(true);
                }}
                onFocus={() => setLocationOpen(true)}
                placeholder={t("internships.locationPlaceholder")}
                className="w-full rounded-lg border border-surface-sand bg-surface-cream/50 py-2 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-coffee-gold focus:bg-surface-white focus:outline-none focus:ring-1 focus:ring-coffee-gold/15 transition-all"
              />
              {location && (
                <button
                  onClick={() => setLocation("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-text-muted/40 hover:text-text-muted cursor-pointer"
                >
                  <HiOutlineX size={14} />
                </button>
              )}
              {locationOpen && filteredLocations.length > 0 && (
                <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-surface-sand bg-surface-white shadow-lg max-h-48 overflow-y-auto">
                  {filteredLocations.map((loc) => (
                    <li key={loc}>
                      <button
                        type="button"
                        onClick={() => { setLocation(loc); setLocationOpen(false); }}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-coffee-gold/5"
                      >
                        <HiOutlineLocationMarker size={13} className="shrink-0 text-text-muted/50" />
                        {loc}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-surface-sand" />

            {/* Result count */}
            <span className="hidden sm:inline shrink-0 text-xs text-text-muted tabular-nums">
              {isStudent && smartMatchOn && matchesDone && (
                <span className="inline-flex items-center gap-1 text-coffee-warm font-medium mr-1">
                  <HiOutlineLightningBolt size={11} />
                </span>
              )}
              {displayList.length} {t("internships.results")}
            </span>

            {/* Smart Match Toggle */}
            {isStudent && (
              <>
                <div className="hidden sm:block h-5 w-px bg-surface-sand" />
                <button
                  onClick={handleToggleSmartMatch}
                  disabled={matchesLoading}
                  className="group flex items-center gap-1.5 cursor-pointer disabled:cursor-wait shrink-0"
                  aria-label="Toggle SmartMatch"
                >
                  <span className={`hidden lg:inline text-[11px] font-medium transition-colors duration-300 ${
                    smartMatchOn ? "text-coffee-warm" : "text-text-muted"
                  }`}>
                    SmartMatch<sup className="text-[7px]">®</sup>
                  </span>
                  <span className={`relative inline-flex h-6 w-[44px] shrink-0 items-center rounded-full border-2 transition-all duration-400 ease-in-out ${
                    smartMatchOn
                      ? "border-coffee-warm bg-gradient-to-r from-coffee-warm to-coffee-gold shadow-sm shadow-coffee-warm/20"
                      : "border-surface-sand bg-surface-sand/60 group-hover:border-coffee-gold/40"
                  }`}>
                    {smartMatchOn && (
                      <span className="absolute inset-0 rounded-full animate-switch-glow" />
                    )}
                    <span className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full shadow-sm transition-all duration-400 ease-in-out ${
                      smartMatchOn
                        ? "translate-x-[22px] bg-white"
                        : "translate-x-[3px] bg-white"
                    }`}>
                      <HiOutlineLightningBolt
                        size={9}
                        className={`transition-all duration-300 ${
                          smartMatchOn ? "text-coffee-warm scale-110" : "text-text-muted/40 scale-90"
                        }`}
                      />
                    </span>
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile: location + count row */}
          <div className="flex items-center gap-2.5 mt-2 sm:hidden">
            <div className="relative flex-1" ref={undefined}>
              <HiOutlineLocationMarker size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted/50 z-10" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLocationOpen(true);
                }}
                onFocus={() => setLocationOpen(true)}
                placeholder={t("internships.locationPlaceholder")}
                className="w-full rounded-lg border border-surface-sand bg-surface-cream/50 py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-coffee-gold focus:bg-surface-white focus:outline-none focus:ring-1 focus:ring-coffee-gold/15 transition-all"
              />
            </div>
            <span className="shrink-0 text-xs text-text-muted tabular-nums">
              {displayList.length} {t("internships.results")}
            </span>
          </div>
        </div>
      </div>

      {/* ======== CARD GRID ======== */}
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList.map((item, idx) => {
              const matchData = smartMatchOn ? matchMap.get(item.id) : undefined;
              return (
                <InternshipCard
                  key={item.id}
                  item={item}
                  matchData={matchData}
                  isSaved={savedIds.has(item.id)}
                  onToggleSave={toggleSave}
                  animationDelay={idx * 40}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
