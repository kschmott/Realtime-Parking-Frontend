"use client";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import mapboxgl, {
  Map as MapboxMap,
  GeolocateControl,
  Marker,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxExampleProps {
  onSpotPlaced: (lng: number, lat: number) => void; // Prop type for the callback function
}

const MapboxExample = forwardRef<HTMLDivElement, MapboxExampleProps>(
  ({ onSpotPlaced }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [mapStyle, setMapStyle] = useState(
      "mapbox://styles/mapbox/streets-v12"
    );
    const [parkingSpots, setParkingSpots] = useState<
      { lng: number; lat: number; available: boolean }[]
    >([]);
    const [showMap, setShowMap] = useState(true);

    // Replace this with the URL of your actual image
    const imageURL = "https://your-image-url.com/path/to/image.jpg";

    useEffect(() => {
      mapboxgl.accessToken = "pk.eyJ1IjoiYXJ1bG1rMTciLCJhIjoiY2x5eWphY2VsMmEwejJqcHlyMTBpNTA5YSJ9.awhbH-MC409jQiIcp9K1Ig"; // Your Mapbox access token here

      if (mapContainerRef.current && showMap) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [-24, 42],
          zoom: 1,
        });

        const geolocateControl = new GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
          fitBoundsOptions: { maxZoom: 15 },
        });

        mapRef.current.addControl(geolocateControl);

        mapRef.current.on("load", () => {
          geolocateControl.trigger();

          // Add existing parking spot markers
          parkingSpots.forEach((spot) => {
            new Marker({
              color: spot.available ? "green" : "red",
            })
              .setLngLat([spot.lng, spot.lat])
              .addTo(mapRef.current as MapboxMap);
          });
        });

        // Add click event for adding parking spots
        mapRef.current.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          const newSpot = { lng, lat, available: true };
          setParkingSpots((prev) => [...prev, newSpot]);

          // Call onSpotPlaced with the new coordinates
          onSpotPlaced(lng, lat);

          new Marker({ color: "blue" })
            .setLngLat([lng, lat])
            .addTo(mapRef.current as MapboxMap);
        });
      }

      // Cleanup on unmount
      return () => {
        if (mapRef.current) mapRef.current.remove();
      };
    }, [showMap, onSpotPlaced]);

    const toggleMapStyle = () => {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        const currentZoom = mapRef.current.getZoom();

        const newStyle =
          mapStyle === "mapbox://styles/mapbox/streets-v12"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/streets-v12";
        setMapStyle(newStyle);

        mapRef.current.setStyle(newStyle);
        mapRef.current.on("style.load", () => {
          mapRef.current?.setCenter(currentCenter);
          mapRef.current?.setZoom(currentZoom);
        });
      }
    };

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
      <div className="relative">
        <div className="absolute top-4 left-4 z-[2] flex gap-2">
          {showMap ? (
            <>
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
              <button
                onClick={toggleMapStyle}
                className="p-2 bg-gray-500 text-white rounded"
              >
                Toggle View
              </button>
            </>
          ) : null}

          <button
            onClick={() => setShowMap(!showMap)}
            className="p-2 bg-gray-500 text-white rounded"
          >
            {showMap ? "Go to Image" : "Go to Map"}
          </button>
        </div>

        {showMap ? (
          <div
            id="map"
            ref={mapContainerRef}
            style={{ width: "640px", height: "640px", border: "1px solid black" }}
          ></div>
        ) : (
          <img
            src={imageURL}
            alt="Parking Area Image"
            style={{
              width: "640px",
              height: "640px",
              border: "1px solid black",
              objectFit: "cover",
            }}
          />
        )}
      </div>
    );
  }
);

export default MapboxExample;
