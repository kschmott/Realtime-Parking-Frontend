"use client";
import React, { useState } from "react";
import ImageSelector from "./ImageSelector";
import ImageCanvas from "./ImageCanvas";
import { Spot } from "./types";
import dynamic from "next/dynamic";
const UploadImages = dynamic(() => import("./UploadImages"), {
  ssr: false,
});
function ParkingSpotsPage() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nextSpotId, setNextSpotId] = useState<number>(1);

  return (
    <div>
      <UploadImages setImages={setImages} />
      {images.length > 0 && (
        <div>
          <div className="m-4">
            <ImageSelector
              images={images}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />
          </div>

          <ImageCanvas
            image={images[selectedImageIndex]}
            imageIndex={selectedImageIndex}
            spots={spots}
            setSpots={setSpots}
            nextSpotId={nextSpotId}
            setNextSpotId={setNextSpotId}
          />
        </div>
      )}
    </div>
  );
}

export default ParkingSpotsPage;
