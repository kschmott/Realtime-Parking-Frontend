"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl, {
  Map as MapboxMap,
  GeolocateControl,
  Marker,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxExample: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXJ1bG1rMTciLCJhIjoiY2x5eWphY2VsMmEwejJqcHlyMTBpNTA5YSJ9.awhbH-MC409jQiIcp9K1Ig";

    if (mapContainerRef.current) {
      // Initialize the Mapbox map instance
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [-24, 42],
        zoom: 1,
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

      // Automatically trigger the geolocate control
      mapRef.current.on("load", () => {
        geolocateControl.trigger();
      });

      // Example parking spots (replace with real-time data)
      const parkingSpots = [
        { lng: -24.001, lat: 42.001, available: true },
        { lng: -24.002, lat: 42.002, available: false },
      ];

      // Add parking spot markers
      parkingSpots.forEach((spot) => {
        new Marker({
          color: spot.available ? "green" : "red",
        })
          .setLngLat([spot.lng, spot.lat])
          .addTo(mapRef.current as MapboxMap);
      });
    }

    // Cleanup the map on component unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []); // Initial map setup

  // Toggle map style without resetting zoom or center
  const toggleMapStyle = () => {
    if (mapRef.current) {
      // Get current center and zoom
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();

      // Toggle style
      const newStyle =
        mapStyle === "mapbox://styles/mapbox/streets-v12"
          ? "mapbox://styles/mapbox/satellite-streets-v12"
          : "mapbox://styles/mapbox/streets-v12";
      setMapStyle(newStyle);

      // Set the new style while preserving center and zoom
      mapRef.current.setStyle(newStyle);
      mapRef.current.on("style.load", () => {
        mapRef.current?.setCenter(currentCenter);
        mapRef.current?.setZoom(currentZoom);
      });
    }
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    }
  };

  return (
    <div className="w-full h-[calc(100dvh)] relative">
      {/* Search Input */}
      <div className="absolute top-4 left-4 z-[2] flex gap-2">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </form>

        {/* Toggle Button */}
        <button
          onClick={toggleMapStyle}
          className="p-2 bg-gray-500 text-white rounded"
        >
          Toggle View
        </button>
      </div>

      {/* Map Container */}
      <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>
    </div>
  );
};

export default MapboxExample;
