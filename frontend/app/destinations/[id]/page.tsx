"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDestination, getDestinationPlaces, getDestinationWeather } from "../../../lib/api";
import type { Destination, PlaceInfo, WeatherInfo } from "../../../lib/types";
import MapView from "../../../components/MapView";

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
      {/* Navigation Header */}
      <div className="mb-7 flex items-center justify-between">
        <Link
          href="/destinations"
          className="inline-flex items-center text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
        >
          ← Back to Destinations
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          Loading destination details…
        </div>
      ) : !destination ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🌍
          </div>
          <h3 className="mt-4 text-lg font-extrabold text-slate-900">Destination Not Found</h3>
          <p className="mt-1 text-sm text-slate-500">The destination you requested could not be found in the database.</p>
          <Link href="/destinations" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
            Return to Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Destination Hero Card */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-72 w-full bg-slate-900 sm:h-96">
              {destination.imageUrl ? (
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="h-full w-full object-cover opacity-90"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-700 to-violet-700 text-7xl">
                  🌴
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  {destination.category && (
                    <span className="inline-block rounded-full bg-indigo-600/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white shadow-sm">
                      {destination.category}
                    </span>
                  )}
                  <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-5xl">{destination.name}</h1>
                  <p className="mt-1 text-lg font-bold text-indigo-200">
                    📍 {destination.city || destination.location || destination.country || "Global Location"}
                    {destination.country && destination.city ? `, ${destination.country}` : ""}
                  </p>
                </div>

                <Link
                  href={`/trips/new?destinationId=${destination.id}`}
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-700"
                >
                  ✈️ Plan a Trip Here
                </Link>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8 border-b border-slate-100">
              <InfoCard label="City" value={destination.city || "Not specified"} icon="🏙️" />
              <InfoCard label="Country" value={destination.country || "Not specified"} icon="🌐" />
              <InfoCard label="Category" value={destination.category || "General"} icon="🏷️" />
            </div>

            {/* Description */}
            <div className="p-6 sm:p-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-400">About {destination.name}</h2>
              <p className="mt-3 text-sm leading-8 text-slate-700 whitespace-pre-wrap">
                {destination.description || "No detailed description available for this destination."}
              </p>
            </div>
          </section>

          {/* OpenStreetMap + Leaflet Location Map */}
          <DestinationMapSection destination={destination} />

          {/* Live Weather Section connected to GET /api/destinations/{id}/weather */}
          <LiveWeatherSection destination={destination} />

          {/* Google Places Section connected to GET /api/destinations/{id}/places */}
          <GooglePlacesSection destination={destination} />
        </div>
      )}
    </AppShell>
  );
}

function DestinationMapSection({ destination }: { destination: Destination }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Interactive Location Map</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
              Interactive Map
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Explore {destination.name} location map and surrounding area
          </p>
        </div>
      </div>

      <MapView singleDestination={destination} height="380px" />
    </section>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-base font-extrabold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
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
      .catch((err) => setError(err instanceof Error ? err.message : "Weather service unavailable."))
      .finally(() => setLoading(false));
  }, [destination.id]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Live Weather</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
              Live Forecast
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time weather forecast for {destination.name}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
            Fetching live weather forecast…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                🌤️
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">Weather Service Status</h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">{error}</p>
              </div>
            </div>
          </div>
        ) : weather ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🌡️</span>
                <span className="text-3xl font-extrabold text-indigo-700">
                  {weather.temperature != null ? `${Math.round(weather.temperature)}°C` : "N/A"}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">{weather.condition}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <span className="text-2xl">🤒</span>
              <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Feels Like</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">
                {weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <span className="text-2xl">💧</span>
              <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Humidity</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">
                {weather.humidity != null ? `${weather.humidity}%` : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <span className="text-2xl">💨</span>
              <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Wind Speed</p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">
                {weather.windSpeed != null ? `${weather.windSpeed} m/s` : "N/A"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GooglePlacesSection({ destination }: { destination: Destination }) {
  const [places, setPlaces] = useState<PlaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");

    getDestinationPlaces(destination.id)
      .then(setPlaces)
      .catch((err) => setError(err instanceof Error ? err.message : "Points of Interest service unavailable."))
      .finally(() => setLoading(false));
  }, [destination.id]);

  const getGoogleMapsUrl = (placeName: string, address?: string) => {
    const query = `${placeName} ${address || destination.name || ""}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getOsmUrl = (placeName: string, address?: string) => {
    const query = `${placeName} ${address || destination.name || ""}`;
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Relevant Places & Attractions</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
              OpenStreetMap + Overpass API
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Click any attraction card to view map locations, directions, and explore points of interest in {destination.name}.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
            Fetching OpenStreetMap Points of Interest via Overpass API...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl">
                📍
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-950">Points of Interest Service</h3>
                <p className="mt-1 text-xs leading-relaxed text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs font-semibold text-slate-500">
            No attraction places returned for this location.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <div
                key={place.id || place.name}
                onClick={() => setSelectedPlace(place)}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus:outline-none"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors" title={place.name}>
                      {place.name}
                    </h4>
                    {place.rating != null && (
                      <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                        ⭐ {place.rating}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    {place.category && (
                      <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-100">
                        {place.category}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      OSM POI
                    </span>
                  </div>

                  {place.address && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">📍 {place.address}</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-extrabold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    View Details & Directions →
                  </span>
                  <a
                    href={getGoogleMapsUrl(place.name, place.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg bg-slate-100 p-1.5 text-xs text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 transition"
                    title="Open directly in Google Maps"
                  >
                    🗺️
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Attraction Detail Popup Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700 border border-emerald-100">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-100">
                      {selectedPlace.category || "Attraction"}
                    </span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                      ⭐ {selectedPlace.rating || 4.8} / 5.0
                    </span>
                  </div>
                  <h3 className="mt-1 text-xl font-black text-slate-900 leading-tight">
                    {selectedPlace.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlace(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location & Address</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                📍 {selectedPlace.address || `${destination.name}, ${destination.country || ""}`}
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              This tourist attraction is recorded in OpenStreetMap. You can view map directions, explore photos, or add this destination to your travel itinerary.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <a
                href={getGoogleMapsUrl(selectedPlace.name, selectedPlace.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                🗺️ View on Google Maps ↗
              </a>
              <a
                href={getOsmUrl(selectedPlace.name, selectedPlace.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                🌍 View on OpenStreetMap ↗
              </a>
              <Link
                href={`/trips/new?destinationId=${destination.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
              >
                + Plan Trip Here
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
