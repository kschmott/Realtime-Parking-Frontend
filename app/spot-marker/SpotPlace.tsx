import React, { useState, useRef } from "react";
import ImageCanvas from "./ImageCanvas"; // Adjust the import path as needed
import MapboxExample from "../Map"; // Adjust the import path as needed
import mapboxgl, {
    Map as MapboxMap,
    GeolocateControl,
    Marker,
  } from "mapbox-gl";
import { Spot } from "./types"; // Adjust the import path as needed

const ParentComponent: React.FC = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nextSpotId, setNextSpotId] = useState(1);
  const mapRef = useRef<any>(null); // Reference for the Mapbox map

  const handleSpotPlacedOnMap = () => {
    const lastSpot = spots[spots.length - 1];
    if (lastSpot && mapRef.current) {
      // Add logic to place the last drawn spot on the map
      const { points } = lastSpot;
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

      // Use Mapbox to add a marker at the calculated center
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat([centerX, centerY]) // Replace with appropriate longitude and latitude
        .addTo(mapRef.current);
    }
  };

  return (
    <div>
      <ImageCanvas
        image="path/to/your/image.jpg" // Update with your image path
        imageIndex={0} // Replace with actual index logic if needed
        spots={spots}
        setSpots={setSpots}
        nextSpotId={nextSpotId}
        setNextSpotId={setNextSpotId}
        // onSpotPlacedOnMap={handleSpotPlacedOnMap} // Pass the function as a prop
      />
      <MapboxExample ref={mapRef} /> {/* Pass ref to the Mapbox component */}
    </div>
  );
};

export default ParentComponent;
