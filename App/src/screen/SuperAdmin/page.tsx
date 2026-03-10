"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/LanguageContext";

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
}

interface PendingCompany {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  contactPerson: string | null;
  email: string;
  verificationDocumentUrl: string | null;
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
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

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
      const [pendingRes, statsRes] = await Promise.all([
        api.get<{ success: true; data: PendingCompany[] }>("/api/superadmin/companies/pending"),
        api.get<{ success: true; data: PlatformStats }>("/api/superadmin/stats"),
      ]);
      setPendingCompanies(pendingRes.data.data);
      setStats(statsRes.data.data);
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
                return (
                  <div key={company.id} className="rounded-card border border-surface-sand p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-text-primary text-lg">{company.companyName}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                          <span>{company.email}</span>
                          {company.industry && <span className="rounded-full bg-coffee-gold/10 px-2 py-0.5 text-xs font-medium text-coffee-warm">{company.industry}</span>}
                          {company.location && <span>{company.location}</span>}
                          {company.contactPerson && <span>{t("superadmin.contact")}: {company.contactPerson}</span>}
                          <span>{dateStr}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
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
      </div>
    </section>
  );
}
