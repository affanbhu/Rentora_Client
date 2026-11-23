
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

type PendingEquipment = {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  dailyRate?: number;
  location?: string;
  imageUrl?: string;
  ownerName?: string;
  ownerEmail?: string;
  approvalStatus: string;
};

function AnalyticsBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.min(100, (value / total) * 100) : 0;

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [pendingEquipment, setPendingEquipment] = useState<PendingEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");
  const [equipmentError, setEquipmentError] = useState("");
  const [equipmentMessage, setEquipmentMessage] = useState("");

  const loadPendingEquipment = async () => {
    setEquipmentLoading(true);
    setEquipmentError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/equipment/pending`,
        { credentials: "include" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load pending equipment."
        );
      }

      setPendingEquipment(result.data || []);
    } catch (err) {
      setEquipmentError(
        err instanceof Error
          ? err.message
          : "Unable to load pending equipment."
      );
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleEquipmentApproval = async (
    equipmentId: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    const action = approvalStatus === "approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this equipment?`)) {
      return;
    }

    setProcessingId(equipmentId);
    setEquipmentError("");
    setEquipmentMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/equipment/${equipmentId}/approval`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approvalStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Failed to ${action} equipment.`
        );
      }

      setEquipmentMessage(
        `Equipment ${approvalStatus} successfully.`
      );

      await loadPendingEquipment();
    } catch (err) {
      setEquipmentError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setProcessingId("");
    }
  };

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
          throw new Error(
            result.message || "Failed to load admin dashboard."
          );
        }

        if (!cancelled) {
          setData(result);
        }

        const pendingResponse = await fetch(
          `${API_URL}/api/admin/equipment/pending`,
          { credentials: "include" }
        );

        const pendingResult = await pendingResponse.json();

        if (!pendingResponse.ok || !pendingResult.success) {
          throw new Error(
            pendingResult.message || "Failed to load pending equipment."
          );
        }

        if (!cancelled) {
          setPendingEquipment(pendingResult.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
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
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-center text-red-600">{error}</p>
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

  const otherUsers = Math.max(
    0,
    data.stats.totalUsers -
      data.stats.totalCustomers -
      data.stats.totalOwners
  );

  const otherBookings = Math.max(
    0,
    data.stats.totalBookings -
      data.stats.pendingBookings -
      data.stats.confirmedBookings
  );

  const unpaidBookings = Math.max(
    0,
    data.stats.totalBookings - data.stats.paidBookings
  );

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

        {/* Equipment Approval */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Equipment Approval
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review equipment submitted by owners before publishing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                {pendingEquipment.length} Pending
              </span>

              <button
                type="button"
                onClick={loadPendingEquipment}
                disabled={equipmentLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                {equipmentLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {equipmentMessage && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {equipmentMessage}
            </p>
          )}

          {equipmentError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {equipmentError}
            </p>
          )}

          {equipmentLoading && pendingEquipment.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Loading pending equipment...
            </p>
          ) : pendingEquipment.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-4 py-10 text-center">
              <p className="font-semibold text-gray-700">
                No pending equipment
              </p>
              <p className="mt-1 text-sm text-gray-500">
                All submitted equipment has been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {pendingEquipment.map((equipment) => (
                <article
                  key={equipment._id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  {equipment.imageUrl && (
                    <img
                      src={equipment.imageUrl}
                      alt={equipment.name}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {equipment.name}
                      </h3>
                      <span className="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold capitalize text-yellow-800">
                        {equipment.approvalStatus}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {equipment.category || "Uncategorized"}
                      {equipment.location
                        ? ` · ${equipment.location}`
                        : ""}
                    </p>

                    <p className="mt-3 font-bold text-gray-900">
                      ৳{equipment.dailyRate ?? 0} / day
                    </p>

                    <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                      <p>
                        Owner: {equipment.ownerName || "Not provided"}
                      </p>
                      <p className="mt-1 break-all">
                        Email: {equipment.ownerEmail || "Not provided"}
                      </p>
                    </div>

                    {equipment.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-gray-500">
                        {equipment.description}
                      </p>
                    )}

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleEquipmentApproval(
                            equipment._id,
                            "approved"
                          )
                        }
                        disabled={processingId === equipment._id}
                        className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === equipment._id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEquipmentApproval(
                            equipment._id,
                            "rejected"
                          )
                        }
                        disabled={processingId === equipment._id}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === equipment._id
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Analytics Overview */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Visual breakdown of users, bookings, and payments.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                User Composition
              </h3>
              <AnalyticsBar
                label="Customers"
                value={data.stats.totalCustomers}
                total={data.stats.totalUsers}
              />
              <AnalyticsBar
                label="Owners"
                value={data.stats.totalOwners}
                total={data.stats.totalUsers}
              />
              <AnalyticsBar
                label="Other Accounts"
                value={otherUsers}
                total={data.stats.totalUsers}
              />
              <p className="mt-5 border-t pt-4 text-sm text-gray-500">
                Total registered users:{" "}
                <strong className="text-gray-900">
                  {data.stats.totalUsers}
                </strong>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Booking Status
              </h3>
              <AnalyticsBar
                label="Pending"
                value={data.stats.pendingBookings}
                total={data.stats.totalBookings}
              />
              <AnalyticsBar
                label="Confirmed"
                value={data.stats.confirmedBookings}
                total={data.stats.totalBookings}
              />
              <AnalyticsBar
                label="Other / Cancelled"
                value={otherBookings}
                total={data.stats.totalBookings}
              />
              <p className="mt-5 border-t pt-4 text-sm text-gray-500">
                Total bookings:{" "}
                <strong className="text-gray-900">
                  {data.stats.totalBookings}
                </strong>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Payment Overview
              </h3>
              <AnalyticsBar
                label="Paid Bookings"
                value={data.stats.paidBookings}
                total={data.stats.totalBookings}
              />
              <AnalyticsBar
                label="Unpaid Bookings"
                value={unpaidBookings}
                total={data.stats.totalBookings}
              />
              <p className="mt-5 border-t pt-4 text-sm text-gray-500">
                Paid bookings:{" "}
                <strong className="text-gray-900">
                  {data.stats.paidBookings}
                </strong>
              </p>
            </div>
          </div>
        </section>

        {/* Recent Users */}
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

        {/* Recent Bookings */}
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

        {/* Recent Equipment */}
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
