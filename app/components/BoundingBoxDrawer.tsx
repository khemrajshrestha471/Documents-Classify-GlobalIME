"use client";

import { useRef, useState } from "react";

interface BoundingBoxDrawerProps {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
}

export default function BoundingBoxDrawer({
  imageUrl,
  naturalWidth,
  naturalHeight,
}: BoundingBoxDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [boxCoords, setBoxCoords] = useState<{
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  } | null>(null);
  const [keyInputVisible, setKeyInputVisible] = useState(false);
  const [boundingBoxKey, setBoundingBoxKey] = useState<string>("");
  const [boundingBoxData, setBoundingBoxData] = useState<any[]>([]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * naturalHeight;
    setStartPoint({ x, y });
    setEndPoint(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPoint) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * naturalHeight;
    setEndPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (startPoint && endPoint) {
      setBoxCoords({
        topLeft: {
          x: Math.min(startPoint.x, endPoint.x),
          y: Math.min(startPoint.y, endPoint.y),
        },
        bottomRight: {
          x: Math.max(startPoint.x, endPoint.x),
          y: Math.max(startPoint.y, endPoint.y),
        },
      });
    }
    setStartPoint(null);
    setEndPoint(null);
    setKeyInputVisible(true); // Show input for the key
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoundingBoxKey(e.target.value);
  };

  const handleKeySubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && boundingBoxKey.trim() !== "") {
      // Save the bounding box data with the user input key
      const newBoundingBox = {
        [boundingBoxKey]: `(${boxCoords?.topLeft.x.toFixed(2)}, ${boxCoords?.topLeft.y.toFixed(2)}), (${boxCoords?.bottomRight.x.toFixed(2)}, ${boxCoords?.bottomRight.y.toFixed(2)})`,
      };

      setBoundingBoxData((prev) => [...prev, newBoundingBox]);
      setKeyInputVisible(false); // Hide the input field after submission
      setBoundingBoxKey(""); // Reset the input field
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative inline-block border"
        style={{ touchAction: "none" }}
      >
        <img src={imageUrl} alt="Uploaded" className="max-w-full h-auto" draggable={false} />
        {startPoint && endPoint && (
          <div
            className="absolute border-2 border-red-500"
            style={{
              left: `${(Math.min(startPoint.x, endPoint.x) / naturalWidth) * 100}%`,
              top: `${(Math.min(startPoint.y, endPoint.y) / naturalHeight) * 100}%`,
              width: `${(Math.abs(startPoint.x - endPoint.x) / naturalWidth) * 100}%`,
              height: `${(Math.abs(startPoint.y - endPoint.y) / naturalHeight) * 100}%`,
            }}
          />
        )}
        {boxCoords && (
          <div
            className="absolute border-2 border-green-500"
            style={{
              left: `${(boxCoords.topLeft.x / naturalWidth) * 100}%`,
              top: `${(boxCoords.topLeft.y / naturalHeight) * 100}%`,
              width: `${((boxCoords.bottomRight.x - boxCoords.topLeft.x) / naturalWidth) * 100}%`,
              height: `${((boxCoords.bottomRight.y - boxCoords.topLeft.y) / naturalHeight) * 100}%`,
            }}
          />
        )}
      </div>

      {keyInputVisible && (
        <div className="mt-4">
          <input
            type="text"
            value={boundingBoxKey}
            onChange={handleKeyChange}
            onKeyDown={handleKeySubmit}
            placeholder="Enter bounding box key"
            className="border p-2 rounded-md"
          />
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold">Bounding Box Data:</h3>
        {boundingBoxData.length > 0 && (
          <pre className="bg-gray-100 p-4 rounded-md text-sm">
            {JSON.stringify(boundingBoxData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}