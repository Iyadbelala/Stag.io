"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineOfficeBuilding,
  HiOutlineShare,
  HiOutlineGlobe,
  HiOutlineBriefcase,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { useLanguage } from "@/Components/LanguageContext";
import { api } from "@/lib/api";

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
   Company Avatar  (same as Internships)
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
   Component
   ============================================ */
export default function CompaniesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  /* Auto-select first on desktop only */
  useEffect(() => {
    if (companies.length > 0 && !selectedId && window.innerWidth >= 1024) {
      setSelectedId(companies[0].id);
    }
  }, [companies, selectedId]);

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

  // Unique locations for suggestions
  const locationSuggestions = useMemo(() => {
    const all = companies.map((c) => c.location).filter((l): l is string => !!l);
    return [...new Set(all)];
  }, [companies]);

  const filteredLocations = useMemo(() => {
    const loc = location.trim().toLowerCase();
    if (!loc) return locationSuggestions;
    return locationSuggestions.filter((l) => l.toLowerCase().includes(loc));
  }, [location, locationSuggestions]);

  // Close dropdowns on outside click
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

  const selected = companies.find((c) => c.id === selectedId) ?? null;

  /* ---- Loading state ---- */
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
      {/* ---- Hero Search Area ---- */}
      <div className="bg-gradient-to-b from-surface-white to-surface-cream border-b border-surface-sand">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
          {/* Title row */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-coffee-dark">
                {t("companies.title")}
              </h1>
              <p className="mt-0.5 text-sm text-text-muted">
                {filtered.length} {t("companies.results")}
              </p>
            </div>
          </div>

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

              {/* ---- User Suggestions Dropdown ---- */}
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

      {/* ---- Main Content ---- */}
      <div className="mx-auto flex max-w-6xl gap-5 px-3 sm:px-6 py-4 sm:py-5">

        {/* ---- LEFT: Card List ---- */}
        <div
          className={`w-full lg:w-[400px] shrink-0 space-y-2 sm:space-y-2.5 overflow-y-auto lg:max-h-[calc(100vh-240px)] pr-1 ${
            selected ? "hidden lg:block" : ""
          }`}
        >
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
            filtered.map((item, idx) => {
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
                        {item.companyName}
                      </h3>
                      {item.industry && (
                        <p className="mt-0.5 text-[13px] text-text-secondary truncate">{item.industry}</p>
                      )}
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
                    {item.location && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                        <HiOutlineLocationMarker size={11} />
                        {item.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      <HiOutlineBriefcase size={11} />
                      {item.openPositions} {t("companies.detail.openPositions")}
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div className="mt-2.5 flex items-center justify-end">
                    <HiOutlineChevronRight size={14} className="text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
                  </div>
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
                {t("companies.backToList")}
              </button>

              {/* Detail Header */}
              <div className="p-4 sm:p-6 lg:p-8 pb-0 sm:pb-0">
                {/* Company header */}
                <div className="flex items-start gap-4 mb-5">
                  <CompanyAvatar name={selected.companyName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-heading font-bold text-coffee-dark">
                      {selected.companyName}
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                      {[selected.industry, selected.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>

                {/* Metadata bar */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-muted mb-5">
                  {selected.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <HiOutlineLocationMarker size={14} />
                      {selected.location}
                    </span>
                  )}
                  {selected.industry && (
                    <span className="inline-flex items-center gap-1.5">
                      <HiOutlineBriefcase size={14} />
                      {selected.industry}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlineOfficeBuilding size={14} />
                    {selected.openPositions} {t("companies.detail.openPositions")}
                  </span>
                  {selected.website && (
                    <span className="inline-flex items-center gap-1.5">
                      <HiOutlineGlobe size={14} />
                      <a
                        href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coffee-warm hover:text-coffee-gold transition-colors"
                      >
                        {selected.website}
                      </a>
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mb-6">
                  <a
                    href={`/internships?company=${encodeURIComponent(selected.companyName)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-coffee-warm/15 transition-all hover:shadow-lg hover:shadow-coffee-warm/25 cursor-pointer"
                  >
                    {t("companies.viewInternships")}
                  </a>
                  <button
                    onClick={() => toggleSave(selected.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                    aria-label={t("companies.save")}
                  >
                    {savedIds.has(selected.id) ? (
                      <HiBookmark size={18} className="text-coffee-warm" />
                    ) : (
                      <HiOutlineBookmark size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/companies?id=${selected.id}`;
                      if (navigator.share) {
                        navigator.share({ title: selected.companyName, text: `${selected.companyName} on Stag.io`, url });
                      } else {
                        navigator.clipboard.writeText(url);
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                    aria-label={t("companies.share")}
                  >
                    <HiOutlineShare size={18} />
                  </button>
                </div>
              </div>

              {/* Content sections */}
              <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                {/* Contact Person */}
                {selected.contactPerson && (
                  <div className="mb-5 rounded-xl bg-gradient-to-br from-coffee-gold/5 via-surface-cream to-coffee-warm/5 border border-coffee-gold/15 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-coffee-warm/10 flex items-center justify-center">
                        <HiOutlineUser size={16} className="text-coffee-warm" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Contact Person</p>
                        <p className="text-sm font-medium text-coffee-dark">{selected.contactPerson}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selected.description && (
                  <div className="mb-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-coffee-dark mb-3">
                      <span className="h-1 w-1 rounded-full bg-coffee-gold" />
                      {t("companies.detail.about")}
                    </h2>
                    <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-coffee-warm/10 to-coffee-gold/10 flex items-center justify-center mb-4">
                <HiOutlineOfficeBuilding size={28} className="text-text-muted/30" />
              </div>
              <p className="text-sm text-text-muted">
                {t("companies.selectPrompt")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
