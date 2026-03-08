"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "react-icons/hi";
import { useAuth } from "@/Components/AuthContext";
import { api } from "@/lib/api";

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
}

/* ============================================
   Main Profile Component
   ============================================ */
export default function StudentProfile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    department: "",
    bio: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

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
        });
      } catch {
        // Fallback to auth context data
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

      // Update the auth context so navbar reflects changes
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
                My Profile
              </h1>
              <p className="text-sm text-text-muted">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* ---- Personal Information ---- */}
        <div className="rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-semibold text-coffee-dark">
            <HiOutlineUser size={20} className="text-coffee-warm" />
            Personal Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-text-primary">
                First Name
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
                Last Name
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
                Email
              </label>
              <div className="flex items-center gap-3 rounded-button border border-surface-sand bg-surface-sand/30 px-4 py-3 text-sm text-text-muted">
                <HiOutlineMail size={16} className="shrink-0" />
                {form.email}
              </div>
            </div>

            {/* University (read-only) */}
            <div>
              <label htmlFor="university" className="mb-1.5 block text-sm font-medium text-text-primary">
                University
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
            Academic Information
          </h2>

          <div>
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-text-primary">
              Department
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
            About Me
          </h2>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-text-primary">
              Bio
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
            Skills
          </h2>

          {/* Existing skills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {form.skills.length === 0 && (
              <p className="text-sm text-text-muted">No skills added yet.</p>
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
              Add
            </button>
          </div>
        </div>

        {/* ---- Save Button ---- */}
        <div className="flex items-center justify-end gap-4">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-status-success">
              <HiOutlineCheck size={16} />
              Profile saved successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm font-medium text-status-error">
              Failed to save. Please try again.
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-button bg-coffee-warm px-8 py-3 text-sm font-semibold text-text-inverse shadow-lg shadow-coffee-warm/20 transition-all hover:bg-coffee-gold hover:shadow-coffee-gold/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
