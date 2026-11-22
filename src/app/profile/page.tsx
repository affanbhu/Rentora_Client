
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile/me`, {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load profile.");
        }

        setProfile(result.user);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#172033]">
            My Profile
          </h1>
          <p className="mt-2 text-gray-500">
            View your Rentora account information.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        ) : profile ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f47735] text-3xl font-bold text-white">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#172033]">
                  {profile.name}
                </h2>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-5 border-t border-gray-100 pt-6">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="mt-1 font-semibold text-[#172033]">
                  {profile.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="mt-1 font-semibold text-[#172033]">
                  {profile.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Account ID</p>
                <p className="mt-1 break-all font-semibold text-[#172033]">
                  {profile.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-8 rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white transition hover:bg-[#df6428]"
            >
              Back to Home
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
