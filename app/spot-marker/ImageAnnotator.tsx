import React, { useRef, useState, useEffect } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

type Point = { x: number; y: number };

interface ImageAnnotatorProps {
  src: string;
  imageIndex: number;
  onSpotMarked: (
    imageIndex: number,
    points: Point[],
    location: { lng: number; lat: number }
  ) => void;
}

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  src,
  imageIndex,
  onSpotMarked,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [mapVisible, setMapVisible] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [spotLocation, setSpotLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // Load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      const image = new Image();
      image.src = src;
      image.onload = () => {
        context?.drawImage(image, 0, 0, 640, 640);
      };
    }
  }, [src]);

  // Draw points on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && points.length > 0) {
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "red";
        points.forEach((point) => {
          context.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
      }
    }
  }, [points]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (canvasRef.current && points.length < 4) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const newPoint = { x, y };
      setPoints([...points, newPoint]);
    }
  };

  const handleConfirm = () => {
    if (points.length === 4) {
      setMapVisible(true);
    } else {
      alert("Please select exactly 4 points.");
    }
  };

  // Initialize Mapbox map
  useEffect(() => {
    if (mapVisible && mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [0, 0],
        zoom: 2,
      });

      // Handle map clicks to set the parking spot location
      mapRef.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setSpotLocation({ lng, lat });

        // Remove previous marker if exists
        if (marker) {
          marker.remove();
        }
        if (!mapRef.current) return;
        // Add new marker
        const newMarker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
        setMarker(newMarker);
      });
    }
  }, [mapVisible, marker]);

  const handleFinalize = () => {
    if (spotLocation) {
      onSpotMarked(imageIndex, points, spotLocation);
      setPoints([]);
      setSpotLocation(null);
      setMapVisible(false);

      // Clean up the map and marker
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (marker) {
        marker.remove();
        setMarker(null);
      }
    } else {
      alert("Please select a location on the map.");
    }
  };

  return (
    <div>
      {!mapVisible ? (
        <>
          <canvas
            ref={canvasRef}
            width={640}
            height={640}
            style={{ border: "1px solid black" }}
            onClick={handleCanvasClick}
          />
          <button onClick={handleConfirm}>Confirm Spot</button>
        </>
      ) : (
        <>
          <div
            ref={mapContainerRef}
            style={{ width: "640px", height: "640px" }}
          />
          <button onClick={handleFinalize}>Finalize Spot</button>
        </>
      )}
    </div>
  );
};

export default ImageAnnotator;
