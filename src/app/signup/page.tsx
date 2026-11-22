
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [preview, setPreview] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showError = (message: string) => {
    setError(message);
    toast.error(message);
  };

  const handlePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      showError("Please select a JPG, PNG, WebP, or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPhoto("");

    try {
      setUploading(true);
      toast.info("Uploading your profile picture...");

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

      if (!response.ok || !result.success || !result.imageUrl) {
        throw new Error(result.message || "Photo upload failed.");
      }

      setPhoto(result.imageUrl);
      toast.success("Profile picture uploaded successfully!");
    } catch (err) {
      setPhoto("");
      setPreview("");
      URL.revokeObjectURL(localPreview);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to upload your photo.";

      showError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!photo) {
      showError("Please upload your profile picture first.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      showError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      showError("Password must contain at least one lowercase letter.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photo,
      });

      if (result.error) {
        showError(result.error.message || "Registration failed.");
        return;
      }

      toast.success("Registration successful! Welcome to Rentora.");
      router.push("/");
      router.refresh();
    } catch {
      showError("Something went wrong. Please try again.");
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#172033] placeholder:text-gray-500 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#172033] placeholder:text-gray-500 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-[#172033]">
                Profile Picture
              </label>

              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-5">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-28 w-28 rounded-full border-4 border-orange-100 object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-4xl text-gray-400">
                    👤
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                  className="rounded-xl border border-[#f47735] px-5 py-3 text-sm font-bold text-[#f47735] transition hover:bg-orange-50 disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading Photo..."
                    : photo
                      ? "Change Profile Picture"
                      : "Upload Profile Picture"}
                </button>

                <p className="text-center text-xs text-gray-500">
                  JPG, PNG, WebP or GIF. Maximum size 5 MB.
                </p>

                {photo && (
                  <p className="text-sm font-semibold text-green-600">
                    ✓ Profile picture uploaded
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters, uppercase and lowercase"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#172033] placeholder:text-gray-500 outline-none transition focus:border-[#f47735] focus:ring-2 focus:ring-orange-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Must include an uppercase letter and a lowercase letter.
              </p>
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
              disabled={loading || uploading}
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
