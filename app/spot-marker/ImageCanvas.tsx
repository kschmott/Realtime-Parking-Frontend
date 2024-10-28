// ImageCanvas.tsx

import React, { useState, useRef, useEffect } from "react";
import { Spot, Point } from "./types";
import { Button } from "@/components/ui/button"; // Replace with the actual path to your Shadcn Button component

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
      // Save the spot
      const newSpot: Spot = {
        id: nextSpotId,
        imageIndex,
        points: currentPoints,
      };
      setSpots((prev) => [...prev, newSpot]);
      setNextSpotId((prev) => prev + 1);
      setCurrentPoints([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPoints]);

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, spots, currentPoints, imageIndex]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Draw existing spots
      spots
        .filter((spot) => spot.imageIndex === imageIndex)
        .forEach((spot) => {
          drawSpot(ctx, spot);
        });

      // Draw current points
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

    // Draw the polygon
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Draw the spot ID at the center
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(String(id), centerX - 5, centerY + 5);
  };

  const handleRemoveLastSpot = () => {
    if (spots.length === 0) return;

    // Remove the last spot that was added
    const updatedSpots = spots.slice(0, -1);
    setSpots(updatedSpots);

    // Decrement nextSpotId if it's greater than 1
    setNextSpotId((prevId) => (prevId > 1 ? prevId - 1 : 1));
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        onClick={handleClick}
        style={{ border: "1px solid black" }}
      />
      <Button
        onClick={handleRemoveLastSpot}
        style={{ position: "absolute", top: 10, right: 10 }}
      >
        Remove Last Spot
      </Button>
    </div>
  );
};

export default ImageCanvas;
