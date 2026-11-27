"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface EquipmentForm {
  name: string;
  category: string;
  description: string;
  dailyRate: string;
  location: string;
  imageUrl: string;
  rentalType: string;
  availableQuantity: string;
  condition: string;
  brand: string;
  model: string;
  terms: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const initialForm: EquipmentForm = {
  name: "",
  category: "",
  description: "",
  dailyRate: "",
  location: "",
  imageUrl: "",
  rentalType: "Daily",
  availableQuantity: "1",
  condition: "Good",
  brand: "",
  model: "",
  terms: "Standard rental terms apply.",
};

const categories = [
  "Construction",
  "Agriculture",
  "Transportation",
  "Industrial",
  "Other",
  "Photography Equipment",
  "Event Equipment",
];

export default function AdminEditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = String(params.id);
  const { data: session, isPending } = useSession();

  const [form, setForm] = useState<EquipmentForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      return;
    }

    const loadEquipment = async () => {
      try {
        const profileResponse = await fetch(
          `${API_URL}/api/profile/me`,
          { credentials: "include" }
        );

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok || !profileResult.success) {
          throw new Error(
            profileResult.message || "Unable to verify your account."
          );
        }

        if (profileResult.user?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/admin/equipment`,
          { credentials: "include" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load equipment."
          );
        }

        const equipment = (result.data || []).find(
          (item: { _id: string }) => item._id === equipmentId
        );

        if (!equipment) {
          throw new Error("Equipment not found.");
        }

        setForm({
          name: equipment.name || "",
          category: equipment.category || "",
          description: equipment.description || "",
          dailyRate: String(equipment.dailyRate ?? ""),
          location: equipment.location || "",
          imageUrl: equipment.imageUrl || "",
          rentalType: equipment.rentalType || "Daily",
          availableQuantity: String(equipment.availableQuantity ?? 1),
          condition: equipment.condition || "Good",
          brand: equipment.brand || "",
          model: equipment.model || "",
          terms: equipment.terms || "Standard rental terms apply.",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load equipment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [session, isPending, router, equipmentId]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/equipment/${equipmentId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            dailyRate: Number(form.dailyRate),
            availableQuantity: Number(form.availableQuantity),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update equipment."
        );
      }

      setSuccess("Equipment updated successfully.");

      setTimeout(() => {
        router.push("/admin/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update equipment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-500">
          Loading equipment...
        </p>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="font-semibold text-blue-600 hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-9">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Rentora Administration
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Edit Equipment
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update equipment information and rental price as an administrator.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Equipment Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                {!categories.includes(form.category) && form.category && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                minLength={10}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="dailyRate"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Daily Rental Price (৳)
              </label>
              <input
                id="dailyRate"
                name="dailyRate"
                type="number"
                min="1"
                value={form.dailyRate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="rentalType" className="mb-2 block text-sm font-semibold text-gray-700">Rental Type</label>
                <select id="rentalType" name="rentalType" value={form.rentalType} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label htmlFor="availableQuantity" className="mb-2 block text-sm font-semibold text-gray-700">Available Quantity</label>
                <input id="availableQuantity" name="availableQuantity" type="number" min="1" value={form.availableQuantity} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-4 py-3" />
              </div>
              <div>
                <label htmlFor="condition" className="mb-2 block text-sm font-semibold text-gray-700">Condition</label>
                <select id="condition" name="condition" value={form.condition} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3">
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div>
                <label htmlFor="brand" className="mb-2 block text-sm font-semibold text-gray-700">Brand</label>
                <input id="brand" name="brand" value={form.brand} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-4 py-3" />
              </div>
              <div>
                <label htmlFor="model" className="mb-2 block text-sm font-semibold text-gray-700">Model</label>
                <input id="model" name="model" value={form.model} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-4 py-3" />
              </div>
            </div>
            <div>
              <label htmlFor="terms" className="mb-2 block text-sm font-semibold text-gray-700">Rental Terms and Conditions</label>
              <textarea id="terms" name="terms" value={form.terms} onChange={handleChange} required minLength={5} rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3" />
            </div>
            <div>
              <label
                htmlFor="imageUrl"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

              <Link
                href="/admin/dashboard"
                className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
