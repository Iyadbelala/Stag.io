"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineStar,
  HiStar,
  HiOutlinePencilAlt,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineBriefcase,
} from "react-icons/hi";
import { useAuth } from "@/Components/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

/* ── Types ── */

interface PendingReview {
  applicationId: string;
  offerTitle: string;
  companyName: string;
  role: "student" | "company";
}

interface Review {
  id: string;
  applicationId: string;
  reviewerUserId: string;
  revieweeUserId: string;
  reviewerRole: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
  revieweeName: string;
  offerTitle: string;
  companyName: string;
}

interface RatingStats {
  average: number;
  count: number;
}

/* ── Star Rating Component ── */

function StarRating({
  rating,
  onRate,
  size = "md",
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!onRate}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => onRate && setHover(star)}
            onMouseLeave={() => onRate && setHover(0)}
            className={`${onRate ? "cursor-pointer" : "cursor-default"} transition-colors`}
          >
            {filled ? (
              <HiStar className={`${sizeClass} text-amber-500`} />
            ) : (
              <HiOutlineStar className={`${sizeClass} text-surface-sand`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Review Card ── */

function ReviewCard({ review, currentUserId }: { review: Review; currentUserId: string }) {
  const isReceived = review.revieweeUserId === currentUserId;
  const timeAgo = getTimeAgo(review.createdAt);

  return (
    <div className="rounded-card border border-surface-sand bg-surface-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-coffee-dark">
              {isReceived ? review.reviewerName : review.revieweeName}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                review.reviewerRole === "student"
                  ? "bg-status-info/10 text-status-info"
                  : "bg-coffee-warm/10 text-coffee-warm"
              }`}
            >
              {review.reviewerRole === "student" ? "Student" : "Company"}
            </span>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <HiOutlineBriefcase className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">
              {review.offerTitle} — {review.companyName}
            </span>
          </div>

          <StarRating rating={review.rating} size="sm" />

          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>

        <span className="shrink-0 text-xs text-text-muted">{timeAgo}</span>
      </div>
    </div>
  );
}

/* ── Write Review Modal ── */

function WriteReviewModal({
  pending,
  onClose,
  onSubmit,
}: {
  pending: PendingReview;
  onClose: () => void;
  onSubmit: (applicationId: string, rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(pending.applicationId, rating, comment);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e.response?.data?.error?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-card border border-surface-sand bg-surface-white p-6 shadow-xl">
        <h3 className="mb-1 text-lg font-semibold text-coffee-dark">Write a Review</h3>
        <p className="mb-4 text-sm text-text-muted">
          {pending.role === "student"
            ? `Rate your experience at ${pending.companyName}`
            : `Rate the student's performance`}
        </p>

        <div className="mb-2 rounded-lg bg-surface-cream p-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <HiOutlineBriefcase className="h-4 w-4" />
            <span className="font-medium">{pending.offerTitle}</span>
          </div>
          <span className="text-xs text-text-muted">{pending.companyName}</span>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-secondary">Rating</label>
          <StarRating rating={rating} onRate={setRating} size="lg" />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-secondary">
            Comment <span className="text-text-muted">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              pending.role === "student"
                ? "Share your internship experience..."
                : "Comment on the student's performance..."
            }
            rows={4}
            className="w-full rounded-lg border border-surface-sand bg-surface-cream p-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-coffee-warm"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-status-danger">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-surface-sand bg-surface-cream px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-sand"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 rounded-lg bg-coffee-dark px-4 py-2.5 text-sm font-medium text-surface-cream transition-colors hover:bg-coffee-warm disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

type Tab = "pending" | "received" | "written";

export default function ReviewsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("pending");
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [writtenReviews, setWrittenReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<PendingReview | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  const fetchAll = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, receivedRes, writtenRes, ratingRes] = await Promise.all([
        api.get("/api/reviews/pending", { headers }),
        api.get("/api/reviews/received", { headers }),
        api.get("/api/reviews/my", { headers }),
        api.get(`/api/reviews/user/${user.id}/rating`),
      ]);
      setPendingReviews(pendingRes.data.data);
      setReceivedReviews(receivedRes.data.data);
      setWrittenReviews(writtenRes.data.data);
      setRatingStats(ratingRes.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmitReview = async (applicationId: string, rating: number, comment: string) => {
    await api.post(
      "/api/reviews",
      { applicationId, rating, comment: comment || undefined },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setReviewTarget(null);
    fetchAll();
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pendingReviews.length },
    { key: "received", label: "Received", count: receivedReviews.length },
    { key: "written", label: "Written", count: writtenReviews.length },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface-cream px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-coffee-dark">Reviews &amp; Ratings</h1>
          <p className="text-sm text-text-muted">
            {user.role === "student"
              ? "Rate your internship experiences and see feedback from companies"
              : "Rate student performance and see reviews from interns"}
          </p>
        </div>

        {/* Rating summary */}
        <div className="mb-8 flex items-center gap-6 rounded-card border border-surface-sand bg-surface-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-coffee-dark">
              {ratingStats.average > 0 ? ratingStats.average.toFixed(1) : "—"}
            </p>
            <StarRating rating={Math.round(ratingStats.average)} size="sm" />
            <p className="mt-1 text-xs text-text-muted">
              {ratingStats.count} {ratingStats.count === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="h-12 w-px bg-surface-sand" />
          <div className="flex-1">
            <p className="text-sm text-text-secondary">
              {ratingStats.count === 0
                ? "No reviews yet. Complete internships to start building your profile."
                : `Your overall rating based on ${ratingStats.count} review${ratingStats.count !== 1 ? "s" : ""}.`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-surface-white p-1 border border-surface-sand">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-coffee-dark text-surface-cream shadow-sm"
                  : "text-text-secondary hover:bg-surface-cream"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                    tab === t.key
                      ? "bg-surface-cream/20 text-surface-cream"
                      : "bg-surface-sand text-text-muted"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-coffee-warm border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Pending tab */}
            {tab === "pending" && (
              <div className="space-y-3">
                {pendingReviews.length === 0 ? (
                  <EmptyState
                    icon={<HiOutlineCheckCircle className="h-12 w-12 text-status-success/40" />}
                    title="All caught up!"
                    description="No pending reviews. Reviews become available after an internship is validated."
                  />
                ) : (
                  pendingReviews.map((p) => (
                    <div
                      key={p.applicationId}
                      className="flex items-center justify-between rounded-card border border-surface-sand bg-surface-white p-5 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <HiOutlineClock className="h-4 w-4 text-status-warning" />
                          <span className="text-sm font-medium text-coffee-dark">
                            {p.offerTitle}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{p.companyName}</p>
                      </div>
                      <button
                        onClick={() => setReviewTarget(p)}
                        className="flex items-center gap-1.5 rounded-lg bg-coffee-dark px-4 py-2 text-sm font-medium text-surface-cream transition-colors hover:bg-coffee-warm"
                      >
                        <HiOutlinePencilAlt className="h-4 w-4" />
                        Review
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Received tab */}
            {tab === "received" && (
              <div className="space-y-3">
                {receivedReviews.length === 0 ? (
                  <EmptyState
                    icon={<HiOutlineStar className="h-12 w-12 text-amber-400/40" />}
                    title="No reviews yet"
                    description="Reviews will appear here once others review your work."
                  />
                ) : (
                  receivedReviews.map((r) => (
                    <ReviewCard key={r.id} review={r} currentUserId={user.id} />
                  ))
                )}
              </div>
            )}

            {/* Written tab */}
            {tab === "written" && (
              <div className="space-y-3">
                {writtenReviews.length === 0 ? (
                  <EmptyState
                    icon={<HiOutlinePencilAlt className="h-12 w-12 text-text-muted/30" />}
                    title="No reviews written"
                    description="After completing internships, you can review your experience here."
                  />
                ) : (
                  writtenReviews.map((r) => (
                    <ReviewCard key={r.id} review={r} currentUserId={user.id} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <WriteReviewModal
          pending={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}

/* ── Empty State ── */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <h3 className="mt-4 text-base font-medium text-coffee-dark">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-text-muted">{description}</p>
    </div>
  );
}

/* ── Time Helper ── */

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
