"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineOfficeBuilding,
  HiOutlineShare,
  HiOutlineUserGroup,
  HiOutlineGlobe,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineChevronLeft,
} from "react-icons/hi";
import { useLanguage } from "@/Components/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface Company {
  id: number;
  nameKey: string;
  industryKey: string;
  locationKey: string;
  sizeKey: string;
  descriptionKey: string;
  openPositions: number;
  foundedKey: string;
  websiteKey: string;
  tags: string[];
  perks: string[];
}

/* ============================================
   Mock Data (translation keys)
   ============================================ */
const companies: Company[] = [
  {
    id: 1,
    nameKey: "company.1.name",
    industryKey: "company.1.industry",
    locationKey: "company.1.location",
    sizeKey: "company.1.size",
    descriptionKey: "company.1.desc",
    openPositions: 2,
    foundedKey: "company.1.founded",
    websiteKey: "company.1.website",
    tags: ["company.tag.remote", "company.tag.verified"],
    perks: ["company.1.perk.1", "company.1.perk.2", "company.1.perk.3", "company.1.perk.4"],
  },
  {
    id: 2,
    nameKey: "company.2.name",
    industryKey: "company.2.industry",
    locationKey: "company.2.location",
    sizeKey: "company.2.size",
    descriptionKey: "company.2.desc",
    openPositions: 1,
    foundedKey: "company.2.founded",
    websiteKey: "company.2.website",
    tags: ["company.tag.verified"],
    perks: ["company.2.perk.1", "company.2.perk.2", "company.2.perk.3"],
  },
  {
    id: 3,
    nameKey: "company.3.name",
    industryKey: "company.3.industry",
    locationKey: "company.3.location",
    sizeKey: "company.3.size",
    descriptionKey: "company.3.desc",
    openPositions: 1,
    foundedKey: "company.3.founded",
    websiteKey: "company.3.website",
    tags: ["company.tag.paid", "company.tag.verified"],
    perks: ["company.3.perk.1", "company.3.perk.2", "company.3.perk.3"],
  },
  {
    id: 4,
    nameKey: "company.4.name",
    industryKey: "company.4.industry",
    locationKey: "company.4.location",
    sizeKey: "company.4.size",
    descriptionKey: "company.4.desc",
    openPositions: 1,
    foundedKey: "company.4.founded",
    websiteKey: "company.4.website",
    tags: ["company.tag.remote"],
    perks: ["company.4.perk.1", "company.4.perk.2", "company.4.perk.3"],
  },
  {
    id: 5,
    nameKey: "company.5.name",
    industryKey: "company.5.industry",
    locationKey: "company.5.location",
    sizeKey: "company.5.size",
    descriptionKey: "company.5.desc",
    openPositions: 2,
    foundedKey: "company.5.founded",
    websiteKey: "company.5.website",
    tags: ["company.tag.verified", "company.tag.paid"],
    perks: ["company.5.perk.1", "company.5.perk.2", "company.5.perk.3", "company.5.perk.4"],
  },
  {
    id: 6,
    nameKey: "company.6.name",
    industryKey: "company.6.industry",
    locationKey: "company.6.location",
    sizeKey: "company.6.size",
    descriptionKey: "company.6.desc",
    openPositions: 1,
    foundedKey: "company.6.founded",
    websiteKey: "company.6.website",
    tags: ["company.tag.public"],
    perks: ["company.6.perk.1", "company.6.perk.2", "company.6.perk.3"],
  },
];

/* ============================================
   Component
   ============================================ */
export default function CompaniesPage() {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [committedLocation, setCommittedLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  // Unique translated locations for suggestions
  const locationSuggestions = useMemo(() => {
    const all = companies.map((c) => t(c.locationKey));
    return [...new Set(all)];
  }, [t]);

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

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = () => {
    setAnimating(true);
    setVisibleCards(new Set());
    setCommittedSearch(search);
    setCommittedLocation(location);
  };

  const filtered = useMemo(() => {
    const q = committedSearch.trim().toLowerCase();
    const loc = committedLocation.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesSearch =
        !q ||
        t(c.nameKey).toLowerCase().includes(q) ||
        t(c.industryKey).toLowerCase().includes(q) ||
        t(c.locationKey).toLowerCase().includes(q);
      const matchesLocation =
        !loc || t(c.locationKey).toLowerCase().includes(loc);
      return matchesSearch && matchesLocation;
    });
  }, [committedSearch, committedLocation, t]);

  // Stagger animate cards after filter changes
  useEffect(() => {
    if (!animating) return;
    const ids = filtered.map((c) => c.id);
    ids.forEach((id, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => new Set([...prev, id]));
      }, idx * 80);
    });
    const total = ids.length * 80 + 300;
    const timer = setTimeout(() => setAnimating(false), total);
    return () => clearTimeout(timer);
  }, [filtered, animating]);

  const selected = companies.find((c) => c.id === selectedId) ?? null;

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
              <p className="text-sm text-text-muted">{t("companies.noResults")}</p>
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
                } ${
                  animating
                    ? visibleCards.has(item.id)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                    : "opacity-100 translate-y-0"
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
                    <span className="inline-block w-fit rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-coffee-warm">
                      {t(item.industryKey)}
                    </span>

                    {/* Company name */}
                    <h3 className="pr-8 text-[15px] font-semibold leading-snug text-coffee-dark">
                      {t(item.nameKey)}
                    </h3>

                    {/* Location */}
                    <p className="text-[13px] text-text-muted">
                      {t(item.locationKey)}
                    </p>
                  </div>
                </div>

                {/* Tags row */}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-surface-sand bg-surface-cream px-2 py-0.5 text-[11px] text-text-muted"
                    >
                      {t(tag)}
                    </span>
                  ))}
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
                    {t(selected.nameKey)}
                  </h1>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t(selected.industryKey)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-text-muted">
                    {t(selected.locationKey)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-6 flex items-center gap-3">
                <a
                  href={`/internships?company=${encodeURIComponent(t(selected.nameKey))}`}
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
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.industry")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.industryKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineUserGroup size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.size")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.sizeKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineCalendar size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.founded")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.foundedKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineGlobe size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.website")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.websiteKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineOfficeBuilding size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("companies.detail.openPositions")}</p>
                      <p className="text-[13px] text-text-muted">{selected.openPositions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-3 text-base font-semibold text-coffee-dark">
                  {t("companies.detail.about")}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {t(selected.descriptionKey)}
                </p>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Perks */}
              <div>
                <h2 className="mb-3 text-base font-semibold text-coffee-dark">
                  {t("companies.detail.perks")}
                </h2>
                <ul className="flex flex-col gap-2">
                  {selected.perks.map((perkKey) => (
                    <li
                      key={perkKey}
                      className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coffee-gold" />
                      {t(perkKey)}
                    </li>
                  ))}
                </ul>
              </div>
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
