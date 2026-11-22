
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

export default function SigninPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        const message =
          result.error.message || "Invalid email or password.";

        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Login successful! Welcome back to Rentora.");

      router.push("/");
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setError("");

    try {
      setGoogleLoading(true);

      const result = await signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });

      if (result.error) {
        const message =
          result.error.message || "Google login failed. Please try again.";

        setError(message);
        toast.error(message);
        setGoogleLoading(false);
      }
    } catch {
      const message = "Unable to sign in with Google. Please try again.";
      setError(message);
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#172033] p-12 text-white md:flex">
          <Link href="/" className="text-3xl font-extrabold">
            rentora<span className="text-[#f47735]">.</span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#f47735]">
              RENT SMARTER
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight">
              Welcome back.
              <span className="block text-[#f47735]">
                Let's get moving.
              </span>
            </h1>

            <p className="mt-6 leading-8 text-gray-300">
              Sign in to manage your rentals, explore equipment, and continue
              where you left off.
            </p>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Rentora. All rights reserved.
          </p>
        </div>

        <div className="p-7 sm:p-12">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-500 hover:text-[#f47735]"
          >
            ← Back to Home
          </Link>

          <div className="mt-12">
            <h2 className="text-3xl font-extrabold text-[#172033]">
              Welcome back
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSignin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#172033] placeholder:text-gray-500 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#172033] placeholder:text-gray-500 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl bg-[#f47735] py-4 text-sm font-bold text-white transition hover:bg-[#df6428] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGoogleSignin}
            disabled={googleLoading || loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-4 text-sm font-bold text-[#172033] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.25 5.62c4.23-3.91 7.52-9.69 7.52-17.27Z"/>
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.25-5.62c-2.01 1.35-4.59 2.16-8.66 2.16-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
            </svg>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold uppercase text-gray-400">
              Or continue with email
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#f47735] hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
