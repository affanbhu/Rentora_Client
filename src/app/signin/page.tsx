
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function SigninPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

          <form onSubmit={handleSignin} className="mt-9 space-y-6">
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#f47735] py-4 text-sm font-bold text-white transition hover:bg-[#df6428] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

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
