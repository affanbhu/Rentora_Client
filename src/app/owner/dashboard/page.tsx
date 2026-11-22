"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface Equipment {
  _id: string;
  slug: string;
  name: string;
  category: string;
  dailyRate: number;
  availability: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface Booking {
  _id: string;
  userName: string;
  userEmail: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function OwnerDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingActionId, setBookingActionId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      setLoading(false);
      return;
    }

    const fetchOwnerDashboard = async () => {
      try {
        const profileResponse = await fetch(
          `${API_URL}/api/profile/me`,
          { credentials: "include" }
        );

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok || !profileResult.success) {
          throw new Error(
            profileResult.message || "Unable to load your profile."
          );
        }

        if (profileResult.user.role !== "owner") {
          router.replace("/dashboard");
          return;
        }

        setProfile(profileResult.user);

        const [equipmentResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_URL}/api/owner/equipment`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/owner/bookings`, {
            credentials: "include",
          }),
        ]);

        const equipmentResult = await equipmentResponse.json();
        const bookingsResult = await bookingsResponse.json();

        if (!equipmentResponse.ok || !equipmentResult.success) {
          throw new Error(
            equipmentResult.message || "Unable to load your equipment."
          );
        }

        if (!bookingsResponse.ok || !bookingsResult.success) {
          throw new Error(
            bookingsResult.message || "Unable to load rental requests."
          );
        }

        setEquipment(equipmentResult.data || []);
        setBookings(bookingsResult.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load owner dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDashboard();
  }, [session, isPending, router]);

  const handleBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "rejected"
  ) => {
    try {
      setBookingActionId(bookingId);
      setBookingMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/owner/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update booking.");
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status }
            : booking
        )
      );

      setBookingMessage(
        status === "confirmed"
          ? "Booking request accepted successfully."
          : "Booking request rejected successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setBookingActionId("");
    }
  };

  const availableCount = equipment.filter(
    (item) => item.availability.toLowerCase() === "available"
  ).length;

  const unavailableCount = equipment.length - availableCount;

  const categoriesCount = new Set(
    equipment.map((item) => item.category)
  ).size;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const formatPrice = (price: number) =>
    `৳${price.toLocaleString("en-BD")}`;

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-500">
          Loading your owner dashboard...
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
            Owner Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Welcome back, {profile?.name || "Owner"}!
          </h1>

          <p className="mt-3 max-w-xl text-gray-300">
            Manage your equipment, monitor availability, and keep
            track of your rental business from one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/owner/add-equipment"
              className="inline-block rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white transition hover:bg-[#df6428]"
            >
              + Add Equipment
            </Link>

            <Link
              href="/equipment"
              className="inline-block rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Browse Equipment →
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {bookingMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {bookingMessage}
          </div>
        )}

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Equipment",
              value: equipment.length,
              icon: "🚜",
              color: "bg-blue-50",
            },
            {
              title: "Available Equipment",
              value: availableCount,
              icon: "✓",
              color: "bg-green-50",
            },
            {
              title: "Unavailable Equipment",
              value: unavailableCount,
              icon: "⏳",
              color: "bg-yellow-50",
            },
            {
              title: "Categories",
              value: categoriesCount,
              icon: "📦",
              color: "bg-purple-50",
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

        <section className="mb-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/equipment"
            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">🚜</div>
            <h2 className="mt-4 text-lg font-bold text-[#172033]">
              Browse Equipment
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Explore the equipment available on Rentora.
            </p>
            <p className="mt-4 font-semibold text-[#f47735]">
              Explore Now →
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
              View your owner account information.
            </p>
            <p className="mt-4 font-semibold text-[#f47735]">
              View Profile →
            </p>
          </Link>
        </section>

        {/* Rental Requests */}
        <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#172033]">
                Rental Requests
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage booking requests from customers.
              </p>
            </div>

            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-[#f47735]">
              {pendingBookings} Pending
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center">
              <p className="text-3xl">📋</p>
              <h3 className="mt-3 font-bold text-[#172033]">
                No rental requests yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Customer booking requests for your equipment will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#172033]">
                        {booking.equipmentName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Booking ID: {booking._id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : booking.status === "cancelled"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Customer
                      </p>
                      <p className="mt-1 font-semibold text-[#172033]">
                        {booking.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.userEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Rental Period
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#172033]">
                        {formatDate(booking.startDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        to {formatDate(booking.endDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Rental Details
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {booking.totalDays} day(s)
                      </p>
                      <p className="text-lg font-extrabold text-[#f47735]">
                        {formatPrice(booking.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {booking.status === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleBookingStatus(booking._id, "confirmed")
                        }
                        disabled={bookingActionId === booking._id}
                        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {bookingActionId === booking._id
                          ? "Please wait..."
                          : "Accept Request"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleBookingStatus(booking._id, "rejected")
                        }
                        disabled={bookingActionId === booking._id}
                        className="rounded-lg bg-red-100 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* My Equipment */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#172033]">
              My Equipment
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Equipment currently assigned to your owner account.
            </p>
          </div>

          {equipment.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center">
              <p className="text-gray-500">
                You haven't added any equipment yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {equipment.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#172033]">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.category}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.availability.toLowerCase() === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    📍 {item.location}
                  </p>

                  <p className="mt-3 text-lg font-extrabold text-[#f47735]">
                    {formatPrice(item.dailyRate)}
                    <span className="text-sm font-normal text-gray-500">
                      {" "} / day
                    </span>
                  </p>

                  <Link
                    href={`/equipment/${item.slug}`}
                    className="mt-4 inline-block font-semibold text-[#172033] hover:text-[#f47735]"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
