"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { FavoriteEquipment } from "@/lib/favorites";

interface Equipment extends FavoriteEquipment {
  rentalType?: string;
}

const categories = [
  "All Categories",
  "Construction",
  "Vehicles",
  "Power Tools",
  "Electronics",
  "Home & Living",
  "Events",
  "Photography Equipment",
  "Event Equipment",
];

export default function EquipmentPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [favoriteActionId, setFavoriteActionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("All");
  const [rentalType, setRentalType] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Load saved favorites from MongoDB.
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const response = await fetch(`${apiUrl}/api/favorites`, {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setFavorites(result.data || []);
        }
      } catch (err) {
        console.error("Unable to load favorites:", err);
      }
    };

    fetchFavorites();
  }, [isPending, session]);

  // Fetch equipment using backend search and filters.
  useEffect(() => {
    const controller = new AbortController();

    const fetchEquipment = async () => {
      try {
        setLoading(true);
        setError("");

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());
        if (category !== "All Categories") {
          params.set("category", category);
        }
        if (location.trim()) params.set("location", location.trim());
        if (availability !== "All") {
          params.set("availability", availability);
        }
        if (rentalType !== "All") {
          params.set("rentalType", rentalType);
        }
        if (minPrice.trim()) params.set("minPrice", minPrice.trim());
        if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());

        params.set("sortBy", sortBy);

        const response = await fetch(
          `${apiUrl}/api/equipment?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load equipment. Please try again.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid equipment response.");
        }

        setEquipment(result.data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEquipment();

    return () => controller.abort();
  }, [
    search,
    category,
    location,
    availability,
    rentalType,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(equipment.length / itemsPerPage);
  const paginatedEquipment = equipment.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, location, availability, rentalType, minPrice, maxPrice, sortBy]);

  // Add or remove an equipment item using the MongoDB API.
  const handleFavorite = async (item: FavoriteEquipment) => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    try {
      setFavoriteActionId(item._id);

      const alreadySaved = isSaved(item._id);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const response = await fetch(
        `${apiUrl}/api/favorites/${item._id}`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update favorites.");
      }

      setFavorites((current) =>
        alreadySaved
          ? current.filter((favorite) => favorite._id !== item._id)
          : [...current, item]
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update favorites."
      );
    } finally {
      setFavoriteActionId("");
    }
  };

  const isSaved = (id: string) =>
    favorites.some((favorite) => favorite._id === id);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLocation("");
    setAvailability("All");
    setRentalType("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

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
          <h2 className="mb-5 text-lg font-bold text-[#172033]">
            Search and Filter Equipment
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-gray-500">
                SEARCH EQUIPMENT
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
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
                  <option key={item} value={item}>
                    {item}
                  </option>
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

            <div>
              <label className="text-xs font-bold text-gray-500">
                AVAILABILITY
              </label>
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              >
                <option value="All">All Availability</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                RENTAL TYPE
              </label>
              <select
                value={rentalType}
                onChange={(event) => setRentalType(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              >
                <option value="All">All Rental Types</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                SORT BY
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="nameAZ">Name: A to Z</option>
                <option value="nameZA">Name: Z to A</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                MINIMUM PRICE (৳ / DAY)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Minimum price"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500">
                MAXIMUM PRICE (৳ / DAY)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Maximum price"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#f47735]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-lg border border-[#f47735] px-5 py-3 text-sm font-bold text-[#f47735] transition hover:bg-[#f47735] hover:text-white"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Count */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#172033]">
            Browse Equipment
          </h2>

          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${equipment.length} items found`}
          </p>
        </div>

        {/* Loading, Error and Empty States */}
        {loading ? (
          <p className="py-20 text-center text-gray-500">
            Loading equipment...
          </p>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 block mx-auto rounded-lg bg-[#172033] px-5 py-2 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : equipment.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg font-bold text-[#172033]">
              No equipment found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-[#f47735] px-5 py-3 text-sm font-bold text-white hover:bg-[#df6428]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Equipment Cards */
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEquipment.map((item) => (
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
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
