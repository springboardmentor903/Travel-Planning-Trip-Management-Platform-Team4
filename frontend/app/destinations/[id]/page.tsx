"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDestination, getDestinationPlaces, getDestinationWeather } from "../../../lib/api";
import type { Destination, PlaceInfo, WeatherInfo } from "../../../lib/types";

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
          Loading destination details from backend…
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

          {/* Live Weather Section connected to GET /api/destinations/{id}/weather */}
          <LiveWeatherSection destination={destination} />

          {/* Google Places Section connected to GET /api/destinations/{id}/places */}
          <GooglePlacesSection destination={destination} />
        </div>
      )}
    </AppShell>
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
              Spring Boot Proxy
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time weather forecast for {destination.name} via GET /api/destinations/{destination.id}/weather
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
            Fetching weather via Spring Boot backend…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
                🌤️
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">Backend Weather Service Status</h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">{error}</p>
                <p className="mt-2 text-xs font-semibold text-amber-900">
                  💡 Configured via <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono">WEATHER_API_KEY</code> on the backend.
                </p>
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

  useEffect(() => {
    setLoading(true);
    setError("");

    getDestinationPlaces(destination.id)
      .then(setPlaces)
      .catch((err) => setError(err instanceof Error ? err.message : "Google Places service unavailable."))
      .finally(() => setLoading(false));
  }, [destination.id]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Relevant Places & Attractions</h2>
            <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
              Spring Boot Proxy
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Points of interest in {destination.name} via GET /api/destinations/{destination.id}/places
          </p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-500">
            Querying Google Places via Spring Boot backend…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 text-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📍
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-950">Backend Google Places Service Status</h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-800">{error}</p>
                <p className="mt-2 text-xs font-semibold text-blue-900">
                  💡 Securely configured via <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-950 font-mono">GOOGLE_PLACES_API_KEY</code> on the backend.
                </p>
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
              <div key={place.id || place.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 line-clamp-1">{place.name}</h4>
                  {place.rating != null && (
                    <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                      ⭐ {place.rating}
                    </span>
                  )}
                </div>
                {place.category && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {place.category}
                  </span>
                )}
                {place.address && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">📍 {place.address}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
