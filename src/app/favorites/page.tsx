"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export interface FavoriteEquipment {
  _id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  dailyRate: number;
  location: string;
  imageUrl: string;
  availability: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function FavoritesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/signin");
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/favorites`, {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load your favorites."
          );
        }

        setFavorites(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your favorites."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isPending, session, router]);

  const handleRemove = async (item: FavoriteEquipment) => {
    try {
      setRemovingId(item._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/favorites/${item._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to remove this favorite."
        );
      }

      setFavorites((current) =>
        current.filter((favorite) => favorite._id !== item._id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove this favorite."
      );
    } finally {
      setRemovingId("");
    }
  };

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <p className="text-sm font-semibold text-gray-500">
          Loading your favorites...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <section className="bg-[#172033] px-5 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
            Your Collection
          </p>

          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            My Favorites <span className="text-red-400">♥</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">
            All your favorite equipment in one place. Find your saved
            equipment whenever you need it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#172033]">
            Saved Equipment
          </h2>

          <p className="text-sm text-gray-500">
            {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl text-gray-300">♡</div>

            <h2 className="mt-5 text-xl font-extrabold text-[#172033]">
              No favorites yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              You haven't saved any equipment yet. Explore our equipment
              collection and tap the heart icon to save your favorites.
            </p>

            <Link
              href="/equipment"
              className="mt-7 inline-block rounded-lg bg-[#f47735] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#df6428]"
            >
              Explore Equipment →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#172033] shadow">
                    {item.availability}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item._id}
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-red-500 shadow-md transition hover:scale-110 hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingId === item._id ? "..." : "♥"}
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#f47735]">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-[#172033]">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-4 text-sm text-gray-500">
                    ⌖ {item.location}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                    <p>
                      <span className="text-2xl font-extrabold text-[#172033]">
                        ৳{item.dailyRate.toLocaleString("en-BD")}
                      </span>
                      <span className="text-xs text-gray-500"> / day</span>
                    </p>

                    <Link
                      href={`/equipment/${item.slug}`}
                      className="rounded-lg bg-[#172033] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#f47735]"
                    >
                      View Details →
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item._id}
                    className="mt-4 w-full rounded-lg border border-red-200 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingId === item._id
                      ? "Removing..."
                      : "Remove from Favorites"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
