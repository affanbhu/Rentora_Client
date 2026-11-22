
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
  status: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, isPending } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/bookings/my-bookings`,
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
  }, [session, isPending]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setActionError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/bookings/${bookingId}/cancel`,
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
    <>

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

              <div className="space-y-5">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm text-gray-500">
                          Equipment
                        </p>

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
                        <p className="text-sm text-gray-500">
                          Start Date
                        </p>
                        <p className="mt-1 font-semibold text-[#172033]">
                          {formatDate(booking.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          End Date
                        </p>
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

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm text-gray-500">
                          Daily Rate: {formatPrice(booking.dailyRate)}
                        </p>
                        <p className="mt-1 text-xl font-bold text-[#f47735]">
                          Total: {formatPrice(booking.totalPrice)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={`/equipment/${booking.equipmentSlug}`}
                          className="inline-block rounded-lg border border-[#172033] px-5 py-3 text-center font-semibold text-[#172033] transition hover:bg-[#172033] hover:text-white"
                        >
                          View Equipment
                        </Link>

                        {booking.status.toLowerCase() === "pending" && (
                          <button
                            onClick={() =>
                              handleCancelBooking(booking._id)
                            }
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
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
