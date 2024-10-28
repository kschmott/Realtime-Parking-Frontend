// ImageSelector.tsx

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Replace with actual path to your Shadcn Select components

interface ImageSelectorProps {
  images: string[];
  selectedImageIndex: number;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
}) => {
  const handleChange = (value: string) => {
    setSelectedImageIndex(Number(value));
  };

  return (
    <Select onValueChange={handleChange} value={String(selectedImageIndex)}>
      <SelectTrigger className="max-w-xs">
        <SelectValue placeholder="Select Image" />
      </SelectTrigger>
      <SelectContent className="max-w-xs">
        {images.map((_, index) => (
          <SelectItem key={index} value={String(index)}>
            Image {index + 1}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ImageSelector;