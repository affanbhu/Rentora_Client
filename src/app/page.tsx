
import Link from "next/link";

const categories = [
  { name: "Construction", icon: "🏗️", count: "120+ items" },
  { name: "Vehicles", icon: "🚜", count: "85+ items" },
  { name: "Power Tools", icon: "🔧", count: "200+ items" },
  { name: "Electronics", icon: "💻", count: "95+ items" },
  { name: "Home & Living", icon: "🏠", count: "70+ items" },
  { name: "Events", icon: "🎪", count: "60+ items" },
];

const equipment = [
  {
    name: "Heavy Duty Excavator",
    category: "Construction Equipment",
    price: "$180",
    period: "/day",
    rating: "4.9",
    location: "Dhaka, Bangladesh",
    image: "🚜",
    tag: "Popular",
  },
  {
    name: "Professional Generator",
    category: "Power Equipment",
    price: "$45",
    period: "/day",
    rating: "4.8",
    location: "Chattogram, Bangladesh",
    image: "⚡",
    tag: "Available",
  },
  {
    name: "Industrial Concrete Mixer",
    category: "Construction Equipment",
    price: "$65",
    period: "/day",
    rating: "4.9",
    location: "Dhaka, Bangladesh",
    image: "🏗️",
    tag: "Top Rated",
  },
];

const benefits = [
  {
    icon: "✓",
    title: "Verified Equipment",
    description: "Every listing is reviewed to help you rent with confidence.",
  },
  {
    icon: "↗",
    title: "Simple Booking",
    description: "Find the equipment you need and arrange your rental easily.",
  },
  {
    icon: "◎",
    title: "Trusted Community",
    description: "Connect with equipment owners and renters in one place.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Navbar */}
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
            <Link href="/" className="text-[#f47735]">Home</Link>
            <a href="#categories" className="transition hover:text-[#f47735]">Categories</a>
            <a href="#equipment" className="transition hover:text-[#f47735]">Explore Equipment</a>
            <a href="#about" className="transition hover:text-[#f47735]">About Us</a>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative bg-[#172033]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full border-[50px] border-white" />
          <div className="absolute -bottom-60 left-1/3 h-96 w-96 rounded-full border-[50px] border-white" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28 lg:px-8">
          <div>
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
              <div>
                <p className="text-2xl font-extrabold text-white">500+</p>
                <p className="mt-1 text-xs text-gray-400">Equipment Listings</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">200+</p>
                <p className="mt-1 text-xs text-gray-400">Happy Renters</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">4.9/5</p>
                <p className="mt-1 text-xs text-gray-400">Customer Rating</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-3xl bg-[#f47735]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#35435a] to-[#202c40] p-7 shadow-2xl sm:p-10">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-400/15 px-3 py-1.5 text-xs font-semibold text-green-300">
                  ● Ready to rent
                </span>
                <span className="text-sm text-gray-300">Featured equipment</span>
              </div>

              <div className="flex h-64 items-center justify-center text-9xl">
                🚜
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-widest text-orange-300">
                  Construction / Heavy Machinery
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Heavy Duty Excavator
                </h3>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-white">$180</span>
                    <span className="text-sm text-gray-300"> / day</span>
                  </div>
                  <span className="text-sm text-yellow-300">★ 4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="relative z-10 mx-auto -mt-7 max-w-6xl px-5">
        <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-gray-200/70 md:grid-cols-[1fr_1fr_1fr_auto] md:p-5">
          <div className="px-3 py-2">
            <label className="block text-xs font-bold text-gray-500">WHAT DO YOU NEED?</label>
            <input
              type="text"
              placeholder="Search equipment..."
              className="mt-2 w-full border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="border-gray-200 px-3 py-2 md:border-l">
            <label className="block text-xs font-bold text-gray-500">CATEGORY</label>
            <select className="mt-2 w-full bg-transparent text-sm text-gray-700 outline-none">
              <option>All Categories</option>
              <option>Construction</option>
              <option>Vehicles</option>
              <option>Power Tools</option>
              <option>Electronics</option>
            </select>
          </div>
          <div className="border-gray-200 px-3 py-2 md:border-l">
            <label className="block text-xs font-bold text-gray-500">LOCATION</label>
            <input
              type="text"
              placeholder="Enter your location"
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
      <section id="categories" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
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
          <a href="#equipment" className="text-sm font-bold text-[#f47735] hover:underline">
            View all equipment →
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#equipment"
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#f47735] hover:shadow-lg"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff1e9] text-3xl transition group-hover:bg-[#f47735]">
                {category.icon}
              </span>
              <h3 className="mt-5 text-sm font-bold text-[#172033]">
                {category.name}
              </h3>
              <p className="mt-2 text-xs text-gray-500">{category.count}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured equipment */}
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
            <a href="#categories" className="text-sm font-bold text-[#f47735] hover:underline">
              Explore categories →
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <article
                key={item.name}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative flex h-56 items-center justify-center bg-[#f0f2f5] text-8xl transition group-hover:bg-[#e9edf2]">
                  {item.image}
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#172033] shadow-sm">
                    {item.tag}
                  </span>
                  <button
                    type="button"
                    aria-label={`Save ${item.name}`}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:text-[#f47735]"
                  >
                    ♡
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#f47735]">
                    {item.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#172033]">
                    {item.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">★ {item.rating}</span>
                    <span className="text-xs text-gray-500">⌖ {item.location}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                    <p>
                      <span className="text-2xl font-extrabold text-[#172033]">{item.price}</span>
                      <span className="text-xs text-gray-500">{item.period}</span>
                    </p>
                    <Link
                      href="/signin"
                      className="rounded-lg bg-[#172033] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#f47735]"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rentora */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
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
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-lg"
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
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
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
              <a href="#categories" className="hover:text-white">Categories</a>
              <a href="#equipment" className="hover:text-white">Equipment</a>
              <a href="#about" className="hover:text-white">About Rentora</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-400">
              <Link href="/signin" className="hover:text-white">Sign In</Link>
              <Link href="/signup" className="hover:text-white">Create Account</Link>
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
