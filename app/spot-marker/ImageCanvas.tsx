import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SimpleMap from "./MapMark";
import { Spot, Point, Lot } from "./types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ImagePreview } from "./UploadImages";

interface ImageCanvasProps {
  image: ImagePreview;
  imageIndex: number;
  spots: Spot[];
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  nextSpotId: number;
  setNextSpotId: React.Dispatch<React.SetStateAction<number>>;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  image,
  imageIndex,
  spots,
  setSpots,
  nextSpotId,
  setNextSpotId,
}) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [lotData, setLotData] = useState<Lot>({
    parkingLotName: "",
    openingHours: undefined,
    price: undefined,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentPoints.length >= 4) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const point = { x, y };
    setCurrentPoints((prev) => [...prev, point]);
  };

  const handleSaveSpotAndLot = async (updatedSpot: Spot) => {
    try {
      const spotData = {
        id: updatedSpot.id,
        latitude: updatedSpot.location?.lat,
        longitude: updatedSpot.location?.lng,
        status: updatedSpot.status || "available",
        parkingLotName: updatedSpot.parkingLotName,
      };

      // Use the lotData state for saving lot information
      const lotDataToSave: Lot = {
        parkingLotName: lotData.parkingLotName,
        openingHours: lotData.openingHours,
        price: lotData.price,
      };

      // Save spot data
      const spotResponse = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spotData),
      });

      if (!spotResponse.ok) {
        console.error("Failed to save spot:", spotResponse.statusText);
      }

      // Save lot data
      const lotResponse = await fetch("/api/lot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spots: [lotDataToSave] }), // Adjusted to match your API requirement
      });

      if (!lotResponse.ok) {
        console.error("Failed to save lot:", lotResponse.statusText);
      }
    } catch (error) {
      console.error("Error saving spot and lot:", error);
    }
  };

  useEffect(() => {
    if (currentPoints.length === 4) {
      const newSpot: Spot = {
        id: nextSpotId,
        imageIndex,
        points: currentPoints,
        location: null, // Initially no location
        parkingLotName: "", // Initially empty
        status: "available", // Default status for new spots
      };
      setSpots((prev) => [...prev, newSpot]);
      setNextSpotId((prev) => prev + 1);
      setCurrentPoints([]);
    }
  }, [currentPoints]);

  useEffect(() => {
    drawCanvas();
  }, [image, spots, currentPoints, imageIndex]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = image.url;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      (spots || [])
        .filter((spot) => spot.imageIndex === imageIndex)
        .forEach((spot) => {
          drawSpot(ctx, spot);
        });

      currentPoints.forEach((point) => {
        drawPoint(ctx, point);
      });
    };
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, point: Point) => {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawSpot = (ctx: CanvasRenderingContext2D, spot: Spot) => {
    const { points, id } = spot;

    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();

    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(String(id), centerX - 5, centerY + 5);
  };

  const handleRemoveLastSpot = () => {
    if (spots.length === 0) return;

    const updatedSpots = spots.slice(0, -1);
    setSpots(updatedSpots);
    setNextSpotId((prevId) => (prevId > 1 ? prevId - 1 : 1));
  };

  const handleSpotPlacedOnMap = (point: { lng: number; lat: number }) => {
    if (selectedSpotId === null) return;

    setSpots((prevSpots) =>
      prevSpots.map((spot) =>
        spot.id === selectedSpotId ? { ...spot, location: point } : spot
      )
    );
  };

  const handleSelectChange = (value: string) => {
    setSelectedSpotId(Number(value));
  };

  const handleInputChange = (field: keyof Lot, value: string) => {
    if (selectedSpotId !== null) {
      // Update the Lot data separately
      setLotData((prev) => ({ ...prev, [field]: value }));

      // Save the spot data to ensure it stays updated
      const updatedSpot = spots.find(spot => spot.id === selectedSpotId);
      if (updatedSpot) {
        handleSaveSpotAndLot(updatedSpot);
      }
    }
  };

  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);

  return (
    <div className="flex space-x-6 items-start">
      <div
        style={{
          position: "relative",
          width: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          onClick={handleClick}
          style={{ border: "1px solid black" }}
        />
        <Button
          onClick={handleRemoveLastSpot}
          style={{ marginTop: "10px", alignSelf: "center" }}
        >
          Remove Last Spot
        </Button>

        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            placeholder="Parking Lot Name"
            value={lotData.parkingLotName}
            onChange={(e) => handleInputChange("parkingLotName", e.target.value)}
            style={{ display: "block", marginBottom: "5px" }}
          />
          <input
            type="text"
            placeholder="Opening Hours"
            value={lotData.openingHours || ""}
            onChange={(e) => handleInputChange("openingHours", e.target.value)}
            style={{ display: "block", marginBottom: "5px" }}
          />
          <input
            type="text"
            placeholder="Price"
            value={lotData.price || ""}
            onChange={(e) => handleInputChange("price", e.target.value)}
            style={{ display: "block", marginBottom: "5px" }}
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "50%",
          height: "640px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        >
          <Select onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Map Spot" />
            </SelectTrigger>
            <SelectContent>
              {spots.map((spot) => (
                <SelectItem key={spot.id} value={String(spot.id)}>
                  Spot {spot.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SimpleMap
          onSpotPlaced={handleSpotPlacedOnMap}
          selectedSpotId={selectedSpotId}
          spots={spots}
        />
      </div>
    </div>
  );
};

export default ImageCanvas;
