"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { publicApi, api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface ReviewSummary {
  total: number;
  good_count: number;
  bad_count: number;
}

interface Review {
  review_id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_photo: string;
  rating: "good" | "bad";
  comment: string;
  created_at: string;
}

interface Props {
  userId: string;
}

export default function ReviewsSection({ userId }: Props) {
  const { user, isLoggedIn } = useAuthStore();
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<{ rating: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState<"good" | "bad" | null>(null);
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
      setSummary((prev) =>
        prev
          ? {
              total: prev.total + 1,
              good_count: selectedRating === "good" ? prev.good_count + 1 : prev.good_count,
              bad_count: selectedRating === "bad" ? prev.bad_count + 1 : prev.bad_count,
            }
          : prev
      );
      setReviews((prev) => [
        {
          review_id: Date.now(),
          reviewer_id: user.user_id,
          reviewer_name: user.name,
          reviewer_photo: "",
          rating: selectedRating,
          comment,
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

  const goodPct =
    summary && summary.total > 0
      ? Math.round((summary.good_count / summary.total) * 100)
      : 0;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Reviews & Ratings</h2>

      {/* Summary bar */}
      {loading ? (
        <Skeleton className="h-20 w-full rounded-xl mb-6" />
      ) : summary && summary.total > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-center gap-5">
          {/* Score circle */}
          <div className="flex-shrink-0 text-center">
            <div
              className={`text-4xl font-extrabold ${
                goodPct >= 70 ? "text-blue-600" : goodPct >= 40 ? "text-yellow-500" : "text-red-500"
              }`}
            >
              {goodPct}%
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Positive</p>
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all"
                  style={{ width: `${goodPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                <ThumbsUp size={11} className="inline mr-1 text-green-500" />
                {summary.good_count} good
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-400 h-full rounded-full transition-all"
                  style={{ width: `${100 - goodPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                <ThumbsDown size={11} className="inline mr-1 text-red-400" />
                {summary.bad_count} bad
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{summary.total} total reviews</p>
          </div>
        </div>
      ) : null}

      {/* Submit review form */}
      {!isSelf && isLoggedIn && !myReview && !submitSuccess && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-3">Leave a Review</p>
          {submitError && (
            <p className="text-xs text-red-600 mb-3">{submitError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedRating("good")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  selectedRating === "good"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                }`}
              >
                <ThumbsUp size={14} /> Good
              </button>
              <button
                type="button"
                onClick={() => setSelectedRating("bad")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  selectedRating === "bad"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-400"
                }`}
              >
                <ThumbsDown size={14} /> Bad
              </button>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment…"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Button
              type="submit"
              disabled={!selectedRating || submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              Submit Review
            </Button>
          </form>
        </div>
      )}

      {(myReview || submitSuccess) && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6">
          <CheckCircle size={16} /> You have reviewed this profile
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-gray-400 mb-6">
          <a href="/login" className="text-blue-600 hover:underline">Login</a> to leave a review
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
          <span
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              review.rating === "good"
                ? "bg-green-50 text-blue-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {review.rating === "good" ? (
              <ThumbsUp size={10} />
            ) : (
              <ThumbsDown size={10} />
            )}{" "}
            {review.rating}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            {review.created_at?.split(" ").slice(1, 4).join(" ")}
          </span>
        </div>
        {review.comment && (
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  );
}
