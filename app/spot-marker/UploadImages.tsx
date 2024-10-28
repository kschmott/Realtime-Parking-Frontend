// UploadImages.tsx

import React, { useRef } from "react";
import { Button } from "@/components/ui/button"; // Replace with the actual path to your Shadcn Button component
import { readAndCompressImage } from "browser-image-resizer";

interface UploadImagesProps {
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const config = {
  quality: 1,
  maxWidth: 640,
  maxHeight: 640,
  autoRotate: true,
  debug: false,
};

const UploadImages: React.FC<UploadImagesProps> = ({ setImages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 4); // Limit to 4 files
    if (fileArray.length !== 4) {
      alert("Please upload exactly 4 images.");
      return;
    }

    const resizedImagePromises = fileArray.map((file) =>
      readAndCompressImage(file, config)
    );

    try {
      const resizedImageBlobs = await Promise.all(resizedImagePromises);
      const imageUrls = resizedImageBlobs.map((blob) =>
        URL.createObjectURL(blob)
      );
      setImages(imageUrls);
    } catch (error) {
      console.error("Error resizing images:", error);
    }
  };

  return (
    <div>
      <Button onClick={handleButtonClick}>Upload Images</Button>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default UploadImages;
