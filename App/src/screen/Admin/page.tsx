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
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

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

interface ApplicationListResult {
  applications: AdminApplication[];
  total: number;
  page: number;
  limit: number;
}

/* ============================================
   Reusable: Search Input
   ============================================ */
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <HiOutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-surface-sand bg-surface-white py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-coffee-gold focus:outline-none focus:ring-1 focus:ring-coffee-gold/30 transition-colors"
      />
    </div>
  );
}

/* ============================================
   Reusable: Filter Pill
   ============================================ */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
        active
          ? "bg-coffee-warm text-text-inverse shadow-sm"
          : "bg-surface-cream text-text-secondary hover:bg-surface-sand"
      }`}
    >
      {label}
    </button>
  );
}

/* ============================================
   Status Badge
   ============================================ */
function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { dot: string; bg: string }> = {
    pending: { dot: "bg-status-warning", bg: "bg-status-warning/10 text-status-warning" },
    accepted: { dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700" },
    validated: { dot: "bg-status-success", bg: "bg-status-success/10 text-status-success" },
    rejected: { dot: "bg-status-error", bg: "bg-status-error/10 text-status-error" },
    withdrawn: { dot: "bg-text-muted", bg: "bg-text-muted/10 text-text-muted" },
  };
  const s = config[status] ?? config.pending;
  const label = t(`status.${status}`) || status;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${s.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

/* ============================================
   Application Row (with checkbox)
   ============================================ */
function ApplicationRow({
  app,
  selected,
  onToggleSelect,
  onValidate,
  onDownloadPdf,
  t,
}: {
  app: AdminApplication;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onValidate: (id: string) => void;
  onDownloadPdf: (id: string) => void;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="border-b border-surface-sand/60 last:border-0">
      <div
        className="flex items-center gap-3 py-3.5 cursor-pointer hover:bg-surface-cream/40 px-3 -mx-3 rounded-lg transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Checkbox */}
        {app.status === "accepted" && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(app.id); }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-surface-sand text-coffee-warm focus:ring-coffee-gold/30 cursor-pointer shrink-0"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text-primary truncate">{app.studentName}</p>
            <StatusBadge status={app.status} t={t} />
          </div>
          <p className="mt-0.5 text-xs text-text-muted truncate">{app.offerTitle} — {app.companyName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {app.status === "accepted" && (
            <button
              onClick={(e) => { e.stopPropagation(); onValidate(app.id); }}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
            >
              <HiOutlineShieldCheck size={14} />
              {t("admin.validate")}
            </button>
          )}

          {app.status === "validated" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownloadPdf(app.id); }}
              className="inline-flex items-center gap-1 rounded-lg bg-coffee-gold/10 px-2.5 py-1.5 text-xs font-medium text-coffee-warm transition-colors hover:bg-coffee-gold/20 cursor-pointer"
            >
              <HiOutlineDocumentDownload size={14} />
              {t("admin.pdf")}
            </button>
          )}

          <span className="text-[11px] text-text-muted hidden sm:block">{dateStr}</span>
          {expanded ? <HiOutlineChevronUp size={15} className="text-text-muted" /> : <HiOutlineChevronDown size={15} className="text-text-muted" />}
        </div>
      </div>

      {expanded && (
        <div className="pb-4 px-3 -mx-3">
          <div className="rounded-xl border border-surface-sand bg-surface-cream/30 p-4 space-y-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">{t("companyDash.email")}</p>
              <a href={`mailto:${app.studentEmail}`} className="text-sm text-coffee-warm hover:underline">{app.studentEmail}</a>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">{t("companyDash.cvResume")}</p>
              {app.cvUrl ? (
                <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:underline">
                  <HiOutlineClipboardList size={14} />
                  {t("companyDash.viewCV")}
                </a>
              ) : (
                <p className="text-sm text-text-muted italic">{t("companyDash.noCVProvided")}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">{t("companyDash.coverLetter")}</p>
              {app.coverLetter ? (
                <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{app.coverLetter}</p>
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
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("pending-validation");
  const [acceptedApps, setAcceptedApps] = useState<AdminApplication[]>([]);

  // All-tab state with pagination
  const [allApps, setAllApps] = useState<AdminApplication[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [allPage, setAllPage] = useState(1);
  const [allLimit] = useState(20);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Stats (from unfiltered data)
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, validated: 0 });

  /* ---- Redirect non-admin ---- */
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router]);

  /* ---- Fetch accepted (for pending-validation tab) ---- */
  const fetchAccepted = useCallback(async () => {
    try {
      const res = await api.get<{ success: true; data: AdminApplication[] }>("/api/admin/applications");
      setAcceptedApps(res.data.data);
    } catch {}
  }, []);

  /* ---- Fetch all applications with filters ---- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQ) params.set("q", searchQ);
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("page", String(allPage));
      params.set("limit", String(allLimit));

      const res = await api.get<{ success: true; data: ApplicationListResult }>(
        `/api/admin/applications/all?${params.toString()}`
      );
      setAllApps(res.data.data.applications);
      setAllTotal(res.data.data.total);
    } catch {}
    setLoading(false);
  }, [searchQ, statusFilter, dateFrom, dateTo, allPage, allLimit]);

  /* ---- Fetch stats (unfiltered totals) ---- */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<{ success: true; data: ApplicationListResult }>(
        "/api/admin/applications/all?limit=10000"
      );
      const apps = res.data.data.applications;
      setStats({
        total: apps.length,
        pending: apps.filter((a) => a.status === "pending").length,
        accepted: apps.filter((a) => a.status === "accepted").length,
        validated: apps.filter((a) => a.status === "validated").length,
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAccepted();
      fetchStats();
    }
  }, [user, fetchAccepted, fetchStats]);

  useEffect(() => {
    if (user?.role === "admin" && activeTab === "all") {
      fetchAll();
    }
  }, [user, activeTab, fetchAll]);

  /* ---- Debounced search ---- */
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQ(searchInput);
      setAllPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ---- Validate single ---- */
  const handleValidate = async (id: string) => {
    setActionError(null);
    try {
      await api.patch(`/api/admin/applications/${id}/validate`);
      setAcceptedApps((prev) => prev.filter((a) => a.id !== id));
      setAllApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: "validated" } : a)));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      fetchStats();
    } catch {
      setActionError(t("admin.validateFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Batch validate ---- */
  const handleBatchValidate = async () => {
    if (selectedIds.size === 0) return;
    setActionError(null);
    try {
      const res = await api.patch<{ success: true; data: { validated: string[]; skipped: string[] } }>(
        "/api/admin/applications/batch-validate",
        { ids: Array.from(selectedIds) }
      );
      const { validated } = res.data.data;
      setAcceptedApps((prev) => prev.filter((a) => !validated.includes(a.id)));
      setAllApps((prev) => prev.map((a) => validated.includes(a.id) ? { ...a, status: "validated" } : a));
      setSelectedIds(new Set());
      setActionSuccess(t("admin.batchValidateSuccess").replace("{count}", String(validated.length)));
      setTimeout(() => setActionSuccess(null), 4000);
      fetchStats();
    } catch {
      setActionError(t("admin.batchValidateFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  };

  /* ---- Toggle selection ---- */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectableApps = (activeTab === "pending-validation" ? acceptedApps : allApps).filter((a) => a.status === "accepted");
  const allSelected = selectableApps.length > 0 && selectableApps.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableApps.map((a) => a.id)));
    }
  };

  /* ---- Export CSV ---- */
  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await api.get(`/api/admin/export/applications?${params.toString()}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "applications-export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setActionError(t("admin.exportFailed"));
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

  /* ---- Stats cards ---- */
  const statCards = [
    { icon: <HiOutlineClipboardList size={20} />, label: t("admin.totalApplications"), value: stats.total, accent: "text-coffee-warm bg-coffee-gold/10 ring-coffee-gold/20" },
    { icon: <HiOutlineUsers size={20} />, label: t("admin.pendingReview"), value: stats.pending, accent: "text-blue-600 bg-blue-50 ring-blue-100" },
    { icon: <HiOutlineBriefcase size={20} />, label: t("admin.awaitingValidation"), value: stats.accepted, accent: "text-amber-600 bg-amber-50 ring-amber-100" },
    { icon: <HiOutlineCheckCircle size={20} />, label: t("admin.validated"), value: stats.validated, accent: "text-emerald-600 bg-emerald-50 ring-emerald-100" },
  ];

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending-validation", label: t("admin.awaitingValidationTab"), count: acceptedApps.length },
    { key: "all", label: t("admin.allApplications"), count: allTotal || stats.total },
  ];

  const displayedApps = activeTab === "pending-validation" ? acceptedApps : allApps;
  const totalPages = Math.ceil(allTotal / allLimit);

  const statusOptions = [
    { value: "", label: t("admin.allStatuses") },
    { value: "pending", label: t("status.pending") },
    { value: "accepted", label: t("status.accepted") },
    { value: "validated", label: t("status.validated") },
    { value: "rejected", label: t("status.rejected") },
    { value: "withdrawn", label: t("status.withdrawn") },
  ];

  return (
    <section className="min-h-screen bg-surface-cream">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---- Toasts ---- */}
        {actionError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-sm text-status-error">
            <HiOutlineX size={16} className="shrink-0" />
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-status-success/20 bg-status-success/5 px-4 py-3 text-sm text-status-success">
            <HiOutlineCheckCircle size={16} className="shrink-0" />
            {actionSuccess}
          </div>
        )}

        {/* ---- Welcome ---- */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-coffee-dark sm:text-3xl">
              {t("admin.dashboard")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">{t("admin.dashboardDesc")}</p>
          </div>
          {/* Export button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-sand bg-surface-white px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-surface-cream hover:shadow-sm cursor-pointer"
          >
            <HiOutlineDownload size={16} />
            {t("admin.exportCsv")}
          </button>
        </div>

        {/* ---- Stats grid ---- */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((s) => {
            const [textColor, bgColor, ringColor] = s.accent.split(" ");
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-surface-sand bg-surface-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${bgColor} ${ringColor} ${textColor}`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-semibold tracking-tight text-text-primary">{s.value}</p>
                <p className="mt-0.5 text-xs text-text-muted leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* ---- Tabs ---- */}
        <div className="mb-4 flex gap-1 rounded-xl border border-surface-sand bg-surface-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-coffee-warm text-text-inverse shadow-sm"
                  : "text-text-secondary hover:bg-surface-cream"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-text-inverse/70" : "text-text-muted"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ---- Filters (All tab only) ---- */}
        {activeTab === "all" && (
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder={t("admin.searchApplications")}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setAllPage(1); }}
                  className="rounded-xl border border-surface-sand bg-surface-white px-3 py-2.5 text-sm text-text-secondary focus:border-coffee-gold focus:outline-none focus:ring-1 focus:ring-coffee-gold/30"
                  placeholder={t("admin.from")}
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setAllPage(1); }}
                  className="rounded-xl border border-surface-sand bg-surface-white px-3 py-2.5 text-sm text-text-secondary focus:border-coffee-gold focus:outline-none focus:ring-1 focus:ring-coffee-gold/30"
                  placeholder={t("admin.to")}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => (
                <FilterPill
                  key={opt.value}
                  label={opt.label}
                  active={statusFilter === opt.value}
                  onClick={() => { setStatusFilter(opt.value); setAllPage(1); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---- Batch action bar ---- */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-coffee-gold/30 bg-coffee-gold/5 px-4 py-3">
            <span className="text-sm font-medium text-coffee-warm">
              {t("admin.selectedCount").replace("{count}", String(selectedIds.size))}
            </span>
            <button
              onClick={handleBatchValidate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 cursor-pointer"
            >
              <HiOutlineShieldCheck size={14} />
              {t("admin.batchValidate")}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-text-muted hover:text-text-secondary cursor-pointer"
            >
              {t("admin.clearSelection")}
            </button>
          </div>
        )}

        {/* ---- Applications list ---- */}
        <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
          {/* Select all header */}
          {selectableApps.length > 0 && (
            <div className="flex items-center gap-3 border-b border-surface-sand/60 px-6 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-surface-sand text-coffee-warm focus:ring-coffee-gold/30 cursor-pointer"
              />
              <span className="text-xs text-text-muted">{t("admin.selectAll")}</span>
            </div>
          )}

          <div className="p-6">
            {loading && activeTab === "all" ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-coffee-gold border-t-transparent" />
              </div>
            ) : displayedApps.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-cream">
                  <HiOutlineShieldCheck size={24} className="text-text-muted/40" />
                </div>
                <p className="text-sm text-text-muted">
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
                  selected={selectedIds.has(app.id)}
                  onToggleSelect={toggleSelect}
                  onValidate={handleValidate}
                  onDownloadPdf={handleDownloadPdf}
                  t={t}
                />
              ))
            )}
          </div>

          {/* ---- Pagination (All tab) ---- */}
          {activeTab === "all" && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-surface-sand/60 px-6 py-3">
              <span className="text-xs text-text-muted">
                {t("admin.showingPage").replace("{page}", String(allPage)).replace("{total}", String(totalPages))}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                  disabled={allPage <= 1}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-cream disabled:opacity-40 cursor-pointer"
                >
                  <HiOutlineChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setAllPage((p) => Math.min(totalPages, p + 1))}
                  disabled={allPage >= totalPages}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-cream disabled:opacity-40 cursor-pointer"
                >
                  <HiOutlineChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
