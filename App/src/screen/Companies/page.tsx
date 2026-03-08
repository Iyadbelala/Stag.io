"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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

/* ============================================
   Component
   ============================================ */
export default function CompaniesPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [committedLocation, setCommittedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  /* ---- Fetch companies from API ---- */
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data } = await api.get<{ success: true; data: Company[] }>("/api/companies");
        setCompanies(data.data);
        if (data.data.length > 0) {
          setSelectedId(data.data[0].id);
        }
      } catch {
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Unique locations for suggestions
  const locationSuggestions = useMemo(() => {
    const all = companies
      .map((c) => c.location)
      .filter((l): l is string => !!l);
    return [...new Set(all)];
  }, [companies]);

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

  const filtered = useMemo(() => {
    const q = committedSearch.trim().toLowerCase();
    const loc = committedLocation.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesSearch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        (c.industry?.toLowerCase().includes(q) ?? false) ||
        (c.location?.toLowerCase().includes(q) ?? false);
      const matchesLocation =
        !loc || (c.location?.toLowerCase().includes(loc) ?? false);
      return matchesSearch && matchesLocation;
    });
  }, [committedSearch, committedLocation, companies]);

  const selected = companies.find((c) => c.id === selectedId) ?? null;

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
              placeholder={t("companies.searchPlaceholder")}
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
              placeholder={t("companies.locationPlaceholder")}
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
            {t("companies.searchBtn")}
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="border-b border-surface-sand bg-surface-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
          <p className="text-sm text-text-muted">
            {t("companies.sortBy")}{" "}
            <button className="font-medium text-coffee-warm hover:text-coffee-gold cursor-pointer">
              {t("companies.relevance")}
            </button>
            {" · "}
            <button className="font-medium text-coffee-warm hover:text-coffee-gold cursor-pointer">
              {t("companies.name")}
            </button>
          </p>
          <p className="text-sm text-text-muted">
            {filtered.length} {t("companies.results")}
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
                {companies.length === 0
                  ? "No companies have registered yet."
                  : t("companies.noResults")}
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

                {/* Logo + Info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-coffee-gold/10">
                    <HiOutlineOfficeBuilding size={20} className="text-coffee-warm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Industry badge */}
                    {item.industry && (
                      <span className="inline-block w-fit rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-coffee-warm">
                        {item.industry}
                      </span>
                    )}

                    {/* Company name */}
                    <h3 className="pr-8 text-[15px] font-semibold leading-snug text-coffee-dark">
                      {item.companyName}
                    </h3>

                    {/* Location */}
                    {item.location && (
                      <p className="text-[13px] text-text-muted">
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags row */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded border border-surface-sand bg-surface-cream px-2 py-0.5 text-[11px] text-text-muted">
                    {item.openPositions} {t("companies.detail.openPositions")}
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
                {t("companies.backToList")}
              </button>

              {/* Header */}
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-coffee-gold/10">
                  <HiOutlineOfficeBuilding size={28} className="text-coffee-warm" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-coffee-dark sm:text-2xl">
                    {selected.companyName}
                  </h1>
                  {selected.industry && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {selected.industry}
                    </p>
                  )}
                  {selected.location && (
                    <p className="mt-0.5 text-[13px] text-text-muted">
                      {selected.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mb-6 flex items-center gap-3">
                <a
                  href={`/internships?company=${encodeURIComponent(selected.companyName)}`}
                  className="rounded-button bg-coffee-warm px-6 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-all hover:bg-coffee-gold cursor-pointer"
                >
                  {t("companies.viewInternships")}
                </a>
                <button
                  onClick={() => toggleSave(selected.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-button border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                  aria-label={t("companies.save")}
                >
                  {savedIds.has(selected.id) ? (
                    <HiBookmark size={18} className="text-coffee-warm" />
                  ) : (
                    <HiOutlineBookmark size={18} />
                  )}
                </button>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-button border border-surface-sand bg-surface-white text-text-muted shadow-sm transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
                  aria-label={t("companies.share")}
                >
                  <HiOutlineShare size={18} />
                </button>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Company details section */}
              <div className="mb-6">
                <h2 className="mb-4 text-base font-semibold text-coffee-dark">
                  {t("companies.detail.overview")}
                </h2>
                <div className="flex flex-col gap-3">
                  {selected.industry && (
                    <div className="flex items-start gap-3">
                      <HiOutlineBriefcase size={18} className="mt-0.5 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.industry")}</p>
                        <p className="text-[13px] text-text-muted">{selected.industry}</p>
                      </div>
                    </div>
                  )}
                  {selected.location && (
                    <div className="flex items-start gap-3">
                      <HiOutlineLocationMarker size={18} className="mt-0.5 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-coffee-dark">Location</p>
                        <p className="text-[13px] text-text-muted">{selected.location}</p>
                      </div>
                    </div>
                  )}
                  {selected.website && (
                    <div className="flex items-start gap-3">
                      <HiOutlineGlobe size={18} className="mt-0.5 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.website")}</p>
                        <a
                          href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-coffee-warm hover:text-coffee-gold"
                        >
                          {selected.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {selected.contactPerson && (
                    <div className="flex items-start gap-3">
                      <HiOutlineOfficeBuilding size={18} className="mt-0.5 shrink-0 text-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-coffee-dark">Contact Person</p>
                        <p className="text-[13px] text-text-muted">{selected.contactPerson}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.openPositions")}</p>
                      <p className="text-[13px] text-text-muted">{selected.openPositions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <>
                  <hr className="mb-6 border-surface-sand" />
                  <div className="mb-6">
                    <h2 className="mb-3 text-base font-semibold text-coffee-dark">
                      {t("companies.detail.about")}
                    </h2>
                    <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
                      {selected.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HiOutlineOfficeBuilding size={48} className="mb-4 text-text-muted/30" />
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
