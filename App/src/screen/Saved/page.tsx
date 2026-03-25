"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineGlobeAlt,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { api } from "@/lib/api";

/* ── Types ── */
interface Internship {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  companyName: string;
  companyIndustry: string | null;
  companyLocation: string | null;
  applicationCount: number;
  createdAt: string;
}

/* ── Company Avatar ── */
function CompanyAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "from-coffee-warm to-coffee-gold",
    "from-amber-600 to-orange-400",
    "from-emerald-600 to-teal-400",
    "from-blue-600 to-cyan-400",
    "from-purple-600 to-pink-400",
    "from-rose-600 to-red-400",
    "from-indigo-600 to-violet-400",
  ];
  const colorIdx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const dim = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";

  return (
    <div className={`${dim} shrink-0 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

/* ── Helpers ── */
const typeLabel = (type: string) => {
  switch (type) {
    case "remote": return "Remote";
    case "hybrid": return "Hybrid";
    default: return "On-site";
  }
};

const typeIcon = (type: string) => {
  switch (type) {
    case "remote": return <HiOutlineGlobeAlt size={12} />;
    case "hybrid": return <HiOutlineRefresh size={12} />;
    default: return <HiOutlineOfficeBuilding size={12} />;
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

/* ══════════════════════════════════════════ */
export default function SavedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  /* ── Fetch all offers + saved IDs, then filter ── */
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const [offersRes, savedRes] = await Promise.all([
          api.get<{ success: true; data: Internship[] }>("/api/offers"),
          api.get<{ success: true; data: string[] }>("/api/saved"),
        ]);

        const ids = new Set(savedRes.data.data);
        setSavedIds(ids);
        setInternships(offersRes.data.data.filter((o) => ids.has(o.id)));
      } catch {
        setInternships([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  /* ── Unsave an offer ── */
  const handleUnsave = useCallback(async (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setInternships((prev) => prev.filter((o) => o.id !== id));
    try {
      await api.post(`/api/saved/${id}`);
    } catch {
      // silently fail — already removed from UI
    }
  }, []);

  /* ── Redirect if not logged in ── */
  if (!user) {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-surface-cream flex items-center justify-center">
        <div className="text-center">
          <HiOutlineBookmark size={48} className="mx-auto mb-4 text-text-muted/30" />
          <p className="text-sm text-text-muted mb-4">Please log in to see your saved internships.</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </section>
    );
  }

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

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-surface-white to-surface-cream border-b border-surface-sand">
        <div className="mx-auto max-w-3xl px-4 pt-6 pb-5 sm:px-6">
          <button
            onClick={() => router.back()}
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-white border border-surface-sand text-coffee-dark shadow-sm hover:bg-surface-sand transition-colors"
          >
            <HiOutlineArrowLeft size={18} />
          </button>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-coffee-dark">
            Saved Internships
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            {internships.length} {internships.length === 1 ? "internship" : "internships"} saved
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 sm:py-5">
        {internships.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-white border border-surface-sand py-20 text-center">
            <HiOutlineBookmark size={36} className="mb-3 text-text-muted/30" />
            <p className="text-sm text-text-muted mb-1">No saved internships yet.</p>
            <p className="text-xs text-text-muted/70 mb-4">
              Tap the bookmark icon on any internship to save it here.
            </p>
            <button
              onClick={() => router.push("/internships")}
              className="rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold px-6 py-2.5 text-sm font-semibold text-white shadow-md cursor-pointer"
            >
              Browse Internships
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-2.5">
            {internships.map((item, idx) => (
              <div
                key={item.id}
                className="animate-card-slide-in group relative flex w-full flex-col rounded-2xl border border-surface-sand bg-surface-white p-3.5 sm:p-4 transition-all duration-200 hover:border-coffee-gold/30 hover:shadow-sm"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Top row */}
                <div className="flex items-start gap-3 w-full">
                  <button
                    onClick={() => router.push(`/internships?company=${encodeURIComponent(item.companyName)}`)}
                    className="cursor-pointer"
                  >
                    <CompanyAvatar name={item.companyName} size="sm" />
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/internships?company=${encodeURIComponent(item.companyName)}`)}
                  >
                    <h3 className="text-[14px] font-semibold leading-tight text-coffee-dark truncate pr-7">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-text-secondary truncate">
                      {item.companyName}
                      {item.companyIndustry && <span className="text-text-muted"> · {item.companyIndustry}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsave(item.id)}
                    className="shrink-0 rounded-lg p-1 text-coffee-warm transition-colors hover:bg-surface-cream cursor-pointer"
                    aria-label="Unsave"
                  >
                    <HiBookmark size={16} />
                  </button>
                </div>

                {/* Meta tags */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                    <HiOutlineLocationMarker size={11} />
                    {item.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                    {typeIcon(item.type)}
                    {typeLabel(item.type)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2 py-0.5 text-[11px] font-medium text-text-muted">
                    <HiOutlineClock size={11} />
                    {item.duration}
                  </span>
                </div>

                {/* Bottom */}
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted/70">{timeAgo(item.createdAt)}</span>
                  <button
                    onClick={() => router.push(`/internships?company=${encodeURIComponent(item.companyName)}`)}
                    className="cursor-pointer"
                  >
                    <HiOutlineChevronRight size={14} className="text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
