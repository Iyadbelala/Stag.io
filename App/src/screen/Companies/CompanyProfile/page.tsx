"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineGlobe,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineArrowLeft,
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

export default function CompanyPublicProfile() {
  const params = useParams();
  const { t } = useLanguage();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        <p className="text-lg text-text-muted">{t("companyPublic.notFound")}</p>
        <Link href="/companies" className="text-sm text-coffee-warm hover:underline flex items-center gap-1">
          <HiOutlineArrowLeft size={14} />
          Back to companies
        </Link>
      </div>
    );
  }

  const initials = company.companyName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Back link */}
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-coffee-warm transition-colors">
          <HiOutlineArrowLeft size={14} />
          Back to companies
        </Link>

        {/* Company Header */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {company.logoUrl ? (
              <Image src={company.logoUrl} alt={company.companyName} width={96} height={96} className="h-24 w-24 rounded-xl object-cover border border-surface-sand shrink-0" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-2xl font-bold text-text-inverse shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-coffee-dark sm:text-3xl">{company.companyName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineBriefcase size={14} />
                    {company.industry}
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineLocationMarker size={14} />
                    {company.location}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-coffee-warm hover:underline">
                    <HiOutlineGlobe size={14} />
                    {t("companyPublic.website")}
                  </a>
                )}
                {company.contactPerson && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineUser size={14} />
                    {company.contactPerson}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <span className="rounded-full bg-coffee-gold/10 px-3 py-1 text-sm font-medium text-coffee-warm">
                  {company.openPositions} {t("companyPublic.openPositions")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        {company.description && (
          <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-coffee-dark">{t("companyPublic.about")}</h2>
            <p className="text-sm text-text-secondary whitespace-pre-line">{company.description}</p>
          </div>
        )}

        {/* Active Offers */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-coffee-dark">{t("companyPublic.activeOffers")}</h2>
          <p className="mb-6 text-sm text-text-muted">{company.offers.length} {t("companyPublic.openPositions").toLowerCase()}</p>

          {company.offers.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineBriefcase size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">{t("companyPublic.noOffers")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {company.offers.map((offer) => (
                <Link
                  key={offer.id}
                  href="/internships"
                  className="flex items-center justify-between gap-4 rounded-card border border-surface-sand p-4 transition-colors hover:bg-surface-cream/50 hover:border-coffee-gold/30"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{offer.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <HiOutlineLocationMarker size={12} />
                        {offer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineClock size={12} />
                        {offer.duration}
                      </span>
                      <span className="rounded-full bg-coffee-gold/10 px-2 py-0.5 text-[11px] font-medium text-coffee-warm">
                        {offer.type}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-coffee-warm font-medium">{t("companyPublic.applyNow")}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
