"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string;
  address?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

        const user: UserProfile = result.user;

        setProfile(user);
        setName(user.name || "");
        setPhoneNumber(user.phoneNumber || "");
        setAddress(user.address || "");
        setImage(user.image || "");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, isPending, router]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/api/upload/profile-photo`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Image upload failed.");
      }

      const uploadedImage = result.imageUrl || result.displayUrl;

      if (!uploadedImage) {
        throw new Error("The server did not return an image URL.");
      }

      setImage(uploadedImage);
      toast.success("Image uploaded. Save your profile to apply it.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          image,
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setProfile((previous) => ({
        ...previous!,
        ...(result.user || {}),
        name: name.trim(),
        image,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      }));

      toast.success("Your profile has been updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-600">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (!session?.user || !profile) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#172033]">
            My Profile
          </h1>
          <p className="mt-2 text-gray-500">
            View and update your Rentora account information.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-8 flex flex-col items-center gap-4 border-b border-gray-100 pb-8 sm:flex-row">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-orange-100 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f47735] text-3xl font-bold text-white">
                {name.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-[#172033]">
                {name || profile.name}
              </h2>
              <p className="text-sm text-gray-500">{profile.email}</p>

              <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-[#f47735] transition hover:bg-orange-50">
                {uploading ? "Uploading..." : "Change Profile Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP or GIF. Maximum 5MB.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed from this profile form.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Address
              </label>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
                placeholder="Enter your address"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-lg bg-[#f47735] px-6 py-3 font-semibold text-white transition hover:bg-[#df6428] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
