export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      <h2 className="mt-6 text-xl font-bold text-gray-900">
        Loading Rentora...
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Please wait while we prepare your experience.
      </p>
    </main>
  );
}
