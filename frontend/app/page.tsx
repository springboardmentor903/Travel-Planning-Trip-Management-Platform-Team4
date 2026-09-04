"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Compass,
  MapPin,
  Search,
  Bell,
  Sun,
  User,
  ArrowRight,
  Play,
  Heart,
  Star,
  Globe,
  Sparkles,
  Luggage,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";

const DESTINATIONS = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    rating: 4.9,
    reviews: "12.4k",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    tag: "Romantic",
  },
  {
    id: 2,
    name: "Tokyo",
    country: "Japan",
    rating: 4.9,
    reviews: "18.1k",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    tag: "Culture",
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    rating: 4.8,
    reviews: "9.8k",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    tag: "Tropical",
  },
  {
    id: 4,
    name: "Swiss Alps",
    country: "Switzerland",
    rating: 4.9,
    reviews: "14.2k",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    tag: "Adventure",
  },
  {
    id: 5,
    name: "New York",
    country: "United States",
    rating: 4.7,
    reviews: "22.5k",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    tag: "Urban",
  },
  {
    id: 6,
    name: "Maldives",
    country: "Indian Ocean",
    rating: 5.0,
    reviews: "8.7k",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
    tag: "Luxury",
  },
];

const LOGOS = ["Airbnb", "Tripadvisor", "Emirates", "Lonely Planet", "Booking.com"];

export default function LandingPage() {
  const [favorites, setFavorites] = useState<number[]>([1, 4]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#111827] font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* TOP NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB]/60 bg-[#FAFAF9]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-white shadow-xs">
              <Plane className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827]">TripNest</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B7280]">
            <a href="#features" className="transition hover:text-[#111827]">Features</a>
            <a href="#destinations" className="transition hover:text-[#111827]">Destinations</a>
            <a href="#planner" className="transition hover:text-[#111827]">Trip Planner</a>
            <a href="#explore" className="transition hover:text-[#111827]">Explore</a>
            <a href="#resources" className="transition hover:text-[#111827]">Resources</a>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-full border border-[#E5E7EB] bg-white py-1.5 pl-9 pr-4 text-xs text-[#111827] outline-none transition focus:w-56 focus:border-[#4338CA]"
              />
            </div>
            <button aria-label="Notifications" className="rounded-full p-2 text-[#6B7280] hover:bg-[#F1F1EF] hover:text-[#111827] transition">
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-[#111827] hover:text-[#4338CA] px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-[#4338CA] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3730A3]"
            >
              Start Planning →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 sm:px-10 sm:pt-20 sm:pb-24">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* LEFT SIDE EDITORIAL TYPOGRAPHY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#4338CA] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Editorial Travel Platform</span>
            </div>

            <h1 className="text-[42px] sm:text-[56px] lg:text-[76px] font-extrabold tracking-tight leading-[1.05] text-[#111827]">
              Travel <br />
              <span className="text-[#4338CA]">Your World</span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#6B7280]">
              Plan unforgettable journeys, organize every detail, and discover the world your way with intuitive smart itineraries and real-time insights.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-[#3730A3] hover:-translate-y-0.5"
              >
                <span>Start Planning</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3.5 text-sm font-semibold text-[#111827] shadow-xs hover:bg-[#F1F1EF] transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4338CA]/10 text-[#4338CA]">
                  <Play className="h-3.5 w-3.5 fill-[#4338CA] ml-0.5" />
                </div>
                <span>Watch Story</span>
              </button>
            </div>

            {/* TRUSTED BY LOGOS */}
            <div className="mt-12 border-t border-[#E5E7EB] pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Trusted by travelers worldwide
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-6 opacity-60 filter grayscale hover:grayscale-0 transition duration-300">
                {LOGOS.map((logo) => (
                  <span key={logo} className="text-sm font-bold text-[#4B5563] tracking-tight">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE LAYERED COMPOSITION */}
          <div className="lg:col-span-6 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg"
            >
              {/* Arched Travel Image */}
              <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden rounded-t-[180px] rounded-b-3xl border-4 border-white bg-slate-200 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
                  alt="Epic Travel Destination"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    Featured Landmark
                  </span>
                  <h3 className="mt-2 text-2xl font-extrabold">Yosemite Valley & Alps</h3>
                  <p className="text-xs text-white/80">Curated itinerary for nature seekers</p>
                </div>
              </div>

              {/* Floating Airplane */}
              <motion.div
                animate={{ y: [-6, 6, -6], x: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute -top-6 -right-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl border border-[#E5E7EB]"
              >
                <Plane className="h-7 w-7 text-[#4338CA] rotate-45" />
              </motion.div>

              {/* Floating Traveler Card 1 */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-20 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 p-3.5 shadow-xl backdrop-blur-md"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Sneha"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-[#111827]">Sneha Sharma</p>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-rose-500" /> London, UK
                  </p>
                </div>
              </motion.div>

              {/* Floating Traveler Card 2 */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 -right-6 z-20 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 p-3.5 shadow-xl backdrop-blur-md"
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Rahul"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-[#111827]">Rahul Verma</p>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-500" /> Paris, France
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATISTICS CONTAINER */}
      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x md:divide-[#E5E7EB]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4338CA] mb-3">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#111827]">150+</span>
              <span className="mt-1 text-xs font-bold text-[#111827]">Countries</span>
              <span className="text-xs text-[#6B7280]">Explore the world</span>
            </div>

            <div className="flex flex-col items-center text-center md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                <Luggage className="h-5 w-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#111827]">500K+</span>
              <span className="mt-1 text-xs font-bold text-[#111827]">Happy Travelers</span>
              <span className="text-xs text-[#6B7280]">Joined our community</span>
            </div>

            <div className="flex flex-col items-center text-center md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#111827]">10K+</span>
              <span className="mt-1 text-xs font-bold text-[#111827]">Destinations</span>
              <span className="text-xs text-[#6B7280]">Curated for you</span>
            </div>

            <div className="flex flex-col items-center text-center md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 mb-3">
                <Star className="h-5 w-5 fill-rose-500" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#111827]">4.8/5</span>
              <span className="mt-1 text-xs font-bold text-[#111827]">User Rating</span>
              <span className="text-xs text-[#6B7280]">Loved by travelers</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DESTINATION GALLERY SECTION */}
      <section id="destinations" className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4338CA]">Curated Collections</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#111827]">Explore Top Destinations</h2>
          </div>
          <Link
            href="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4338CA] hover:text-[#3730A3]"
          >
            <span>View all destinations</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-[#111827]/20 to-transparent" />

                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#111827] backdrop-blur-xs">
                  {item.tag}
                </span>

                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  aria-label="Save to favorites"
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#111827] backdrop-blur-xs transition hover:bg-white"
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-rose-500 text-rose-500" : "text-[#111827]"}`} />
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
                    <Star className="h-3.5 w-3.5 fill-amber-300" />
                    <span>{item.rating}</span>
                    <span className="text-white/70">({item.reviews})</span>
                  </div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {item.country}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E7EB] bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-white">
              <Plane className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-base font-bold text-[#111827]">TripNest</span>
          </div>

          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} TripNest Platform (Team 4). Built with passion for modern travelers.
          </p>

          <div className="flex gap-6 text-xs text-[#6B7280]">
            <a href="#privacy" className="hover:text-[#111827]">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#111827]">Terms of Service</a>
            <a href="#contact" className="hover:text-[#111827]">Support</a>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/80 backdrop-blur-md p-4"
          >
            <div className="relative w-full max-w-3xl rounded-2xl bg-black overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="TripNest Video Story"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
