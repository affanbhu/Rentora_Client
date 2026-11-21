
"use client";

import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
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

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="text-[#f47735]">
            Home
          </Link>
          <a href="/#categories" className="transition hover:text-[#f47735]">
            Categories
          </a>
          <a href="/#equipment" className="transition hover:text-[#f47735]">
            Explore Equipment
          </a>
          <a href="/#about" className="transition hover:text-[#f47735]">
            About Us
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : session?.user ? (
            <>
              <Link
                href="/profile"
                className="hidden text-sm font-semibold text-[#172033] transition hover:text-[#f47735] sm:block"
              >
                Hi, {session.user.name}
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
                className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-[#172033] transition hover:bg-gray-100 sm:block"
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
      </nav>
    </header>
  );
}
