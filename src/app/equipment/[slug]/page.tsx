
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const slug = params.slug as string;
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const totalDays =
    startDate && endDate && endDate >= startDate
      ? Math.floor(
          (new Date(`${endDate}T00:00:00`).getTime() -
            new Date(`${startDate}T00:00:00`).getTime()) /
            86400000
        ) + 1
      : 0;

  const totalPrice = equipment ? totalDays * equipment.dailyRate : 0;

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace(`/signin?next=/equipment/${slug}`);
      return;
    }

    const fetchEquipment = async () => {
      try {
        const response = await fetch(`${API_URL}/api/equipment`, {
          credentials: "include",
        });

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
  }, [slug, session, isPending, router, API_URL]);

  const handleBooking = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!startDate || !endDate) {
      setBookingError("Please select your rental dates.");
      return;
    }

    if (startDate < today || endDate < startDate) {
      setBookingError("Please select valid rental dates.");
      return;
    }

    try {
      setBookingLoading(true);

      // Step 1: Create the booking
      const bookingResponse = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          equipmentSlug: slug,
          startDate,
          endDate,
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(
          bookingResult.message || "Booking failed. Please try again."
        );
      }

      const bookingId = bookingResult.data?._id;

      if (!bookingId) {
        throw new Error("Booking was created, but its ID was not returned.");
      }

      // Step 2: Create Stripe Checkout session
      const paymentResponse = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            bookingId,
          }),
        }
      );

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentResult.message ||
            "Unable to start payment. Your booking is still pending."
        );
      }

      const checkoutUrl = paymentResult.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      // Step 3: Redirect customer to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setBookingLoading(false);
    }
  };

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

                {/* Booking Form */}
                <form
                  onSubmit={handleBooking}
                  className="mt-8 space-y-5 border-t border-gray-100 pt-6"
                >
                  <h2 className="text-xl font-bold text-[#172033]">
                    Book This Equipment
                  </h2>

                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Rental Start Date
                    </label>

                    <input
                      id="startDate"
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setBookingError("");
                        setBookingSuccess("");
                        if (endDate && e.target.value > endDate) {
                          setEndDate("");
                        }
                      }}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#f47735]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Rental End Date
                    </label>

                    <input
                      id="endDate"
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setBookingError("");
                        setBookingSuccess("");
                      }}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-[#f47735]"
                    />
                  </div>

                  {totalDays > 0 && (
                    <div className="rounded-xl bg-orange-50 p-5">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Rental Duration</span>
                        <span>{totalDays} day(s)</span>
                      </div>

                      <div className="mt-3 flex justify-between text-sm text-gray-600">
                        <span>Daily Rate</span>
                        <span>
                          ৳{equipment.dailyRate.toLocaleString("en-BD")}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between border-t border-orange-200 pt-4">
                        <span className="font-bold text-[#172033]">
                          Total Price
                        </span>
                        <span className="text-xl font-extrabold text-[#f47735]">
                          ৳{totalPrice.toLocaleString("en-BD")}
                        </span>
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {bookingError}
                    </p>
                  )}

                  {bookingSuccess && (
                    <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                      {bookingSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={
                      bookingLoading ||
                      equipment.availability !== "Available"
                    }
                    className="w-full rounded-xl bg-[#f47735] px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {bookingLoading
                      ? "Redirecting to Payment..."
                      : "Book & Proceed to Payment"}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
