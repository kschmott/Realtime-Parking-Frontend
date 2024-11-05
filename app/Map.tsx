"use client";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import mapboxgl, { Map as MapboxMap, GeolocateControl, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface Spot {
  id: number;
  latitude: number;
  longitude: number;
  lotId: number;
  status: string;
  parkingLotName: string;
}

interface Lot {
  parkingLotName: string;
  openingHours: string;
  price: string;
}

const MapboxExample = forwardRef((props, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [parkingSpots, setParkingSpots] = useState<Spot[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12");

  useEffect(() => {
    const fetchSpotsAndLots = async () => {
      try {
        const spotsRes = await fetch("/api/spots");
        const lotsRes = await fetch("/api/lot");

        if (!spotsRes.ok || !lotsRes.ok) {
          throw new Error(`Failed to fetch data: ${spotsRes.statusText}, ${lotsRes.statusText}`);
        }

        const spotsData = await spotsRes.json();
        const lotsData = await lotsRes.json();

        if (spotsData?.spots) {
          setParkingSpots(spotsData.spots);
        } else {
          console.error("Expected 'spots' key not found in response data");
        }

        if (lotsData?.lots) {
          setLots(lotsData.lots);
        } else {
          console.error("Expected 'lots' key not found in response data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSpotsAndLots();
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoiYXJ1bG1rMTciLCJhIjoiY2x5eWphY2VsMmEwejJqcHlyMTBpNTA5YSJ9.awhbH-MC409jQiIcp9K1Ig"; // Add your Mapbox token here

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [-24, 42],
        zoom: 1,
      });

      const geolocateControl = new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        fitBoundsOptions: { maxZoom: 15 },
      });
      mapRef.current.addControl(geolocateControl);

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
        marker: false,
        placeholder: "Search for a location",
      });
      mapRef.current.addControl(geocoder, "top-left");

      mapRef.current.on("style.load", () => {
        const center = mapRef.current?.getCenter();
        const zoom = mapRef.current?.getZoom();
        if (center && zoom) {
          mapRef.current?.setCenter(center);
          mapRef.current?.setZoom(zoom);
        }
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [mapStyle]);

  useEffect(() => {
    if (mapRef.current && parkingSpots.length > 0 && lots.length > 0) {
      parkingSpots.forEach((spot: Spot) => {
        const lot = lots.find((lot) => lot.parkingLotName === spot.parkingLotName);
        
        if (lot) {
          new Marker({ color: spot.status === "available" ? "green" : "red" })
            .setLngLat([spot.longitude, spot.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div>
                  <h3><strong>${lot.parkingLotName}</strong></h3>
                  <p><strong>Hours:</strong> ${lot.openingHours}</p>
                  <p><strong>Price:</strong> ${lot.price}</p>
                </div>
              `)
            )
            .addTo(mapRef.current as MapboxMap);
        }
      });
    }
  }, [parkingSpots, lots]);

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

  return (
    <div className="w-full h-[calc(100vh)] relative">
      <div className="absolute top-16 left-4 z-[2]">
        <button
          onClick={toggleMapStyle}
          className="p-2 bg-gray-500 text-white rounded"
        >
          Toggle View
        </button>
      </div>

      <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>
    </div>
  );
});

export default MapboxExample;
