"use client";

import {
  HiOutlineBriefcase,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineUser,
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
interface ActivityRowProps {
  title: string;
  company: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    classes: "bg-status-warning/10 text-status-warning",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-status-success/10 text-status-success",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-status-error/10 text-status-error",
  },
};

function ActivityRow({ title, company, status, date }: ActivityRowProps) {
  const s = statusConfig[status];
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
        <span className="text-xs text-text-muted hidden sm:block">{date}</span>
      </div>
    </div>
  );
}

/* ============================================
   Dashboard
   ============================================ */
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const recentActivity: ActivityRowProps[] = [
    {
      title: "Frontend Developer Intern",
      company: "TechVision Algeria",
      status: "pending",
      date: "Feb 20",
    },
    {
      title: "UI/UX Design Intern",
      company: "DesignLab DZ",
      status: "accepted",
      date: "Feb 18",
    },
    {
      title: "Data Analyst Intern",
      company: "DataFlow Solutions",
      status: "rejected",
      date: "Feb 15",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ---- Welcome Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-coffee-dark sm:text-3xl">
              Welcome back, {user?.firstName || user?.email}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {user?.university} &middot; Student Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/profile"
              className="flex items-center gap-2 rounded-button border border-surface-sand bg-surface-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineUser size={16} />
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-button border border-surface-sand bg-surface-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-status-error hover:text-status-error cursor-pointer"
            >
              <HiOutlineLogout size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={
              <HiOutlineBriefcase size={22} className="text-coffee-warm" />
            }
            label="Applications Sent"
            value={3}
            color="bg-coffee-warm/10"
          />
          <StatCard
            icon={
              <HiOutlineCheckCircle
                size={22}
                className="text-status-success"
              />
            }
            label="Interviews Scheduled"
            value={1}
            color="bg-status-success/10"
          />
          <StatCard
            icon={
              <HiOutlineClipboardList
                size={22}
                className="text-status-info"
              />
            }
            label="Saved Offers"
            value={7}
            color="bg-status-info/10"
          />
          <StatCard
            icon={
              <HiOutlineClock size={22} className="text-status-warning" />
            }
            label="Pending Responses"
            value={2}
            color="bg-status-warning/10"
          />
        </div>

        {/* ---- Profile Completion Banner ---- */}
        <div className="rounded-card border border-coffee-gold/30 bg-coffee-gold/5 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-coffee-dark">
                Complete your profile to stand out
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                Add your CV, skills, and bio to increase your visibility to
                companies.
              </p>
            </div>
            <Link
              href="/student/profile"
              className="shrink-0 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold"
            >
              Complete Profile
            </Link>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-sand">
            <div className="h-full w-1/3 rounded-full bg-coffee-gold transition-all" />
          </div>
          <p className="mt-1 text-right text-xs text-text-muted">
            33% complete
          </p>
        </div>

        {/* ---- Recent Activity ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-1 font-heading text-lg font-semibold text-coffee-dark">
            Recent Applications
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            Your latest internship application activity.
          </p>

          {recentActivity.map((item, i) => (
            <ActivityRow key={i} {...item} />
          ))}

          <button className="mt-6 w-full rounded-button border border-surface-sand py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm cursor-pointer">
            View All Applications
          </button>
        </div>
      </div>
    </div>
  );
}
