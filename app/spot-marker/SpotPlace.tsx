import React, { useState, useRef } from "react";
import ImageCanvas from "./ImageCanvas"; // Adjust the import path as needed
import MapboxExample from "../MapMark"; // Adjust the import path as needed
import mapboxgl from 'mapbox-gl';
import { Spot } from "./types"; // Adjust the import path as needed

const ParentComponent: React.FC = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nextSpotId, setNextSpotId] = useState(1);
  const mapRef = useRef<any>(null); // Reference for the Mapbox map

  const handleSpotPlacedOnMap = (lng: number, lat: number) => {
    if (mapRef.current) {
      // Use Mapbox to add a marker at the specified longitude and latitude
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat([lng, lat]) // Place the marker at the provided coordinates
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
      />
      <MapboxExample ref={mapRef} onSpotPlaced={handleSpotPlacedOnMap} /> {/* Pass ref and onSpotPlaced function */}
    </div>
  );
};

export default ParentComponent;
