"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const categories = [
  "Construction",
  "Vehicles",
  "Power Tools",
  "Electronics",
  "Home & Living",
  "Events",
];

export default function AddEquipmentPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [checkingRole, setCheckingRole] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
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
    terms: "",
  });

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      return;
    }

    const checkOwner = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/me`, {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to verify your account.");
        }

        if (result.user.role !== "owner") {
          router.replace("/dashboard");
          return;
        }
      } catch {
        setError("Unable to verify your owner account. Please try again.");
      } finally {
        setCheckingRole(false);
      }
    };

    checkOwner();
  }, [session, isPending, router]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          dailyRate: Number(formData.dailyRate),
          availableQuantity: Number(formData.availableQuantity),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add equipment.");
      }

      setSuccess("Equipment added successfully!");

      setFormData({
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
        terms: "",
      });

      setTimeout(() => {
        router.push("/owner/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending || checkingRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-500">
          Verifying your owner account...
        </p>
      </main>
    );
  }

  if (!session?.user) return null;

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/owner/dashboard"
          className="font-semibold text-[#f47735] hover:text-[#df6428]"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-[#172033] px-6 py-8 text-white md:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#f47735]">
              Owner Portal
            </p>

            <h1 className="mt-3 text-3xl font-extrabold">
              Add New Equipment
            </h1>

            <p className="mt-3 text-sm text-gray-300">
              List your equipment on Rentora and make it available for
              customers to rent.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 md:p-10"
          >
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="text-sm font-semibold text-[#172033]"
              >
                Equipment Name *
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Caterpillar Excavator"
                className={inputClass}
                minLength={3}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-semibold text-[#172033]"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-[#172033]"
              >
                Equipment Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your equipment, its condition, and features..."
                className={inputClass}
                rows={5}
                minLength={10}
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dailyRate"
                  className="text-sm font-semibold text-[#172033]"
                >
                  Daily Rental Price (৳) *
                </label>
                <input
                  id="dailyRate"
                  name="dailyRate"
                  type="number"
                  value={formData.dailyRate}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  className={inputClass}
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="text-sm font-semibold text-[#172033]"
                >
                  Location *
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className={inputClass}
                  minLength={2}
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="rentalType" className="text-sm font-semibold text-[#172033]">
                  Rental Type *
                </label>
                <select id="rentalType" name="rentalType" value={formData.rentalType} onChange={handleChange} className={inputClass} required>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="availableQuantity" className="text-sm font-semibold text-[#172033]">
                  Available Quantity *
                </label>
                <input id="availableQuantity" name="availableQuantity" type="number" min="1" step="1" value={formData.availableQuantity} onChange={handleChange} className={inputClass} required />
              </div>

              <div>
                <label htmlFor="condition" className="text-sm font-semibold text-[#172033]">
                  Equipment Condition *
                </label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className={inputClass} required>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label htmlFor="brand" className="text-sm font-semibold text-[#172033]">
                  Brand *
                </label>
                <input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Caterpillar" className={inputClass} required />
              </div>

              <div>
                <label htmlFor="model" className="text-sm font-semibold text-[#172033]">
                  Model *
                </label>
                <input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. CAT 320D" className={inputClass} required />
              </div>
            </div>

            <div>
              <label htmlFor="terms" className="text-sm font-semibold text-[#172033]">
                Rental Terms and Conditions *
              </label>
              <textarea id="terms" name="terms" value={formData.terms} onChange={handleChange} placeholder="Describe deposit, usage rules, delivery, and return conditions..." className={inputClass} rows={4} minLength={5} required />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="text-sm font-semibold text-[#172033]"
              >
                Equipment Image URL *
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/equipment-image.jpg"
                className={inputClass}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Paste a publicly accessible image URL.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/owner/dashboard"
                className="rounded-lg border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#f47735] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#df6428] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Adding Equipment..." : "Add Equipment"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
