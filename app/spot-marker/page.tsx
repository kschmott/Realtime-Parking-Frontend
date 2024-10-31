"use client";
import React, { useState } from "react";
import ImageSelector from "./ImageSelector";
import ImageCanvas from "./ImageCanvas";
import { Spot } from "./types";
import dynamic from "next/dynamic";
import { ImagePreview } from "./UploadImages";
import { Button } from "@/components/ui/button";
import { saveToJSONFile } from "@/lib/json";
import { clearAndSetSpots } from "@/db/spots";
const UploadImages = dynamic(() => import("./UploadImages"), {
  ssr: false,
});
function ParkingSpotsPage() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nextSpotId, setNextSpotId] = useState<number>(1);

  return (
    <div>
      <UploadImages setImages={setImages} />
      {images.length > 0 && (
        <div className="flex justify-center m-4">
          <Button
            onClick={async () => {
              await fetch("/api/lot", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ spots }),
              });
              const data: any = spots.map((spot) => {
                return {
                  id: spot.id,
                  location: spot.location,
                  points: spot.points,
                  imageIndex: spot.imageIndex,
                  imageName: images[spot.imageIndex].name,
                };
              });
              saveToJSONFile(data);
            }}
          >
            Download and Save
          </Button>
        </div>
      )}
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
