"use client";
import React, { useState } from "react";
import Resizer from "browser-image-resizer";
import ImageAnnotator from "./ImageAnnotator";

const imageConfig = {
  quality: 1,
  maxWidth: 640,
  maxHeight: 640,
  autoRotate: false,
  debug: false,
};

type Point = { x: number; y: number };

const SpotMarkerPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [resizedImages, setResizedImages] = useState<string[]>([]);
  const [spotsData, setSpotsData] = useState<any[]>([]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length === 4) {
      const imageFiles = Array.from(files);
      setImages(imageFiles);

      const resizedImagePromises = imageFiles.map((file) =>
        Resizer.readAndCompressImage(file, imageConfig)
      );

      const resizedImageBlobs = await Promise.all(resizedImagePromises);

      const resizedImageURLs = resizedImageBlobs.map((blob) =>
        URL.createObjectURL(blob)
      );

      setResizedImages(resizedImageURLs);
    } else {
      alert("Please upload exactly 4 images.");
    }
  };

  const handleSpotMarked = (
    imageIndex: number,
    points: Point[],
    location: { lng: number; lat: number }
  ) => {
    const spotId = spotsData.length + 1;
    setSpotsData([...spotsData, { spotId, imageIndex, points, location }]);
  };

  return (
    <div>
      <h1>Spot Marker Page</h1>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {resizedImages.map((src, index) => (
          <ImageAnnotator
            key={index}
            src={src}
            imageIndex={index}
            onSpotMarked={handleSpotMarked}
          />
        ))}
      </div>
      <button
        onClick={() => {
          // Save spotsData to localStorage
          localStorage.setItem("spotsData", JSON.stringify(spotsData));
          alert("Data saved to localStorage!");
        }}
      >
        Save Data
      </button>
    </div>
  );
};

export default SpotMarkerPage;
