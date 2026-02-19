"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  HiOutlineCurrencyDollar,
  HiOutlineChevronLeft,
} from "react-icons/hi";
import { useLanguage } from "@/Components/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface Internship {
  id: number;
  titleKey: string;
  companyKey: string;
  locationKey: string;
  typeKey: string;
  durationKey: string;
  stipendKey: string;
  postedKey: string;
  tags: string[];
  descriptionKey: string;
  requirements: string[];
  settingKey: string;
}

/* ============================================
   Mock Data (translation keys)
   ============================================ */
const internships: Internship[] = [
  {
    id: 1,
    titleKey: "intern.1.title",
    companyKey: "intern.1.company",
    locationKey: "intern.1.location",
    typeKey: "intern.1.type",
    durationKey: "intern.1.duration",
    stipendKey: "intern.1.stipend",
    postedKey: "intern.1.posted",
    tags: ["intern.tag.remote", "intern.tag.paid"],
    descriptionKey: "intern.1.desc",
    requirements: ["intern.1.req.1", "intern.1.req.2", "intern.1.req.3", "intern.1.req.4"],
    settingKey: "intern.1.setting",
  },
  {
    id: 2,
    titleKey: "intern.2.title",
    companyKey: "intern.2.company",
    locationKey: "intern.2.location",
    typeKey: "intern.2.type",
    durationKey: "intern.2.duration",
    stipendKey: "intern.2.stipend",
    postedKey: "intern.2.posted",
    tags: ["intern.tag.onsite", "intern.tag.paid"],
    descriptionKey: "intern.2.desc",
    requirements: ["intern.2.req.1", "intern.2.req.2", "intern.2.req.3"],
    settingKey: "intern.2.setting",
  },
  {
    id: 3,
    titleKey: "intern.3.title",
    companyKey: "intern.3.company",
    locationKey: "intern.3.location",
    typeKey: "intern.3.type",
    durationKey: "intern.3.duration",
    stipendKey: "intern.3.stipend",
    postedKey: "intern.3.posted",
    tags: ["intern.tag.hybrid", "intern.tag.paid"],
    descriptionKey: "intern.3.desc",
    requirements: ["intern.3.req.1", "intern.3.req.2", "intern.3.req.3"],
    settingKey: "intern.3.setting",
  },
  {
    id: 4,
    titleKey: "intern.4.title",
    companyKey: "intern.4.company",
    locationKey: "intern.4.location",
    typeKey: "intern.4.type",
    durationKey: "intern.4.duration",
    stipendKey: "intern.4.stipend",
    postedKey: "intern.4.posted",
    tags: ["intern.tag.remote", "intern.tag.paid"],
    descriptionKey: "intern.4.desc",
    requirements: ["intern.4.req.1", "intern.4.req.2", "intern.4.req.3"],
    settingKey: "intern.4.setting",
  },
  {
    id: 5,
    titleKey: "intern.5.title",
    companyKey: "intern.5.company",
    locationKey: "intern.5.location",
    typeKey: "intern.5.type",
    durationKey: "intern.5.duration",
    stipendKey: "intern.5.stipend",
    postedKey: "intern.5.posted",
    tags: ["intern.tag.onsite", "intern.tag.paid"],
    descriptionKey: "intern.5.desc",
    requirements: ["intern.5.req.1", "intern.5.req.2", "intern.5.req.3"],
    settingKey: "intern.5.setting",
  },
  {
    id: 6,
    titleKey: "intern.6.title",
    companyKey: "intern.6.company",
    locationKey: "intern.6.location",
    typeKey: "intern.6.type",
    durationKey: "intern.6.duration",
    stipendKey: "intern.6.stipend",
    postedKey: "intern.6.posted",
    tags: ["intern.tag.hybrid"],
    descriptionKey: "intern.6.desc",
    requirements: ["intern.6.req.1", "intern.6.req.2", "intern.6.req.3"],
    settingKey: "intern.6.setting",
  },
];

/* ============================================
   Component
   ============================================ */
export default function InternshipsPage() {
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
    const all = internships.map((i) => t(i.locationKey));
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
    return internships.filter((i) => {
      const matchesSearch =
        !q ||
        t(i.titleKey).toLowerCase().includes(q) ||
        t(i.companyKey).toLowerCase().includes(q) ||
        t(i.locationKey).toLowerCase().includes(q);
      const matchesLocation =
        !loc || t(i.locationKey).toLowerCase().includes(loc);
      return matchesSearch && matchesLocation;
    });
  }, [committedSearch, committedLocation, t]);

  // Stagger animate cards after filter changes
  useEffect(() => {
    if (!animating) return;
    const ids = filtered.map((i) => i.id);
    ids.forEach((id, idx) => {
      setTimeout(() => {
        setVisibleCards((prev) => new Set([...prev, id]));
      }, idx * 80);
    });
    const total = ids.length * 80 + 300;
    const timer = setTimeout(() => setAnimating(false), total);
    return () => clearTimeout(timer);
  }, [filtered, animating]);

  const selected = internships.find((i) => i.id === selectedId) ?? null;

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
              <p className="text-sm text-text-muted">{t("internships.noResults")}</p>
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

                {/* Posted badge */}
                <span className="w-fit rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-coffee-warm">
                  {t(item.postedKey)}
                </span>

                {/* Title */}
                <h3 className="pr-8 font-heading text-[15px] font-semibold leading-snug text-coffee-dark">
                  {t(item.titleKey)}
                </h3>

                {/* Company */}
                <p className="text-sm text-text-secondary">{t(item.companyKey)}</p>

                {/* Location */}
                <p className="text-[13px] text-text-muted">
                  {t(item.locationKey)}
                </p>

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
                    {t(item.stipendKey)}
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
                <h1 className="font-heading text-xl font-bold text-coffee-dark sm:text-2xl">
                  {t(selected.titleKey)}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(selected.companyKey)}
                </p>
                <p className="mt-0.5 text-[13px] text-text-muted">
                  {t(selected.locationKey)}
                </p>
                <p className="mt-0.5 text-[13px] text-text-muted">
                  {t(selected.stipendKey)}{" · "}{t(selected.typeKey)}
                </p>
              </div>

              {/* Actions */}
              <div className="mb-6 flex items-center gap-3">
                <button className="rounded-button bg-coffee-warm px-6 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-all hover:bg-coffee-gold cursor-pointer">
                  {t("internships.applyNow")}
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

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Job details section */}
              <div className="mb-6">
                <h2 className="mb-4 font-heading text-base font-semibold text-coffee-dark">
                  {t("internships.detail.jobDetails")}
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <HiOutlineCurrencyDollar size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.pay")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.stipendKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineBriefcase size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.type")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.typeKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineOfficeBuilding size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.setting")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.settingKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HiOutlineCalendar size={18} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-coffee-dark">{t("internships.detail.duration")}</p>
                      <p className="text-[13px] text-text-muted">{t(selected.durationKey)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="mb-3 font-heading text-base font-semibold text-coffee-dark">
                  {t("internships.detail.description")}
                </h2>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {t(selected.descriptionKey)}
                </p>
              </div>

              {/* Divider */}
              <hr className="mb-6 border-surface-sand" />

              {/* Requirements */}
              <div>
                <h2 className="mb-3 font-heading text-base font-semibold text-coffee-dark">
                  {t("internships.detail.requirements")}
                </h2>
                <ul className="flex flex-col gap-2">
                  {selected.requirements.map((reqKey) => (
                    <li
                      key={reqKey}
                      className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coffee-gold" />
                      {t(reqKey)}
                    </li>
                  ))}
                </ul>
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
    </section>
  );
}
