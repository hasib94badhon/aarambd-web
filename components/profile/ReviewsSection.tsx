"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { publicApi, api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ReviewSummary {
  total: number;
  avg_rating: number;
  distribution: { "5": number; "4": number; "3": number; "2": number; "1": number };
  top_tags: string[];
}

interface Review {
  review_id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_photo: string;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
}

interface Props {
  userId: string;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </span>
  );
}

export default function ReviewsSection({ userId }: Props) {
  const { user, isLoggedIn } = useAuthStore();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<{ rating: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isSelf = isLoggedIn && String(user?.user_id) === userId;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, revRes] = await Promise.all([
          publicApi.get("/review/summary", { params: { reviewed_id: userId } }),
          publicApi.get("/review/get", { params: { reviewed_id: userId, page: 1, page_size: 10 } }),
        ]);
        setSummary(sumRes.data);
        const raw: Review[] = revRes.data.reviews ?? [];
        const seen = new Set<number>();
        setReviews(raw.filter((r) => { if (seen.has(r.review_id)) return false; seen.add(r.review_id); return true; }));

        // Check if logged-in user already reviewed
        if (isLoggedIn && user && !isSelf) {
          const mineRes = await api.get("/review/mine", {
            params: { reviewed_id: userId, reviewer_id: user.user_id },
          });
          setMyReview(mineRes.data.review);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId, isLoggedIn, user, isSelf]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRating || !user) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/review/add", {
        reviewer_id: user.user_id,
        reviewed_id: parseInt(userId),
        rating: selectedRating,
        comment,
      });
      setSubmitSuccess(true);
      setMyReview({ rating: selectedRating });
      setSummary((prev) => {
        if (!prev) return prev;
        const key = String(selectedRating) as keyof ReviewSummary["distribution"];
        const newTotal = prev.total + 1;
        return {
          ...prev,
          total: newTotal,
          avg_rating: Math.round(((prev.avg_rating * prev.total + selectedRating) / newTotal) * 10) / 10,
          distribution: { ...prev.distribution, [key]: prev.distribution[key] + 1 },
        };
      });
      setReviews((prev) => [
        {
          review_id: Date.now(),
          reviewer_id: user.user_id,
          reviewer_name: user.name,
          reviewer_photo: "",
          rating: selectedRating,
          comment,
          tags: [],
          created_at: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Failed to submit review.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Reviews & Ratings</h2>

      {/* Summary */}
      {loading ? (
        <Skeleton className="h-28 w-full rounded-xl mb-6" />
      ) : summary && summary.total > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Average score */}
          <div className="flex-shrink-0 text-center">
            <div className="text-4xl font-extrabold text-gray-900">{summary.avg_rating.toFixed(1)}</div>
            <Stars rating={Math.round(summary.avg_rating)} size={13} />
            <p className="text-xs text-gray-400 mt-1">{summary.total} review{summary.total !== 1 ? "s" : ""}</p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((n) => {
              const count = summary.distribution[String(n) as keyof ReviewSummary["distribution"]];
              const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3 flex-shrink-0">{n}</span>
                  <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Top tags */}
      {summary && summary.top_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {summary.top_tags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-[#30337A] bg-[#6C78DF]/10 border border-[#6C78DF]/20 rounded-full px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Submit review form */}
      {!isSelf && isLoggedIn && !myReview && !submitSuccess && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-3">Leave a Review</p>
          {submitError && (
            <p className="text-xs text-red-600 mb-3">{submitError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={
                      n <= (hoverRating || selectedRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment…"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#6C78DF]/40"
            />
            <Button
              type="submit"
              disabled={!selectedRating || submitting}
              className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Submit Review
            </Button>
          </form>
        </div>
      )}

      {(myReview || submitSuccess) && (
        <div className="flex items-center gap-2 text-sm text-[#30337A] bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6">
          <CheckCircle size={16} /> You have reviewed this profile
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-gray-400 mb-6">
          <a href="/login" className="text-[#6C78DF] hover:underline">Login</a> to leave a review
        </p>
      )}

      <Separator className="mb-5" />

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewItem key={r.review_id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4">
      <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {review.reviewer_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.reviewer_photo} alt={review.reviewer_name} className="w-full h-full object-cover" />
        ) : (
          <User size={14} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{review.reviewer_name}</span>
          <Stars rating={review.rating} size={11} />
          <span className="text-xs text-gray-400 ml-auto">
            {review.created_at?.split(" ").slice(1, 4).join(" ")}
          </span>
        </div>
        {review.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {review.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-medium text-[#30337A] bg-[#6C78DF]/10 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
        {review.comment && (
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}
