
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Registration failed.");
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
              Everything you need.
              <span className="block text-[#f47735]">
                One rental platform.
              </span>
            </h1>

            <p className="mt-6 leading-8 text-gray-300">
              Join Rentora and discover a smarter way to access the equipment
              you need for your next project.
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

          <div className="mt-9">
            <h2 className="text-3xl font-extrabold text-[#172033]">
              Create an account
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Join Rentora and start renting smarter.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-bold text-[#f47735] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
