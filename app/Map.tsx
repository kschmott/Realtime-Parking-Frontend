"use client";
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from "react";
import mapboxgl, {
  Map as MapboxMap,
  GeolocateControl,
  Marker,
} from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MapboxExample = forwardRef((props, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [parkingSpots, setParkingSpots] = useState([]);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );

  useEffect(() => {
    console.log(parkingSpots, "parkingSpots");
    console.log(mapReady, "mapReady");
    if (mapReady && parkingSpots.length > 0) {
      parkingSpots.forEach(
        (spot: {
          id: number;
          latitude: number;
          longitude: number;
          status: string;
        }) => {
          new Marker({
            color: spot.status ? "green" : "red",
          })
            .setLngLat([spot.longitude, spot.latitude])
            .addTo(mapRef.current as MapboxMap);
        }
      );
    }
  }, [mapReady, parkingSpots]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/spots");
      const data = await res.json();
      setParkingSpots(data.spots);
    };
    fetchData();
  }, []);

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

      // Add Mapbox Geocoder for search functionality
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
        marker: false, // Disable default marker
        placeholder: "Search for a location",
      });
      if (parkingSpots.length > 0) {
        parkingSpots.forEach(
          (spot: {
            id: number;
            latitude: number;
            longitude: number;
            status: string;
          }) => {
            new Marker({
              color: spot.status === "available" ? "green" : "red",
            })
              .setLngLat([spot.longitude, spot.latitude])
              .addTo(mapRef.current as MapboxMap);
          }
        );
      }
      // Add geocoder to the map
      mapRef.current.addControl(geocoder, "top-left");

      // Preserve zoom and center on style change
      mapRef.current.on("style.load", () => {
        const center = mapRef.current?.getCenter();
        const zoom = mapRef.current?.getZoom();
        if (center && zoom) {
          mapRef.current?.setCenter(center);
          mapRef.current?.setZoom(zoom);
        }
      });
    }
    setMapReady(true);
    // Cleanup the map on component unmount
    return () => {
      if (mapRef.current) {
        setMapReady(false);
        mapRef.current.remove();
      }
    };
  }, [mapStyle]); // Re-run effect when mapStyle changes

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

  return (
    <div className="w-full h-[calc(100dvh)] relative">
      {/* Toggle Button */}
      <div className="absolute top-16 left-4 z-[2]">
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
});

export default MapboxExample;
