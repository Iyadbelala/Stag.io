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
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/LanguageContext";

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
}

interface DashboardData {
  stats: DashboardStats;
  recentApplications: RecentApplication[];
  profileCompletion: number;
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
    <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-heading font-bold text-coffee-dark">
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}

/* ============================================
   Activity Row
   ============================================ */
function ActivityRow({ title, company, status, appliedAt, t }: RecentApplication & { t: (key: string) => string }) {
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
  });

  return (
    <div className="flex items-center justify-between gap-4 border-b border-surface-sand py-4 last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-text-primary truncate">{title}</p>
        <p className="text-sm text-text-muted">{company}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${s.classes}`}
        >
          {s.label}
        </span>
        <span className="text-xs text-text-muted hidden sm:block">{dateStr}</span>
      </div>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }
    async function fetchDashboard() {
      try {
        const res = await api.get<{ success: true; data: DashboardData }>("/api/profile/dashboard");
        setData(res.data.data);
      } catch {
        // Fallback to empty state
        setData({
          stats: { applicationsSent: 0, acceptedApplications: 0, pendingResponses: 0, rejectedApplications: 0 },
          recentApplications: [],
          profileCompletion: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats ?? { applicationsSent: 0, acceptedApplications: 0, pendingResponses: 0, rejectedApplications: 0 };
  const recentApplications = data?.recentApplications ?? [];
  const profileCompletion = data?.profileCompletion ?? 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ---- Welcome Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-coffee-dark sm:text-3xl">
              {t("student.welcomeBack").replace("{name}", user?.firstName || user?.email || "")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {user?.university} &middot; {t("student.dashboard")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 rounded-button border border-surface-sand bg-surface-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineUser size={16} />
              {t("common.editProfile")}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-button border border-surface-sand bg-surface-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-status-error hover:text-status-error cursor-pointer"
            >
              <HiOutlineLogout size={16} />
              {t("common.signOut")}
            </button>
          </div>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          <div className="rounded-card border border-coffee-gold/30 bg-coffee-gold/5 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-coffee-dark">
                  {t("student.completeProfile")}
                </p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {t("student.completeProfileDesc")}
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
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-1 font-heading text-lg font-semibold text-coffee-dark">
            {t("student.recentApplications")}
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            {t("student.recentApplicationsDesc")}
          </p>

          {recentApplications.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineClipboardList size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">
                {t("student.noApplications")}
              </p>
            </div>
          ) : (
            <>
              {recentApplications.map((item) => (
                <ActivityRow key={item.id} {...item} t={t} />
              ))}
              <button className="mt-6 w-full rounded-button border border-surface-sand py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm cursor-pointer">
                {t("student.viewAllApplications")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
