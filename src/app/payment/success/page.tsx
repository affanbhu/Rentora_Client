
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Payment Submitted!
        </h1>

        <p className="mb-6 text-gray-600">
          Thank you! Your payment has been submitted. We are confirming your
          booking. You can check its latest status in My Bookings.
        </p>

        <Link
          href="/my-bookings"
          className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Go to My Bookings
        </Link>

        <p className="mt-5 text-sm text-gray-400">
          Your booking status will update after payment verification.
        </p>
      </div>
    </main>
  );
}
