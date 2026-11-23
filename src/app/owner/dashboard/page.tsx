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
  quantity?: number;
  phone?: string;
  deliveryAddress?: string;
  notes?: string;
  status: string;
}

interface OwnerAnalytics {
  stats: {
    totalBookings: number;
    totalListedEquipment: number;
    completedRentals: number;
    paidBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    totalEarnings: number;
    averageBookingValue: number;
  };
  monthlyRevenue: {
    month: string;
    year: number;
    revenue: number;
  }[];
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
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingActionId, setBookingActionId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [equipmentActionId, setEquipmentActionId] = useState("");
  const [equipmentMessage, setEquipmentMessage] = useState("");

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

        const [
          equipmentResponse,
          bookingsResponse,
          analyticsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/owner/equipment`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/owner/bookings`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/owner/analytics`, {
            credentials: "include",
          }),
        ]);

        const equipmentResult = await equipmentResponse.json();
        const bookingsResult = await bookingsResponse.json();
        const analyticsResult = await analyticsResponse.json();

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

        if (!analyticsResponse.ok || !analyticsResult.success) {
          throw new Error(
            analyticsResult.message || "Unable to load business analytics."
          );
        }

        setEquipment(equipmentResult.data || []);
        setBookings(bookingsResult.data || []);
        setAnalytics(analyticsResult);
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

  const handleDeleteEquipment = async (equipmentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setEquipmentActionId(equipmentId);
      setEquipmentMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/owner/equipment/${equipmentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete equipment.");
      }

      setEquipment((previous) =>
        previous.filter((item) => item._id !== equipmentId)
      );

      setEquipmentMessage("Equipment deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete equipment."
      );
    } finally {
      setEquipmentActionId("");
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

        {equipmentMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {equipmentMessage}
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

        {/* Business Analytics */}
        <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#f47735]">
              Business Performance
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#172033]">
              Business Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your bookings, successful payments, and rental revenue.
            </p>
          </div>

          {analytics ? (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Total Bookings",
                    value: analytics.stats.totalBookings,
                    icon: "📋",
                  },
                  {
                    title: "Total Listed Equipment",
                    value: analytics.stats.totalListedEquipment,
                    icon: "🚜",
                  },
                  {
                    title: "Completed Rentals",
                    value: analytics.stats.completedRentals,
                    icon: "✅",
                  },
                  {
                    title: "Paid Bookings",
                    value: analytics.stats.paidBookings,
                    icon: "✓",
                  },
                  {
                    title: "Pending Bookings",
                    value: analytics.stats.pendingBookings,
                    icon: "⏳",
                  },
                  {
                    title: "Confirmed Bookings",
                    value: analytics.stats.confirmedBookings,
                    icon: "📅",
                  },
                  {
                    title: "Total Earnings",
                    value: formatPrice(analytics.stats.totalEarnings),
                    icon: "৳",
                  },
                  {
                    title: "Average Booking Value",
                    value: formatPrice(analytics.stats.averageBookingValue),
                    icon: "📈",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      {item.title}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-[#172033]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-7">
                <h3 className="text-lg font-bold text-[#172033]">
                  Monthly Revenue
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Revenue from successfully paid bookings over the last 12 months.
                </p>

                <div className="mt-6 space-y-4">
                  {analytics.monthlyRevenue.map((item, index) => {
                    const maximumRevenue = Math.max(
                      ...analytics.monthlyRevenue.map((month) => month.revenue),
                      1
                    );

                    const barWidth =
                      item.revenue > 0
                        ? Math.max((item.revenue / maximumRevenue) * 100, 2)
                        : 0;

                    return (
                      <div
                        key={`${item.year}-${item.month}-${index}`}
                        className="grid grid-cols-[75px_1fr_auto] items-center gap-3"
                      >
                        <span className="text-sm font-medium text-gray-600">
                          {item.month} {item.year}
                        </span>

                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#f47735] transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        <span className="min-w-[65px] text-right text-sm font-semibold text-[#172033]">
                          {formatPrice(item.revenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
              Business analytics are not available yet.
            </p>
          )}
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

                  {(booking.phone || booking.deliveryAddress || booking.notes) && (
                    <div className="mt-5 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                      {booking.quantity !== undefined && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Quantity</p>
                          <p className="mt-1 font-semibold text-[#172033]">{booking.quantity}</p>
                        </div>
                      )}
                      {booking.phone && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact Phone</p>
                          <p className="mt-1 font-semibold text-[#172033]">{booking.phone}</p>
                        </div>
                      )}
                      {booking.deliveryAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery Address</p>
                          <p className="mt-1 text-sm text-[#172033]">{booking.deliveryAddress}</p>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Customer Notes</p>
                          <p className="mt-1 text-sm text-[#172033]">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

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

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/equipment/${item.slug}`}
                      className="font-semibold text-[#172033] hover:text-[#f47735]"
                    >
                      View Details →
                    </Link>

                    <Link
                      href={`/owner/edit-equipment/${item._id}`}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteEquipment(item._id)}
                      disabled={equipmentActionId === item._id}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {equipmentActionId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
