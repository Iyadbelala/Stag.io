"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineExclamationCircle,
  HiOutlinePhotograph,
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineDocumentDownload,
} from "react-icons/hi";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/Components/contexts/AuthContext";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

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
  isValidated: boolean;
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
  bannerUrl: string | null;
  applicationCount: number;
  createdAt: string;
}

interface OfferApplicant {
  id: string;
  studentId: string;
  applicantName: string;
  email: string;
  department: string | null;
  profilePhotoUrl: string | null;
  skills: string[];
  bio: string | null;
  coverLetter: string | null;
  cvUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  status: string;
  appliedAt: string;
}

/* ============================================
   Stat Card
   ============================================ */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-2 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-coffee-dark">{value}</p>
      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-muted">{label}</p>
    </div>
  );
}

/* ============================================
   Activity Row
   ============================================ */
function ActivityRow({ id, applicantName, position, status, appliedAt, coverLetter, cvUrl, email, onStatusChange, t }: RecentApplicant & { onStatusChange?: (id: string, status: "accepted" | "rejected") => void; t: (key: string) => string }) {
  const statusConfig = {
    pending: { label: t("status.pending"), classes: "bg-status-warning/10 text-status-warning" },
    accepted: { label: t("status.accepted"), classes: "bg-blue-100 text-blue-700" },
    rejected: { label: t("status.rejected"), classes: "bg-status-error/10 text-status-error" },
    withdrawn: { label: t("status.withdrawn"), classes: "bg-text-muted/10 text-text-muted" },
    validated: { label: t("status.validated"), classes: "bg-status-success/10 text-status-success" },
  };

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
                {t("companyDash.accept")}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(id, "rejected"); }}
                className="rounded-full bg-status-error/10 px-3 py-1 text-xs font-medium text-status-error transition-colors hover:bg-status-error/20 cursor-pointer"
              >
                {t("companyDash.reject")}
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
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.email")}</p>
              <a href={`mailto:${email}`} className="text-sm text-coffee-warm hover:text-coffee-gold underline">{email}</a>
            </div>

            {/* CV Link */}
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.cvResume")}</p>
              {cvUrl ? (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:text-coffee-gold underline">
                  <HiOutlineClipboardList size={14} />
                  {t("companyDash.viewCV")}
                </a>
              ) : (
                <p className="text-sm text-text-muted italic">{t("companyDash.noCVProvided")}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.coverLetter")}</p>
              {coverLetter ? (
                <p className="text-sm text-text-secondary whitespace-pre-line">{coverLetter}</p>
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
   Create Offer Modal
   ============================================ */
interface CreateOfferModalProps {
  onClose: () => void;
  onCreated: (offer: Offer) => void;
  t: (key: string) => string;
}

function CreateOfferModal({ onClose, onCreated, t }: CreateOfferModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    duration: "",
    location: "",
    type: "onsite" as "remote" | "onsite" | "hybrid",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.requirements || !form.duration || !form.location) {
      setError(t("companyDash.allFieldsRequired"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("requirements", form.requirements);
      fd.append("duration", form.duration);
      fd.append("location", form.location);
      fd.append("type", form.type);
      if (bannerFile) fd.append("banner", bannerFile);

      const { data } = await api.post<{ success: true; data: Offer }>("/api/offers", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated(data.data);
    } catch {
      setError(t("companyDash.createFailed"));
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
          aria-label={t("companyDash.postNewInternship")}
          className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer"
        >
          <HiOutlineX size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-coffee-dark">
          {t("companyDash.postNewInternship")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.positionTitle")}</label>
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
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.type")}</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              >
                <option value="onsite">{t("companyDash.onsite")}</option>
                <option value="remote">{t("companyDash.remote")}</option>
                <option value="hybrid">{t("companyDash.hybrid")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.duration")}</label>
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
            <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.location")}</label>
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
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.description")}</label>
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
            <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.requirements")}</label>
            <textarea
              id="requirements"
              rows={3}
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              placeholder="Skills and qualifications needed..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Banner Image (optional)</label>
            {bannerPreview && (
              <div className="relative mb-2 overflow-hidden rounded-xl border border-surface-sand">
                <img src={bannerPreview} alt="Banner preview" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 cursor-pointer"
                >
                  <HiOutlineX size={14} />
                </button>
              </div>
            )}
            {!bannerPreview && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-sand bg-surface-cream/30 px-4 py-6 text-sm text-text-muted transition-colors hover:border-coffee-gold/40 hover:bg-coffee-gold/5">
                <HiOutlinePhotograph size={20} />
                Click to upload a banner image
                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
              </label>
            )}
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
            {isSubmitting ? t("common.publishing") : t("companyDash.publishInternship")}
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
  t: (key: string) => string;
}

function EditOfferModal({ offer, onClose, onUpdated, t }: EditOfferModalProps) {
  const [form, setForm] = useState({
    title: offer.title,
    description: offer.description,
    requirements: offer.requirements,
    duration: offer.duration,
    location: offer.location,
    type: offer.type as "remote" | "onsite" | "hybrid",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(offer.bannerUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.requirements || !form.duration || !form.location) {
      setError(t("companyDash.allFieldsRequired"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("requirements", form.requirements);
      fd.append("duration", form.duration);
      fd.append("location", form.location);
      fd.append("type", form.type);
      if (bannerFile) fd.append("banner", bannerFile);

      const { data } = await api.put<{ success: true; data: Offer }>(`/api/offers/${offer.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated(data.data);
    } catch {
      setError(t("companyDash.updateFailed"));
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
          aria-label={t("companyDash.editInternship")}
          className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer"
        >
          <HiOutlineX size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-coffee-dark">
          {t("companyDash.editInternship")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.positionTitle")}</label>
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
              <label htmlFor="edit-type" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.type")}</label>
              <select
                id="edit-type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              >
                <option value="onsite">{t("companyDash.onsite")}</option>
                <option value="remote">{t("companyDash.remote")}</option>
                <option value="hybrid">{t("companyDash.hybrid")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-duration" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.duration")}</label>
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
            <label htmlFor="edit-location" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.location")}</label>
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
            <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.description")}</label>
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
            <label htmlFor="edit-requirements" className="mb-1.5 block text-sm font-medium text-text-primary">{t("companyDash.requirements")}</label>
            <textarea
              id="edit-requirements"
              rows={3}
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              placeholder="Skills and qualifications needed..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Banner Image (optional)</label>
            {bannerPreview && (
              <div className="relative mb-2 overflow-hidden rounded-xl border border-surface-sand">
                <img src={bannerPreview} alt="Banner preview" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 cursor-pointer"
                >
                  <HiOutlineX size={14} />
                </button>
              </div>
            )}
            {!bannerPreview && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-sand bg-surface-cream/30 px-4 py-6 text-sm text-text-muted transition-colors hover:border-coffee-gold/40 hover:bg-coffee-gold/5">
                <HiOutlinePhotograph size={20} />
                Click to upload a banner image
                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
              </label>
            )}
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
            {isSubmitting ? t("common.saving") : t("common.saveChanges")}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================================
   Applicant Profile Preview Modal
   ============================================ */
function ApplicantProfileModal({
  applicant,
  onClose,
  onStatusChange,
  t,
}: {
  applicant: OfferApplicant;
  onClose: () => void;
  onStatusChange?: (id: string, status: "accepted" | "rejected") => void;
  t: (key: string) => string;
}) {
  const initials =
    applicant.applicantName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer">
          <HiOutlineX size={20} />
        </button>

        {/* Header with photo */}
        <div className="flex items-center gap-4 mb-6">
          {applicant.profilePhotoUrl ? (
            <Image src={applicant.profilePhotoUrl} alt={applicant.applicantName} width={72} height={72} className="h-18 w-18 rounded-full object-cover border-2 border-surface-sand" />
          ) : (
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-coffee-warm to-coffee-gold text-xl font-bold text-text-inverse" style={{ width: 72, height: 72 }}>
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-coffee-dark">{applicant.applicantName}</h2>
            <p className="flex items-center gap-1.5 text-sm text-text-muted">
              <HiOutlineMail size={14} />
              <a href={`mailto:${applicant.email}`} className="hover:text-coffee-warm">{applicant.email}</a>
            </p>
            {applicant.department && (
              <p className="flex items-center gap-1.5 text-sm text-text-muted mt-0.5">
                <HiOutlineAcademicCap size={14} />
                {applicant.department}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {applicant.bio && (
          <div className="mb-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.bio")}</p>
            <p className="text-sm text-text-secondary">{applicant.bio}</p>
          </div>
        )}

        {/* Skills */}
        {applicant.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">{t("companyDash.skills")}</p>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-coffee-gold/10 px-2.5 py-1 text-xs font-medium text-coffee-dark">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {(applicant.linkedinUrl || applicant.githubUrl) && (
          <div className="mb-4 flex items-center gap-3">
            {applicant.linkedinUrl && (
              <a href={applicant.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#0A66C2] hover:underline">
                <FaLinkedin size={16} /> LinkedIn
              </a>
            )}
            {applicant.githubUrl && (
              <a href={applicant.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#333] hover:underline">
                <FaGithub size={16} /> GitHub
              </a>
            )}
          </div>
        )}

        {/* Cover letter */}
        <div className="mb-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{t("companyDash.coverLetter")}</p>
          <p className="text-sm text-text-secondary bg-surface-cream rounded-lg px-3 py-2 whitespace-pre-line">
            {applicant.coverLetter || t("companyDash.noCoverLetter")}
          </p>
        </div>

        {/* CV + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-sand">
          <div>
            {applicant.cvUrl ? (
              <a href={applicant.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:underline">
                <HiOutlineDocumentDownload size={16} />
                {t("companyDash.viewCV")}
              </a>
            ) : (
              <span className="text-sm text-text-muted italic">{t("companyDash.noCVProvided")}</span>
            )}
          </div>
          {applicant.status === "pending" && onStatusChange && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onStatusChange(applicant.id, "accepted"); onClose(); }}
                className="rounded-button bg-status-success/10 px-4 py-1.5 text-xs font-medium text-status-success transition-colors hover:bg-status-success/20 cursor-pointer"
              >
                {t("companyDash.accept")}
              </button>
              <button
                onClick={() => { onStatusChange(applicant.id, "rejected"); onClose(); }}
                className="rounded-button bg-status-error/10 px-4 py-1.5 text-xs font-medium text-status-error transition-colors hover:bg-status-error/20 cursor-pointer"
              >
                {t("companyDash.reject")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   All Applicants Modal (per offer)
   ============================================ */
function AllApplicantsModal({
  offer,
  onClose,
  onStatusChange,
  t,
}: {
  offer: Offer;
  onClose: () => void;
  onStatusChange: (id: string, status: "accepted" | "rejected") => void;
  t: (key: string) => string;
}) {
  const [applicants, setApplicants] = useState<OfferApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewApplicant, setPreviewApplicant] = useState<OfferApplicant | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get<{ success: true; data: OfferApplicant[] }>(`/api/offers/${offer.id}/applications`);
        setApplicants(data.data);
      } catch {
        /* empty */
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, [offer.id]);

  const handleStatusChange = (appId: string, status: "accepted" | "rejected") => {
    onStatusChange(appId, status);
    setApplicants((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
  };

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: t("status.pending"), classes: "bg-status-warning/10 text-status-warning" },
    accepted: { label: t("status.accepted"), classes: "bg-blue-100 text-blue-700" },
    rejected: { label: t("status.rejected"), classes: "bg-status-error/10 text-status-error" },
    withdrawn: { label: t("status.withdrawn"), classes: "bg-text-muted/10 text-text-muted" },
    validated: { label: t("status.validated"), classes: "bg-status-success/10 text-status-success" },
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <div
          className="relative w-full max-w-2xl rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-text-muted hover:text-coffee-dark cursor-pointer">
            <HiOutlineX size={20} />
          </button>

          <h2 className="text-xl font-bold text-coffee-dark mb-1">{t("companyDash.allApplicants")}</h2>
          <p className="text-sm text-text-muted mb-6">{t("companyDash.allApplicantsFor")} &quot;{offer.title}&quot;</p>

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent mx-auto" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineUsers size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">{t("companyDash.noApplicantsForOffer")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {applicants.map((app) => {
                const s = statusConfig[app.status] || statusConfig.pending;
                const initials = app.applicantName.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
                return (
                  <div key={app.id} className="flex items-center justify-between gap-3 rounded-card border border-surface-sand p-3 transition-colors hover:bg-surface-cream/50">
                    <div className="flex items-center gap-3 min-w-0">
                      {app.profilePhotoUrl ? (
                        <Image src={app.profilePhotoUrl} alt={app.applicantName} width={40} height={40} className="h-10 w-10 rounded-full object-cover border border-surface-sand shrink-0" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-coffee-warm to-coffee-gold text-xs font-bold text-text-inverse shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate text-sm">{app.applicantName}</p>
                        <p className="text-xs text-text-muted">{app.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.classes}`}>{s.label}</span>
                      {app.status === "pending" && (
                        <>
                          <button onClick={() => handleStatusChange(app.id, "accepted")} className="rounded-full bg-status-success/10 px-2.5 py-0.5 text-[11px] font-medium text-status-success hover:bg-status-success/20 cursor-pointer">{t("companyDash.accept")}</button>
                          <button onClick={() => handleStatusChange(app.id, "rejected")} className="rounded-full bg-status-error/10 px-2.5 py-0.5 text-[11px] font-medium text-status-error hover:bg-status-error/20 cursor-pointer">{t("companyDash.reject")}</button>
                        </>
                      )}
                      <button onClick={() => setPreviewApplicant(app)} className="rounded-full bg-coffee-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-coffee-warm hover:bg-coffee-gold/20 cursor-pointer">
                        {t("companyDash.viewProfile")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewApplicant && (
        <ApplicantProfileModal
          applicant={previewApplicant}
          onClose={() => setPreviewApplicant(null)}
          onStatusChange={handleStatusChange}
          t={t}
        />
      )}
    </>
  );
}

/* ============================================
   Dashboard
   ============================================ */
export default function CompanyDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [applicantsOffer, setApplicantsOffer] = useState<Offer | null>(null);
  const [previewApplicant, setPreviewApplicant] = useState<OfferApplicant | null>(null);

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
          isValidated: false,
        });
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleOfferCreated = useCallback((offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setShowCreateModal(false);
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
    setActionError(null);
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
      setConfirmDeleteId(null);
    } catch {
      setActionError(t("common.deleteFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  }, [t]);

  const handleOfferStatusChange = useCallback(async (offerId: string, newStatus: "draft" | "active" | "closed") => {
    setActionError(null);
    try {
      const { data } = await api.patch<{ success: true; data: Offer }>(`/api/offers/${offerId}/status`, { status: newStatus });
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: data.data.status } : o)));
    } catch {
      setActionError(t("companyDash.statusUpdateFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  }, [t]);

  const handleStatusChange = useCallback(async (applicationId: string, newStatus: "accepted" | "rejected") => {
    setActionError(null);
    try {
      await api.patch(`/api/applications/${applicationId}/status`, { status: newStatus });
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
      setActionError(t("common.statusChangeFailed"));
      setTimeout(() => setActionError(null), 4000);
    }
  }, [t]);

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

  const stats = data?.stats ?? { activeListings: 0, applicationsReceived: 0, acceptedApplications: 0, totalOffers: 0 };
  const recentApplicants = data?.recentApplicants ?? [];
  const profileCompletion = data?.profileCompletion ?? 0;
  const isValidated = data?.isValidated ?? false;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-10">
        {/* ---- Action error toast ---- */}
        {actionError && (
          <div className="rounded-button border border-status-error/20 bg-status-error/10 px-4 py-3 text-sm text-status-error">
            {actionError}
          </div>
        )}

        {/* ---- Welcome Header ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-coffee-dark sm:text-3xl">
              {t("companyDash.welcomeBack").replace("{name}", user?.companyName || user?.email || "")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">{t("companyDash.dashboard")}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isValidated}
              className="flex items-center gap-1.5 sm:gap-2 rounded-button bg-coffee-warm px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isValidated ? t("companyDash.pendingValidation") : undefined}
            >
              <HiOutlinePlus size={16} />
              {t("companyDash.postInternship")}
            </button>
            <Link
              href="/company/profile"
              className="flex items-center gap-1.5 sm:gap-2 rounded-button border border-surface-sand bg-surface-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineUser size={16} />
              <span className="hidden sm:inline">{t("common.editProfile")}</span>
            </Link>
          </div>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={<HiOutlineClipboardList size={22} className="text-coffee-warm" />} label={t("companyDash.activeListings")} value={stats.activeListings} color="bg-coffee-warm/10" />
          <StatCard icon={<HiOutlineUsers size={22} className="text-status-info" />} label={t("companyDash.applicationsReceived")} value={stats.applicationsReceived} color="bg-status-info/10" />
          <StatCard icon={<HiOutlineCheckCircle size={22} className="text-status-success" />} label={t("companyDash.acceptedApplications")} value={stats.acceptedApplications} color="bg-status-success/10" />
          <StatCard icon={<HiOutlineBriefcase size={22} className="text-status-warning" />} label={t("companyDash.totalOffers")} value={stats.totalOffers} color="bg-status-warning/10" />
        </div>

        {/* ---- Pending Validation Banner ---- */}
        {!isValidated && (
          <div className="rounded-card border border-status-warning/30 bg-status-warning/5 px-6 py-5">
            <div className="flex items-start gap-4">
              <HiOutlineExclamationCircle size={24} className="shrink-0 text-status-warning mt-0.5" />
              <div>
                <p className="font-medium text-coffee-dark">{t("companyDash.pendingValidation")}</p>
                <p className="mt-0.5 text-sm text-text-muted">{t("companyDash.pendingValidationDesc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* ---- Profile Completion Banner ---- */}
        {profileCompletion < 100 && (
          <div className="rounded-card border border-coffee-gold/30 bg-coffee-gold/5 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-coffee-dark">{t("companyDash.completeProfile")}</p>
                <p className="mt-0.5 text-sm text-text-muted">{t("companyDash.completeProfileDesc")}</p>
              </div>
              <Link href="/company/profile" className="shrink-0 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold">
                {t("companyDash.completeProfileBtn")}
              </Link>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-sand">
              <div className="h-full rounded-full bg-coffee-gold transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-text-muted">{profileCompletion}% {t("companyDash.complete")}</p>
          </div>
        )}

        {/* ---- My Internship Listings ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-4 sm:p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-coffee-dark">{t("companyDash.myListings")}</h2>
              <p className="text-sm text-text-muted">{t("companyDash.myListingsDesc")}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-button border border-surface-sand px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm cursor-pointer"
            >
              <HiOutlinePlus size={14} />
              {t("companyDash.new")}
            </button>
          </div>

          {offers.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineBriefcase size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">{t("companyDash.noListings")}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 rounded-button bg-coffee-warm px-5 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
              >
                {t("companyDash.postFirst")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => {
                const statusLabels: Record<string, { label: string; classes: string }> = {
                  draft: { label: t("companyDash.statusDraft"), classes: "bg-text-muted/10 text-text-muted" },
                  active: { label: t("companyDash.statusActive"), classes: "bg-status-success/10 text-status-success" },
                  closed: { label: t("companyDash.statusClosed"), classes: "bg-status-error/10 text-status-error" },
                };
                const sl = statusLabels[offer.status] || statusLabels.draft;
                return (
                  <div key={offer.id} className="rounded-card border border-surface-sand p-4 transition-colors hover:bg-surface-cream/50">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary truncate">{offer.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${sl.classes}`}>{sl.label}</span>
                        </div>
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
                            {offer.applicationCount} {offer.applicationCount !== 1 ? t("companyDash.applications") : t("companyDash.application")}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => setEditingOffer(offer)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-coffee-gold/10 hover:text-coffee-warm cursor-pointer"
                          title={t("companyDash.editOffer")}
                          aria-label={t("companyDash.editOffer")}
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(offer.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-status-error/10 hover:text-status-error cursor-pointer"
                          title={t("companyDash.deleteOffer")}
                          aria-label={t("companyDash.deleteOffer")}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Status toggles + View Applicants */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-sand pt-3">
                      {/* Status toggles */}
                      {(["draft", "active", "closed"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleOfferStatusChange(offer.id, s)}
                          disabled={offer.status === s}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:cursor-default ${
                            offer.status === s
                              ? sl.classes + " ring-1 ring-current"
                              : "bg-surface-sand/50 text-text-muted hover:bg-surface-sand"
                          }`}
                        >
                          {statusLabels[s].label}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <button
                        onClick={() => setApplicantsOffer(offer)}
                        className="flex items-center gap-1.5 rounded-button border border-surface-sand px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm cursor-pointer"
                      >
                        <HiOutlineUsers size={14} />
                        {t("companyDash.viewAllApplicants")} ({offer.applicationCount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---- Recent Applicants ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-4 sm:p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-coffee-dark">{t("companyDash.recentApplicants")}</h2>
          <p className="mb-6 text-sm text-text-muted">{t("companyDash.recentApplicantsDesc")}</p>

          {recentApplicants.length === 0 ? (
            <div className="py-8 text-center">
              <HiOutlineUsers size={40} className="mx-auto mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">{t("companyDash.noApplicants")}</p>
            </div>
          ) : (
            <>
              {recentApplicants.map((item) => (
                <ActivityRow key={item.id} {...item} onStatusChange={handleStatusChange} t={t} />
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
          t={t}
        />
      )}

      {/* ---- Edit Offer Modal ---- */}
      {editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onUpdated={handleOfferUpdated}
          t={t}
        />
      )}

      {/* ---- All Applicants Modal ---- */}
      {applicantsOffer && (
        <AllApplicantsModal
          offer={applicantsOffer}
          onClose={() => setApplicantsOffer(null)}
          onStatusChange={handleStatusChange}
          t={t}
        />
      )}

      {/* ---- Applicant Profile Preview Modal ---- */}
      {previewApplicant && (
        <ApplicantProfileModal
          applicant={previewApplicant}
          onClose={() => setPreviewApplicant(null)}
          onStatusChange={handleStatusChange}
          t={t}
        />
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl">
            <p className="mb-6 text-sm text-text-primary">{t("common.deleteConfirm")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-button border border-surface-sand px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOffer(confirmDeleteId)}
                className="rounded-button bg-status-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-status-error/90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
