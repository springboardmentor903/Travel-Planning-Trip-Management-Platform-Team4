"use client";

import { useEffect, useRef, useState } from "react";
import type { CreateDestinationRequest, DestinationAdminDTO } from "../../lib/types";
import { createAdminDestination, updateAdminDestination } from "../../lib/api";
import "leaflet/dist/leaflet.css";

interface DestinationFormModalProps {
  isOpen: boolean;
  destination: DestinationAdminDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Metropolitan",
  "Beach & Nature",
  "Historical",
  "Coastal",
  "Luxury",
  "Mountain & Nature",
  "Cultural",
  "Coastal & Island",
  "Adventure & Wildlife",
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34";

export default function DestinationFormModal({
  isOpen,
  destination,
  onClose,
  onSuccess,
}: DestinationFormModalProps) {
  const [formData, setFormData] = useState<CreateDestinationRequest>({
    name: "",
    country: "",
    city: "",
    category: "Metropolitan",
    description: "",
    imageUrl: DEFAULT_IMAGE,
    latitude: 48.8566,
    longitude: 2.3522,
    active: true,
    estimatedBudget: 1500,
    bestTravelSeason: "Year-round",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapAddressSearch, setMapAddressSearch] = useState("");
  const [searchingLocation, setSearchingLocation] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || "",
        country: destination.country || "",
        city: destination.city || "",
        category: destination.category || "Metropolitan",
        description: destination.description || "",
        imageUrl: destination.imageUrl || DEFAULT_IMAGE,
        latitude: destination.latitude ?? 48.8566,
        longitude: destination.longitude ?? 2.3522,
        active: destination.active ?? true,
        estimatedBudget: destination.estimatedBudget ?? 1500,
        bestTravelSeason: destination.bestTravelSeason || "Year-round",
      });
    } else {
      setFormData({
        name: "",
        country: "",
        city: "",
        category: "Metropolitan",
        description: "",
        imageUrl: DEFAULT_IMAGE,
        latitude: 48.8566,
        longitude: 2.3522,
        active: true,
        estimatedBudget: 1500,
        bestTravelSeason: "Year-round",
      });
    }
    setError(null);
  }, [destination, isOpen]);

  // Leaflet map initialization for coordinate picking
  useEffect(() => {
    if (!isOpen || !mapRef.current || typeof window === "undefined") return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      // Fix icon URLs
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialLat = formData.latitude ?? 48.8566;
      const initialLng = formData.longitude ?? 2.3522;

      const containerEl = mapRef.current as HTMLElement & { _leaflet_id?: string };
      if (containerEl._leaflet_id) {
        containerEl._leaflet_id = undefined;
        containerEl.innerHTML = "";
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }

      try {
        const map = L.map(containerEl, {
          scrollWheelZoom: true,
          zoomAnimation: false,
        }).setView([initialLat, initialLng], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Click map to pick location
        map.on("click", (e: L.LeafletMouseEvent) => {
          const lat = parseFloat(e.latlng.lat.toFixed(4));
          const lng = parseFloat(e.latlng.lng.toFixed(4));

          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          marker.setLatLng([lat, lng]);
          map.panTo([lat, lng]);
        });

        // Drag marker to update location
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          const lat = parseFloat(pos.lat.toFixed(4));
          const lng = parseFloat(pos.lng.toFixed(4));
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        });

        mapInstanceRef.current = map;
      } catch {
        // ignore
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update map marker when latitude/longitude manual inputs change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const lat = Number(formData.latitude);
      const lng = Number(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [formData.latitude, formData.longitude]);

  // Search address via Nominatim API to set coordinates
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapAddressSearch.trim() || searchingLocation) return;

    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          mapAddressSearch.trim()
        )}&format=json&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(parseFloat(data[0].lat).toFixed(4));
        const lng = parseFloat(parseFloat(data[0].lon).toFixed(4));

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          city: prev.city || mapAddressSearch.split(",")[0].trim(),
        }));

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 11);
        }
      } else {
        setError("Location not found. Please try a broader city or landmark name.");
      }
    } catch {
      setError("Failed to geocode location.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Destination name is required.");
      return;
    }
    if (!formData.country.trim()) {
      setError("Country is required.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (formData.latitude < -90 || formData.latitude > 90) {
      setError("Latitude must be between -90 and 90 degrees.");
      return;
    }
    if (formData.longitude < -180 || formData.longitude > 180) {
      setError("Longitude must be between -180 and 180 degrees.");
      return;
    }
    if (formData.estimatedBudget !== undefined && formData.estimatedBudget < 0) {
      setError("Estimated budget cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      if (destination) {
        await updateAdminDestination(destination.id, formData);
      } else {
        await createAdminDestination(formData);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save destination.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-700/60 bg-slate-900/95 text-slate-100 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{destination ? "✏️ Edit Destination" : "➕ Create New Destination"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {destination
                ? `Updating destination #${destination.id} (${destination.name})`
                : "Add a new world destination to the TripNest platform catalog"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300 shadow-inner flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                1. Basic Info & Meta
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paris, Tokyo, Bali"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., France"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Paris"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.estimatedBudget || 0}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Best Travel Season</label>
                  <input
                    type="text"
                    value={formData.bestTravelSeason || ""}
                    onChange={(e) => setFormData({ ...formData, bestTravelSeason: e.target.value })}
                    placeholder="e.g., Spring & Fall, Year-round"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Active Status</label>
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.active)}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-200">
                      {formData.active ? "Active (Available for trips)" : "Deactivated (Hidden)"}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rich overview describing highlights, culture, attractions..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Cover Image URL & Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                {formData.imageUrl && (
                  <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <div className="relative h-28 w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="absolute bottom-1.5 left-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                        Live Image Preview
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Map Picker & Coordinates */}
            <div className="space-y-4 flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                2. Location & Map Picker
              </h3>

              {/* Quick Geocode Search Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapAddressSearch}
                  onChange={(e) => setMapAddressSearch(e.target.value)}
                  placeholder="Search city/landmark to position map…"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleMapSearch}
                  disabled={searchingLocation}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
                >
                  {searchingLocation ? "Searching…" : "Locate 📍"}
                </button>
              </div>

              {/* Leaflet Map Picker Container */}
              <div className="relative flex-1 min-h-[220px] rounded-2xl border border-slate-700 overflow-hidden bg-slate-950 shadow-inner">
                <div ref={mapRef} className="h-full w-full min-h-[220px] z-0" />
                <div className="absolute bottom-2 left-2 z-[400] rounded-lg bg-slate-950/90 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md border border-slate-800">
                  💡 Click or drag marker to set exact coordinates
                </div>
              </div>

              {/* Latitude and Longitude Manual Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Latitude (-90 to 90) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-mono font-medium text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Longitude (-180 to 180) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-xs font-mono font-medium text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : destination ? (
                "Save Changes"
              ) : (
                "Create Destination"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
