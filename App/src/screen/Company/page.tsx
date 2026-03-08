"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePencil,
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

/* ============================================
   Types
   ============================================ */
interface DashboardStats {
  activeListings: number;
  applicationsReceived: number;
  acceptedApplications: number;
  totalOffers: number;
}

interface RecentApplicant {
  id: string;
  applicantName: string;
  position: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "validated";
  appliedAt: string;
  coverLetter: string | null;
  cvUrl: string | null;
  email: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentApplicants: RecentApplicant[];
  profileCompletion: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  requirements: string;
  duration: string;
  location: string;
  type: string;
  status: string;
  applicationCount: number;
  createdAt: string;
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
   Activity Row
   ============================================ */
const statusConfig = {
  pending: { label: "Pending", classes: "bg-status-warning/10 text-status-warning" },
  accepted: { label: "Accepted", classes: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rejected", classes: "bg-status-error/10 text-status-error" },
  withdrawn: { label: "Withdrawn", classes: "bg-text-muted/10 text-text-muted" },
  validated: { label: "Validated", classes: "bg-status-success/10 text-status-success" },
};

function ActivityRow({ id, applicantName, position, status, appliedAt, coverLetter, cvUrl, email, onStatusChange }: RecentApplicant & { onStatusChange?: (id: string, status: "accepted" | "rejected") => void }) {
  const s = statusConfig[status];
  const dateStr = new Date(appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isPending = status === "pending";
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-surface-sand last:border-0">
      <div
        className="flex items-center justify-between gap-4 py-4 cursor-pointer hover:bg-surface-cream/30 px-2 -mx-2 rounded transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0">
          <p className="font-medium text-text-primary truncate">{applicantName}</p>
          <p className="text-sm text-text-muted">{position}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isPending && onStatusChange ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(id, "accepted"); }}
                className="rounded-full bg-status-success/10 px-3 py-1 text-xs font-medium text-status-success transition-colors hover:bg-status-success/20 cursor-pointer"
              >
                Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(id, "rejected"); }}
                className="rounded-full bg-status-error/10 px-3 py-1 text-xs font-medium text-status-error transition-colors hover:bg-status-error/20 cursor-pointer"
              >
                Reject
              </button>
            </>
          ) : (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.classes}`}>{s.label}</span>
          )}
          <span className="text-xs text-text-muted hidden sm:block">{dateStr}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="pb-4 pl-2 pr-2 space-y-3">
          <div className="rounded-card border border-surface-sand bg-surface-cream/30 p-4 space-y-3">
            {/* Email */}
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Email</p>
              <a href={`mailto:${email}`} className="text-sm text-coffee-warm hover:text-coffee-gold underline">{email}</a>
            </div>

            {/* CV Link */}
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">CV / Resume</p>
              {cvUrl ? (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:text-coffee-gold underline">
                  <HiOutlineClipboardList size={14} />
                  View CV
                </a>
              ) : (
                <p className="text-sm text-text-muted italic">No CV provided</p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Cover Letter</p>
              {coverLetter ? (
                <p className="text-sm text-text-secondary whitespace-pre-line">{coverLetter}</p>
              ) : (
                <p className="text-sm text-text-muted italic">No cover letter provided</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   Create Offer Modal
   ============================================ */
interface CreateOfferModalProps {
  onClose: () => void;
  onCreated: (offer: Offer) => void;
}

function CreateOfferModal({ onClose, onCreated }: CreateOfferModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    duration: "",
    location: "",
    type: "onsite" as "remote" | "onsite" | "hybrid",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.requirements || !form.duration || !form.location) {
      setError("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post<{ success: true; data: Offer }>("/api/offers", form);
      onCreated(data.data);
    } catch {
      setError("Failed to create offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer"
        >
          <HiOutlineX size={20} />
        </button>

        <h2 className="mb-6 text-xl font-heading font-bold text-coffee-dark">
          Post New Internship
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-text-primary">Position Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Frontend Developer Intern"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-text-primary">Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-text-primary">Duration</label>
              <input
                id="duration"
                type="text"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-text-primary">Location</label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Constantine, Algeria"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the internship role and responsibilities..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium text-text-primary">Requirements</label>
            <textarea
              id="requirements"
              rows={3}
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              placeholder="Skills and qualifications needed..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {error && (
            <div className="rounded-button border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-button bg-coffee-warm py-3.5 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Internship"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================
   Edit Offer Modal
   ============================================ */
interface EditOfferModalProps {
  offer: Offer;
  onClose: () => void;
  onUpdated: (offer: Offer) => void;
}

function EditOfferModal({ offer, onClose, onUpdated }: EditOfferModalProps) {
  const [form, setForm] = useState({
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type as "remote" | "onsite" | "hybrid",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.requirements || !form.duration || !form.location) {
      setError("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const { data } = await api.put<{ success: true; data: Offer }>(`/api/offers/${offer.id}`, form);
      onUpdated(data.data);
    } catch {
      setError("Failed to update offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer"
        >
          <HiOutlineX size={20} />
        </button>

        <h2 className="mb-6 text-xl font-heading font-bold text-coffee-dark">
          Edit Internship
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-text-primary">Position Title</label>
            <input
              id="edit-title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Frontend Developer Intern"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-type" className="mb-1.5 block text-sm font-medium text-text-primary">Type</label>
              <select
                id="edit-type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-duration" className="mb-1.5 block text-sm font-medium text-text-primary">Duration</label>
              <input
                id="edit-duration"
                type="text"
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="edit-location" className="mb-1.5 block text-sm font-medium text-text-primary">Location</label>
            <input
              id="edit-location"
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Constantine, Algeria"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
            <textarea
              id="edit-description"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the internship role and responsibilities..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="edit-requirements" className="mb-1.5 block text-sm font-medium text-text-primary">Requirements</label>
            <textarea
              id="edit-requirements"
              rows={3}
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              placeholder="Skills and qualifications needed..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {error && (
            <div className="rounded-button border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-button bg-coffee-warm py-3.5 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================
   Dashboard
   ============================================ */
export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, offersRes] = await Promise.all([
          api.get<{ success: true; data: DashboardData }>("/api/company/dashboard"),
          api.get<{ success: true; data: Offer[] }>("/api/offers/mine"),
        ]);
        setData(dashRes.data.data);
        setOffers(offersRes.data.data);
      } catch {
        setData({
          stats: { activeListings: 0, applicationsReceived: 0, acceptedApplications: 0, totalOffers: 0 },
          recentApplicants: [],
          profileCompletion: 0,
        });
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleOfferCreated = useCallback((offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setShowCreateModal(false);
    // Update stats
    setData((prev) => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        activeListings: prev.stats.activeListings + 1,
        totalOffers: prev.stats.totalOffers + 1,
      },
    } : prev);
  }, []);

  const handleOfferUpdated = useCallback((updated: Offer) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditingOffer(null);
  }, []);

  const handleDeleteOffer = useCallback(async (offerId: string) => {
    try {
      await api.delete(`/api/offers/${offerId}`);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      setData((prev) => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          activeListings: Math.max(0, prev.stats.activeListings - 1),
          totalOffers: Math.max(0, prev.stats.totalOffers - 1),
        },
      } : prev);
    } catch {
      // silently fail
    }
  }, []);

  const handleStatusChange = useCallback(async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status: newStatus });
      // Update the applicant status in local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentApplicants: prev.recentApplicants.map((a) =>
            a.id === applicationId ? { ...a, status: newStatus } : a
          ),
          stats: {
            ...prev.stats,
            acceptedApplications: newStatus === "accepted"
              ? prev.stats.acceptedApplications + 1
              : prev.stats.acceptedApplications,
          },
        };
      });
    } catch {
      // silently fail
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats ?? { activeListings: 0, applicationsReceived: 0, acceptedApplications: 0, totalOffers: 0 };
  const recentApplicants = data?.recentApplicants ?? [];
  const profileCompletion = data?.profileCompletion ?? 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ---- Welcome Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-coffee-dark sm:text-3xl">
              Welcome back, {user?.companyName || user?.email}
            </h1>
            <p className="mt-1 text-sm text-text-muted">Company Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-button bg-coffee-warm px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
            >
              <HiOutlinePlus size={16} />
              Post Internship
            </button>
            <Link
              href="/company/profile"
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
          <StatCard icon={<HiOutlineClipboardList size={22} className="text-coffee-warm" />} label="Active Listings" value={stats.activeListings} color="bg-coffee-warm/10" />
          <StatCard icon={<HiOutlineUsers size={22} className="text-status-info" />} label="Applications Received" value={stats.applicationsReceived} color="bg-status-info/10" />
          <StatCard icon={<HiOutlineCheckCircle size={22} className="text-status-success" />} label="Accepted Applications" value={stats.acceptedApplications} color="bg-status-success/10" />
          <StatCard icon={<HiOutlineBriefcase size={22} className="text-status-warning" />} label="Total Offers" value={stats.totalOffers} color="bg-status-warning/10" />
        </div>

        {/* ---- Profile Completion Banner ---- */}
        {profileCompletion < 100 && (
          <div className="rounded-card border border-coffee-gold/30 bg-coffee-gold/5 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-coffee-dark">Complete your company profile</p>
                <p className="mt-0.5 text-sm text-text-muted">Add your description, website, and industry to attract the best candidates.</p>
              </div>
              <Link href="/company/profile" className="shrink-0 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold">
                Complete Profile
              </Link>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-sand">
              <div className="h-full rounded-full bg-coffee-gold transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-text-muted">{profileCompletion}% complete</p>
          </div>
        )}

        {/* ---- My Internship Listings ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-1 font-heading text-lg font-semibold text-coffee-dark">My Internship Listings</h2>
              <p className="text-sm text-text-muted">Manage your internship offers.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-button border border-surface-sand px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm cursor-pointer"
            >
              <HiOutlinePlus size={14} />
              New
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineBriefcase size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">No internships posted yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
              >
                Post Your First Internship
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between gap-4 rounded-card border border-surface-sand p-4 transition-colors hover:bg-surface-cream/50">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-text-primary truncate">{offer.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <HiOutlineLocationMarker size={12} />
                        {offer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineClock size={12} />
                        {offer.duration}
                      </span>
                      <span className="rounded-full bg-coffee-gold/10 px-2 py-0.5 text-[11px] font-medium text-coffee-warm">
                        {offer.type}
                      </span>
                      <span className="text-text-muted">
                        {offer.applicationCount} application{offer.applicationCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingOffer(offer)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-coffee-gold/10 hover:text-coffee-warm cursor-pointer"
                      title="Edit offer"
                    >
                      <HiOutlinePencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-status-error/10 hover:text-status-error cursor-pointer"
                      title="Delete offer"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Recent Applicants ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-1 font-heading text-lg font-semibold text-coffee-dark">Recent Applicants</h2>
          <p className="mb-6 text-sm text-text-muted">Latest applications to your internship listings.</p>

          {recentApplicants.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineUsers size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">No applications yet. Post an internship to start receiving applicants.</p>
            </div>
          ) : (
            <>
              {recentApplicants.map((item) => (
                <ActivityRow key={item.id} {...item} onStatusChange={handleStatusChange} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ---- Create Offer Modal ---- */}
      {showCreateModal && (
        <CreateOfferModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleOfferCreated}
        />
      )}

      {/* ---- Edit Offer Modal ---- */}
      {editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onUpdated={handleOfferUpdated}
        />
      )}
    </div>
  );
}
