"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineCheck,
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/LanguageContext";

/* ============================================
   Profile data shape from the API
   ============================================ */
interface CompanyProfileData {
  companyName: string;
  email: string;
  contactPerson: string;
  industry: string;
  location: string;
  website: string;
  description: string;
}

/* ============================================
   Main Profile Component
   ============================================ */
export default function CompanyProfile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState<CompanyProfileData>({
    companyName: "",
    email: "",
    contactPerson: "",
    industry: "",
    location: "",
    website: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  /* ---- Fetch profile on mount ---- */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get<{ success: true; data: CompanyProfileData }>("/api/company/profile");
        const p = data.data;
        setForm({
          companyName: p.companyName || "",
          email: p.email || "",
          contactPerson: p.contactPerson || "",
          industry: p.industry || "",
          location: p.location || "",
          website: p.website || "",
          description: p.description || "",
        });
      } catch {
        // Fallback to auth context data
        if (user) {
          setForm((f) => ({
            ...f,
            companyName: user.companyName || "",
            email: user.email,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  /* ---- Update field ---- */
  const updateField = useCallback((field: keyof CompanyProfileData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaveStatus("idle");
  }, []);

  /* ---- Save ---- */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const { data } = await api.put<{ success: true; data: CompanyProfileData }>("/api/company/profile", {
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        industry: form.industry,
        location: form.location,
        website: form.website,
        description: form.description,
      });

      // Update the auth context so navbar reflects changes
      const p = data.data;
      updateUser({
        id: user!.id,
        email: p.email,
        role: user!.role,
        companyName: p.companyName,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [form, user, updateUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/company"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand bg-surface-white text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-coffee-dark">
                {t("companyProfile.title")}
              </h1>
              <p className="text-sm text-text-muted">
                {t("companyProfile.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Company Information ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
            <HiOutlineOfficeBuilding size={20} className="text-coffee-warm" />
            {t("companyProfile.companyInfo")}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.companyName")}
              </label>
              <input
                id="companyName"
                type="text"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label htmlFor="contactPerson" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.contactPerson")}
              </label>
              <input
                id="contactPerson"
                type="text"
                value={form.contactPerson}
                onChange={(e) => updateField("contactPerson", e.target.value)}
                placeholder="Full name of contact person"
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.email")}
              </label>
              <div className="flex items-center gap-3 rounded-button border border-surface-sand bg-surface-sand/30 px-4 py-3 text-sm text-text-muted">
                <HiOutlineMail size={16} className="shrink-0" />
                {form.email}
              </div>
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.industry")}
              </label>
              <input
                id="industry"
                type="text"
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="e.g. Technology, Healthcare, Finance"
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.location")}
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Constantine, Algeria"
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("companyProfile.website")}
              </label>
              <div className="flex items-center gap-0">
                <span className="flex items-center gap-1.5 rounded-l-button border border-r-0 border-surface-sand bg-surface-sand/30 px-3 py-3 text-sm text-text-muted">
                  <HiOutlineGlobe size={16} />
                </span>
                <input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-r-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---- About the Company ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-coffee-dark">
            {t("companyProfile.aboutCompany")}
          </h2>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t("companyProfile.description")}
            </label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell students about your company, culture, and what makes you a great place to intern..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
            <p className="mt-1 text-right text-xs text-text-muted">
              {form.description.length} / 1000
            </p>
          </div>
        </div>

        {/* ---- Save Button ---- */}
        <div className="flex items-center justify-end gap-4">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-status-success">
              <HiOutlineCheck size={16} />
              {t("common.profileSaved")}
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm font-medium text-status-error">
              {t("common.saveFailed")}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-button bg-coffee-warm px-8 py-3 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? t("common.saving") : t("common.saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
