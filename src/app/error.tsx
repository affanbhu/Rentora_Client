"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Rentora application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="text-6xl font-bold text-orange-500">!</div>

      <h1 className="mt-5 text-3xl font-bold text-gray-900">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-gray-600">
        We're sorry. An unexpected error occurred while loading this page.
        Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="mt-7 rounded-xl bg-orange-500 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
      >
        Try Again
      </button>

      <a href="/" className="mt-4 text-sm font-medium text-gray-600 hover:text-orange-500">
        Back to Home
      </a>
    </main>
  );
}
