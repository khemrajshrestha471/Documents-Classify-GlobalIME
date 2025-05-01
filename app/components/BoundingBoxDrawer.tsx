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

// Type for API response
type ApiCoordinates = Record<string, string>;

export default function BoundingBoxDrawer({
  imageUrl,
  naturalWidth,
  naturalHeight,
}: BoundingBoxDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxCoordsList, setBoxCoordsList] = useState<BoundingBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse coordinate string into {x, y} objects
  const parseCoordinates = (coordString: string) => {
    const coords = coordString.match(/[\d.]+/g)?.map(Number) || [];
    if (coords.length !== 4) {
      throw new Error(`Invalid coordinate format: ${coordString}`);
    }
    return {
      topLeft: { x: coords[0], y: coords[1] },
      bottomRight: { x: coords[2], y: coords[3] }
    };
  };

// In your BoundingBoxDrawer component

useEffect(() => {
  const fetchCoordinates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/coordinates');
      if (!response.ok) throw new Error('Failed to fetch coordinates');
      
      const data = await response.json();
      const boxes: BoundingBox[] = Object.entries(data.coordinates).map(
        ([keyName, coords], index) => {
          const parsed = parseCoordinates(coords as string);
          return {
            id: index + 1,
            keyName,
            topLeft: parsed.topLeft,
            bottomRight: parsed.bottomRight
          };
        }
      );
      setBoxCoordsList(boxes);
    } catch (err) {
      console.error("Failed to load coordinates:", err);
      setError(err instanceof Error ? err.message : "Failed to load coordinates");
    } finally {
      setIsLoading(false);
    }
  };

  fetchCoordinates();
}, []);

// Update the submit handler
const handleSubmit = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/save-annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: generateJsonOutput() })
    });
    
    if (!response.ok) throw new Error('Submission failed');
    alert("Coordinates submitted successfully!");
  } catch (err) {
    console.error("Submission failed:", err);
    alert("Failed to submit coordinates");
  }
};

  const handleDeleteBox = (id: number) => {
    setBoxCoordsList(prev => prev.filter(box => box.id !== id));
  };

  const generateJsonOutput = (): ApiCoordinates => {
    const output: ApiCoordinates = {};
    boxCoordsList.forEach((box) => {
      output[box.keyName] = `(${box.topLeft.x.toFixed(2)}, ${box.topLeft.y.toFixed(2)}), (${box.bottomRight.x.toFixed(2)}, ${box.bottomRight.y.toFixed(2)})`;
    });
    return output;
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

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <p>Loading coordinates...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100/50">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          /* Render all boxes from coordinates */
          boxCoordsList.map((box) => (
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
          ))
        )}
      </div>

      {!isLoading && !error && boxCoordsList.length > 0 && (
        <div className="mt-4 w-full max-w-4xl bg-gray-100 rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">Bounding Box Coordinates:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm whitespace-pre-wrap">
            {JSON.stringify(generateJsonOutput(), null, 2)}
          </pre>
          <button
            onClick={async () => {
              try {
                // Replace with actual API call
                console.log("Submitting:", generateJsonOutput());
                await fetch('/api/save-annotations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(generateJsonOutput())
                });
                alert("Coordinates submitted successfully!");
              } catch (err) {
                console.error("Submission failed:", err);
                alert("Failed to submit coordinates");
              }
            }}
            className="mt-4 bg-[#C5161D] hover:bg-[#a91318] text-white px-4 py-2 rounded transition cursor-pointer"
          >
            Submit to Backend
          </button>
        </div>
      )}
    </div>
  );
}