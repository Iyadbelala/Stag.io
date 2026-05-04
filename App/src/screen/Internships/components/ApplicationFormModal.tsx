"use client";

import { useState } from "react";
import {
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineDocument,
} from "react-icons/hi";
import { api } from "@/lib/api";
import { CompanyAvatar } from "./CompanyAvatar";

interface ApplicationFormModalProps {
  offerTitle: string;
  companyName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string, cvUrl: string) => void;
  t: (key: string) => string;
}

export function ApplicationFormModal({ offerTitle, companyName, isSubmitting, onClose, onSubmit, t }: ApplicationFormModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [isGeneratingCv, setIsGeneratingCv] = useState(false);

  const handleGenerateCv = async () => {
    setIsGeneratingCv(true);
    try {
      const { data } = await api.post<{ success: true; data: { url: string } }>("/api/profile/cv/generate");
      setCvUrl(data.data.url);
    } catch {
      /* ignore */
    } finally {
      setIsGeneratingCv(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(coverLetter, cvUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 py-10 sm:py-16 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-sand bg-surface-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto animate-modal-enter">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:bg-surface-cream hover:text-coffee-dark cursor-pointer transition-colors"
        >
          <HiOutlineX size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <CompanyAvatar name={companyName} size="md" />
          <div>
            <h2 className="text-lg font-bold text-coffee-dark">{offerTitle}</h2>
            <p className="text-sm text-text-muted">{companyName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="cvUrl" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary">
              <HiOutlineLink size={16} className="text-text-muted" />
              {t("internships.cvResumeLink")}
            </label>
            <input
              id="cvUrl"
              type="url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://drive.google.com/your-cv or LinkedIn URL"
              className="w-full rounded-xl border border-surface-sand bg-surface-cream/40 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/50 focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10"
            />
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-text-muted">{t("internships.cvHint")}</p>
              <button
                type="button"
                onClick={handleGenerateCv}
                disabled={isGeneratingCv}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-coffee-gold/30 bg-coffee-gold/5 px-3 py-1.5 text-xs font-medium text-coffee-warm transition-colors hover:bg-coffee-gold/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingCv ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
                    {t("studentProfile.generatingCv")}
                  </>
                ) : (
                  <>
                    <HiOutlineDocument size={14} />
                    {t("internships.useStagCv")}
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="coverLetter" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary">
              <HiOutlineDocumentText size={16} className="text-text-muted" />
              {t("internships.coverLetter")}
            </label>
            <textarea
              id="coverLetter"
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the company why you're a great fit..."
              className="w-full resize-none rounded-xl border border-surface-sand bg-surface-cream/40 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted/50 focus:border-coffee-gold focus:ring-2 focus:ring-coffee-gold/10"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-coffee-warm to-coffee-gold py-3.5 text-sm font-semibold text-white shadow-lg shadow-coffee-warm/15 transition-all hover:shadow-xl hover:shadow-coffee-warm/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("common.submitting") : t("common.submitApplication")}
          </button>
        </form>
      </div>
    </div>
  );
}
