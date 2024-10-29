import React, { useState, useRef, useEffect } from "react";
import { Spot, Point } from "./types";
import { Button } from "@/components/ui/button";
import SimpleMap from "../MapMark"; // Import the new SimpleMap component

interface ImageCanvasProps {
  image: string;
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
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [showMap, setShowMap] = useState<boolean>(false); // State to toggle map visibility
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditable) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const point = { x, y };
    setCurrentPoints((prev) => [...prev, point]);
  };

  useEffect(() => {
    if (currentPoints.length === 4) {
      const newSpot: Spot = {
        id: nextSpotId,
        imageIndex,
        points: currentPoints,
      };
      setSpots((prev) => [...prev, newSpot]);
      setNextSpotId((prev) => prev + 1);
      setCurrentPoints([]);
      setIsEditable(false);
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
    img.src = image;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      spots
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
    setIsEditable(true);
  };

  const handleSpotPlacedOnMap = (point: { lng: number; lat: number }) => {
    const newPoint: Point = { x: point.lng, y: point.lat }; // Map coordinates to canvas coordinates if needed
    setCurrentPoints((prev) => [...prev, newPoint]);
    setShowMap(false); // Hide map after placing the spot
  };

  return (
    <div className="flex flex-col items-center justify-center">
  <div style={{ position: "relative", display: "inline-block" }}>
    {showMap ? (
      <SimpleMap onSpotPlaced={handleSpotPlacedOnMap} />
    ) : (
      <>
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          onClick={handleClick}
          style={{ border: "1px solid black" }}
        />
      </>
    )}
  </div>

    {/* Button container below the canvas */}
    <div className="mt-4 flex space-x-6">
      <Button onClick={handleRemoveLastSpot}>
        Remove Last Spot
      </Button>
      <Button
        onClick={() => setShowMap(true)}
        disabled={!isEditable} // Disable if not editable
      >
        Place Spot on Map
      </Button>
    </div>
  </div>
  );
};

export default ImageCanvas;
