"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FavoriteEquipment,
  getFavorites,
  toggleFavorite,
} from "@/lib/favorites";

const categories = [
  { name: "Construction", icon: "🏗️" },
  { name: "Vehicles", icon: "🚜" },
  { name: "Power Tools", icon: "🔧" },
  { name: "Electronics", icon: "💻" },
  { name: "Home & Living", icon: "🏠" },
  { name: "Events", icon: "🎪" },
];

interface Equipment extends FavoriteEquipment {}

interface HomeStats {
  totalEquipment: number;
  totalCustomers: number;
  totalBookings: number;
}

const benefits = [
  {
    icon: "✓",
    title: "Verified Equipment",
    description:
      "Find equipment listings and choose what works best for your needs.",
  },
  {
    icon: "↗",
    title: "Simple Booking",
    description:
      "Find the equipment you need and arrange your rental easily.",
  },
  {
    icon: "◎",
    title: "Trusted Community",
    description:
      "Connect with equipment owners and renters in one place.",
  },
];

const sectionAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Home() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [favorites, setFavorites] = useState<FavoriteEquipment[]>([]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [equipmentError, setEquipmentError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [locationTerm, setLocationTerm] = useState("");

  useEffect(() => {
    setFavorites(getFavorites());

    const fetchHomepageData = async () => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      try {
        const [equipmentResponse, statsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/equipment`),
          fetch(`${apiUrl}/api`),
        ]);

        if (!equipmentResponse.ok) {
          throw new Error("Unable to load equipment. Please try again.");
        }

        const equipmentResult = await equipmentResponse.json();

        if (
          !equipmentResult.success ||
          !Array.isArray(equipmentResult.data)
        ) {
          throw new Error("The equipment response was invalid.");
        }

        setEquipment(equipmentResult.data);

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();

          if (statsResult.success && statsResult.stats) {
            setStats(statsResult.stats);
          }
        }
      } catch (error) {
        setEquipmentError(
          error instanceof Error ? error.message : "Something went wrong."
        );
      } finally {
        setLoadingEquipment(false);
      }
    };

    fetchHomepageData();
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLocation = item.location
        .toLowerCase()
        .includes(locationTerm.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [equipment, searchTerm, selectedCategory, locationTerm]);

  const handleFavorite = (item: Equipment) => {
    setFavorites(toggleFavorite(item));
  };

  const statItems = [
    {
      value: stats ? stats.totalEquipment.toLocaleString("en-BD") : "—",
      label: "Equipment Listings",
    },
    {
      value: stats ? stats.totalCustomers.toLocaleString("en-BD") : "—",
      label: "Registered Customers",
    },
    {
      value: stats ? stats.totalBookings.toLocaleString("en-BD") : "—",
      label: "Total Bookings",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative bg-[#172033]">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full border-[50px] border-white" />
          <div className="absolute -bottom-60 left-1/3 h-96 w-96 rounded-full border-[50px] border-white" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionAnimation}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-orange-300">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              THE SMARTER WAY TO RENT
            </span>

            <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-6xl">
              Rent the right
              <span className="block text-[#f47735]">equipment.</span>
              Get more done.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-gray-300">
              From heavy machinery to everyday essentials, discover the
              equipment you need without the cost of ownership.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#equipment"
                className="rounded-lg bg-[#f47735] px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#df6428]"
              >
                Explore Equipment →
              </a>

              <a
                href="#categories"
                className="rounded-lg border border-white/30 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Browse Categories
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/15 pt-8">
              {statItems.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute -inset-5 rounded-3xl bg-[#f47735]/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#35435a] to-[#202c40] p-7 shadow-2xl sm:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-400/15 px-3 py-1.5 text-xs font-semibold text-green-300">
                  ● Ready to explore
                </span>
                <span className="text-sm text-gray-300">
                  Rentora Marketplace
                </span>
              </div>

              <motion.div
                className="flex h-64 items-center justify-center text-9xl"
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🚜
              </motion.div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-widest text-orange-300">
                  Equipment Rental Made Easy
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  Find the right equipment
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-300">
                  Browse equipment, compare rental prices, and connect with
                  equipment owners.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-10 mx-auto -mt-7 max-w-6xl px-5">
        <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-gray-200/70 md:grid-cols-[1fr_1fr_1fr_auto] md:p-5">
          <div className="px-3 py-2">
            <label className="block text-xs font-bold text-gray-500">
              WHAT DO YOU NEED?
            </label>
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-2 w-full border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="border-gray-200 px-3 py-2 md:border-l">
            <label className="block text-xs font-bold text-gray-500">
              CATEGORY
            </label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm text-gray-700 outline-none"
            >
              <option>All Categories</option>
              {categories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="border-gray-200 px-3 py-2 md:border-l">
            <label className="block text-xs font-bold text-gray-500">
              LOCATION
            </label>
            <input
              type="text"
              placeholder="Enter your location"
              value={locationTerm}
              onChange={(event) => setLocationTerm(event.target.value)}
              className="mt-2 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <a
            href="#equipment"
            className="flex items-center justify-center rounded-xl bg-[#f47735] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#df6428]"
          >
            Search →
          </a>
        </div>
      </section>

      {/* Categories */}
      <motion.section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionAnimation}
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
              Browse by category
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">
              Find what you need.
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Explore a wide range of rental equipment.
            </p>
          </div>

          <a
            href="#equipment"
            className="text-sm font-bold text-[#f47735] hover:underline"
          >
            View all equipment →
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.button
              type="button"
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-[#f47735] hover:shadow-lg"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff1e9] text-3xl transition group-hover:bg-[#f47735]">
                {category.icon}
              </span>

              <h3 className="mt-5 text-sm font-bold text-[#172033]">
                {category.name}
              </h3>

              <p className="mt-2 text-xs text-gray-500">Explore equipment</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Featured Equipment */}
      <section id="equipment" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
                Handpicked for you
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">
                Featured equipment
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Quality equipment for every kind of project.
              </p>
            </div>

            <Link
              href="/equipment"
              className="text-sm font-bold text-[#f47735] hover:underline"
            >
              View all equipment →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingEquipment ? (
              <p className="col-span-full py-12 text-center text-gray-500">
                Loading equipment...
              </p>
            ) : equipmentError ? (
              <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                {equipmentError}
              </div>
            ) : filteredEquipment.length === 0 ? (
              <p className="col-span-full py-12 text-center text-gray-500">
                No equipment found. Try changing your search or filters.
              </p>
            ) : (
              filteredEquipment.map((item, index) => {
                const saved = favorites.some(
                  (favorite) => favorite._id === item._id
                );

                return (
                  <motion.article
                    key={item._id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-xl"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#f0f2f5]">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#172033] shadow-sm">
                        {item.availability}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleFavorite(item)}
                        aria-label={
                          saved
                            ? `Remove ${item.name} from favorites`
                            : `Save ${item.name} to favorites`
                        }
                        aria-pressed={saved}
                        title={
                          saved ? "Remove from favorites" : "Add to favorites"
                        }
                        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-sm transition hover:scale-110 ${
                          saved ? "text-red-500" : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        {saved ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#f47735]">
                        {item.category}
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-[#172033]">
                        {item.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {item.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          ⌖ {item.location}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            item.availability.toLowerCase() === "available"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.availability}
                        </span>
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
                  </motion.article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Why Rentora */}
      <motion.section
        id="about"
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionAnimation}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
            Why choose Rentora
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">
            Renting made simple.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            Everything you need to find reliable equipment and make your next
            project easier.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition hover:shadow-lg"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e9] text-2xl font-bold text-[#f47735]">
                {benefit.icon}
              </span>

              <h3 className="mt-5 text-lg font-bold text-[#172033]">
                {benefit.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Customer Reviews */}
      <section className="bg-[#f7f8fa] px-5 py-20">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionAnimation}
        >
          <p className="text-xs font-bold uppercase tracking-[3px] text-[#f47735]">
            Customer feedback
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">
            Customer Reviews
          </h2>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-12 shadow-sm">
            <div className="text-4xl text-[#f47735]">★</div>

            <h3 className="mt-4 text-xl font-bold text-[#172033]">
              Your feedback matters
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-500">
              Customer reviews will appear here once the review feature is
              available. We want every review to come from a real Rentora
              customer.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-3xl bg-[#f47735] px-8 py-14 text-center md:flex-row md:px-16 md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-white/80">
              Ready to get started?
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
              Your next project starts here.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85">
              Find the right equipment, connect with owners, and rent smarter
              with Rentora.
            </p>
          </div>

          <Link
            href="/signup"
            className="shrink-0 rounded-xl bg-white px-8 py-4 text-sm font-bold text-[#172033] transition hover:bg-gray-100"
          >
            Create Your Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111a2a] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f47735] text-xl font-bold">
                R
              </span>

              <span className="text-2xl font-extrabold">
                rentora<span className="text-[#f47735]">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              The smarter way to access the equipment you need. Rent what you
              need, when you need it.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Explore</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
              <a href="#categories" className="hover:text-white">
                Categories
              </a>
              <a href="#equipment" className="hover:text-white">
                Equipment
              </a>
              <a href="#about" className="hover:text-white">
                About Rentora
              </a>
              <Link href="/favorites" className="hover:text-white">
                My Favorites
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
              <Link href="/signin" className="hover:text-white">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-white">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Rentora. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
