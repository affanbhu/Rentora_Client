
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getFavorites } from "@/lib/favorites";

interface Booking {
  _id: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CustomerDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [bookingResponse, profileResponse] = await Promise.all([
          fetch(`${API_URL}/api/bookings/my-bookings`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/profile/me`, {
            credentials: "include",
          }),
        ]);

        const bookingResult = await bookingResponse.json();
        const profileResult = await profileResponse.json();

        if (!bookingResponse.ok || !bookingResult.success) {
          throw new Error(
            bookingResult.message || "Unable to load bookings."
          );
        }

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.message || "Unable to load profile."
          );
        }

        setBookings(bookingResult.data || []);
        setProfile(profileResult.user);
        setFavoritesCount(getFavorites().length);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, isPending, router]);

  const pendingCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status.toLowerCase() === "confirmed"
  ).length;

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const formatPrice = (price: number) =>
    `৳${price.toLocaleString("en-BD")}`;

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 rounded-2xl bg-[#172033] p-8 text-white shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#f47735]">
            Customer Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Welcome back, {profile?.name || session.user.name || "Customer"}!
          </h1>

          <p className="mt-3 max-w-xl text-gray-300">
            Manage your equipment rentals, track bookings, and explore
            your saved equipment from one place.
          </p>

          <Link
            href="/equipment"
            className="mt-6 inline-block rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white transition hover:bg-[#df6428]"
          >
            Explore Equipment →
          </Link>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Bookings",
              value: bookings.length,
              icon: "📦",
              color: "bg-blue-50",
            },
            {
              title: "Pending Bookings",
              value: pendingCount,
              icon: "⏳",
              color: "bg-yellow-50",
            },
            {
              title: "Confirmed Bookings",
              value: confirmedCount,
              icon: "✓",
              color: "bg-green-50",
            },
            {
              title: "Favorite Equipment",
              value: favoritesCount,
              icon: "♥",
              color: "bg-red-50",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${item.color}`}
              >
                {item.icon}
              </div>

              <p className="text-sm font-medium text-gray-500">
                {item.title}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#172033]">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          <Link
            href="/my-bookings"
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">📋</div>
            <h2 className="mt-4 text-lg font-bold text-[#172033]">
              My Bookings
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              View rental requests and track booking status.
            </p>
            <p className="mt-4 font-semibold text-[#f47735]">
              View Bookings →
            </p>
          </Link>

          <Link
            href="/favorites"
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl text-red-500">♥</div>
            <h2 className="mt-4 text-lg font-bold text-[#172033]">
              My Favorites
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Find equipment you have saved.
            </p>
            <p className="mt-4 font-semibold text-[#f47735]">
              View Favorites →
            </p>
          </Link>

          <Link
            href="/profile"
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">👤</div>
            <h2 className="mt-4 text-lg font-bold text-[#172033]">
              My Profile
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              View your personal account information.
            </p>
            <p className="mt-4 font-semibold text-[#f47735]">
              View Profile →
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">
                Recent Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your latest equipment rental activity.
              </p>
            </div>

            <Link
              href="/my-bookings"
              className="font-semibold text-[#f47735] hover:underline"
            >
              View All →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center">
              <p className="text-gray-500">
                You don't have any bookings yet.
              </p>

              <Link
                href="/equipment"
                className="mt-4 inline-block font-semibold text-[#f47735]"
              >
                Browse Equipment →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-bold text-[#172033]">
                      {booking.equipmentName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {booking.startDate} – {booking.endDate}
                    </p>

                    <p className="mt-2 font-semibold text-[#f47735]">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                      booking.status.toLowerCase() === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status.toLowerCase() === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
