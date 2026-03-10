"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineDocumentDownload,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineLogout,
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface AdminApplication {
  id: string;
  studentName: string;
  studentEmail: string;
  offerTitle: string;
  companyName: string;
  coverLetter: string | null;
  cvUrl: string | null;
  status: string;
  appliedAt: string;
}

/* ============================================
   Stat Card
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
   Application Row
   ============================================ */
function ApplicationRow({
  app,
  onValidate,
  onDownloadPdf,
  t,
}: {
  app: AdminApplication;
  onValidate: (id: string) => void;
  onDownloadPdf: (id: string) => void;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: t("status.pending"), classes: "bg-status-warning/10 text-status-warning" },
    accepted: { label: t("status.accepted"), classes: "bg-blue-100 text-blue-700" },
    validated: { label: t("status.validated"), classes: "bg-status-success/10 text-status-success" },
    rejected: { label: t("status.rejected"), classes: "bg-status-error/10 text-status-error" },
    withdrawn: { label: t("status.withdrawn"), classes: "bg-text-muted/10 text-text-muted" },
  };

  const s = statusConfig[app.status] ?? statusConfig.pending;

  return (
    <div className="border-b border-surface-sand last:border-0">
      <div
        className="flex items-center justify-between gap-4 py-4 cursor-pointer hover:bg-surface-cream/30 px-2 -mx-2 rounded transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary truncate">{app.studentName}</p>
          <p className="text-sm text-text-muted truncate">{app.offerTitle} — {app.companyName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.classes}`}>{s.label}</span>

          {app.status === "accepted" && (
            <button
              onClick={(e) => { e.stopPropagation(); onValidate(app.id); }}
              className="rounded-full bg-status-success/10 px-3 py-1.5 text-xs font-medium text-status-success transition-colors hover:bg-status-success/20 cursor-pointer flex items-center gap-1"
              title={t("admin.validate")}
              aria-label={t("admin.validate")}
            >
              <HiOutlineShieldCheck size={14} />
              {t("admin.validate")}
            </button>
          )}

          {app.status === "validated" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownloadPdf(app.id); }}
              className="rounded-full bg-coffee-gold/10 px-3 py-1.5 text-xs font-medium text-coffee-dark transition-colors hover:bg-coffee-gold/20 cursor-pointer flex items-center gap-1"
              title={t("admin.pdf")}
              aria-label={t("admin.pdf")}
            >
              <HiOutlineDocumentDownload size={14} />
              {t("admin.pdf")}
            </button>
          )}

          <span className="text-xs text-text-muted hidden sm:block">{dateStr}</span>

          {expanded ? <HiOutlineChevronUp size={16} className="text-text-muted" /> : <HiOutlineChevronDown size={16} className="text-text-muted" />}
        </div>
      </div>

      {expanded && (
        <div className="pb-4 pl-2 pr-2 space-y-3">
          <div className="rounded-card border border-surface-sand bg-surface-cream/30 p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.email")}</p>
              <a href={`mailto:${app.studentEmail}`} className="text-sm text-coffee-warm hover:text-coffee-gold underline">{app.studentEmail}</a>
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.cvResume")}</p>
              {app.cvUrl ? (
                <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:text-coffee-gold underline">
                  <HiOutlineClipboardList size={14} />
                  {t("companyDash.viewCV")}
                </a>
              ) : (
                <p className="text-sm text-text-muted italic">{t("companyDash.noCVProvided")}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.coverLetter")}</p>
              {app.coverLetter ? (
                <p className="text-sm text-text-secondary whitespace-pre-line">{app.coverLetter}</p>
              ) : (
                <p className="text-sm text-text-muted italic">{t("companyDash.noCoverLetter")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   Admin Dashboard
   ============================================ */
type TabKey = "pending-validation" | "all";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("pending-validation");
  const [acceptedApps, setAcceptedApps] = useState<AdminApplication[]>([]);
  const [allApps, setAllApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  /* ---- Redirect non-admin ---- */
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  /* ---- Fetch data ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [acceptedRes, allRes] = await Promise.all([
        api.get<{ success: true; data: AdminApplication[] }>("/api/admin/applications"),
        api.get<{ success: true; data: AdminApplication[] }>("/api/admin/applications/all"),
      ]);
      setAcceptedApps(acceptedRes.data.data);
      setAllApps(allRes.data.data);
    } catch {
      // Non-admin will be redirected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user, fetchData]);

  /* ---- Validate ---- */
  const handleValidate = async (id: string) => {
    setActionError(null);
    try {
      await api.patch(`/api/admin/applications/${id}/validate`);
      setAcceptedApps((prev) => prev.filter((a) => a.id !== id));
      setAllApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "validated" } : a)));
    } catch {
      setActionError(t("admin.validateFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Download PDF ---- */
  const handleDownloadPdf = async (id: string) => {
    setActionError(null);
    try {
      const res = await api.get(`/api/admin/applications/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `internship-agreement-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setActionError(t("admin.downloadFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Guard ---- */
  if (!user || user.role !== "admin") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-muted">{t("admin.accessRestricted")}</p>
      </section>
    );
  }

  /* ---- Stats ---- */
  const totalAll = allApps.length;
  const totalAccepted = allApps.filter((a) => a.status === "accepted").length;
  const totalValidated = allApps.filter((a) => a.status === "validated").length;
  const totalPending = allApps.filter((a) => a.status === "pending").length;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending-validation", label: t("admin.awaitingValidationTab"), count: acceptedApps.length },
    { key: "all", label: t("admin.allApplications"), count: totalAll },
  ];

  const displayedApps = activeTab === "pending-validation" ? acceptedApps : allApps;

  return (
    <section className="min-h-screen bg-surface-cream">
      {/* ---- Header ---- */}
      <div className="border-b border-surface-sand bg-surface-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-coffee-dark">{t("admin.dashboard")}</h1>
            <p className="mt-1 text-sm text-text-muted">{t("admin.dashboardDesc")}</p>
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<HiOutlineClipboardList size={22} className="text-coffee-warm" />} label={t("admin.totalApplications")} value={totalAll} color="bg-coffee-gold/10" />
          <StatCard icon={<HiOutlineUsers size={22} className="text-blue-600" />} label={t("admin.pendingReview")} value={totalPending} color="bg-blue-50" />
          <StatCard icon={<HiOutlineBriefcase size={22} className="text-amber-600" />} label={t("admin.awaitingValidation")} value={totalAccepted} color="bg-amber-50" />
          <StatCard icon={<HiOutlineCheckCircle size={22} className="text-status-success" />} label={t("admin.validated")} value={totalValidated} color="bg-status-success/10" />
        </div>

        {/* ---- Tabs ---- */}
        <div className="mb-6 flex gap-1 rounded-card border border-surface-sand bg-surface-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-card px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "bg-coffee-warm text-text-inverse shadow-sm"
                  : "text-text-secondary hover:bg-surface-cream"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ---- Applications List ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
            </div>
          ) : displayedApps.length === 0 ? (
            <div className="py-16 text-center">
              <HiOutlineShieldCheck size={48} className="mx-auto mb-4 text-text-muted/30" />
              <p className="text-text-muted">
                {activeTab === "pending-validation"
                  ? t("admin.noAwaitingValidation")
                  : t("admin.noApplications")}
              </p>
            </div>
          ) : (
            displayedApps.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                onValidate={handleValidate}
                onDownloadPdf={handleDownloadPdf}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
