"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineGlobe,
} from "react-icons/hi";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import { api } from "@/lib/api";
import { Reveal } from "@/Components/ui/Motion";

/* ============================================
   Types
   ============================================ */
interface Company {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  contactPerson: string | null;
  openPositions: number;
  createdAt: string;
}

interface UserSuggestion {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  department: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
}

/* ============================================
   Company Avatar
   ============================================ */
function CompanyAvatar({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" | "xl" }) {
  const dim =
    size === "sm" ? "h-10 w-10 text-xs" :
    size === "lg" ? "h-14 w-14 text-lg" :
    size === "xl" ? "h-16 w-16 text-xl" :
    "h-11 w-11 text-sm";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dim} shrink-0 rounded-xl object-cover border border-surface-sand shadow-sm`}
      />
    );
  }

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

  return (
    <div className={`${dim} shrink-0 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

/* ============================================
   Component
   ============================================ */
export default function CompaniesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [committedLocation, setCommittedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  /* ---- User search suggestions ---- */
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [userSuggestionsOpen, setUserSuggestionsOpen] = useState(false);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Fetch companies from API ---- */
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data } = await api.get<{ success: true; data: Company[] }>("/api/companies");
        setCompanies(data.data);
      } catch {
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  /* ---- User search debounce ---- */
  const searchUsers = useCallback((q: string) => {
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
    if (q.trim().length < 2) {
      setUserSuggestions([]);
      setUserSuggestionsOpen(false);
      return;
    }
    userSearchTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get<{ success: true; data: UserSuggestion[] }>(
          `/api/search/users?q=${encodeURIComponent(q.trim())}&limit=5`
        );
        setUserSuggestions(data.data);
        setUserSuggestionsOpen(data.data.length > 0);
      } catch {
        setUserSuggestions([]);
        setUserSuggestionsOpen(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    searchUsers(val);
  };

  const locationSuggestions = useMemo(() => {
    const all = companies.map((c) => c.location).filter((l): l is string => !!l);
    return [...new Set(all)];
  }, [companies]);

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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setUserSuggestionsOpen(false);
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
    setUserSuggestionsOpen(false);
  };

  const filtered = useMemo(() => {
    const q = committedSearch.trim().toLowerCase();
    const loc = committedLocation.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        (c.industry?.toLowerCase().includes(q) ?? false) ||
        (c.location?.toLowerCase().includes(q) ?? false);
      const matchesLocation = !loc || (c.location?.toLowerCase().includes(loc) ?? false);
      return matchesSearch && matchesLocation;
    });
  }, [committedSearch, committedLocation, companies]);

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

      {/* ======== SEARCH BAR ======== */}
      <div className="relative bg-gradient-to-b from-surface-white to-surface-cream border-b border-surface-sand overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-coffee-gold/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-logo-sage/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
          <Reveal variant="fade-up" duration={500}>
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-coffee-dark">
                {t("companies.title")}
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                {filtered.length} {t("companies.results")}
              </p>
            </div>
          </Reveal>

          {/* Search Inputs */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1" ref={searchRef}>
              <HiOutlineSearch
                size={18}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted/60"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => { if (userSuggestions.length > 0) setUserSuggestionsOpen(true); }}
                placeholder={t("companies.searchPlaceholder")}
                className="w-full rounded-xl border border-surface-sand bg-surface-white py-3 pl-11 pr-4 text-sm text-text-primary shadow-sm placeholder:text-text-muted/50 focus:border-coffee-gold focus:outline-none focus:ring-2 focus:ring-coffee-gold/10 transition-all"
              />

              {/* User Suggestions Dropdown */}
              {userSuggestionsOpen && userSuggestions.length > 0 && (
                <ul className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-sand bg-surface-white shadow-xl">
                  <li className="px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted/60 border-b border-surface-sand bg-surface-cream/50">
                    <HiOutlineUser size={12} className="inline mr-1.5 -mt-0.5" />
                    Students
                  </li>
                  {userSuggestions.map((u) => (
                    <li key={u.userId}>
                      <button
                        type="button"
                        onClick={() => {
                          setUserSuggestionsOpen(false);
                          router.push(`/student/profile?id=${u.userId}`);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-coffee-gold/5"
                      >
                        {u.profilePhotoUrl ? (
                          <img
                            src={u.profilePhotoUrl}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-coffee-warm/20 to-coffee-gold/20 flex items-center justify-center">
                            <HiOutlineUser size={14} className="text-coffee-warm" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-coffee-dark truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {[u.department, u.university].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {u.skills.length > 0 && (
                          <div className="hidden sm:flex gap-1">
                            {u.skills.slice(0, 2).map((s) => (
                              <span key={s} className="rounded-md bg-coffee-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-coffee-warm">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <HiOutlineChevronRight size={14} className="shrink-0 text-text-muted/30" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
                placeholder={t("companies.locationPlaceholder")}
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
              {t("companies.searchBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* ======== CARD GRID ======== */}
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-white border border-surface-sand py-20 text-center">
            <HiOutlineSearch size={36} className="mb-3 text-text-muted/30" />
            <p className="text-sm text-text-muted">
              {companies.length === 0
                ? t("companies.noCompaniesYet")
                : t("companies.noResults")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item, idx) => (
              <Link
                key={item.id}
                href={`/companies/${item.id}`}
                className="animate-card-slide-in group relative flex w-full cursor-pointer flex-col rounded-2xl border border-surface-sand bg-surface-white p-5 text-left transition-all duration-300 hover:border-coffee-gold/30 hover:shadow-md hover:shadow-coffee-warm/5 hover:-translate-y-0.5"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Top row: avatar + info + bookmark */}
                <div className="flex items-start gap-3.5 w-full">
                  <CompanyAvatar name={item.companyName} logoUrl={item.logoUrl} size="xl" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug text-coffee-dark truncate pr-6">
                      {item.companyName}
                    </h3>
                    {item.industry && (
                      <p className="mt-0.5 text-sm text-text-secondary truncate">{item.industry}</p>
                    )}
                    {item.location && (
                      <p className="mt-0.5 text-xs text-text-muted flex items-center gap-1">
                        <HiOutlineLocationMarker size={11} />
                        {item.location}
                      </p>
                    )}
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(item.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); toggleSave(item.id); } }}
                    className="shrink-0 rounded-lg p-1.5 text-text-muted/50 transition-colors hover:bg-surface-cream hover:text-coffee-warm"
                  >
                    {savedIds.has(item.id) ? (
                      <HiBookmark size={18} className="text-coffee-warm" />
                    ) : (
                      <HiOutlineBookmark size={18} />
                    )}
                  </span>
                </div>

                {/* Description preview */}
                {item.description && (
                  <p className="mt-3 text-xs leading-relaxed text-text-muted line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Meta tags */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                    <HiOutlineBriefcase size={12} />
                    {item.openPositions} {t("companies.detail.openPositions")}
                  </span>
                  {item.website && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                      <HiOutlineGlobe size={12} />
                      Website
                    </span>
                  )}
                </div>

                {/* Bottom row */}
                <div className="mt-3.5 flex items-center justify-end">
                  <HiOutlineChevronRight size={14} className="text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
