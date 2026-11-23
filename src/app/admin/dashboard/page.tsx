
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type UserRole = "customer" | "owner" | "admin";
type ApprovalStatus = "approved" | "rejected";

type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
  createdAt?: string;
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
  createdAt?: string;
};

type AdminBooking = {
  _id: string;
  userName?: string;
  userEmail?: string;
  ownerName?: string;
  equipmentName?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  dailyRate?: number;
  totalPrice?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

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
    completedBookings: number;
    totalRevenue: number;
  };
  monthlyBookings: {
    _id: { year: number; month: number };
    bookings: number;
  }[];
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingEquipment, setPendingEquipment] = useState<
    PendingEquipment[]
  >([]);
  const [allEquipment, setAllEquipment] = useState<PendingEquipment[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [allEquipmentLoading, setAllEquipmentLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatingEquipmentId, setUpdatingEquipmentId] = useState<
    string | null
  >(null);
  const [deletingAdminEquipmentId, setDeletingAdminEquipmentId] =
    useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [allEquipmentError, setAllEquipmentError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  const [roleMessage, setRoleMessage] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [adminEquipmentMessage, setAdminEquipmentMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

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

        // Load all users.
        if (!cancelled) {
          setUsersLoading(true);
        }

        try {
          const usersResponse = await fetch(
            `${API_URL}/api/admin/users`,
            {
              credentials: "include",
            }
          );

          const usersResult = await usersResponse.json();

          if (!usersResponse.ok || !usersResult.success) {
            throw new Error(
              usersResult.message || "Failed to load users."
            );
          }

          if (!cancelled) {
            setUsers(usersResult.data || []);
            setUsersError("");
          }
        } catch (err) {
          if (!cancelled) {
            setUsersError(
              err instanceof Error ? err.message : "Unable to load users."
            );
          }
        } finally {
          if (!cancelled) {
            setUsersLoading(false);
          }
        }

        // Load equipment awaiting admin approval.
        try {
          const equipmentResponse = await fetch(
            `${API_URL}/api/admin/equipment/pending`,
            {
              credentials: "include",
            }
          );

          const equipmentResult = await equipmentResponse.json();

          if (!equipmentResponse.ok || !equipmentResult.success) {
            throw new Error(
              equipmentResult.message ||
                "Failed to load pending equipment."
            );
          }

          if (!cancelled) {
            setPendingEquipment(equipmentResult.data || []);
            setPendingError("");
          }
        } catch (err) {
          if (!cancelled) {
            setPendingError(
              err instanceof Error
                ? err.message
                : "Unable to load pending equipment."
            );
          }
        } finally {
          if (!cancelled) {
            setPendingLoading(false);
          }
        }

        // Load all equipment for admin management.
        try {
          const allEquipmentResponse = await fetch(
            `${API_URL}/api/admin/equipment`,
            {
              credentials: "include",
            }
          );

          const allEquipmentResult = await allEquipmentResponse.json();

          if (!allEquipmentResponse.ok || !allEquipmentResult.success) {
            throw new Error(
              allEquipmentResult.message || "Failed to load all equipment."
            );
          }

          if (!cancelled) {
            setAllEquipment(allEquipmentResult.data || []);
            setAllEquipmentError("");
          }
        } catch (err) {
          if (!cancelled) {
            setAllEquipmentError(
              err instanceof Error
                ? err.message
                : "Unable to load all equipment."
            );
          }
        } finally {
          if (!cancelled) {
            setAllEquipmentLoading(false);
          }
        }

        // Load all rental bookings.
        try {
          const bookingsResponse = await fetch(
            `${API_URL}/api/admin/bookings`,
            {
              credentials: "include",
            }
          );

          const bookingsResult = await bookingsResponse.json();

          if (!bookingsResponse.ok || !bookingsResult.success) {
            throw new Error(
              bookingsResult.message || "Failed to load rental bookings."
            );
          }

          if (!cancelled) {
            setBookings(bookingsResult.data || []);
            setBookingsError("");
          }
        } catch (err) {
          if (!cancelled) {
            setBookingsError(
              err instanceof Error
                ? err.message
                : "Unable to load rental bookings."
            );
          }
        } finally {
          if (!cancelled) {
            setBookingsLoading(false);
          }
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

  const handleRoleChange = async (
    userId: string,
    newRole: UserRole
  ) => {
    setUpdatingUserId(userId);
    setUsersError("");
    setRoleMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update user role."
        );
      }

      const previousRole =
        users.find((user) => user._id === userId)?.role || "customer";

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      setData((previousData) => {
        if (!previousData) return previousData;

        return {
          ...previousData,
          recentUsers: previousData.recentUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          ),
          stats: {
            ...previousData.stats,
            totalCustomers:
              previousData.stats.totalCustomers +
              (newRole === "customer" ? 1 : 0) -
              (previousRole === "customer" ? 1 : 0),
            totalOwners:
              previousData.stats.totalOwners +
              (newRole === "owner" ? 1 : 0) -
              (previousRole === "owner" ? 1 : 0),
          },
        };
      });

      setRoleMessage("User role updated successfully.");
    } catch (err) {
      setUsersError(
        err instanceof Error ? err.message : "Something went wrong."
      );

      try {
        const usersResponse = await fetch(
          `${API_URL}/api/admin/users`,
          {
            credentials: "include",
          }
        );

        const usersResult = await usersResponse.json();

        if (usersResponse.ok && usersResult.success) {
          setUsers(usersResult.data || []);
        }
      } catch {
        // Keep the original error message.
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Approve or reject pending equipment.
  const handleEquipmentApproval = async (
    equipmentId: string,
    approvalStatus: ApprovalStatus
  ) => {
    const action = approvalStatus === "approved" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} this equipment?`
      )
    ) {
      return;
    }

    setUpdatingEquipmentId(equipmentId);
    setPendingError("");
    setApprovalMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/equipment/${equipmentId}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ approvalStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Failed to ${action} equipment.`
        );
      }

      setPendingEquipment((previous) =>
        previous.filter((equipment) => equipment._id !== equipmentId)
      );

      setApprovalMessage(
        result.message ||
          `Equipment ${approvalStatus} successfully.`
      );
    } catch (err) {
      setPendingError(
        err instanceof Error
          ? err.message
          : "Unable to update equipment approval."
      );
    } finally {
      setUpdatingEquipmentId(null);
    }
  };

  // Delete equipment as an administrator.
  const handleDeleteAdminEquipment = async (equipmentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this equipment?"
      )
    ) {
      return;
    }

    setDeletingAdminEquipmentId(equipmentId);
    setAllEquipmentError("");
    setAdminEquipmentMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/equipment/${equipmentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete equipment."
        );
      }

      setAllEquipment((previous) =>
        previous.filter((item) => item._id !== equipmentId)
      );

      setPendingEquipment((previous) =>
        previous.filter((item) => item._id !== equipmentId)
      );

      setAdminEquipmentMessage(
        result.message || "Equipment deleted successfully."
      );
    } catch (err) {
      setAllEquipmentError(
        err instanceof Error
          ? err.message
          : "Unable to delete equipment."
      );
    } finally {
      setDeletingAdminEquipmentId(null);
    }
  };

  // Update a pending booking as an administrator.
  const handleBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "rejected" | "cancelled"
  ) => {
    const action = status === "confirmed" ? "confirm" : status;

    if (
      !window.confirm(
        `Are you sure you want to ${action} this booking?`
      )
    ) {
      return;
    }

    setUpdatingBookingId(bookingId);
    setBookingsError("");
    setBookingMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update booking status."
        );
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status }
            : booking
        )
      );

      setBookingMessage(
        result.message || "Booking updated successfully."
      );
    } catch (err) {
      setBookingsError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

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
    { label: "Completed Rentals", value: data.stats.completedBookings },
    {
      label: "Total Revenue",
      value: `৳${data.stats.totalRevenue.toLocaleString()}`,
    },
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

  const currentUserId = session?.user?.id;

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

        {/* Dashboard Statistics */}
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

        {/* Monthly Booking Statistics */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Monthly Booking Statistics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bookings created during the last six months.
          </p>

          <div className="mt-6 space-y-4">
            {Array.from({ length: 6 }, (_, index) => {
              const date = new Date();
              date.setDate(1);
              date.setMonth(date.getMonth() - (5 - index));

              const year = date.getFullYear();
              const month = date.getMonth() + 1;

              const record = data.monthlyBookings.find(
                (item) =>
                  item._id.year === year && item._id.month === month
              );

              const count = record?.bookings || 0;
              const maximum = Math.max(
                1,
                ...data.monthlyBookings.map((item) => item.bookings)
              );

              return (
                <div key={`${year}-${month}`}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {date.toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {count} bookings
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${(count / maximum) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pending Equipment Approval */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pending Equipment Approval
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review equipment submitted by owners before publishing it.
              </p>
            </div>

            <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {pendingEquipment.length} Pending
            </span>
          </div>

          {approvalMessage && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {approvalMessage}
            </p>
          )}

          {pendingError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {pendingError}
            </p>
          )}

          {pendingLoading ? (
            <p className="py-6 text-center text-gray-500">
              Loading pending equipment...
            </p>
          ) : pendingEquipment.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="font-semibold text-gray-700">
                No pending equipment
              </p>
              <p className="mt-2 text-sm text-gray-500">
                All submitted equipment has been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {pendingEquipment.map((equipment) => {
                const isUpdating =
                  updatingEquipmentId === equipment._id;

                return (
                  <article
                    key={equipment._id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    {equipment.imageUrl ? (
                      <img
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        className="h-52 w-full bg-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
                        No equipment image
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {equipment.name}
                        </h3>
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-700">
                          {equipment.approvalStatus}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {equipment.category || "Uncategorized"}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {equipment.description || "No description provided."}
                      </p>

                      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                        <p className="text-gray-700">
                          <strong>Daily rate:</strong> ৳
                          {equipment.dailyRate ?? 0} / day
                        </p>
                        <p className="text-gray-700">
                          <strong>Location:</strong>{" "}
                          {equipment.location || "Not specified"}
                        </p>
                        <p className="text-gray-700">
                          <strong>Owner:</strong>{" "}
                          {equipment.ownerName || "Not specified"}
                        </p>
                        <p className="break-all text-gray-700">
                          <strong>Owner email:</strong>{" "}
                          {equipment.ownerEmail || "Not specified"}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleEquipmentApproval(
                              equipment._id,
                              "approved"
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? "Updating..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleEquipmentApproval(
                              equipment._id,
                              "rejected"
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? "Updating..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* User Management */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              User Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View registered users and manage their account roles.
            </p>
          </div>

          {roleMessage && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {roleMessage}
            </p>
          )}

          {usersError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {usersError}
            </p>
          )}

          {usersLoading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Current Role</th>
                    <th className="py-3">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentUser = user._id === currentUserId;
                    const isUpdating = updatingUserId === user._id;

                    return (
                      <tr key={user._id} className="border-b last:border-0">
                        <td className="py-4 pr-4 font-medium text-gray-900">
                          {user.name || "N/A"}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">
                              (You)
                            </span>
                          )}
                        </td>

                        <td className="py-4 pr-4 text-gray-600">
                          {user.email}
                        </td>

                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                            {user.role}
                          </span>
                        </td>

                        <td className="py-4">
                          <select
                            value={user.role}
                            disabled={isCurrentUser || isUpdating}
                            onChange={(event) =>
                              handleRoleChange(
                                user._id,
                                event.target.value as UserRole
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>

                          {isUpdating && (
                            <span className="ml-2 text-xs text-gray-500">
                              Updating...
                            </span>
                          )}

                          {isCurrentUser && (
                            <p className="mt-1 text-xs text-gray-400">
                              Your own role cannot be changed.
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

        {/* Admin Rental Management */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Admin Rental Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all rental bookings across Rentora.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {bookings.length} Total Rentals
            </span>
          </div>

          {bookingMessage && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {bookingMessage}
            </p>
          )}

          {bookingsError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {bookingsError}
            </p>
          )}

          {bookingsLoading ? (
            <p className="py-6 text-center text-gray-500">
              Loading all rental bookings...
            </p>
          ) : bookings.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="font-semibold text-gray-700">
                No rental bookings found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Owner</th>
                    <th className="py-3 pr-4">Equipment</th>
                    <th className="py-3 pr-4">Rental Dates</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Booking Status</th>
                    <th className="py-3 pr-4">Payment</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const isUpdating =
                      updatingBookingId === booking._id;

                    const isPending = booking.status === "pending";

                    return (
                      <tr
                        key={booking._id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-gray-900">
                            {booking.userName || "N/A"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {booking.userEmail || "No email"}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {booking.ownerName || "N/A"}
                        </td>

                        <td className="py-4 pr-4 font-medium text-gray-900">
                          {booking.equipmentName || "N/A"}
                        </td>

                        <td className="py-4 pr-4">
                          <p>{booking.startDate || "N/A"}</p>
                          <p className="mt-1 text-gray-500">
                            to {booking.endDate || "N/A"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {booking.totalDays ?? 0} days
                          </p>
                        </td>

                        <td className="py-4 pr-4 font-semibold">
                          ৳{booking.totalPrice ?? 0}
                        </td>

                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                            {booking.status || "N/A"}
                          </span>
                        </td>

                        <td className="py-4 pr-4 capitalize">
                          {booking.paymentStatus || "Unpaid"}
                        </td>

                        <td className="py-4">
                          {isPending ? (
                            <div className="flex min-w-[110px] flex-col gap-2">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleBookingStatus(
                                    booking._id,
                                    "confirmed"
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {isUpdating ? "Updating..." : "Confirm"}
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleBookingStatus(
                                    booking._id,
                                    "rejected"
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isUpdating ? "Updating..." : "Reject"}
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleBookingStatus(
                                    booking._id,
                                    "cancelled"
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                {isUpdating ? "Updating..." : "Cancel"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No actions available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Admin Equipment Management */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Admin Equipment Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View, edit, and delete all equipment submitted to Rentora.
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {allEquipment.length} Total Equipment
            </span>
          </div>

          {adminEquipmentMessage && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {adminEquipmentMessage}
            </p>
          )}

          {allEquipmentError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {allEquipmentError}
            </p>
          )}

          {allEquipmentLoading ? (
            <p className="py-6 text-center text-gray-500">
              Loading all equipment...
            </p>
          ) : allEquipment.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="font-semibold text-gray-700">
                No equipment found.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {allEquipment.map((equipment) => {
                const isDeleting =
                  deletingAdminEquipmentId === equipment._id;

                return (
                  <article
                    key={equipment._id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    {equipment.imageUrl ? (
                      <img
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        className="h-48 w-full bg-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                        No equipment image
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900">
                          {equipment.name}
                        </h3>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                          {equipment.approvalStatus || "Not reviewed"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {equipment.category || "Uncategorized"}
                      </p>

                      <p className="mt-3 text-sm text-gray-700">
                        <strong>Daily rate:</strong> ৳
                        {equipment.dailyRate ?? 0} / day
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        <strong>Location:</strong>{" "}
                        {equipment.location || "Not specified"}
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        <strong>Owner:</strong>{" "}
                        {equipment.ownerName || "Not specified"}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          href={`/admin/edit-equipment/${equipment._id}`}
                          className="rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDeleteAdminEquipment(equipment._id)
                          }
                          className="rounded-lg bg-red-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
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
                    {equipment.availability ||
                      "Availability not specified"}
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
