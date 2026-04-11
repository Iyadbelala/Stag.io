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
function CompanyAvatar({ name, logoUrl, size = "md" }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";

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

  const selected = companies.find((c) => c.id === selectedId) ?? null;

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

      {/* ======== MOBILE DETAIL VIEW (full page on small screens) ======== */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface-cream lg:hidden overflow-y-auto">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-surface-sand bg-surface-white/95 backdrop-blur-sm px-4 py-3">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 text-sm font-medium text-coffee-warm cursor-pointer"
            >
              <HiOutlineChevronLeft size={18} />
              Back
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => toggleSave(selected.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-coffee-warm cursor-pointer"
              >
                {savedIds.has(selected.id) ? <HiBookmark size={20} className="text-coffee-warm" /> : <HiOutlineBookmark size={20} />}
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
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-coffee-warm cursor-pointer"
              >
                <HiOutlineShare size={20} />
              </button>
            </div>
          </div>

          {/* Mobile detail body */}
          <div className="flex-1 px-4 py-5 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <CompanyAvatar name={selected.companyName} logoUrl={selected.logoUrl} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-coffee-dark leading-tight">
                  {selected.companyName}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  {[selected.industry, selected.location].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              {selected.location && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-white border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <HiOutlineLocationMarker size={13} className="text-text-muted" />
                  {selected.location}
                </span>
              )}
              {selected.industry && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-white border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <HiOutlineBriefcase size={13} className="text-text-muted" />
                  {selected.industry}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-white border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                <HiOutlineOfficeBuilding size={13} className="text-text-muted" />
                {selected.openPositions} {t("companies.detail.openPositions")}
              </span>
              {selected.website && (
                <a
                  href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-white border border-surface-sand px-3 py-1.5 text-xs font-medium text-coffee-warm transition-colors hover:bg-coffee-gold/5"
                >
                  <HiOutlineGlobe size={13} />
                  Website
                </a>
              )}
            </div>

            {/* Contact Person */}
            {selected.contactPerson && (
              <div className="rounded-xl bg-surface-white border border-surface-sand p-4">
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
              <div className="rounded-xl bg-surface-white border border-surface-sand p-4">
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

          {/* Mobile sticky action bar */}
          <div className="sticky bottom-0 border-t border-surface-sand bg-surface-white/95 backdrop-blur-sm px-4 py-3">
            <a
              href={`/internships?company=${encodeURIComponent(selected.companyName)}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold py-3 text-sm font-semibold text-white shadow-md shadow-coffee-warm/15 transition-all hover:shadow-lg"
            >
              {t("companies.viewInternships")}
            </a>
          </div>
        </div>
      )}

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

      {/* ======== MAIN CONTENT (list + detail) ======== */}
      <div className="mx-auto flex max-w-6xl gap-5 px-3 sm:px-6 py-4 sm:py-5">

        {/* ---- LEFT: Card List ---- */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-2.5 overflow-y-auto lg:max-h-[calc(100vh-240px)] pr-1">
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
                  className={`animate-card-slide-in group relative flex w-full cursor-pointer flex-col rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-coffee-warm/40 bg-surface-white shadow-lg shadow-coffee-warm/10 ring-1 ring-coffee-warm/15 -translate-y-0.5"
                      : "border-surface-sand bg-surface-white hover:border-coffee-gold/30 hover:shadow-md hover:shadow-coffee-warm/5 hover:-translate-y-0.5"
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Top row: avatar + info + bookmark */}
                  <div className="flex items-start gap-3 w-full">
                    <CompanyAvatar name={item.companyName} logoUrl={item.logoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-tight text-coffee-dark truncate pr-6">
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
                      className="shrink-0 rounded-lg p-1.5 text-text-muted/50 transition-colors hover:bg-surface-cream hover:text-coffee-warm"
                    >
                      {savedIds.has(item.id) ? (
                        <HiBookmark size={16} className="text-coffee-warm" />
                      ) : (
                        <HiOutlineBookmark size={16} />
                      )}
                    </span>
                  </div>

                  {/* Meta tags */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {item.location && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                        <HiOutlineLocationMarker size={11} />
                        {item.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
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

        {/* ---- RIGHT: Detail Panel (desktop only) ---- */}
        <div
          className={`hidden lg:block flex-1 overflow-y-auto rounded-xl border border-surface-sand bg-surface-white lg:max-h-[calc(100vh-240px)] ${
            !selected ? "lg:flex lg:items-center lg:justify-center" : ""
          }`}
        >
          {selected ? (
            <div key={selected.id} className="animate-fade-in">
              {/* Detail Header */}
              <div className="p-8 pb-0">
                <div className="flex items-start gap-4 mb-5">
                  <CompanyAvatar name={selected.companyName} logoUrl={selected.logoUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-coffee-dark">
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
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-coffee-warm/15 transition-all duration-300 hover:shadow-xl hover:shadow-coffee-warm/25 hover:-translate-y-0.5 cursor-pointer"
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
              <div className="px-8 pb-8">
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
