
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl text-orange-500">
          !
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Payment Cancelled
        </h1>

        <p className="mb-6 text-gray-600">
          Your payment was not completed. Your booking request is still pending.
          You can return to My Bookings to review it.
        </p>

        <Link
          href="/my-bookings"
          className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Go to My Bookings
        </Link>

        <p className="mt-5 text-sm text-gray-400">
          No payment confirmation has been received.
        </p>
      </div>
    </main>
  );
}
