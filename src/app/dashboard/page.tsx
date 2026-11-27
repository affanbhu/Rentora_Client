"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  status: string;
  paymentStatus?: string;
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date: string) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/bookings/my-bookings`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load your bookings."
          );
        }

        if (active) {
          setBookings(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your bookings."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBookings();

    return () => {
      active = false;
    };
  }, [session, isPending, router]);

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "paid"
  );

  const recentBookings = bookings.slice(0, 5);

  if (isPending || loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-20">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-4 h-8 w-64 rounded bg-gray-200" />
          <div className="mb-10 h-4 w-80 rounded bg-gray-200" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl bg-gray-200"
              />
            ))}
          </div>
          <div className="mt-8 h-72 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Redirecting to sign in...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10 text-gray-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="mb-9 flex flex-col justify-between gap-5 rounded-3xl bg-gray-950 p-7 text-white shadow-xl sm:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Customer Dashboard
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {session.user.name || "Customer"}!
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300">
              Manage your equipment rentals, track booking requests, and
              keep your rental activity organized in one place.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-gray-950 transition hover:bg-amber-300"
          >
            Browse Equipment <span className="ml-2">→</span>
          </Link>
        </section>

        {error && (
          <div className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Could not load your booking information
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        <section className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Bookings
            </p>
            <p className="mt-3 text-3xl font-black">{bookings.length}</p>
            <p className="mt-2 text-xs text-gray-400">
              All your rental requests
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Pending Requests
            </p>
            <p className="mt-3 text-3xl font-black text-amber-600">
              {pendingBookings.length}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Waiting for owner response
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Confirmed Rentals
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {confirmedBookings.length}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Approved rental bookings
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Completed Rentals
            </p>
            <p className="mt-3 text-3xl font-black text-blue-600">
              {completedBookings.length}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Successfully completed
            </p>
          </div>
        </section>

        <section className="mb-9 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Recent Bookings</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest equipment rental activity
                </p>
              </div>
              <Link
                href="/my-bookings"
                className="text-sm font-bold text-amber-700 transition hover:text-amber-800"
              >
                View all bookings →
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
                  🚜
                </div>
                <h3 className="font-bold">No bookings yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Find the equipment you need and make your first booking.
                </p>
                <Link
                  href="/equipment"
                  className="mt-5 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Explore Equipment
                </Link>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                      <th className="pb-4 pr-4 font-semibold">Equipment</th>
                      <th className="pb-4 pr-4 font-semibold">Rental Dates</th>
                      <th className="pb-4 pr-4 font-semibold">Amount</th>
                      <th className="pb-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-bold text-gray-900">
                            {booking.equipmentName || "Equipment"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {booking.quantity || 1} unit(s)
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-gray-600">
                          <p>{formatDate(booking.startDate)}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            to {formatDate(booking.endDate)}
                          </p>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-gray-800">
                          {formatCurrency(booking.totalPrice)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status || "Unknown"}
                          </span>
                          <p className="mt-2 text-xs capitalize text-gray-400">
                            Payment: {booking.paymentStatus || "unpaid"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">Rental Overview</h2>
            <p className="mt-1 text-sm text-gray-500">
              A quick look at your activity
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Paid Bookings</span>
                  <span className="font-bold">{paidBookings.length}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        bookings.length
                          ? (paidBookings.length / bookings.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Total Rental Value
                </p>
                <p className="mt-2 text-2xl font-black">
                  {formatCurrency(
                    bookings.reduce(
                      (total, booking) =>
                        total + (Number(booking.totalPrice) || 0),
                      0
                    )
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Across all your bookings
                </p>
              </div>

              <Link
                href="/favorites"
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-sm font-bold transition hover:border-amber-400 hover:bg-amber-50"
              >
                <span>My Favorite Equipment</span>
                <span className="text-amber-600">→</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-sm font-bold transition hover:border-amber-400 hover:bg-amber-50"
              >
                <span>Manage My Profile</span>
                <span className="text-amber-600">→</span>
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
