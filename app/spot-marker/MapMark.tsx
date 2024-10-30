"use client";
import React, { createElement, useEffect, useRef } from "react";
import mapboxgl, {
  Map as MapboxMap,
  GeolocateControl,
  Marker,
} from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Spot } from "./types";

interface SimpleMapProps {
  onSpotPlaced: (point: { lng: number; lat: number }) => void; // Callback for spot placement
  selectedSpotId: number | null;
  spots: Spot[];
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  onSpotPlaced,
  selectedSpotId,
  spots,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<{ [key: number]: Marker }>({});

  // Click handler for the map
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    console.log("Map clicked:", lng, lat, selectedSpotId);

    // Check if a spot is selected
    if (selectedSpotId !== null) {
      // Remove existing marker for the selected spot (if any)
      if (markersRef.current[selectedSpotId]) {
        markersRef.current[selectedSpotId].remove();
      }

      // Create a new custom marker for the selected spot ID
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.backgroundColor = "green";
      markerElement.style.color = "white";
      markerElement.style.borderRadius = "50%";
      markerElement.style.width = "30px";
      markerElement.style.height = "30px";
      markerElement.style.display = "flex";
      markerElement.style.alignItems = "center";
      markerElement.style.justifyContent = "center";
      markerElement.style.fontWeight = "bold";
      markerElement.innerText = selectedSpotId.toString();

      const newMarker = new Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);
      console.log("New Marker:", newMarker);

      // Store the new marker reference
      markersRef.current[selectedSpotId] = newMarker;

      // Notify the parent component with the coordinates
      onSpotPlaced({ lng, lat });
    }
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXJ1bG1rMTciLCJhIjoiY2x5eWphY2VsMmEwejJqcHlyMTBpNTA5YSJ9.awhbH-MC409jQiIcp9K1Ig";

    // Initialize the map only once
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [-98, 39], // Initial map center
        zoom: 3, // Initial zoom level
      });

      // Add geolocate control to the map
      const geolocateControl = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        fitBoundsOptions: { maxZoom: 15 },
      });

      mapRef.current.addControl(geolocateControl);

      // Add Mapbox Geocoder for search functionality
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
        marker: false, // Disable default marker
        placeholder: "Search for a location",
      });

      // Add geocoder to the map
      mapRef.current.addControl(geocoder, "top-left");
    }

    if (mapRef.current) {
      mapRef.current.on("click", handleMapClick);
    }
    // Cleanup: Unregister the click event listener to prevent duplicate handlers
    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [selectedSpotId, onSpotPlaced]);

  useEffect(() => {
    // Ensure markers are updated when spots change
    if (!mapRef.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for spots with locations
    spots.forEach((spot) => {
      if (spot.location) {
        // Create a custom marker element with the spot ID
        const markerElement = document.createElement("div");
        markerElement.className = "custom-marker";
        markerElement.style.backgroundColor = "green";
        markerElement.style.color = "white";
        markerElement.style.borderRadius = "50%";
        markerElement.style.width = "30px";
        markerElement.style.height = "30px";
        markerElement.style.display = "flex";
        markerElement.style.alignItems = "center";
        markerElement.style.justifyContent = "center";
        markerElement.style.fontWeight = "bold";
        markerElement.innerText = spot.id.toString();

        const marker = new Marker(markerElement)
          .setLngLat([spot.location.lng, spot.location.lat])
          .addTo(mapRef.current!);
        markersRef.current[spot.id] = marker;
      }
    });
  }, [spots]);

  return (
    <div
      style={{ width: "640px", height: "640px", position: "relative" }}
      ref={mapContainerRef}
    />
  );
};

export default SimpleMap;
