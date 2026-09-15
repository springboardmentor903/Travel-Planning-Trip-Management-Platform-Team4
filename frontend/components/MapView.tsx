"use client";

import React, { useEffect, useRef } from "react";
import type { Destination } from "../lib/types";

interface MapViewProps {
  destinations?: Destination[];
  singleDestination?: Destination | null;
  height?: string;
  zoom?: number;
}

export default function MapView({
  destinations = [],
  singleDestination,
  height = "400px",
  zoom = 3,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const itemsToMap = singleDestination ? [singleDestination] : destinations;

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    import("leaflet").then((L) => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const validItems = itemsToMap.filter(
        (item) => typeof item.latitude === "number" && typeof item.longitude === "number"
      );

      let initialLat = 20.0;
      let initialLng = 0.0;
      let initialZoom = zoom;

      if (
        singleDestination &&
        typeof singleDestination.latitude === "number" &&
        typeof singleDestination.longitude === "number"
      ) {
        initialLat = singleDestination.latitude;
        initialLng = singleDestination.longitude;
        initialZoom = 10;
      } else if (validItems.length > 0) {
        initialLat = validItems[0].latitude!;
        initialLng = validItems[0].longitude!;
      }

      const map = L.map(mapContainerRef.current!).setView([initialLat, initialLng], initialZoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const customIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const bounds = L.latLngBounds([]);

      validItems.forEach((dest) => {
        if (typeof dest.latitude === "number" && typeof dest.longitude === "number") {
          const marker = L.marker([dest.latitude, dest.longitude], { icon: customIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
              <strong style="color: #1e293b; font-size: 14px;">${dest.name}</strong><br/>
              <span style="color: #64748b;">${dest.city || dest.country || ""}</span>
            </div>
          `);
          bounds.extend([dest.latitude, dest.longitude]);
        }
      });

      if (validItems.length > 1 && !singleDestination) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destinations, singleDestination, zoom]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} className="z-10" />
    </div>
  );
}
