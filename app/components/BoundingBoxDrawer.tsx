"use client";

import { useState, useRef, useEffect } from "react";

interface BoundingBox {
  id: number;
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  keyName: string;
}

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
  const [boxCoordsList, setBoxCoordsList] = useState<BoundingBox[]>([]);

  // Hardcoded coordinates from backend response
  const predefinedCoordinates = {
    "Name": "(523.86, 228.77), (625.78, 273.59)",
    "Gender": "(877.52, 224.69), (1017.15, 265.44)",
    "Ward": "(915.23, 292.94), (1022.24, 337.76)"
  };

  // Parse coordinate string into {x, y} objects
  const parseCoordinates = (coordString: string) => {
    const coords = coordString.match(/[\d.]+/g)?.map(Number) || [];
    return {
      topLeft: { x: coords[0], y: coords[1] },
      bottomRight: { x: coords[2], y: coords[3] }
    };
  };

  // Initialize boxes from predefined coordinates
  useEffect(() => {
    const boxes: BoundingBox[] = Object.entries(predefinedCoordinates).map(
      ([keyName, coords], index) => {
        const parsed = parseCoordinates(coords);
        return {
          id: index + 1,
          keyName,
          topLeft: parsed.topLeft,
          bottomRight: parsed.bottomRight
        };
      }
    );
    setBoxCoordsList(boxes);
  }, []);

  const handleDeleteBox = (id: number) => {
    setBoxCoordsList(prev => prev.filter(box => box.id !== id));
  };

  const generateJsonOutput = () => {
    const output: Record<string, string> = {};
    boxCoordsList.forEach((box) => {
      output[box.keyName] = `(${box.topLeft.x.toFixed(2)}, ${box.topLeft.y.toFixed(2)}), (${box.bottomRight.x.toFixed(2)}, ${box.bottomRight.y.toFixed(2)})`;
    });
    return JSON.stringify(output, null, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative inline-block border"
      >
        <img
          src={imageUrl}
          alt="Uploaded"
          className="max-w-full h-auto"
          draggable={false}
        />

        {/* Render all boxes from coordinates */}
        {boxCoordsList.map((box) => (
          <div
            key={box.id}
            className="absolute border-2 border-blue-500 bg-blue-500/10"
            style={{
              left: `${(box.topLeft.x / naturalWidth) * 100}%`,
              top: `${(box.topLeft.y / naturalHeight) * 100}%`,
              width: `${((box.bottomRight.x - box.topLeft.x) / naturalWidth) * 100}%`,
              height: `${((box.bottomRight.y - box.topLeft.y) / naturalHeight) * 100}%`,
            }}
          >
            <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1 rounded-t">
              {box.keyName}
            </div>
            <button
              onClick={() => handleDeleteBox(box.id)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {boxCoordsList.length > 0 && (
        <div className="mt-4 w-full max-w-4xl bg-gray-100 rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">Bounding Box Coordinates:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm whitespace-pre-wrap">
            {generateJsonOutput()}
          </pre>
          <button
            onClick={() => console.log(generateJsonOutput())}
            className="mt-4 bg-[#C5161D] hover:bg-[#a91318] text-white px-4 py-2 rounded transition cursor-pointer"
          >
            Submit to Backend
          </button>
        </div>
      )}
    </div>
  );
}