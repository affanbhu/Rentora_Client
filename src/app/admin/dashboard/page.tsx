
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type DashboardData = {
  stats: {
    totalUsers: number;
    totalCustomers: number;
    totalOwners: number;
    totalEquipment: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    paidBookings: number;
  };
  recentUsers: {
    _id: string;
    name?: string;
    email: string;
    role?: string;
  }[];
  recentBookings: {
    _id: string;
    userName?: string;
    equipmentName?: string;
    totalPrice?: number;
    status?: string;
    paymentStatus?: string;
  }[];
  recentEquipment: {
    _id: string;
    name: string;
    category?: string;
    dailyRate?: number;
    availability?: string;
  }[];
};

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const profileResponse = await fetch(`${API_URL}/api/profile/me`, {
          credentials: "include",
        });

        if (!profileResponse.ok) {
          throw new Error("Unable to verify your account.");
        }

        const profileResult = await profileResponse.json();
        const role = profileResult.user?.role || "customer";

        if (role !== "admin") {
          router.replace(
            role === "owner" ? "/owner/dashboard" : "/dashboard"
          );
          return;
        }

        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load admin dashboard.");
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-600 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-black px-5 py-2 text-white"
        >
          Try Again
        </button>
      </main>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "Total Users", value: data.stats.totalUsers },
    { label: "Customers", value: data.stats.totalCustomers },
    { label: "Owners", value: data.stats.totalOwners },
    { label: "Total Equipment", value: data.stats.totalEquipment },
    { label: "Total Bookings", value: data.stats.totalBookings },
    { label: "Pending Bookings", value: data.stats.pendingBookings },
    { label: "Confirmed Bookings", value: data.stats.confirmedBookings },
    { label: "Paid Bookings", value: data.stats.paidBookings },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Rentora Administration
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and monitor your Rentora platform.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-100"
          >
            Back to Home
          </Link>
        </div>

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Recent Users
          </h2>

          {data.recentUsers.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((user) => (
                    <tr key={user._id} className="border-b last:border-0">
                      <td className="py-4 pr-4 font-medium">
                        {user.name || "N/A"}
                      </td>
                      <td className="py-4 pr-4">{user.email}</td>
                      <td className="py-4 capitalize">
                        {user.role || "customer"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Recent Bookings
          </h2>

          {data.recentBookings.length === 0 ? (
            <p className="text-gray-500">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Equipment</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking) => (
                    <tr key={booking._id} className="border-b last:border-0">
                      <td className="py-4 pr-4">
                        {booking.userName || "N/A"}
                      </td>
                      <td className="py-4 pr-4">
                        {booking.equipmentName || "N/A"}
                      </td>
                      <td className="py-4 pr-4">
                        ৳{booking.totalPrice ?? 0}
                      </td>
                      <td className="py-4 pr-4 capitalize">
                        {booking.status || "N/A"}
                      </td>
                      <td className="py-4 capitalize">
                        {booking.paymentStatus || "Unpaid"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Recent Equipment
          </h2>

          {data.recentEquipment.length === 0 ? (
            <p className="text-gray-500">No equipment found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentEquipment.map((equipment) => (
                <div
                  key={equipment._id}
                  className="rounded-lg border border-gray-200 p-5"
                >
                  <h3 className="font-semibold text-gray-900">
                    {equipment.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {equipment.category || "Uncategorized"}
                  </p>
                  <p className="mt-3 font-semibold">
                    ৳{equipment.dailyRate ?? 0} / day
                  </p>
                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {equipment.availability || "Availability not specified"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
