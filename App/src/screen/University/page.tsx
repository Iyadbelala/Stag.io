"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineGlobe,
  HiOutlineMail,
  HiOutlineSearch,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineClipboardCheck,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineExternalLink,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineChevronLeft,
  HiOutlineDownload,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface DashboardStats {
  totalStudents: number;
  activeInternships: number;
  pendingValidation: number;
  totalApplications: number;
  universityName: string;
  domain: string;
  isValidated: boolean;
}

interface UniversityStudent {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  department: string | null;
  skills: string[];
  bio: string | null;
  cvUrl: string | null;
  profilePhotoUrl: string | null;
  portfolioPhotos: string[];
  createdAt: string;
}

interface StudentApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  cvUrl: string | null;
  appliedAt: string;
  offerTitle: string;
  offerDescription: string;
  offerDuration: string;
  offerLocation: string;
  offerType: string;
  companyName: string;
  companyLogo: string | null;
}

interface ActiveInternship {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhoto: string | null;
  department: string | null;
  offerTitle: string;
  offerDuration: string;
  offerLocation: string;
  offerType: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  appliedAt: string;
}

type TabKey = "students" | "pending" | "contracts";

/* ============================================
   Stat Card
   ============================================ */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-coffee-dark">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}

/* ============================================
   Status Badge
   ============================================ */
function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { bg: string; text: string; labelKey: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-700", labelKey: "university.statusPending" },
    accepted: { bg: "bg-blue-50", text: "text-blue-700", labelKey: "university.statusAccepted" },
    rejected: { bg: "bg-red-50", text: "text-red-700", labelKey: "university.statusRejected" },
    withdrawn: { bg: "bg-gray-50", text: "text-gray-600", labelKey: "university.statusWithdrawn" },
    validated: { bg: "bg-emerald-50", text: "text-emerald-700", labelKey: "university.statusValidated" },
  };
  const s = map[status] ?? { bg: "bg-gray-50", text: "text-gray-600", labelKey: status };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      {t(s.labelKey)}
    </span>
  );
}

/* ============================================
   University Dashboard
   ============================================ */
export default function UniversityDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<UniversityStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("students");

  // Student profile drawer
  const [selectedStudent, setSelectedStudent] = useState<UniversityStudent | null>(null);
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Pending validations
  const [pendingList, setPendingList] = useState<ActiveInternship[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Active internships / contracts
  const [contracts, setContracts] = useState<ActiveInternship[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ---- Redirect non-university ---- */
  useEffect(() => {
    if (user && user.role !== "university") router.replace("/");
  }, [user, router]);

  /* ---- Fetch core data ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, studentsRes] = await Promise.all([
        api.get<{ success: true; data: DashboardStats }>("/api/university/dashboard"),
        api.get<{ success: true; data: UniversityStudent[] }>("/api/university/students"),
      ]);
      setStats(dashRes.data.data);
      setStudents(studentsRes.data.data);
    } catch { /* redirect if unauthorized */ } finally { setLoading(false); }
  }, []);

  const fetchPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const res = await api.get<{ success: true; data: ActiveInternship[] }>("/api/university/internships/pending");
      setPendingList(res.data.data);
    } catch { /* ignore */ } finally { setPendingLoading(false); }
  }, []);

  const fetchContracts = useCallback(async () => {
    setContractsLoading(true);
    try {
      const res = await api.get<{ success: true; data: ActiveInternship[] }>("/api/university/internships/active");
      setContracts(res.data.data);
    } catch { /* ignore */ } finally { setContractsLoading(false); }
  }, []);

  useEffect(() => {
    if (user?.role === "university") fetchData();
  }, [user, fetchData]);

  useEffect(() => {
    if (user?.role === "university" && activeTab === "pending") fetchPending();
    if (user?.role === "university" && activeTab === "contracts") fetchContracts();
  }, [user, activeTab, fetchPending, fetchContracts]);

  /* ---- Open student profile ---- */
  const openStudentProfile = async (student: UniversityStudent) => {
    setSelectedStudent(student);
    setAppsLoading(true);
    try {
      const res = await api.get<{ success: true; data: StudentApplication[] }>(`/api/university/students/${student.id}/applications`);
      setStudentApps(res.data.data);
    } catch { setStudentApps([]); } finally { setAppsLoading(false); }
  };

  /* ---- Validate application ---- */
  const handleValidate = async (applicationId: string) => {
    setActionMsg(null);
    try {
      await api.patch(`/api/university/applications/${applicationId}/validate`);
      setActionMsg({ type: "success", text: t("university.validateSuccess") });
      // Update local state
      setStudentApps(prev => prev.map(a => a.id === applicationId ? { ...a, status: "validated" } : a));
      setPendingList(prev => prev.filter(p => p.applicationId !== applicationId));
      // Refresh stats
      fetchData();
      fetchContracts();
    } catch {
      setActionMsg({ type: "error", text: t("university.validateFailed") });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  /* ---- Download agreement PDF ---- */
  const handleDownloadPdf = async (applicationId: string) => {
    try {
      const res = await api.get(`/api/university/applications/${applicationId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `internship-agreement-${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setActionMsg({ type: "error", text: "Failed to download agreement PDF" });
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  /* ---- Filtered students ---- */
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.toLowerCase();
    return name.includes(q) || s.email.toLowerCase().includes(q) || (s.department ?? "").toLowerCase().includes(q);
  });

  /* ---- Guard ---- */
  if (!user || user.role !== "university") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <p className="text-text-muted">{t("university.accessRestricted")}</p>
      </section>
    );
  }

  /* ---- Tabs config ---- */
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "students", label: t("university.tabStudents"), icon: <HiOutlineUsers size={16} /> },
    { key: "pending", label: t("university.tabPending"), icon: <HiOutlineClipboardCheck size={16} /> },
    { key: "contracts", label: t("university.tabContracts"), icon: <HiOutlineBriefcase size={16} /> },
  ];

  return (
    <section className="min-h-screen bg-surface-cream">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* ---- Validation Status Badge ---- */}
        {stats && !stats.isValidated && (
          <div className="mb-6 flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 w-fit">
            <HiOutlineExclamationCircle size={16} />
            {t("university.pendingValidation")}
          </div>
        )}
        {stats && stats.isValidated && (
          <div className="mb-6 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 w-fit">
            <HiOutlineCheckCircle size={16} />
            {t("university.validated")}
          </div>
        )}
        {/* ---- Action feedback ---- */}
        {actionMsg && (
          <div className={`mb-6 rounded-button border px-4 py-3 text-sm ${actionMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-status-error/20 bg-status-error/10 text-status-error"}`}>
            {actionMsg.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ---- Stats ---- */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<HiOutlineUsers size={22} className="text-purple-600" />} label={t("university.registeredStudents")} value={stats?.totalStudents ?? 0} color="bg-purple-50" />
              <StatCard icon={<HiOutlineClipboardList size={22} className="text-blue-600" />} label={t("university.totalApplications")} value={stats?.totalApplications ?? 0} color="bg-blue-50" />
              <StatCard icon={<HiOutlineClipboardCheck size={22} className="text-amber-600" />} label={t("university.awaitingValidation")} value={stats?.pendingValidation ?? 0} color="bg-amber-50" />
              <StatCard icon={<HiOutlineBriefcase size={22} className="text-emerald-600" />} label={t("university.activeInternships")} value={stats?.activeInternships ?? 0} color="bg-emerald-50" />
            </div>

            {/* ---- Tabs ---- */}
            <div className="mb-6 flex gap-1 rounded-button border border-surface-sand bg-surface-white p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelectedStudent(null); }}
                  className={`flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-coffee-dark text-text-inverse"
                      : "text-text-secondary hover:bg-surface-cream"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === "pending" && (stats?.pendingValidation ?? 0) > 0 && (
                    <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {stats?.pendingValidation}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ======== STUDENTS TAB ======== */}
            {activeTab === "students" && !selectedStudent && (
              <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-coffee-dark">{t("university.studentsTitle")}</h2>
                  <div className="relative">
                    <HiOutlineSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("university.searchStudents")}
                      className="w-full rounded-button border border-surface-sand bg-surface-cream/50 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-coffee-gold/60 focus:outline-none sm:w-72"
                    />
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <HiOutlineUsers size={48} className="mx-auto mb-4 text-text-muted/30" />
                    <p className="text-text-muted">
                      {students.length === 0 ? t("university.noStudents") : t("university.noSearchResults")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((s) => {
                      const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "—";
                      return (
                        <button
                          key={s.id}
                          onClick={() => openStudentProfile(s)}
                          className="group flex flex-col rounded-card border border-surface-sand p-5 text-left transition-all hover:shadow-md hover:border-coffee-gold/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {s.profilePhotoUrl ? (
                              <Image src={s.profilePhotoUrl} alt={name} width={48} height={48} className="h-12 w-12 rounded-full object-cover border border-surface-sand" />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coffee-gold/10 text-base font-bold text-coffee-warm">
                                {(s.firstName?.[0] ?? "?").toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-text-primary truncate group-hover:text-coffee-warm transition-colors">{name}</p>
                              <p className="text-xs text-text-muted truncate">{s.email}</p>
                            </div>
                          </div>
                          {s.department && (
                            <span className="mb-2 self-start rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">{s.department}</span>
                          )}
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {s.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="rounded-full bg-coffee-gold/10 px-2 py-0.5 text-xs font-medium text-coffee-warm">{skill}</span>
                            ))}
                            {s.skills.length > 3 && <span className="text-xs text-text-muted">+{s.skills.length - 3}</span>}
                            {s.skills.length === 0 && <span className="text-xs text-text-muted">{t("university.noSkills")}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======== STUDENT PROFILE DETAIL ======== */}
            {activeTab === "students" && selectedStudent && (
              <div className="space-y-6">
                {/* Back button */}
                <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-sm text-text-muted hover:text-coffee-warm transition-colors cursor-pointer">
                  <HiOutlineChevronLeft size={16} />
                  {t("university.backToStudents")}
                </button>

                {/* Profile card */}
                <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Photo */}
                    <div className="shrink-0">
                      {selectedStudent.profilePhotoUrl ? (
                        <Image src={selectedStudent.profilePhotoUrl} alt="Profile" width={120} height={120} className="h-28 w-28 rounded-2xl object-cover border border-surface-sand" />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-3xl font-bold text-text-inverse">
                          {(selectedStudent.firstName?.[0] ?? "?").toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-coffee-dark">
                        {`${selectedStudent.firstName ?? ""} ${selectedStudent.lastName ?? ""}`.trim() || "—"}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
                        <span className="flex items-center gap-1.5"><HiOutlineMail size={14} />{selectedStudent.email}</span>
                        {selectedStudent.department && (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">{selectedStudent.department}</span>
                        )}
                        <span className="flex items-center gap-1.5"><HiOutlineClock size={14} />
                          {t("university.joined")} {new Date(selectedStudent.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {/* Bio */}
                      {selectedStudent.bio && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-text-muted mb-1">{t("university.bio")}</p>
                          <p className="text-sm text-text-secondary leading-relaxed">{selectedStudent.bio}</p>
                        </div>
                      )}

                      {/* CV */}
                      {selectedStudent.cvUrl && (
                        <div className="mt-3">
                          <a href={selectedStudent.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:underline">
                            <HiOutlineDocumentText size={16} />
                            {t("university.viewCV")}
                            <HiOutlineExternalLink size={14} />
                          </a>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="mt-4">
                        <p className="text-xs font-medium text-text-muted mb-2">{t("university.skills")}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStudent.skills.length > 0 ? selectedStudent.skills.map((skill, i) => (
                            <span key={i} className="rounded-full bg-coffee-gold/10 px-3 py-1 text-xs font-medium text-coffee-warm">{skill}</span>
                          )) : (
                            <span className="text-xs text-text-muted">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio */}
                  {selectedStudent.portfolioPhotos.length > 0 && (
                    <div className="mt-6 border-t border-surface-sand pt-5">
                      <p className="text-xs font-medium text-text-muted mb-3 flex items-center gap-1.5">
                        <HiOutlinePhotograph size={14} />
                        {t("university.portfolio")} ({selectedStudent.portfolioPhotos.length})
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {selectedStudent.portfolioPhotos.map((photo, i) => (
                          <button key={i} onClick={() => setLightboxPhoto(photo)} className="shrink-0 cursor-pointer">
                            <Image src={photo} alt={`Portfolio ${i + 1}`} width={120} height={90} className="h-20 w-28 rounded-lg object-cover border border-surface-sand hover:border-coffee-gold/60 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Applications */}
                <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-coffee-dark mb-4">{t("university.studentApplications")}</h3>

                  {appsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-3 border-coffee-gold border-t-transparent" />
                    </div>
                  ) : studentApps.length === 0 ? (
                    <div className="py-12 text-center">
                      <HiOutlineClipboardList size={40} className="mx-auto mb-3 text-text-muted/30" />
                      <p className="text-sm text-text-muted">{t("university.noApplications")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentApps.map((app) => (
                        <div key={app.id} className="rounded-xl border border-surface-sand p-4 hover:bg-surface-cream/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {app.companyLogo ? (
                                <Image src={app.companyLogo} alt={app.companyName} width={36} height={36} className="h-9 w-9 rounded-lg object-cover border border-surface-sand mt-0.5" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coffee-gold/10 text-xs font-bold text-coffee-warm mt-0.5">
                                  {app.companyName[0]?.toUpperCase() ?? "?"}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-text-primary">{app.offerTitle}</p>
                                <p className="text-xs text-text-muted mt-0.5">{app.companyName}</p>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                                  <span className="flex items-center gap-1"><HiOutlineLocationMarker size={12} />{app.offerLocation}</span>
                                  <span className="flex items-center gap-1"><HiOutlineClock size={12} />{app.offerDuration}</span>
                                  <span className="rounded-full bg-surface-cream px-2 py-0.5 text-[11px] font-medium">{app.offerType}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <StatusBadge status={app.status} t={t} />
                              {app.status === "accepted" && (
                                <button
                                  onClick={() => handleValidate(app.id)}
                                  className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  <HiOutlineCheckCircle size={14} />
                                  {t("university.validate")}
                                </button>
                              )}
                              {app.status === "validated" && (
                                <button
                                  onClick={() => handleDownloadPdf(app.id)}
                                  className="flex items-center gap-1.5 rounded-full bg-coffee-gold/10 px-3 py-1.5 text-xs font-medium text-coffee-warm hover:bg-coffee-gold/20 transition-colors cursor-pointer"
                                >
                                  <HiOutlineDownload size={14} />
                                  Agreement PDF
                                </button>
                              )}
                            </div>
                          </div>
                          {app.coverLetter && (
                            <p className="mt-3 text-xs text-text-secondary border-t border-surface-sand pt-3 leading-relaxed">{app.coverLetter}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======== PENDING VALIDATIONS TAB ======== */}
            {activeTab === "pending" && (
              <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-coffee-dark mb-6">{t("university.pendingTitle")}</h2>

                {pendingLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
                  </div>
                ) : pendingList.length === 0 ? (
                  <div className="py-16 text-center">
                    <HiOutlineClipboardCheck size={48} className="mx-auto mb-4 text-text-muted/30" />
                    <p className="text-text-muted">{t("university.noPending")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingList.map((item) => (
                      <div key={item.applicationId} className="rounded-xl border border-surface-sand p-5 hover:bg-surface-cream/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            {item.studentPhoto ? (
                              <Image src={item.studentPhoto} alt={item.studentName} width={44} height={44} className="h-11 w-11 rounded-full object-cover border border-surface-sand" />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coffee-gold/10 text-sm font-bold text-coffee-warm">
                                {item.studentName[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-text-primary">{item.studentName}</p>
                              <p className="text-xs text-text-muted">{item.studentEmail}</p>
                              {item.department && (
                                <span className="mt-1 inline-block rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">{item.department}</span>
                              )}
                              <div className="mt-2 rounded-lg bg-surface-cream/70 p-3 border border-surface-sand">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.companyLogo ? (
                                    <Image src={item.companyLogo} alt={item.companyName} width={20} height={20} className="h-5 w-5 rounded object-cover" />
                                  ) : null}
                                  <span className="text-xs font-medium text-text-secondary">{item.companyName}</span>
                                </div>
                                <p className="text-sm font-medium text-coffee-dark">{item.offerTitle}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                                  <span className="flex items-center gap-1"><HiOutlineLocationMarker size={12} />{item.offerLocation}</span>
                                  <span className="flex items-center gap-1"><HiOutlineClock size={12} />{item.offerDuration}</span>
                                  <span className="rounded-full bg-surface-white px-2 py-0.5 text-[11px] font-medium">{item.offerType}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <StatusBadge status={item.status} t={t} />
                            <button
                              onClick={() => handleValidate(item.applicationId)}
                              className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <HiOutlineCheckCircle size={14} />
                              {t("university.validate")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======== CONTRACTS / ACTIVE INTERNSHIPS TAB ======== */}
            {activeTab === "contracts" && (
              <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-coffee-dark mb-6">{t("university.contractsTitle")}</h2>

                {contractsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-coffee-gold border-t-transparent" />
                  </div>
                ) : contracts.length === 0 ? (
                  <div className="py-16 text-center">
                    <HiOutlineBriefcase size={48} className="mx-auto mb-4 text-text-muted/30" />
                    <p className="text-text-muted">{t("university.noContracts")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-surface-sand text-text-muted">
                          <th className="pb-3 pr-4 font-medium">{t("university.student")}</th>
                          <th className="pb-3 pr-4 font-medium">{t("university.internship")}</th>
                          <th className="pb-3 pr-4 font-medium">{t("university.company")}</th>
                          <th className="pb-3 pr-4 font-medium">{t("university.details")}</th>
                          <th className="pb-3 font-medium">{t("university.status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-sand">
                        {contracts.map((c) => (
                          <tr key={c.applicationId} className="hover:bg-surface-cream/50 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                {c.studentPhoto ? (
                                  <Image src={c.studentPhoto} alt={c.studentName} width={36} height={36} className="h-9 w-9 rounded-full object-cover border border-surface-sand" />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-gold/10 text-xs font-bold text-coffee-warm">
                                    {c.studentName[0]?.toUpperCase() ?? "?"}
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-text-primary">{c.studentName}</p>
                                  <p className="text-xs text-text-muted">{c.studentEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <p className="font-medium text-text-primary">{c.offerTitle}</p>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                {c.companyLogo ? (
                                  <Image src={c.companyLogo} alt={c.companyName} width={24} height={24} className="h-6 w-6 rounded object-cover" />
                                ) : null}
                                <span className="text-text-secondary">{c.companyName}</span>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                                <span className="flex items-center gap-1"><HiOutlineLocationMarker size={12} />{c.offerLocation}</span>
                                <span className="flex items-center gap-1"><HiOutlineClock size={12} />{c.offerDuration}</span>
                                <span className="rounded-full bg-surface-cream px-2 py-0.5 text-[11px] font-medium">{c.offerType}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <StatusBadge status={c.status} t={t} />
                              {c.status === "accepted" && (
                                <button
                                  onClick={() => handleValidate(c.applicationId)}
                                  className="mt-1 flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  <HiOutlineCheckCircle size={12} />
                                  {t("university.validate")}
                                </button>
                              )}
                              {c.status === "validated" && (
                                <button
                                  onClick={() => handleDownloadPdf(c.applicationId)}
                                  className="mt-1 flex items-center gap-1 rounded-full bg-coffee-gold/10 px-2.5 py-1 text-[11px] font-medium text-coffee-warm hover:bg-coffee-gold/20 transition-colors cursor-pointer"
                                >
                                  <HiOutlineDownload size={12} />
                                  Agreement PDF
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Lightbox ---- */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightboxPhoto(null)}>
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-6 right-6 text-white/80 hover:text-white cursor-pointer">
            <HiOutlineX size={28} />
          </button>
          <Image src={lightboxPhoto} alt="Portfolio" width={900} height={600} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
