"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineXCircle,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineExternalLink,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

/* ============================================
   Types
   ============================================ */
interface DashboardStats {
  applicationsSent: number;
  acceptedApplications: number;
  pendingResponses: number;
  rejectedApplications: number;
}

interface RecentApplication {
  id: string;
  title: string;
  company: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "validated";
  appliedAt: string;
  coverLetter?: string | null;
  cvUrl?: string | null;
}

interface FullApplication {
  id: string;
  studentId: string;
  offerId: string;
  coverLetter: string | null;
  cvUrl: string | null;
  status: string;
  appliedAt: string;
  offerTitle: string;
  companyName: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentApplications: RecentApplication[];
  profileCompletion: number;
  missingFields: string[];
}

/* ============================================
   Stat Card
   ============================================ */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`mb-2 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-coffee-dark">
        {value}
      </p>
      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-muted">{label}</p>
    </div>
  );
}

/* ============================================
   Activity Row (expandable with withdraw)
   ============================================ */
function ActivityRow({
  id, title, company, status, appliedAt, coverLetter, cvUrl, t, onWithdraw,
}: RecentApplication & { t: (key: string) => string; onWithdraw: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: {
      label: t("status.pending"),
      classes: "bg-status-warning/10 text-status-warning",
    },
    accepted: {
      label: t("status.accepted"),
      classes: "bg-blue-100 text-blue-700",
    },
    rejected: {
      label: t("status.rejected"),
      classes: "bg-status-error/10 text-status-error",
    },
    withdrawn: {
      label: t("status.withdrawn"),
      classes: "bg-text-muted/10 text-text-muted",
    },
    validated: {
      label: t("status.validated"),
      classes: "bg-status-success/10 text-status-success",
    },
  };

  const s = statusConfig[status];
  const dateStr = new Date(appliedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleWithdraw = async () => {
    if (!confirm(t("student.withdrawConfirm"))) return;
    setWithdrawing(true);
    try {
      await api.post(`/api/applications/${id}/withdraw`);
      onWithdraw(id);
    } catch {
      alert(t("student.withdrawFailed"));
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="border-b border-surface-sand last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <div className="min-w-0">
          <p className="font-medium text-text-primary truncate">{title}</p>
          <p className="text-sm text-text-muted">{company}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${s.classes}`}
          >
            {s.label}
          </span>
          <span className="text-xs text-text-muted hidden sm:block">{dateStr}</span>
          {expanded ? (
            <HiOutlineChevronUp size={16} className="text-text-muted" />
          ) : (
            <HiOutlineChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="pb-4 pl-1 space-y-3">
          {/* Applied date */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <HiOutlineClock size={14} />
            <span>{t("student.appliedOn")} {dateStr}</span>
          </div>

          {/* Cover letter */}
          <div>
            <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5 mb-1">
              <HiOutlineDocumentText size={14} />
              {t("student.coverLetter")}
            </p>
            <p className="text-sm text-text-muted bg-surface-cream rounded-lg px-3 py-2">
              {coverLetter || t("student.noCoverLetter")}
            </p>
          </div>

          {/* CV link */}
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:underline"
            >
              <HiOutlineExternalLink size={14} />
              {t("student.cvLink")}
            </a>
          )}

          {/* Withdraw button for pending apps */}
          {status === "pending" && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="rounded-button border border-status-error/30 px-4 py-1.5 text-xs font-medium text-status-error transition-colors hover:bg-status-error/10 disabled:opacity-50 cursor-pointer"
            >
              {withdrawing ? "..." : t("student.withdraw")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================
   Dashboard
   ============================================ */
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [allApplications, setAllApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (user?.role === "superadmin") {
      router.replace("/superadmin");
      return;
    }
    if (user?.role === "company") {
      router.replace("/company");
      return;
    }
    async function fetchDashboard() {
      try {
        const [dashRes, appsRes] = await Promise.all([
          api.get<{ success: true; data: DashboardData }>("/api/profile/dashboard"),
          api.get<{ success: true; data: FullApplication[] }>("/api/applications"),
        ]);
        setData(dashRes.data.data);
        setAllApplications(
          appsRes.data.data.map((a) => ({
            id: a.id,
            title: a.offerTitle,
            company: a.companyName,
            status: a.status as RecentApplication["status"],
            appliedAt: a.appliedAt,
            coverLetter: a.coverLetter,
            cvUrl: a.cvUrl,
          })),
        );
      } catch {
        setData({
          stats: { applicationsSent: 0, acceptedApplications: 0, pendingResponses: 0, rejectedApplications: 0 },
          recentApplications: [],
          profileCompletion: 0,
          missingFields: [],
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleWithdraw = (applicationId: string) => {
    setAllApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: "withdrawn" as const } : a)),
    );
    // Update stats
    setData((prev) =>
      prev
        ? {
            ...prev,
            stats: {
              ...prev.stats,
              pendingResponses: Math.max(0, prev.stats.pendingResponses - 1),
            },
          }
        : prev,
    );
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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

  const stats = data?.stats ?? { applicationsSent: 0, acceptedApplications: 0, pendingResponses: 0, rejectedApplications: 0 };
  const profileCompletion = data?.profileCompletion ?? 0;
  const missingFields = data?.missingFields ?? [];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-10">
        {/* ---- Welcome Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-coffee-dark sm:text-3xl">
              {t("student.welcomeBack").replace("{name}", user?.firstName || user?.email || "")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {user?.university} &middot; {t("student.dashboard")}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/student/profile"
              className="flex items-center gap-1.5 sm:gap-2 rounded-button border border-surface-sand bg-surface-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineUser size={16} />
              <span className="hidden sm:inline">{t("common.editProfile")}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 rounded-button border border-surface-sand bg-surface-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-text-secondary transition-colors hover:border-status-error hover:text-status-error cursor-pointer"
            >
              <HiOutlineLogout size={16} />
              <span className="hidden sm:inline">{t("common.signOut")}</span>
            </button>
          </div>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={
              <HiOutlineBriefcase size={22} className="text-coffee-warm" />
            }
            label={t("student.applicationsSent")}
            value={stats.applicationsSent}
            color="bg-coffee-warm/10"
          />
          <StatCard
            icon={
              <HiOutlineCheckCircle
                size={22}
                className="text-status-success"
              />
            }
            label={t("student.accepted")}
            value={stats.acceptedApplications}
            color="bg-status-success/10"
          />
          <StatCard
            icon={
              <HiOutlineClock size={22} className="text-status-warning" />
            }
            label={t("student.pendingResponses")}
            value={stats.pendingResponses}
            color="bg-status-warning/10"
          />
          <StatCard
            icon={
              <HiOutlineXCircle size={22} className="text-status-error" />
            }
            label={t("student.rejected")}
            value={stats.rejectedApplications}
            color="bg-status-error/10"
          />
        </div>

        {/* ---- Profile Completion Banner ---- */}
        {profileCompletion < 100 && (
          <div className="rounded-card border border-coffee-gold/30 bg-coffee-gold/5 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-coffee-dark">
                  {t("student.completeProfile")}
                </p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {missingFields.length > 0
                    ? `${t("student.addYour")} ${missingFields.join(", ")} ${t("student.toStandOut")}`
                    : t("student.completeProfileDesc")}
                </p>
              </div>
              <Link
                href="/student/profile"
                className="shrink-0 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold"
              >
                {t("student.completeProfileBtn")}
              </Link>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-sand">
              <div
                className="h-full rounded-full bg-coffee-gold transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-text-muted">
              {profileCompletion}% {t("student.complete")}
            </p>
          </div>
        )}

        {/* ---- Recent Activity ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-4 sm:p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-coffee-dark">
            {t("student.recentApplications")}
          </h2>
          <p className="mb-4 sm:mb-6 text-sm text-text-muted">
            {t("student.recentApplicationsDesc")}
          </p>

          {allApplications.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineClipboardList size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">
                {t("student.noApplications")}
              </p>
            </div>
          ) : (
            <>
              {allApplications.map((item) => (
                <ActivityRow key={item.id} {...item} t={t} onWithdraw={handleWithdraw} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
