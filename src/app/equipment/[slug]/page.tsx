
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSession } from "@/lib/auth-client";

interface Equipment {
  _id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  dailyRate: number;
  location: string;
  imageUrl: string;
  availability: string;
}

export default function EquipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const slug = params.slug as string;

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace(`/signin?next=/equipment/${slug}`);
      return;
    }

    const fetchEquipment = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/equipment`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Unable to load equipment.");
        }

        const result = await response.json();

        const selectedEquipment = result.data.find(
          (item: Equipment) => item.slug === slug
        );

        if (!selectedEquipment) {
          throw new Error("Equipment not found.");
        }

        setEquipment(selectedEquipment);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [slug, session, isPending, router]);

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading equipment details...</p>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-block font-semibold text-[#f47735] hover:underline"
          >
            ← Back to Home
          </Link>

          {error ? (
            <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">
              {error}
            </div>
          ) : equipment ? (
            <div className="grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
              <div>
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="h-80 w-full rounded-xl object-cover"
                />
              </div>

              <div>
                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-[#f47735]">
                  {equipment.category}
                </span>

                <h1 className="mt-6 text-3xl font-extrabold text-[#172033]">
                  {equipment.name}
                </h1>

                <p className="mt-4 leading-7 text-gray-600">
                  {equipment.description}
                </p>

                <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                  <p className="text-gray-600">
                    <strong className="text-[#172033]">Location:</strong>{" "}
                    {equipment.location}
                  </p>

                  <p className="text-gray-600">
                    <strong className="text-[#172033]">Availability:</strong>{" "}
                    {equipment.availability}
                  </p>

                  <div>
                    <p className="text-sm text-gray-500">Rental Price</p>
                    <p className="mt-1 text-3xl font-extrabold text-[#f47735]">
                      ৳{equipment.dailyRate.toLocaleString("en-BD")}
                      <span className="text-base font-medium text-gray-500">
                        {" "}/ day
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-4 font-bold text-gray-600"
                >
                  Booking Coming Soon
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
