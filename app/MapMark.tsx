"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl, { Map as MapboxMap, GeolocateControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SimpleMapProps {
  onSpotPlaced: (point: { lng: number; lat: number }) => void; // Callback for spot placement
}

const SimpleMap: React.FC<SimpleMapProps> = ({ onSpotPlaced }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoiYXJ1bG1rMTciLCJhIjoiY2x5eWphY2VsMmEwejJqcHlyMTBpNTA5YSJ9.awhbH-MC409jQiIcp9K1Ig"; // Add your Mapbox access token here

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [-98, 39], // Center of the map
        zoom: 3, // Default zoom level
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

      // Handle map clicks to place a spot
      mapRef.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        onSpotPlaced({ lng, lat }); // Notify the parent with the coordinates
      });
    }

    // Cleanup the map on component unmount
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [onSpotPlaced]);

  return (
    <div className="w-full h-1/4" ref={mapContainerRef} />
  );
};

export default SimpleMap;
