"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineGlobe,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding,
  HiOutlineChevronRight,
  HiOutlineShare,
  HiOutlineGlobeAlt,
  HiOutlineRefresh,
} from "react-icons/hi";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

interface CompanyOffer {
  id: string;
  title: string;
  location: string;
  type: string;
  duration: string;
  applicationCount: number;
  createdAt: string;
}

interface CompanyProfile {
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
  offers: CompanyOffer[];
}

function typeLabel(type: string) {
  switch (type) {
    case "remote": return "Remote";
    case "hybrid": return "Hybrid";
    default: return "On-site";
  }
}

function typeIcon(type: string) {
  switch (type) {
    case "remote": return <HiOutlineGlobeAlt size={12} />;
    case "hybrid": return <HiOutlineRefresh size={12} />;
    default: return <HiOutlineOfficeBuilding size={12} />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CompanyPublicProfile() {
  const params = useParams();
  const { t } = useLanguage();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const { data } = await api.get<{ success: true; data: CompanyProfile }>(`/api/companies/${params.id}`);
        setCompany(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) fetchCompany();
  }, [params.id]);

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

  if (notFound || !company) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-surface-cream gap-4">
        <div className="h-16 w-16 rounded-2xl bg-surface-white border border-surface-sand flex items-center justify-center mb-2">
          <HiOutlineOfficeBuilding size={28} className="text-text-muted/30" />
        </div>
        <p className="text-sm text-text-muted">{t("companyPublic.notFound")}</p>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
        >
          <HiOutlineChevronLeft size={16} />
          {t("companies.backToList") || "Back to companies"}
        </Link>
      </div>
    );
  }

  const initials = company.companyName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {/* ---- Top navigation bar ---- */}
      <div className="border-b border-surface-sand bg-surface-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/companies"
            className="flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
          >
            <HiOutlineChevronLeft size={18} />
            {t("companies.backToList") || "Back to companies"}
          </Link>
          <button
            onClick={() => {
              const url = `${window.location.origin}/companies/${company.id}`;
              if (navigator.share) {
                navigator.share({ title: company.companyName, text: `${company.companyName} on Stag.io`, url });
              } else {
                navigator.clipboard.writeText(url);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-cream hover:text-coffee-warm cursor-pointer"
          >
            <HiOutlineShare size={20} />
          </button>
        </div>
      </div>

      {/* ---- Content ---- */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Copy success toast */}
        {copySuccess && (
          <p className="rounded-lg bg-status-success/5 border border-status-success/15 px-3 py-2 text-sm text-status-success animate-fade-in">
            Link copied to clipboard!
          </p>
        )}

        {/* ---- Company Profile Card ---- */}
        <div className="rounded-2xl border border-surface-sand bg-surface-white overflow-hidden animate-fade-in">
          {/* Profile header */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  className="h-24 w-24 rounded-2xl object-cover border border-surface-sand shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-2xl font-bold text-white shadow-sm shrink-0">
                  {initials}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-coffee-dark">{company.companyName}</h1>
                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  {company.industry && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                      <HiOutlineBriefcase size={13} className="text-text-muted" />
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                      <HiOutlineLocationMarker size={13} className="text-text-muted" />
                      {company.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-coffee-gold/10 border border-coffee-gold/20 px-3 py-1.5 text-xs font-semibold text-coffee-warm">
                    <HiOutlineBriefcase size={13} />
                    {company.openPositions} {t("companyPublic.openPositions")}
                  </span>
                </div>

                {/* Website & Contact */}
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-text-muted">
                  {company.website && (
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-coffee-warm hover:text-coffee-dark transition-colors"
                    >
                      <HiOutlineGlobe size={14} />
                      {t("companyPublic.website")}
                    </a>
                  )}
                  {company.contactPerson && (
                    <span className="inline-flex items-center gap-1.5">
                      <HiOutlineUser size={14} />
                      {company.contactPerson}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="border-t border-surface-sand px-6 sm:px-8 py-5">
              <h2 className="mb-3 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-coffee-gold" />
                {t("companyPublic.about")}
              </h2>
              <p className="text-sm leading-[1.7] text-text-secondary whitespace-pre-line">{company.description}</p>
            </div>
          )}
        </div>

        {/* ---- Available Internships ---- */}
        <div className="rounded-2xl border border-surface-sand bg-surface-white overflow-hidden">
          <div className="px-6 sm:px-8 pt-6 pb-2">
            <h2 className="text-lg font-bold text-coffee-dark">{t("companyPublic.activeOffers")}</h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {company.offers.length} {t("companyPublic.openPositions").toLowerCase()}
            </p>
          </div>

          {company.offers.length === 0 ? (
            <div className="px-6 sm:px-8 pb-8 pt-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-surface-cream/50 py-12 text-center">
                <HiOutlineBriefcase size={32} className="mb-3 text-text-muted/30" />
                <p className="text-sm text-text-muted">{t("companyPublic.noOffers")}</p>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 space-y-2.5">
              {company.offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/internships/${offer.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-surface-sand bg-surface-white p-4 transition-all duration-200 hover:border-coffee-gold/30 hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-coffee-dark group-hover:text-coffee-warm transition-colors truncate">
                      {offer.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                        <HiOutlineLocationMarker size={11} />
                        {offer.location}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                        {typeIcon(offer.type)}
                        {typeLabel(offer.type)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                        <HiOutlineCalendar size={11} />
                        {offer.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
                        <HiOutlineClock size={11} />
                        {timeAgo(offer.createdAt)}
                      </span>
                    </div>
                  </div>
                  <HiOutlineChevronRight size={16} className="shrink-0 text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
