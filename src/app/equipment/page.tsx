
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FavoriteEquipment,
  getFavorites,
  toggleFavorite,
} from "@/lib/favorites";

const categories = [
  "All Categories",
  "Construction",
  "Vehicles",
  "Power Tools",
  "Electronics",
  "Home & Living",
  "Events",
];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<FavoriteEquipment[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("");

  // Load saved favorites when the page opens
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Fetch equipment from backend
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const response = await fetch(`${apiUrl}/api/equipment`);

        if (!response.ok) {
          throw new Error("Unable to load equipment.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid equipment response.");
        }

        setEquipment(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Add or remove an equipment item from favorites
  const handleFavorite = (item: FavoriteEquipment) => {
    const updatedFavorites = toggleFavorite(item);
    setFavorites(updatedFavorites);
  };

  // Check whether an equipment item is already saved
  const isSaved = (id: string) => {
    return favorites.some((favorite) => favorite._id === id);
  };

  // Search and filter equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        item.category.toLowerCase() === category.toLowerCase();

      const matchesLocation = item.location
        .toLowerCase()
        .includes(location.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [equipment, search, category, location]);

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      {/* Hero Section */}
      <section className="bg-[#172033] px-5 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
            Explore Rentora
          </p>

          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
            All Equipment
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300">
            Find the right equipment for your next project. Browse, compare,
            and rent from trusted equipment listings.
          </p>
        </div>
      </section>

      {/* Equipment Section */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {/* Search and Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-gray-500">
                SEARCH EQUIPMENT
              </label>

              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                CATEGORY
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                LOCATION
              </label>

              <input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              />
            </div>
          </div>
        </div>

        {/* Equipment Count */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#172033]">
            Browse Equipment
          </h2>

          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${filteredEquipment.length} items found`}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <p className="py-20 text-center text-gray-500">
            Loading equipment...
          </p>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg font-bold text-[#172033]">
              No equipment found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
                setLocation("");
              }}
              className="mt-5 rounded-lg bg-[#f47735] px-5 py-3 text-sm font-bold text-white hover:bg-[#df6428]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Equipment Cards */
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEquipment.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Equipment Image */}
                <div className="relative h-56 bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#172033] shadow">
                    {item.availability}
                  </span>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={() => handleFavorite(item)}
                    aria-label={
                      isSaved(item._id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    title={
                      isSaved(item._id)
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-110 ${
                      isSaved(item._id)
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    {isSaved(item._id) ? "♥" : "♡"}
                  </button>
                </div>

                {/* Equipment Information */}
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

                  {/* Price and Details */}
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
