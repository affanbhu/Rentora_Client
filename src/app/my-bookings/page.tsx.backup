
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

interface Booking {
  _id: string;
  equipmentSlug: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalPrice: number;
  quantity?: number;
  phone?: string;
  deliveryAddress?: string;
  notes?: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, isPending } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [retryingId, setRetryingId] = useState("");

  const [reviewBookingId, setReviewBookingId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/bookings/my-bookings`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load bookings.");
        }

        setBookings(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, isPending, API_URL]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to cancel booking.");
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setCancellingId("");
    }
  };

  const handleRetryPayment = async (bookingId: string) => {
    setRetryingId(bookingId);
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingId }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to restart payment.");
      }

      const checkoutUrl = result.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to restart payment."
      );
      setRetryingId("");
    }
  };

  const handleReviewSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    bookingId: string
  ) => {
    event.preventDefault();

    setReviewError("");
    setReviewMessage("");

    if (reviewComment.trim().length < 10) {
      setReviewError("Your review must be at least 10 characters.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookingId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your review.");
      }

      setReviewedBookingIds((current) => [...current, bookingId]);
      setReviewBookingId("");
      setReviewRating(5);
      setReviewComment("");
      setReviewMessage("Your review was submitted successfully.");
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString("en-BD")}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#f47735]">
            Your rental activity
          </p>

          <h1 className="text-3xl font-bold text-[#172033] md:text-4xl">
            My Bookings
          </h1>

          <p className="mt-3 text-gray-500">
            View and track all your equipment rental requests.
          </p>
        </div>

        {isPending || loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        ) : !session ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#172033]">
              Please sign in
            </h2>
            <p className="mt-2 text-gray-500">
              Sign in to view your rental bookings.
            </p>
            <Link
              href="/signin"
              className="mt-6 inline-block rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Sign In
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#172033] px-6 py-3 text-white"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mb-4 text-5xl">📦</div>
            <h2 className="text-xl font-bold text-[#172033]">
              No bookings yet
            </h2>
            <p className="mt-2 text-gray-500">
              You haven't submitted any rental requests.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Explore Equipment
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total bookings</p>
              <p className="mt-1 text-3xl font-bold text-[#172033]">
                {bookings.length}
              </p>
            </div>

            {actionError && (
              <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {actionError}
              </div>
            )}

            {reviewMessage && (
              <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {reviewMessage}
              </div>
            )}

            <div className="space-y-5">
              {bookings.map((booking) => {
                const eligible =
                  booking.status?.toLowerCase() === "confirmed" &&
                  booking.paymentStatus?.toLowerCase() === "paid";

                const alreadyReviewed = reviewedBookingIds.includes(
                  booking._id
                );

                return (
                  <div
                    key={booking._id}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm text-gray-500">Equipment</p>
                        <h2 className="mt-1 text-xl font-bold text-[#172033]">
                          {booking.equipmentName}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Booking ID: {booking._id}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="my-6 grid grid-cols-1 gap-5 border-y border-gray-100 py-5 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="mt-1 font-semibold text-[#172033]">
                          {formatDate(booking.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="mt-1 font-semibold text-[#172033]">
                          {formatDate(booking.endDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Rental Duration
                        </p>
                        <p className="mt-1 font-semibold text-[#172033]">
                          {booking.totalDays} days
                        </p>
                      </div>
                    </div>

                    {(booking.phone || booking.deliveryAddress || booking.notes) && (
                      <div className="mb-6 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                        {booking.quantity !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="mt-1 font-semibold text-[#172033]">{booking.quantity}</p>
                          </div>
                        )}
                        {booking.phone && (
                          <div>
                            <p className="text-sm text-gray-500">Contact Phone</p>
                            <p className="mt-1 font-semibold text-[#172033]">{booking.phone}</p>
                          </div>
                        )}
                        {booking.deliveryAddress && (
                          <div className="sm:col-span-2">
                            <p className="text-sm text-gray-500">Delivery Address</p>
                            <p className="mt-1 font-semibold text-[#172033]">{booking.deliveryAddress}</p>
                          </div>
                        )}
                        {booking.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-sm text-gray-500">Additional Notes</p>
                            <p className="mt-1 text-[#172033]">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Daily Rate: {formatPrice(booking.dailyRate)}
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#f47735]">
                          Total: {formatPrice(booking.totalPrice)}
                        </p>
                        <p className="mt-1 text-sm capitalize text-gray-500">
                          Payment: {booking.paymentStatus || "Unpaid"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        {booking.status.toLowerCase() === "pending" &&
                          booking.paymentStatus?.toLowerCase() !== "paid" && (
                            <button
                              onClick={() => handleRetryPayment(booking._id)}
                              disabled={retryingId === booking._id}
                              className="rounded-lg bg-[#f47735] px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {retryingId === booking._id
                                ? "Redirecting..."
                                : "Pay Now / Retry Payment"}
                            </button>
                          )}

                        <Link
                          href={`/equipment/${booking.equipmentSlug}`}
                          className="inline-block rounded-lg border border-[#172033] px-5 py-3 text-center font-semibold text-[#172033] transition hover:bg-[#172033] hover:text-white"
                        >
                          View Equipment
                        </Link>

                        {booking.status.toLowerCase() === "pending" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingId === booking._id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </button>
                        )}
                      </div>
                    </div>

                    {eligible && !alreadyReviewed && (
                      <div className="mt-6 border-t border-gray-100 pt-6">
                        {reviewBookingId === booking._id ? (
                          <form
                            onSubmit={(event) =>
                              handleReviewSubmit(event, booking._id)
                            }
                            className="space-y-4"
                          >
                            <h3 className="text-lg font-bold text-[#172033]">
                              Write a Review
                            </h3>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Your Rating
                              </label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    aria-label={`${star} star rating`}
                                    className={`text-3xl ${
                                      star <= reviewRating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor={`review-${booking._id}`}
                                className="mb-2 block text-sm font-semibold text-gray-700"
                              >
                                Your Review
                              </label>
                              <textarea
                                id={`review-${booking._id}`}
                                value={reviewComment}
                                onChange={(event) =>
                                  setReviewComment(event.target.value)
                                }
                                minLength={10}
                                maxLength={1000}
                                rows={4}
                                required
                                placeholder="Share your experience with this equipment..."
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#f47735]"
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                Minimum 10 characters. Maximum 1000.
                              </p>
                            </div>

                            {reviewError && (
                              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {reviewError}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-3">
                              <button
                                type="submit"
                                disabled={reviewLoading}
                                className="rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                              >
                                {reviewLoading
                                  ? "Submitting..."
                                  : "Submit Review"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReviewBookingId("");
                                  setReviewError("");
                                }}
                                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setReviewBookingId(booking._id);
                              setReviewError("");
                              setReviewMessage("");
                            }}
                            className="rounded-lg bg-orange-50 px-5 py-3 font-semibold text-[#f47735] hover:bg-orange-100"
                          >
                            ★ Write a Review
                          </button>
                        )}
                      </div>
                    )}

                    {alreadyReviewed && (
                      <p className="mt-6 border-t border-gray-100 pt-5 text-sm font-semibold text-green-700">
                        ✓ You have reviewed this booking.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
