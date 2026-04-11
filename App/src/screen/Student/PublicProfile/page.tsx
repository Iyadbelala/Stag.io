"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChevronLeft,
  HiOutlineGlobe,
} from "react-icons/hi";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { api } from "@/lib/api";
import { useLanguage } from "@/Components/contexts/LanguageContext";

interface PublicProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  department: string | null;
  bio: string | null;
  skills: string[];
  profilePhotoUrl: string | null;
  portfolioPhotos: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
}

export default function StudentPublicProfile() {
  const params = useParams();
  const { t } = useLanguage();
  const id = params.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get<{ success: true; data: PublicProfile }>(`/api/profile/${id}`);
        setProfile(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

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

  if (notFound || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-surface-cream gap-4">
        <div className="h-16 w-16 rounded-2xl bg-surface-white border border-surface-sand flex items-center justify-center mb-2">
          <HiOutlineUser size={28} className="text-text-muted/30" />
        </div>
        <p className="text-sm text-text-muted">Student not found</p>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors"
        >
          <HiOutlineChevronLeft size={16} />
          Back
        </Link>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Student";
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <section className="min-h-[calc(100vh-80px)] bg-surface-cream">
      {/* Top nav */}
      <div className="border-b border-surface-sand bg-surface-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3">
          <button
            onClick={() => history.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-coffee-warm hover:text-coffee-dark transition-colors cursor-pointer"
          >
            <HiOutlineChevronLeft size={18} />
            Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-surface-sand bg-surface-white overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={fullName}
                  className="h-24 w-24 rounded-2xl object-cover border border-surface-sand shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-coffee-warm to-coffee-gold text-2xl font-bold text-white shadow-sm shrink-0">
                  {initials}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-coffee-dark">{fullName}</h1>
                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  {profile.university && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                      <HiOutlineAcademicCap size={13} className="text-text-muted" />
                      {profile.university}
                    </span>
                  )}
                  {profile.department && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-cream border border-surface-sand px-3 py-1.5 text-xs font-medium text-text-secondary">
                      <HiOutlineBookOpen size={13} className="text-text-muted" />
                      {profile.department}
                    </span>
                  )}
                </div>

                {/* Social links */}
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:text-coffee-dark transition-colors"
                    >
                      <FaLinkedin size={14} />
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-coffee-warm hover:text-coffee-dark transition-colors"
                    >
                      <FaGithub size={14} />
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="border-t border-surface-sand px-6 sm:px-8 py-5">
              <h2 className="mb-3 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-coffee-gold" />
                About
              </h2>
              <p className="text-sm leading-[1.7] text-text-secondary whitespace-pre-line">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white p-6 sm:p-8">
            <h2 className="mb-4 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-coffee-warm" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-coffee-gold/10 border border-coffee-gold/20 px-3 py-1.5 text-xs font-medium text-coffee-warm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolioPhotos.length > 0 && (
          <div className="rounded-2xl border border-surface-sand bg-surface-white p-6 sm:p-8">
            <h2 className="mb-4 text-[15px] font-semibold text-coffee-dark flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-logo-sage" />
              Portfolio
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profile.portfolioPhotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxUrl(url)}
                  className="overflow-hidden rounded-xl border border-surface-sand cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img src={url} alt={`Portfolio ${idx + 1}`} className="h-32 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Portfolio"
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
