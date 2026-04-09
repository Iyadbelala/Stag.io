"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlineChevronUp,
  HiOutlineGlobe,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineTrendingUp,
  HiOutlineSearch,
  HiOutlineBan,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

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

interface UserItem {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

interface CompanyItem {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  contactPerson: string | null;
  email: string;
  website: string | null;
  logoUrl: string | null;
  isValidated: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

interface UniversityItem {
  id: string;
  universityName: string;
  domain: string;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  email: string;
  isValidated: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

interface OfferItem {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  status: string;
  duration: string;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
}

type Tab = "overview" | "users" | "companies" | "universities" | "offers" | "activity";

/* ============================================
   Reusable search input
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
        className="w-full rounded-xl border border-surface-sand bg-surface-white py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-colors focus:border-coffee-gold"
      />
    </div>
  );
}

/* ============================================
   Filter pill
   ============================================ */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
        active
          ? "bg-coffee-warm text-text-inverse shadow-sm"
          : "bg-surface-white text-text-secondary border border-surface-sand hover:border-coffee-gold/40"
      }`}
    >
      {label}
    </button>
  );
}

/* ============================================
   Role badge
   ============================================ */
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    student: "bg-purple-50 text-purple-700",
    company: "bg-amber-50 text-amber-700",
    admin: "bg-blue-50 text-blue-700",
    superadmin: "bg-red-50 text-red-700",
    university: "bg-teal-50 text-teal-700",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${config[role] ?? "bg-gray-50 text-gray-700"}`}>
      {role}
    </span>
  );
}

/* ============================================
   Status dot badge
   ============================================ */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {active ? "Active" : "Deactivated"}
    </span>
  );
}

/* ============================================
   Spinner
   ============================================ */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-coffee-gold border-t-transparent" />
    </div>
  );
}

/* ============================================
   Empty state
   ============================================ */
function Empty({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-cream">
        {icon}
      </div>
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}

/* ============================================
   SuperAdmin Dashboard
   ============================================ */
export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Overview state
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [pendingUniversities, setPendingUniversities] = useState<PendingUniversity[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Users state
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("");
  const [usersStatusFilter, setUsersStatusFilter] = useState("");

  // Companies state
  const [allCompanies, setAllCompanies] = useState<CompanyItem[]>([]);
  const [companiesSearch, setCompaniesSearch] = useState("");
  const [companiesFilter, setCompaniesFilter] = useState("");

  // Universities state
  const [allUniversitiesList, setAllUniversitiesList] = useState<UniversityItem[]>([]);
  const [universitiesSearch, setUniversitiesSearch] = useState("");
  const [universitiesFilter, setUniversitiesFilter] = useState("");

  // Offers state
  const [allOffers, setAllOffers] = useState<OfferItem[]>([]);
  const [offersSearch, setOffersSearch] = useState("");
  const [offersStatusFilter, setOffersStatusFilter] = useState("");

  // Activity / audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    registrationsByDay: { date: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
    topCompaniesByOffers: { companyName: string; count: number }[];
    topUniversitiesByStudents: { universityName: string; count: number }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  /* ---- Redirect non-superadmin ---- */
  useEffect(() => {
    if (user && user.role !== "superadmin") router.replace("/");
  }, [user, router]);

  /* ---- Fetch overview data ---- */
  const fetchOverview = useCallback(async () => {
    try {
      const [statsRes, pendingRes, uniRes, analyticsRes] = await Promise.all([
        api.get<{ success: true; data: PlatformStats }>("/api/superadmin/stats"),
        api.get<{ success: true; data: PendingCompany[] }>("/api/superadmin/companies/pending"),
        api.get<{ success: true; data: PendingUniversity[] }>("/api/superadmin/universities/pending"),
        api.get<{ success: true; data: typeof analytics }>("/api/superadmin/analytics"),
      ]);
      setStats(statsRes.data.data);
      setPendingCompanies(pendingRes.data.data);
      setPendingUniversities(uniRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch { /* redirect handles auth */ }
  }, []);

  /* ---- Fetch users ---- */
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (usersSearch) params.set("q", usersSearch);
      if (usersRoleFilter) params.set("role", usersRoleFilter);
      if (usersStatusFilter) params.set("status", usersStatusFilter);
      params.set("page", String(usersPage));
      params.set("limit", "20");
      const res = await api.get<{ success: true; data: { users: UserItem[]; total: number } }>(`/api/superadmin/users?${params}`);
      setAllUsers(res.data.data.users);
      setUsersTotal(res.data.data.total);
    } catch { /* */ }
  }, [usersSearch, usersRoleFilter, usersStatusFilter, usersPage]);

  /* ---- Fetch companies ---- */
  const fetchCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (companiesSearch) params.set("q", companiesSearch);
      if (companiesFilter) params.set("validated", companiesFilter);
      const res = await api.get<{ success: true; data: CompanyItem[] }>(`/api/superadmin/companies/all?${params}`);
      setAllCompanies(res.data.data);
    } catch { /* */ }
  }, [companiesSearch, companiesFilter]);

  /* ---- Fetch universities ---- */
  const fetchUniversities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (universitiesSearch) params.set("q", universitiesSearch);
      if (universitiesFilter) params.set("validated", universitiesFilter);
      const res = await api.get<{ success: true; data: UniversityItem[] }>(`/api/superadmin/universities/all?${params}`);
      setAllUniversitiesList(res.data.data);
    } catch { /* */ }
  }, [universitiesSearch, universitiesFilter]);

  /* ---- Fetch offers ---- */
  const fetchOffers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (offersSearch) params.set("q", offersSearch);
      if (offersStatusFilter) params.set("status", offersStatusFilter);
      const res = await api.get<{ success: true; data: OfferItem[] }>(`/api/superadmin/offers?${params}`);
      setAllOffers(res.data.data);
    } catch { /* */ }
  }, [offersSearch, offersStatusFilter]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(auditPage));
      params.set("limit", "30");
      const res = await api.get<{ success: true; data: { logs: AuditLogItem[]; total: number } }>(`/api/superadmin/audit-log?${params}`);
      setAuditLogs(res.data.data.logs);
      setAuditTotal(res.data.data.total);
    } catch { /* */ }
  }, [auditPage]);

  /* ---- Initial load ---- */
  useEffect(() => {
    if (user?.role !== "superadmin") return;
    setLoading(true);
    fetchOverview().finally(() => setLoading(false));
  }, [user, fetchOverview]);

  /* ---- Tab-specific data loading ---- */
  useEffect(() => {
    if (user?.role !== "superadmin") return;
    if (activeTab === "users") fetchUsers();
    if (activeTab === "companies") fetchCompanies();
    if (activeTab === "universities") fetchUniversities();
    if (activeTab === "offers") fetchOffers();
    if (activeTab === "activity") fetchAuditLogs();
  }, [activeTab, fetchUsers, fetchCompanies, fetchUniversities, fetchOffers, fetchAuditLogs, user]);

  /* ---- Actions ---- */
  const showError = (msg: string) => { setActionError(msg); setTimeout(() => setActionError(null), 4000); };

  const handleValidateCompany = async (id: string) => {
    try { await api.patch(`/api/superadmin/companies/${id}/validate`); setPendingCompanies((p) => p.filter((c) => c.id !== id)); fetchCompanies(); fetchOverview(); } catch { showError(t("superadmin.validateCompanyFailed")); }
  };
  const handleRejectCompany = async (id: string) => {
    try { await api.delete(`/api/superadmin/companies/${id}/reject`); setPendingCompanies((p) => p.filter((c) => c.id !== id)); fetchCompanies(); fetchOverview(); } catch { showError(t("superadmin.rejectCompanyFailed")); }
  };
  const handleValidateUniversity = async (id: string) => {
    try { await api.patch(`/api/superadmin/universities/${id}/validate`); setPendingUniversities((p) => p.filter((u) => u.id !== id)); fetchUniversities(); fetchOverview(); } catch { showError(t("superadmin.validateUniversityFailed")); }
  };
  const handleRejectUniversity = async (id: string) => {
    try { await api.delete(`/api/superadmin/universities/${id}/reject`); setPendingUniversities((p) => p.filter((u) => u.id !== id)); fetchUniversities(); fetchOverview(); } catch { showError(t("superadmin.rejectUniversityFailed")); }
  };
  const handleDeactivateUser = async (id: string) => {
    try { await api.patch(`/api/superadmin/users/${id}/deactivate`); fetchUsers(); fetchOverview(); } catch { showError("Failed to deactivate user."); }
  };
  const handleReactivateUser = async (id: string) => {
    try { await api.patch(`/api/superadmin/users/${id}/reactivate`); fetchUsers(); fetchOverview(); } catch { showError("Failed to reactivate user."); }
  };
  const handleCloseOffer = async (id: string) => {
    try { await api.patch(`/api/superadmin/offers/${id}/close`); fetchOffers(); fetchOverview(); } catch { showError("Failed to close offer."); }
  };
  const handleDeleteOffer = async (id: string) => {
    if (!confirm(t("superadmin.confirmDelete"))) return;
    try { await api.delete(`/api/superadmin/offers/${id}`); fetchOffers(); fetchOverview(); } catch { showError("Failed to delete offer."); }
  };

  /* ---- Guard ---- */
  if (!user || user.role !== "superadmin") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-muted">{t("superadmin.accessRestricted")}</p>
      </section>
    );
  }

  /* ---- Tab config ---- */
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("superadmin.tabOverview"), icon: <HiOutlineTrendingUp size={16} /> },
    { key: "users", label: t("superadmin.tabUsers"), icon: <HiOutlineUsers size={16} /> },
    { key: "companies", label: t("superadmin.tabCompanies"), icon: <HiOutlineOfficeBuilding size={16} /> },
    { key: "universities", label: t("superadmin.tabUniversities"), icon: <HiOutlineAcademicCap size={16} /> },
    { key: "offers", label: t("superadmin.tabOffers"), icon: <HiOutlineBriefcase size={16} /> },
    { key: "activity", label: t("superadmin.tabActivity"), icon: <HiOutlineClipboardList size={16} /> },
  ];

  const statCards = [
    { icon: <HiOutlineUsers size={20} />, label: t("superadmin.totalUsers"), value: stats?.totalUsers ?? "—", accent: "text-blue-600 bg-blue-50 ring-blue-100" },
    { icon: <HiOutlineAcademicCap size={20} />, label: t("superadmin.totalStudents"), value: stats?.totalStudents ?? "—", accent: "text-purple-600 bg-purple-50 ring-purple-100" },
    { icon: <HiOutlineOfficeBuilding size={20} />, label: t("superadmin.totalCompanies"), value: stats?.totalCompanies ?? "—", accent: "text-coffee-warm bg-coffee-gold/10 ring-coffee-gold/20" },
    { icon: <HiOutlineBriefcase size={20} />, label: t("superadmin.totalOffers"), value: stats?.totalOffers ?? "—", accent: "text-amber-600 bg-amber-50 ring-amber-100" },
    { icon: <HiOutlineClipboardList size={20} />, label: t("superadmin.totalApplications"), value: stats?.totalApplications ?? "—", accent: "text-emerald-600 bg-emerald-50 ring-emerald-100" },
    { icon: <HiOutlineAcademicCap size={20} />, label: t("superadmin.totalUniversities"), value: stats?.totalUniversities ?? "—", accent: "text-teal-600 bg-teal-50 ring-teal-100" },
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="min-h-screen bg-surface-cream">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---- Error toast ---- */}
        {actionError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-status-error/20 bg-status-error/5 px-4 py-3 text-sm text-status-error">
            <HiOutlineX size={16} className="shrink-0" />
            {actionError}
          </div>
        )}

        {/* ---- Header ---- */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-coffee-dark sm:text-3xl">{t("superadmin.dashboard")}</h1>
          <p className="mt-1 text-sm text-text-muted">{t("superadmin.dashboardDesc")}</p>
        </div>

        {/* ---- Tabs ---- */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-surface-sand bg-surface-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-coffee-warm text-text-inverse shadow-sm"
                  : "text-text-secondary hover:bg-surface-cream"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
           TAB: OVERVIEW
           ════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Stats grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {statCards.map((s) => {
                const [textColor, bgColor, ringColor] = s.accent.split(" ");
                return (
                  <div key={s.label} className="group rounded-2xl border border-surface-sand bg-surface-white p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${bgColor} ${ringColor} ${textColor}`}>{s.icon}</div>
                    <p className="text-2xl font-semibold tracking-tight text-text-primary">{s.value}</p>
                    <p className="mt-0.5 text-xs text-text-muted leading-tight">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Pending alerts */}
            {(stats && (stats.pendingCompanies > 0 || stats.pendingUniversities > 0)) && (
              <div className="mb-8 flex flex-wrap gap-3">
                {stats.pendingCompanies > 0 && (
                  <button onClick={() => setActiveTab("companies")} className="flex items-center gap-2.5 rounded-full border border-orange-200 bg-orange-50/60 px-4 py-2 text-sm cursor-pointer hover:bg-orange-100 transition-colors">
                    <HiOutlineOfficeBuilding size={16} className="text-orange-600" />
                    <span className="font-medium text-text-primary">{stats.pendingCompanies}</span>
                    <span className="text-text-muted">{t("superadmin.pendingCompanies")}</span>
                  </button>
                )}
                {stats.pendingUniversities > 0 && (
                  <button onClick={() => setActiveTab("universities")} className="flex items-center gap-2.5 rounded-full border border-rose-200 bg-rose-50/60 px-4 py-2 text-sm cursor-pointer hover:bg-rose-100 transition-colors">
                    <HiOutlineAcademicCap size={16} className="text-rose-600" />
                    <span className="font-medium text-text-primary">{stats.pendingUniversities}</span>
                    <span className="text-text-muted">{t("superadmin.pendingUniversities")}</span>
                  </button>
                )}
              </div>
            )}

            {/* Pending Companies */}
            <div className="mb-8 rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
              <div className="flex items-center justify-between border-b border-surface-sand px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><HiOutlineOfficeBuilding size={18} /></div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">{t("superadmin.pendingCompaniesTitle")}</h2>
                    <p className="text-xs text-text-muted">{pendingCompanies.length} {t("superadmin.awaitingReview")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? <Spinner /> : pendingCompanies.length === 0 ? (
                  <Empty icon={<HiOutlineOfficeBuilding size={24} className="text-text-muted/40" />} message={t("superadmin.noPendingCompanies")} />
                ) : (
                  <div className="space-y-3">
                    {pendingCompanies.map((company) => {
                      const isExpanded = expandedId === company.id;
                      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                      return (
                        <div key={company.id} className="rounded-xl border border-surface-sand p-4 transition-colors hover:border-coffee-gold/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              {company.logoUrl ? (
                                <Image src={company.logoUrl} alt={company.companyName} width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-surface-sand" />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-sm font-semibold text-text-inverse">{company.companyName[0]?.toUpperCase()}</div>
                              )}
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-text-primary">{company.companyName}</h3>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                                  <span>{company.email}</span>
                                  {company.industry && <span className="rounded-md bg-coffee-gold/10 px-1.5 py-0.5 text-[11px] font-medium text-coffee-warm">{company.industry}</span>}
                                  {company.location && <span>{company.location}</span>}
                                  <span>{formatDate(company.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <button onClick={() => setExpandedId(isExpanded ? null : company.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-cream cursor-pointer">
                                {isExpanded ? <HiOutlineChevronUp size={14} /> : <HiOutlineEye size={14} />}
                                {isExpanded ? t("superadmin.hideProfile") : t("superadmin.viewProfile")}
                              </button>
                              <button onClick={() => handleValidateCompany(company.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer"><HiOutlineCheckCircle size={14} />{t("superadmin.approve")}</button>
                              <button onClick={() => handleRejectCompany(company.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer"><HiOutlineX size={14} />{t("superadmin.reject")}</button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-4 rounded-xl border border-surface-sand bg-surface-cream/40 p-5 space-y-4">
                              <div className="flex items-start gap-4">
                                {company.logoUrl ? <Image src={company.logoUrl} alt={company.companyName} width={72} height={72} className="h-[72px] w-[72px] rounded-2xl object-cover border border-surface-sand" /> : <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-xl font-bold text-text-inverse">{company.companyName[0]?.toUpperCase()}</div>}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-semibold text-text-primary">{company.companyName}</h4>
                                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-text-muted">
                                    <span className="flex items-center gap-1"><HiOutlineMail size={13} />{company.email}</span>
                                    {company.location && <span className="flex items-center gap-1"><HiOutlineLocationMarker size={13} />{company.location}</span>}
                                    {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-coffee-warm hover:underline"><HiOutlineGlobe size={13} />{company.website}</a>}
                                  </div>
                                  {company.industry && <span className="mt-2 inline-block rounded-md bg-coffee-gold/10 px-2 py-0.5 text-xs font-medium text-coffee-warm">{company.industry}</span>}
                                </div>
                              </div>
                              {company.description && <div><p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">{t("superadmin.description")}</p><p className="text-sm text-text-secondary leading-relaxed">{company.description}</p></div>}
                              {company.contactPerson && <div><p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-1">{t("superadmin.contact")}</p><p className="text-sm text-text-secondary">{company.contactPerson}</p></div>}
                            </div>
                          )}
                          {company.verificationDocumentUrl && (
                            <div className="mt-3">
                              <a href={`${apiBase}${company.verificationDocumentUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-surface-sand px-3 py-1.5 text-xs font-medium text-coffee-warm hover:bg-coffee-gold/5"><HiOutlineExternalLink size={13} />{t("superadmin.viewDocument")}</a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Universities */}
            <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
              <div className="flex items-center justify-between border-b border-surface-sand px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600"><HiOutlineAcademicCap size={18} /></div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">{t("superadmin.pendingUniversitiesTitle")}</h2>
                    <p className="text-xs text-text-muted">{pendingUniversities.length} {t("superadmin.awaitingReview")}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? <Spinner /> : pendingUniversities.length === 0 ? (
                  <Empty icon={<HiOutlineAcademicCap size={24} className="text-text-muted/40" />} message={t("superadmin.noPendingUniversities")} />
                ) : (
                  <div className="space-y-3">
                    {pendingUniversities.map((uni) => (
                      <div key={uni.id} className="rounded-xl border border-surface-sand p-4 hover:border-teal-200 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            {uni.logoUrl ? <Image src={uni.logoUrl} alt={uni.universityName} width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-surface-sand" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-600">{uni.universityName[0]?.toUpperCase()}</div>}
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-text-primary">{uni.universityName}</h3>
                              <span className="text-[11px] text-text-muted">@{uni.domain}</span>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                                <span className="flex items-center gap-1"><HiOutlineMail size={13} />{uni.email}</span>
                                {uni.location && <span className="flex items-center gap-1"><HiOutlineLocationMarker size={13} />{uni.location}</span>}
                                {uni.website && <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-coffee-warm hover:underline"><HiOutlineGlobe size={13} />{uni.website}</a>}
                                <span>{formatDate(uni.createdAt)}</span>
                              </div>
                              {uni.description && <p className="mt-2 text-xs text-text-secondary leading-relaxed line-clamp-2">{uni.description}</p>}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button onClick={() => handleValidateUniversity(uni.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer"><HiOutlineCheckCircle size={14} />{t("superadmin.approve")}</button>
                            <button onClick={() => handleRejectUniversity(uni.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer"><HiOutlineX size={14} />{t("superadmin.reject")}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Analytics Charts ═══ */}
            {analytics && (
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Registrations (30d) — Bar chart */}
                <div className="rounded-2xl border border-surface-sand bg-surface-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("superadmin.registrations30d")}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.registrationsByDay}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#7A4E3A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Applications by status — Pie chart */}
                <div className="rounded-2xl border border-surface-sand bg-surface-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("superadmin.applicationsByStatus")}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={analytics.applicationsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }: { name?: string; value?: number }) => `${name} (${value})`}
                        labelLine={false}
                        fontSize={11}
                      >
                        {analytics.applicationsByStatus.map((_, i) => (
                          <Cell key={i} fill={["#C8A96A", "#7A4E3A", "#4B2E2B", "#8B6F47", "#D4B88C"][i % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top companies by offers — Horizontal bar */}
                <div className="rounded-2xl border border-surface-sand bg-surface-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("superadmin.topCompanies")}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.topCompaniesByOffers} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="companyName" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#C8A96A" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top universities by students — Horizontal bar */}
                <div className="rounded-2xl border border-surface-sand bg-surface-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-text-primary">{t("superadmin.topUniversities")}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.topUniversitiesByStudents} layout="vertical">
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="universityName" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#4B2E2B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════
           TAB: USERS
           ════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
            <div className="border-b border-surface-sand p-4 space-y-3">
              <SearchInput value={usersSearch} onChange={(v) => { setUsersSearch(v); setUsersPage(1); }} placeholder={t("superadmin.searchUsers")} />
              <div className="flex flex-wrap gap-2">
                <FilterPill label={t("superadmin.allRoles")} active={usersRoleFilter === ""} onClick={() => { setUsersRoleFilter(""); setUsersPage(1); }} />
                {["student", "company", "admin", "superadmin", "university"].map((r) => (
                  <FilterPill key={r} label={r} active={usersRoleFilter === r} onClick={() => { setUsersRoleFilter(r); setUsersPage(1); }} />
                ))}
                <div className="mx-2 w-px bg-surface-sand" />
                <FilterPill label={t("superadmin.allStatuses")} active={usersStatusFilter === ""} onClick={() => { setUsersStatusFilter(""); setUsersPage(1); }} />
                <FilterPill label={t("superadmin.active")} active={usersStatusFilter === "active"} onClick={() => { setUsersStatusFilter("active"); setUsersPage(1); }} />
                <FilterPill label={t("superadmin.deactivated")} active={usersStatusFilter === "deactivated"} onClick={() => { setUsersStatusFilter("deactivated"); setUsersPage(1); }} />
              </div>
            </div>
            <div className="divide-y divide-surface-sand/60">
              {allUsers.length === 0 ? (
                <Empty icon={<HiOutlineUsers size={24} className="text-text-muted/40" />} message={t("superadmin.noUsers")} />
              ) : (
                allUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-cream/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">{u.firstName} {u.lastName}</p>
                        <RoleBadge role={u.role} />
                        <StatusBadge active={!u.deactivatedAt} />
                      </div>
                      <p className="text-xs text-text-muted truncate">{u.email} — {formatDate(u.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {u.role !== "superadmin" && (
                        u.deactivatedAt ? (
                          <button onClick={() => handleReactivateUser(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer">
                            <HiOutlineRefresh size={14} />{t("superadmin.reactivate")}
                          </button>
                        ) : (
                          <button onClick={() => handleDeactivateUser(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer">
                            <HiOutlineBan size={14} />{t("superadmin.deactivate")}
                          </button>
                        )
                      )}
                      {u.role === "superadmin" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-text-muted">
                          <HiOutlineLockClosed size={14} />Protected
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {usersTotal > 20 && (
              <div className="flex items-center justify-between border-t border-surface-sand px-6 py-3">
                <p className="text-xs text-text-muted">{usersTotal} users total</p>
                <div className="flex gap-1">
                  <button disabled={usersPage <= 1} onClick={() => setUsersPage((p) => p - 1)} className="rounded-lg border border-surface-sand px-3 py-1 text-xs font-medium text-text-secondary disabled:opacity-40 cursor-pointer hover:bg-surface-cream">Prev</button>
                  <span className="px-3 py-1 text-xs text-text-muted">Page {usersPage}</span>
                  <button disabled={usersPage * 20 >= usersTotal} onClick={() => setUsersPage((p) => p + 1)} className="rounded-lg border border-surface-sand px-3 py-1 text-xs font-medium text-text-secondary disabled:opacity-40 cursor-pointer hover:bg-surface-cream">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
           TAB: COMPANIES
           ════════════════════════════════════════════ */}
        {activeTab === "companies" && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
            <div className="border-b border-surface-sand p-4 space-y-3">
              <SearchInput value={companiesSearch} onChange={setCompaniesSearch} placeholder={t("superadmin.searchCompanies")} />
              <div className="flex gap-2">
                <FilterPill label={t("superadmin.allCompanies")} active={companiesFilter === ""} onClick={() => setCompaniesFilter("")} />
                <FilterPill label={t("superadmin.validated")} active={companiesFilter === "true"} onClick={() => setCompaniesFilter("true")} />
                <FilterPill label={t("superadmin.pending")} active={companiesFilter === "false"} onClick={() => setCompaniesFilter("false")} />
              </div>
            </div>
            <div className="divide-y divide-surface-sand/60">
              {allCompanies.length === 0 ? (
                <Empty icon={<HiOutlineOfficeBuilding size={24} className="text-text-muted/40" />} message={t("superadmin.noCompanies")} />
              ) : (
                allCompanies.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-cream/30 transition-colors">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {c.logoUrl ? <Image src={c.logoUrl} alt={c.companyName} width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg object-cover border border-surface-sand" /> : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coffee-gold/10 text-xs font-semibold text-coffee-warm">{c.companyName[0]?.toUpperCase()}</div>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary truncate">{c.companyName}</p>
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${c.isValidated ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${c.isValidated ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {c.isValidated ? t("superadmin.validated") : t("superadmin.pending")}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">{c.email}{c.industry ? ` — ${c.industry}` : ""}{c.location ? ` — ${c.location}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!c.isValidated && (
                        <>
                          <button onClick={() => handleValidateCompany(c.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer"><HiOutlineCheckCircle size={14} />{t("superadmin.approve")}</button>
                          <button onClick={() => handleRejectCompany(c.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer"><HiOutlineX size={14} />{t("superadmin.reject")}</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           TAB: UNIVERSITIES
           ════════════════════════════════════════════ */}
        {activeTab === "universities" && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
            <div className="border-b border-surface-sand p-4 space-y-3">
              <SearchInput value={universitiesSearch} onChange={setUniversitiesSearch} placeholder={t("superadmin.searchUniversities")} />
              <div className="flex gap-2">
                <FilterPill label={t("superadmin.allCompanies")} active={universitiesFilter === ""} onClick={() => setUniversitiesFilter("")} />
                <FilterPill label={t("superadmin.validated")} active={universitiesFilter === "true"} onClick={() => setUniversitiesFilter("true")} />
                <FilterPill label={t("superadmin.pending")} active={universitiesFilter === "false"} onClick={() => setUniversitiesFilter("false")} />
              </div>
            </div>
            <div className="divide-y divide-surface-sand/60">
              {allUniversitiesList.length === 0 ? (
                <Empty icon={<HiOutlineAcademicCap size={24} className="text-text-muted/40" />} message={t("superadmin.noUniversities")} />
              ) : (
                allUniversitiesList.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-cream/30 transition-colors">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {u.logoUrl ? <Image src={u.logoUrl} alt={u.universityName} width={36} height={36} className="h-9 w-9 shrink-0 rounded-lg object-cover border border-surface-sand" /> : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-semibold text-teal-600">{u.universityName[0]?.toUpperCase()}</div>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary truncate">{u.universityName}</p>
                          <span className="text-[11px] text-text-muted">@{u.domain}</span>
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${u.isValidated ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.isValidated ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {u.isValidated ? t("superadmin.validated") : t("superadmin.pending")}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">{u.email}{u.location ? ` — ${u.location}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!u.isValidated && (
                        <>
                          <button onClick={() => handleValidateUniversity(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 cursor-pointer"><HiOutlineCheckCircle size={14} />{t("superadmin.approve")}</button>
                          <button onClick={() => handleRejectUniversity(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer"><HiOutlineX size={14} />{t("superadmin.reject")}</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           TAB: OFFERS
           ════════════════════════════════════════════ */}
        {activeTab === "offers" && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
            <div className="border-b border-surface-sand p-4 space-y-3">
              <SearchInput value={offersSearch} onChange={setOffersSearch} placeholder={t("superadmin.searchOffers")} />
              <div className="flex gap-2">
                <FilterPill label={t("superadmin.allOfferStatuses")} active={offersStatusFilter === ""} onClick={() => setOffersStatusFilter("")} />
                <FilterPill label={t("superadmin.offerActive")} active={offersStatusFilter === "active"} onClick={() => setOffersStatusFilter("active")} />
                <FilterPill label={t("superadmin.offerClosed")} active={offersStatusFilter === "closed"} onClick={() => setOffersStatusFilter("closed")} />
                <FilterPill label={t("superadmin.offerDraft")} active={offersStatusFilter === "draft"} onClick={() => setOffersStatusFilter("draft")} />
              </div>
            </div>
            <div className="divide-y divide-surface-sand/60">
              {allOffers.length === 0 ? (
                <Empty icon={<HiOutlineBriefcase size={24} className="text-text-muted/40" />} message={t("superadmin.noOffers")} />
              ) : (
                allOffers.map((o) => {
                  const statusColor: Record<string, string> = {
                    active: "bg-emerald-50 text-emerald-700",
                    closed: "bg-red-50 text-red-600",
                    draft: "bg-gray-100 text-gray-600",
                  };
                  const dotColor: Record<string, string> = {
                    active: "bg-emerald-500",
                    closed: "bg-red-500",
                    draft: "bg-gray-400",
                  };
                  return (
                    <div key={o.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-cream/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary truncate">{o.title}</p>
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusColor[o.status] ?? ""}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor[o.status] ?? ""}`} />
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted truncate">{o.companyName} — {o.location} — {o.type} — {o.duration}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[11px] text-text-muted hidden sm:block">{formatDate(o.createdAt)}</span>
                        {o.status === "active" && (
                          <button onClick={() => handleCloseOffer(o.id)} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"><HiOutlineBan size={14} />{t("superadmin.closeOffer")}</button>
                        )}
                        <button onClick={() => handleDeleteOffer(o.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer"><HiOutlineTrash size={14} />{t("superadmin.deleteOffer")}</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ════════ ACTIVITY TAB ════════ */}
        {activeTab === "activity" && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white shadow-sm">
            <div className="border-b border-surface-sand px-6 py-4">
              <h2 className="text-sm font-semibold text-text-primary">{t("superadmin.activityLog")}</h2>
              <p className="text-xs text-text-muted mt-0.5">{t("superadmin.activityLogDesc")}</p>
            </div>
            <div className="divide-y divide-surface-sand/60">
              {auditLogs.length === 0 ? (
                <Empty icon={<HiOutlineClipboardList size={24} className="text-text-muted/40" />} message={t("superadmin.noActivity")} />
              ) : (
                auditLogs.map((log) => {
                  const actionLabels: Record<string, { label: string; color: string }> = {
                    validate_company: { label: "Validated company", color: "text-emerald-700 bg-emerald-50" },
                    reject_company: { label: "Rejected company", color: "text-red-600 bg-red-50" },
                    validate_university: { label: "Validated university", color: "text-emerald-700 bg-emerald-50" },
                    reject_university: { label: "Rejected university", color: "text-red-600 bg-red-50" },
                    validate_application: { label: "Validated application", color: "text-blue-700 bg-blue-50" },
                    deactivate_user: { label: "Deactivated user", color: "text-amber-700 bg-amber-50" },
                    reactivate_user: { label: "Reactivated user", color: "text-teal-700 bg-teal-50" },
                    force_close_offer: { label: "Force-closed offer", color: "text-amber-700 bg-amber-50" },
                    delete_offer: { label: "Deleted offer", color: "text-red-600 bg-red-50" },
                  };
                  const actionInfo = actionLabels[log.action] ?? { label: log.action, color: "text-gray-700 bg-gray-50" };
                  const timeStr = new Date(log.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  });

                  return (
                    <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-surface-cream/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {t("superadmin.by")} <span className="font-medium text-text-secondary">{log.actorEmail}</span>
                          </span>
                          <RoleBadge role={log.actorRole} />
                        </div>
                        {log.targetId && (
                          <p className="mt-0.5 text-[11px] text-text-muted truncate">
                            {t("superadmin.target")}: <span className="font-mono">{log.targetId}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-text-muted shrink-0">{timeStr}</span>
                    </div>
                  );
                })
              )}
            </div>
            {/* Pagination */}
            {auditTotal > 30 && (
              <div className="flex items-center justify-between border-t border-surface-sand/60 px-6 py-3">
                <span className="text-xs text-text-muted">
                  {t("superadmin.pageOf").replace("{page}", String(auditPage)).replace("{total}", String(Math.ceil(auditTotal / 30)))}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    disabled={auditPage <= 1}
                    className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-cream disabled:opacity-40 cursor-pointer"
                  >
                    <HiOutlineChevronUp size={16} className="rotate-[-90deg]" />
                  </button>
                  <button
                    onClick={() => setAuditPage((p) => p + 1)}
                    disabled={auditPage >= Math.ceil(auditTotal / 30)}
                    className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-cream disabled:opacity-40 cursor-pointer"
                  >
                    <HiOutlineChevronUp size={16} className="rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
