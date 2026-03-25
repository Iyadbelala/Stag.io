"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlineChevronUp,
  HiOutlineGlobe,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  validatedCompanies: number;
  pendingCompanies: number;
  totalOffers: number;
  totalApplications: number;
  totalUniversities: number;
  validatedUniversities: number;
  pendingUniversities: number;
}

interface PendingCompany {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  contactPerson: string | null;
  email: string;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  verificationDocumentUrl: string | null;
  createdAt: string;
}

interface PendingUniversity {
  id: string;
  universityName: string;
  domain: string;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  email: string;
  createdAt: string;
}

/* ============================================
   Stat Card  (matches Admin & Student dashboards)
   ============================================ */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-heading font-bold text-coffee-dark">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}

/* ============================================
   SuperAdmin Dashboard
   ============================================ */
export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [pendingUniversities, setPendingUniversities] = useState<PendingUniversity[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ---- Redirect non-superadmin ---- */
  useEffect(() => {
    if (user && user.role !== "superadmin") {
      router.replace("/");
    }
  }, [user, router]);

  /* ---- Fetch data ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, statsRes, uniRes] = await Promise.all([
        api.get<{ success: true; data: PendingCompany[] }>("/api/superadmin/companies/pending"),
        api.get<{ success: true; data: PlatformStats }>("/api/superadmin/stats"),
        api.get<{ success: true; data: PendingUniversity[] }>("/api/superadmin/universities/pending"),
      ]);
      setPendingCompanies(pendingRes.data.data);
      setStats(statsRes.data.data);
      setPendingUniversities(uniRes.data.data);
    } catch {
      // Non-superadmin will be redirected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "superadmin") fetchData();
  }, [user, fetchData]);

  /* ---- Validate company ---- */
  const handleValidateCompany = async (id: string) => {
    setActionError(null);
    try {
      await api.patch(`/api/superadmin/companies/${id}/validate`);
      setPendingCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setActionError(t("superadmin.validateCompanyFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Reject company ---- */
  const handleRejectCompany = async (id: string) => {
    setActionError(null);
    try {
      await api.delete(`/api/superadmin/companies/${id}/reject`);
      setPendingCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setActionError(t("superadmin.rejectCompanyFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Validate university ---- */
  const handleValidateUniversity = async (id: string) => {
    setActionError(null);
    try {
      await api.patch(`/api/superadmin/universities/${id}/validate`);
      setPendingUniversities((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setActionError(t("superadmin.validateUniversityFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Reject university ---- */
  const handleRejectUniversity = async (id: string) => {
    setActionError(null);
    try {
      await api.delete(`/api/superadmin/universities/${id}/reject`);
      setPendingUniversities((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setActionError(t("superadmin.rejectUniversityFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Guard ---- */
  if (!user || user.role !== "superadmin") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-muted">{t("superadmin.accessRestricted")}</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-surface-cream">
      {/* ---- Header ---- */}
      <div className="border-b border-surface-sand bg-surface-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-coffee-dark">{t("superadmin.dashboard")}</h1>
            <p className="mt-1 text-sm text-text-muted">{t("superadmin.dashboardDesc")}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex items-center gap-2 rounded-button border border-surface-sand px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
            >
              <HiOutlineLogout size={16} />
              {t("common.signOut")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ---- Action error toast ---- */}
        {actionError && (
          <div className="mb-6 rounded-button border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {actionError}
          </div>
        )}

        {/* ---- Stats ---- */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<HiOutlineUsers size={22} className="text-blue-600" />}
            label={t("superadmin.totalUsers")}
            value={stats?.totalUsers ?? "—"}
            color="bg-blue-50"
          />
          <StatCard
            icon={<HiOutlineAcademicCap size={22} className="text-purple-600" />}
            label={t("superadmin.totalStudents")}
            value={stats?.totalStudents ?? "—"}
            color="bg-purple-50"
          />
          <StatCard
            icon={<HiOutlineOfficeBuilding size={22} className="text-coffee-warm" />}
            label={t("superadmin.totalCompanies")}
            value={stats?.totalCompanies ?? "—"}
            color="bg-coffee-gold/10"
          />
          <StatCard
            icon={<HiOutlineOfficeBuilding size={22} className="text-orange-600" />}
            label={t("superadmin.pendingCompanies")}
            value={stats?.pendingCompanies ?? pendingCompanies.length}
            color="bg-orange-50"
          />
          <StatCard
            icon={<HiOutlineBriefcase size={22} className="text-amber-600" />}
            label={t("superadmin.totalOffers")}
            value={stats?.totalOffers ?? "—"}
            color="bg-amber-50"
          />
          <StatCard
            icon={<HiOutlineClipboardList size={22} className="text-emerald-600" />}
            label={t("superadmin.totalApplications")}
            value={stats?.totalApplications ?? "—"}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<HiOutlineAcademicCap size={22} className="text-teal-600" />}
            label={t("superadmin.totalUniversities")}
            value={stats?.totalUniversities ?? "—"}
            color="bg-teal-50"
          />
          <StatCard
            icon={<HiOutlineAcademicCap size={22} className="text-rose-600" />}
            label={t("superadmin.pendingUniversities")}
            value={stats?.pendingUniversities ?? pendingUniversities.length}
            color="bg-rose-50"
          />
        </div>

        {/* ---- Pending Companies List ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-coffee-dark">{t("superadmin.pendingCompaniesTitle")}</h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
            </div>
          ) : pendingCompanies.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineOfficeBuilding size={48} className="mx-auto mb-4 text-text-muted/30" />
              <p className="text-text-muted">{t("superadmin.noPendingCompanies")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCompanies.map((company) => {
                const dateStr = new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const isExpanded = expandedId === company.id;
                return (
                  <div key={company.id} className="rounded-card border border-surface-sand p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          {company.logoUrl ? (
                            <Image
                              src={company.logoUrl}
                              alt={company.companyName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover border border-surface-sand"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coffee-gold/10 text-sm font-bold text-coffee-warm">
                              {company.companyName[0]?.toUpperCase()}
                            </div>
                          )}
                          <h3 className="font-medium text-text-primary text-lg">{company.companyName}</h3>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                          <span>{company.email}</span>
                          {company.industry && <span className="rounded-full bg-coffee-gold/10 px-2 py-0.5 text-xs font-medium text-coffee-warm">{company.industry}</span>}
                          {company.location && <span>{company.location}</span>}
                          {company.contactPerson && <span>{t("superadmin.contact")}: {company.contactPerson}</span>}
                          <span>{dateStr}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : company.id)}
                          className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 cursor-pointer"
                        >
                          {isExpanded ? <HiOutlineChevronUp size={14} /> : <HiOutlineEye size={14} />}
                          {isExpanded ? t("superadmin.hideProfile") : t("superadmin.viewProfile")}
                        </button>
                        <button
                          onClick={() => handleValidateCompany(company.id)}
                          className="flex items-center gap-1.5 rounded-full bg-status-success/10 px-4 py-2 text-xs font-medium text-status-success transition-colors hover:bg-status-success/20 cursor-pointer"
                        >
                          <HiOutlineCheckCircle size={14} />
                          {t("superadmin.approve")}
                        </button>
                        <button
                          onClick={() => handleRejectCompany(company.id)}
                          className="flex items-center gap-1.5 rounded-full bg-status-error/10 px-4 py-2 text-xs font-medium text-status-error transition-colors hover:bg-status-error/20 cursor-pointer"
                        >
                          <HiOutlineX size={14} />
                          {t("superadmin.reject")}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Profile View */}
                    {isExpanded && (
                      <div className="mt-4 rounded-xl border border-surface-sand bg-surface-cream/50 p-5 space-y-4">
                        <div className="flex items-start gap-5">
                          {company.logoUrl ? (
                            <Image
                              src={company.logoUrl}
                              alt={company.companyName}
                              width={80}
                              height={80}
                              className="h-20 w-20 rounded-xl object-cover border border-surface-sand"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-2xl font-bold text-text-inverse">
                              {company.companyName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-coffee-dark">{company.companyName}</h4>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
                              <span className="flex items-center gap-1.5">
                                <HiOutlineMail size={14} />
                                {company.email}
                              </span>
                              {company.location && (
                                <span className="flex items-center gap-1.5">
                                  <HiOutlineLocationMarker size={14} />
                                  {company.location}
                                </span>
                              )}
                              {company.website && (
                                <a
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-coffee-warm hover:underline"
                                >
                                  <HiOutlineGlobe size={14} />
                                  {company.website}
                                </a>
                              )}
                            </div>
                            {company.industry && (
                              <span className="mt-2 inline-block rounded-full bg-coffee-gold/10 px-3 py-1 text-xs font-medium text-coffee-warm">
                                {company.industry}
                              </span>
                            )}
                          </div>
                        </div>

                        {company.description && (
                          <div>
                            <p className="text-xs font-medium text-text-muted mb-1">{t("superadmin.description")}</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{company.description}</p>
                          </div>
                        )}

                        {company.contactPerson && (
                          <div>
                            <p className="text-xs font-medium text-text-muted mb-1">{t("superadmin.contact")}</p>
                            <p className="text-sm text-text-secondary">{company.contactPerson}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {company.verificationDocumentUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`${apiBase}${company.verificationDocumentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-button border border-surface-sand px-3 py-1.5 text-xs font-medium text-coffee-warm transition-colors hover:bg-coffee-gold/10"
                        >
                          <HiOutlineExternalLink size={14} />
                          {t("superadmin.viewDocument")}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---- Pending Universities List ---- */}
        <div className="mt-8 rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-coffee-dark">{t("superadmin.pendingUniversitiesTitle")}</h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
            </div>
          ) : pendingUniversities.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineAcademicCap size={48} className="mx-auto mb-4 text-text-muted/30" />
              <p className="text-text-muted">{t("superadmin.noPendingUniversities")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUniversities.map((uni) => {
                const dateStr = new Date(uni.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <div key={uni.id} className="rounded-card border border-surface-sand p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          {uni.logoUrl ? (
                            <Image
                              src={uni.logoUrl}
                              alt={uni.universityName}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover border border-surface-sand"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                              {uni.universityName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-text-primary text-lg">{uni.universityName}</h3>
                            <span className="text-xs text-text-muted">@{uni.domain}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                          <span className="flex items-center gap-1"><HiOutlineMail size={14} />{uni.email}</span>
                          {uni.location && <span className="flex items-center gap-1"><HiOutlineLocationMarker size={14} />{uni.location}</span>}
                          {uni.website && (
                            <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-coffee-warm hover:underline">
                              <HiOutlineGlobe size={14} />{uni.website}
                            </a>
                          )}
                          <span>{dateStr}</span>
                        </div>
                        {uni.description && (
                          <p className="mt-2 text-sm text-text-secondary leading-relaxed">{uni.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleValidateUniversity(uni.id)}
                          className="flex items-center gap-1.5 rounded-full bg-status-success/10 px-4 py-2 text-xs font-medium text-status-success transition-colors hover:bg-status-success/20 cursor-pointer"
                        >
                          <HiOutlineCheckCircle size={14} />
                          {t("superadmin.approve")}
                        </button>
                        <button
                          onClick={() => handleRejectUniversity(uni.id)}
                          className="flex items-center gap-1.5 rounded-full bg-status-error/10 px-4 py-2 text-xs font-medium text-status-error transition-colors hover:bg-status-error/20 cursor-pointer"
                        >
                          <HiOutlineX size={14} />
                          {t("superadmin.reject")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
