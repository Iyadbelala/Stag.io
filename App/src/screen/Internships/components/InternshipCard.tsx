"use client";

import Link from "next/link";
import {
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { CompanyAvatar } from "./CompanyAvatar";
import { ScoreRing } from "./ScoreRing";
import { typeLabel, typeIcon, timeAgo } from "../utils";
import type { Internship, MatchedInternship } from "../types";

interface InternshipCardProps {
  item: Internship;
  matchData?: MatchedInternship;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  animationDelay: number;
}

export function InternshipCard({ item, matchData, isSaved, onToggleSave, animationDelay }: InternshipCardProps) {
  return (
    <Link
      href={`/internships/${item.id}`}
      className="animate-card-slide-in group relative flex w-full cursor-pointer flex-col rounded-2xl border border-surface-sand bg-surface-white p-5 text-left transition-all duration-300 hover:border-coffee-gold/30 hover:shadow-md hover:shadow-coffee-warm/5 hover:-translate-y-0.5"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Banner preview */}
      {item.bannerUrl && (
        <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
          <img src={item.bannerUrl} alt="" className="h-28 w-full object-cover" />
        </div>
      )}

      {/* Top row: avatar + info + bookmark */}
      <div className="flex items-start gap-3.5 w-full">
        <CompanyAvatar name={item.companyName} logoUrl={item.companyLogoUrl} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug text-coffee-dark line-clamp-2 pr-6">
            {item.title}
          </h3>
          <p className="mt-0.5 text-sm text-text-secondary truncate">{item.companyName}</p>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(item.id); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); onToggleSave(item.id); } }}
          className="shrink-0 rounded-lg p-1.5 text-text-muted/50 transition-colors hover:bg-surface-cream hover:text-coffee-warm"
        >
          {isSaved ? (
            <HiBookmark size={18} className="text-coffee-warm" />
          ) : (
            <HiOutlineBookmark size={18} />
          )}
        </span>
      </div>

      {/* Description preview */}
      <p className="mt-3 text-xs leading-relaxed text-text-muted line-clamp-2">
        {item.description}
      </p>

      {/* Meta tags */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
          <HiOutlineLocationMarker size={12} />
          {item.location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
          {typeIcon(item.type)}
          {typeLabel(item.type)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-cream px-2.5 py-1 text-[11px] font-medium text-text-muted">
          <HiOutlineClock size={12} />
          {item.duration}
        </span>
      </div>

      {/* Match section */}
      {matchData ? (
        <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-coffee-gold/5 to-coffee-warm/5 border border-coffee-gold/15 px-3.5 py-2.5">
          <ScoreRing score={matchData.matchScore} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1">
              {matchData.matchedSkills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-coffee-gold/12 px-1.5 py-0.5 text-[10px] font-medium text-coffee-warm"
                >
                  {skill}
                </span>
              ))}
              {matchData.matchedSkills.length > 3 && (
                <span className="text-[10px] text-text-muted">
                  +{matchData.matchedSkills.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-[11px] text-text-muted/70">{timeAgo(item.createdAt)}</span>
          <HiOutlineChevronRight size={14} className="text-text-muted/30 group-hover:text-coffee-warm/50 transition-colors" />
        </div>
      )}
    </Link>
  );
}
