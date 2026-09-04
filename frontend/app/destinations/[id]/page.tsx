"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDestination, getDestinationPlaces, getDestinationWeather } from "../../../lib/api";
import type { Destination, PlaceInfo, WeatherInfo } from "../../../lib/types";
import { ArrowLeft, MapPin, Thermometer, Wind, Droplets, Cloud, Sparkles, Plus, Star } from "lucide-react";

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setError("");

    getDestination(params.id)
      .then(setDestination)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load destination details."))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AppShell>
      {/* Header Back Button */}
      <div className="mb-6">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Destinations
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-12 text-center text-xs font-semibold text-[#6B7280]">
          Loading destination details...
        </div>
      ) : !destination ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-12 text-center">
          <h3 className="text-base font-extrabold text-[#111827]">Destination Not Found</h3>
          <p className="mt-1 text-xs text-[#6B7280]">The destination you requested does not exist.</p>
          <Link href="/destinations" className="mt-4 inline-flex rounded-xl bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white">
            Return to Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* MAIN DESTINATION HERO */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#111827] text-white shadow-lg">
            <div className="relative h-80 sm:h-[420px] w-full">
              <img
                src={
                  destination.imageUrl ||
                  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
                }
                alt={destination.name}
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      Featured Destination
                    </span>
                    {destination.category && (
                      <span className="rounded-full bg-indigo-500/80 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        {destination.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{destination.name}</h1>
                  <p className="mt-1.5 text-sm text-white/80 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <span>{destination.city || destination.country}{destination.city && destination.country ? `, ${destination.country}` : ""}</span>
                  </p>
                </div>

                <Link
                  href={`/trips/new?destinationId=${destination.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#3730A3] transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Plan Trip Here</span>
                </Link>
              </div>
            </div>

            {/* Overview Metadata */}
            <div className="p-6 sm:p-8 border-t border-white/10 bg-white/5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                About {destination.name}
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {destination.description || "Explore breathtaking landmarks, local culinary scenes, and rich cultural heritage."}
              </p>
            </div>
          </div>

          {/* LIVE WEATHER SECTION */}
          <LiveWeatherSection destination={destination} />

          {/* GOOGLE PLACES SECTION */}
          <GooglePlacesSection destination={destination} />
        </div>
      )}
    </AppShell>
  );
}

function LiveWeatherSection({ destination }: { destination: Destination }) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getDestinationWeather(destination.id)
      .then(setWeather)
      .catch((err) => setError(err instanceof Error ? err.message : "Weather service currently unavailable."))
      .finally(() => setLoading(false));
  }, [destination.id]);

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#F1F1EF] pb-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#111827]">Live Weather Forecast</h2>
          <p className="text-xs text-[#6B7280]">Real-time meteorological insights for {destination.name}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-[#4338CA]">
          OpenWeather API
        </span>
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-[#6B7280]">Fetching weather data...</div>
      ) : error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-800">
          <p className="font-bold">Weather Info Note</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : weather ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4">
            <div className="flex items-center justify-between">
              <Thermometer className="h-5 w-5 text-[#4338CA]" />
              <span className="text-2xl font-extrabold text-[#111827]">
                {weather.temperature != null ? `${Math.round(weather.temperature)}°C` : "N/A"}
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#6B7280]">Temperature</p>
            <p className="text-xs font-bold text-[#111827]">{weather.condition}</p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4">
            <Cloud className="h-5 w-5 text-indigo-500 mb-2" />
            <p className="text-[11px] font-semibold text-[#6B7280]">Feels Like</p>
            <p className="text-base font-extrabold text-[#111827]">
              {weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4">
            <Droplets className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-[11px] font-semibold text-[#6B7280]">Humidity</p>
            <p className="text-base font-extrabold text-[#111827]">
              {weather.humidity != null ? `${weather.humidity}%` : "N/A"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4">
            <Wind className="h-5 w-5 text-teal-500 mb-2" />
            <p className="text-[11px] font-semibold text-[#6B7280]">Wind Speed</p>
            <p className="text-base font-extrabold text-[#111827]">
              {weather.windSpeed != null ? `${weather.windSpeed} m/s` : "N/A"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GooglePlacesSection({ destination }: { destination: Destination }) {
  const [places, setPlaces] = useState<PlaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getDestinationPlaces(destination.id)
      .then(setPlaces)
      .catch((err) => setError(err instanceof Error ? err.message : "Places service unavailable."))
      .finally(() => setLoading(false));
  }, [destination.id]);

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#F1F1EF] pb-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#111827]">Top Attractions & Places</h2>
          <p className="text-xs text-[#6B7280]">Curated points of interest in {destination.name}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-[#6B7280]">Fetching places...</div>
      ) : error ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4 text-xs text-[#6B7280]">
          {error}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center text-xs text-[#6B7280] py-6">No specific attraction places returned.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {places.map((place) => (
            <div key={place.id || place.name} className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-4">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-[#111827]">{place.name}</h4>
                {place.rating != null && (
                  <span className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500" /> {place.rating}
                  </span>
                )}
              </div>
              {place.address && <p className="mt-2 text-[11px] text-[#6B7280] line-clamp-2">{place.address}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
