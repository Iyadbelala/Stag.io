"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineCamera,
  HiOutlinePhotograph,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineTrash,
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/LanguageContext";

/* ============================================
   Profile data shape from the API
   ============================================ */
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  department: string;
  bio: string;
  skills: string[];
  profilePhotoUrl: string | null;
  portfolioPhotos: string[];
}

/* ============================================
   Main Profile Component
   ============================================ */
export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    department: "",
    bio: "",
    skills: [],
    profilePhotoUrl: null,
    portfolioPhotos: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const portfolioPhotoRef = useRef<HTMLInputElement>(null);

  /* ---- Fetch profile on mount ---- */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get<{ success: true; data: ProfileData }>("/api/profile");
        const p = data.data;
        setForm({
          firstName: p.firstName || "",
          lastName: p.lastName || "",
          email: p.email || "",
          university: p.university || "",
          department: p.department || "",
          bio: p.bio || "",
          skills: p.skills || [],
          profilePhotoUrl: p.profilePhotoUrl || null,
          portfolioPhotos: p.portfolioPhotos || [],
        });
      } catch {
        if (user) {
          setForm((f) => ({
            ...f,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            university: user.university || "",
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  /* ---- Update field ---- */
  const updateField = useCallback((field: keyof ProfileData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaveStatus("idle");
  }, []);

  /* ---- Skills management ---- */
  const addSkill = useCallback(() => {
    const skill = newSkill.trim();
    if (!skill) return;
    setForm((f) => {
      if (f.skills.includes(skill)) return f;
      return { ...f, skills: [...f.skills, skill] };
    });
    setNewSkill("");
    setSaveStatus("idle");
  }, [newSkill]);

  const removeSkill = useCallback((skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
    setSaveStatus("idle");
  }, []);

  /* ---- Profile photo upload ---- */
  const handleProfilePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const { data } = await api.post<{ success: true; data: { url: string } }>("/api/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, profilePhotoUrl: data.data.url }));
    } catch {
      /* ignore */
    } finally {
      setIsUploadingPhoto(false);
      if (profilePhotoRef.current) profilePhotoRef.current.value = "";
    }
  }, []);

  const handleRemoveProfilePhoto = useCallback(async () => {
    try {
      await api.delete("/api/profile/photo");
      setForm((f) => ({ ...f, profilePhotoUrl: null }));
    } catch {
      /* ignore */
    }
  }, []);

  /* ---- Portfolio photo upload ---- */
  const handlePortfolioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPortfolio(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const { data } = await api.post<{ success: true; data: { url: string; photos: string[] } }>("/api/profile/portfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, portfolioPhotos: data.data.photos }));
    } catch {
      /* ignore */
    } finally {
      setIsUploadingPortfolio(false);
      if (portfolioPhotoRef.current) portfolioPhotoRef.current.value = "";
    }
  }, []);

  const handleRemovePortfolioPhoto = useCallback(async (url: string) => {
    try {
      const { data } = await api.delete<{ success: true; data: { photos: string[] } }>("/api/profile/portfolio", {
        data: { url },
      });
      setForm((f) => ({ ...f, portfolioPhotos: data.data.photos }));
      setPortfolioIndex((i) => Math.max(0, Math.min(i, data.data.photos.length - 1)));
      setLightboxUrl(null);
    } catch {
      /* ignore */
    }
  }, []);

  /* ---- Portfolio slider navigation ---- */
  const prevSlide = useCallback(() => {
    setPortfolioIndex((i) => (i - 1 + form.portfolioPhotos.length) % form.portfolioPhotos.length);
  }, [form.portfolioPhotos.length]);

  const nextSlide = useCallback(() => {
    setPortfolioIndex((i) => (i + 1) % form.portfolioPhotos.length);
  }, [form.portfolioPhotos.length]);

  /* ---- Save ---- */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const { data } = await api.put<{ success: true; data: ProfileData }>("/api/profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        bio: form.bio,
        skills: form.skills,
      });

      const p = data.data;
      updateUser({
        id: user!.id,
        email: p.email,
        role: user!.role,
        firstName: p.firstName || undefined,
        lastName: p.lastName || undefined,
        university: p.university || undefined,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [form, user, updateUser]);

  /* ---- Initials for avatar fallback ---- */
  const initials =
    (form.firstName?.[0] || "").toUpperCase() + (form.lastName?.[0] || "").toUpperCase() || "?";

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
              href="/student"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-sand bg-surface-white text-text-secondary transition-colors hover:border-coffee-warm hover:text-coffee-warm"
            >
              <HiOutlineArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-coffee-dark">
                {t("studentProfile.title")}
              </h1>
              <p className="text-sm text-text-muted">
                {t("studentProfile.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Profile Photo Section ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
            <HiOutlineCamera size={20} className="text-coffee-warm" />
            {t("studentProfile.profilePhoto")}
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              {form.profilePhotoUrl ? (
                <Image
                  src={form.profilePhotoUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover border-2 border-surface-sand"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-coffee-warm to-coffee-gold text-2xl font-bold text-text-inverse">
                  {initials}
                </div>
              )}

              {/* Overlay on hover */}
              <button
                type="button"
                onClick={() => profilePhotoRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-coffee-dark/50 text-text-inverse opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              >
                {isUploadingPhoto ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <HiOutlineCamera size={24} />
                )}
              </button>
              <input
                ref={profilePhotoRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => profilePhotoRef.current?.click()}
                disabled={isUploadingPhoto}
                className="flex items-center gap-2 rounded-button bg-coffee-warm px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer disabled:opacity-60"
              >
                <HiOutlineCamera size={16} />
                {isUploadingPhoto
                  ? t("studentProfile.uploading")
                  : form.profilePhotoUrl
                  ? t("studentProfile.changePhoto")
                  : t("studentProfile.uploadPhoto")}
              </button>
              {form.profilePhotoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePhoto}
                  className="flex items-center gap-2 rounded-button border border-surface-sand px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-status-error hover:text-status-error cursor-pointer"
                >
                  <HiOutlineTrash size={16} />
                  {t("studentProfile.removePhoto")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---- Personal Information ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
            <HiOutlineUser size={20} className="text-coffee-warm" />
            {t("studentProfile.personalInfo")}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("studentProfile.firstName")}
              </label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("studentProfile.lastName")}
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-coffee-gold/60"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("studentProfile.email")}
              </label>
              <div className="flex items-center gap-3 rounded-button border border-surface-sand bg-surface-sand/30 px-4 py-3 text-sm text-text-muted">
                <HiOutlineMail size={16} className="shrink-0" />
                {form.email}
              </div>
            </div>

            {/* University (read-only) */}
            <div>
              <label htmlFor="university" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t("studentProfile.university")}
              </label>
              <div className="flex items-center gap-3 rounded-button border border-surface-sand bg-surface-sand/30 px-4 py-3 text-sm text-text-muted">
                <HiOutlineAcademicCap size={16} className="shrink-0" />
                {form.university}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Academic Information ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
            <HiOutlineBookOpen size={20} className="text-coffee-warm" />
            {t("studentProfile.academicInfo")}
          </h2>

          <div>
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t("studentProfile.department")}
            </label>
            <input
              id="department"
              type="text"
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
              placeholder="e.g. Computer Science, Information Technology"
              className="w-full rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
          </div>
        </div>

        {/* ---- About Me ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-coffee-dark">
            {t("studentProfile.aboutMe")}
          </h2>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t("studentProfile.bio")}
            </label>
            <textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell companies about yourself, your goals, and what you're looking for..."
              className="w-full resize-none rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
            <p className="mt-1 text-right text-xs text-text-muted">
              {form.bio.length} / 500
            </p>
          </div>
        </div>

        {/* ---- Skills ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 font-heading text-lg font-semibold text-coffee-dark">
            {t("studentProfile.skills")}
          </h2>

          {/* Existing skills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {form.skills.length === 0 && (
              <p className="text-sm text-text-muted">{t("studentProfile.noSkills")}</p>
            )}
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 rounded-full bg-coffee-gold/10 px-3 py-1.5 text-sm font-medium text-coffee-dark"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-coffee-dark/10 hover:text-coffee-dark cursor-pointer"
                >
                  <HiOutlineX size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Add a skill (e.g. React, Python, Figma)"
              className="flex-1 rounded-button border border-surface-sand bg-surface-cream/50 px-4 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-coffee-gold/60"
            />
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center gap-1.5 rounded-button bg-coffee-warm px-4 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer"
            >
              <HiOutlinePlus size={16} />
              {t("studentProfile.addSkill")}
            </button>
          </div>
        </div>

        {/* ---- Portfolio & Certificates ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
                <HiOutlinePhotograph size={20} className="text-coffee-warm" />
                {t("studentProfile.portfolio")}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {t("studentProfile.portfolioDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => portfolioPhotoRef.current?.click()}
              disabled={isUploadingPortfolio}
              className="flex items-center gap-1.5 rounded-button bg-coffee-warm px-4 py-2.5 text-sm font-medium text-text-inverse transition-colors hover:bg-coffee-gold cursor-pointer disabled:opacity-60"
            >
              {isUploadingPortfolio ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("studentProfile.uploading")}
                </>
              ) : (
                <>
                  <HiOutlinePlus size={16} />
                  {t("studentProfile.addToPortfolio")}
                </>
              )}
            </button>
            <input
              ref={portfolioPhotoRef}
              type="file"
              accept="image/*"
              onChange={handlePortfolioUpload}
              className="hidden"
            />
          </div>

          {form.portfolioPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-surface-sand py-12 text-center">
              <HiOutlinePhotograph size={48} className="mb-3 text-text-muted/40" />
              <p className="text-sm text-text-muted">
                {t("studentProfile.noPortfolio")}
              </p>
            </div>
          ) : (
            <>
              {/* Slider */}
              <div className="relative overflow-hidden rounded-xl border border-surface-sand">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${portfolioIndex * 100}%)` }}
                >
                  {form.portfolioPhotos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-full shrink-0 cursor-pointer"
                      onClick={() => setLightboxUrl(url)}
                    >
                      <Image
                        src={url}
                        alt={`Portfolio ${idx + 1}`}
                        width={800}
                        height={500}
                        className="h-80 w-full object-contain bg-surface-sand/30"
                      />
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePortfolioPhoto(url);
                        }}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-coffee-dark/60 text-white transition-colors hover:bg-status-error cursor-pointer"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Navigation arrows */}
                {form.portfolioPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-coffee-dark/50 text-white transition-colors hover:bg-coffee-dark/80 cursor-pointer"
                    >
                      <HiOutlineChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-coffee-dark/50 text-white transition-colors hover:bg-coffee-dark/80 cursor-pointer"
                    >
                      <HiOutlineChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Dots indicator */}
              {form.portfolioPhotos.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {form.portfolioPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPortfolioIndex(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        idx === portfolioIndex
                          ? "w-6 bg-coffee-warm"
                          : "w-2.5 bg-surface-sand hover:bg-coffee-gold/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail strip */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {form.portfolioPhotos.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPortfolioIndex(idx)}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      idx === portfolioIndex
                        ? "border-coffee-warm shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      width={80}
                      height={60}
                      className="h-14 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
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

      {/* ---- Lightbox Modal ---- */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40 cursor-pointer"
          >
            <HiOutlineX size={24} />
          </button>
          <Image
            src={lightboxUrl}
            alt="Portfolio full view"
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
