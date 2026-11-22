
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState("customer");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setRole("customer");
      setRoleLoading(false);
      return;
    }

    let cancelled = false;

    const fetchUserRole = async () => {
      setRoleLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/profile/me`, {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.ok && result.success && !cancelled) {
          setRole(result.user.role || "customer");
        }
      } catch (error) {
        console.error("Unable to fetch user role:", error);
      } finally {
        if (!cancelled) {
          setRoleLoading(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      cancelled = true;
    };
  }, [session?.user, isPending]);

  const isAdmin = role === "admin";
  const isOwner = role === "owner";
  const isCustomer = !isAdmin && !isOwner;

  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : "/dashboard";

  const dashboardLabel = isAdmin
    ? "Admin Dashboard"
    : isOwner
      ? "Owner Dashboard"
      : "Customer Dashboard";

  const handleSignOut = async () => {
    await signOut();
    setRole("customer");
    setMenuOpen(false);
    router.refresh();
  };

  const closeMenu = () => setMenuOpen(false);

  const linkClass =
    "block py-2 text-sm font-medium text-gray-600 transition hover:text-[#f47735]";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f47735] text-xl font-bold text-white">
            R
          </span>

          <span>
            <span className="block text-2xl font-extrabold tracking-tight text-[#172033]">
              rentora<span className="text-[#f47735]">.</span>
            </span>
            <span className="block text-[9px] font-semibold tracking-[3px] text-gray-500">
              RENT SMARTER
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="transition hover:text-[#f47735]">
            Home
          </Link>

          <Link href="/#categories" className="transition hover:text-[#f47735]">
            Categories
          </Link>

          <Link href="/equipment" className="transition hover:text-[#f47735]">
            Explore Equipment
          </Link>

          <Link href="/favorites" className="transition hover:text-[#f47735]">
            <span className="text-red-500">♥</span> Favorites
          </Link>

          <Link href="/#about" className="transition hover:text-[#f47735]">
            About Us
          </Link>
        </div>

        {/* Desktop authentication */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : session?.user ? (
            <>
              {roleLoading ? (
                <span className="text-sm text-gray-400">
                  Loading dashboard...
                </span>
              ) : (
                <Link href={dashboardHref} className={linkClass}>
                  {dashboardLabel}
                </Link>
              )}

              {isCustomer && (
                <Link href="/my-bookings" className={linkClass}>
                  My Bookings
                </Link>
              )}

              <Link href="/profile" className={linkClass}>
                {session.user.name || "My Profile"}
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-lg bg-[#172033] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#f47735]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#172033] transition hover:bg-gray-100"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-lg bg-[#f47735] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#df6428]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-[#172033] transition hover:bg-gray-100 md:hidden"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-4 shadow-lg md:hidden">
          <div className="mx-auto max-w-7xl space-y-2">
            <Link href="/" onClick={closeMenu} className={linkClass}>
              Home
            </Link>

            <Link
              href="/#categories"
              onClick={closeMenu}
              className={linkClass}
            >
              Categories
            </Link>

            <Link
              href="/equipment"
              onClick={closeMenu}
              className={linkClass}
            >
              Explore Equipment
            </Link>

            <Link
              href="/favorites"
              onClick={closeMenu}
              className={linkClass}
            >
              <span className="text-red-500">♥</span> Favorites
            </Link>

            <Link href="/#about" onClick={closeMenu} className={linkClass}>
              About Us
            </Link>

            <div className="my-3 border-t border-gray-100" />

            {isPending ? (
              <p className="py-2 text-sm text-gray-400">Loading...</p>
            ) : session?.user ? (
              <>
                {roleLoading ? (
                  <p className="py-2 text-sm text-gray-400">
                    Loading dashboard...
                  </p>
                ) : (
                  <Link
                    href={dashboardHref}
                    onClick={closeMenu}
                    className={linkClass}
                  >
                    {dashboardLabel}
                  </Link>
                )}

                {isCustomer && (
                  <Link
                    href="/my-bookings"
                    onClick={closeMenu}
                    className={linkClass}
                  >
                    My Bookings
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  My Profile ({session.user.name || "User"})
                </Link>

                <button
                  onClick={handleSignOut}
                  className="mt-2 w-full rounded-lg bg-[#172033] px-5 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#f47735]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/signin"
                  onClick={closeMenu}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-[#172033] hover:bg-gray-50"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="rounded-lg bg-[#f47735] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#df6428]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
