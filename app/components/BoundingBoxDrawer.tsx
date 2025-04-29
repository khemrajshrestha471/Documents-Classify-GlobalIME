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
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const [boxCoordsList, setBoxCoordsList] = useState<
    {
      id: number;
      topLeft: { x: number; y: number };
      bottomRight: { x: number; y: number };
      keyName: string;
    }[]
  >([]);
  const [currentKeyName, setCurrentKeyName] = useState<string>("");
  const [isPrompting, setIsPrompting] = useState<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPrompting) return; // Prevent drawing while inputting key
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * naturalHeight;
    setStartPoint({ x, y });
    setEndPoint(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPoint || isPrompting) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * naturalHeight;
    setEndPoint({ x, y });
  };

  const handleMouseUp = () => {
    if (startPoint && endPoint) {
      const topLeft = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
      };
      const bottomRight = {
        x: Math.max(startPoint.x, endPoint.x),
        y: Math.max(startPoint.y, endPoint.y),
      };

      setBoxCoordsList((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), topLeft, bottomRight, keyName: "" }, // temp empty keyName
      ]);
      setCurrentKeyName("");
      setIsPrompting(true); // prompt after drawing

      setStartPoint(null);
      setEndPoint(null);
    }
  };

  const handleKeyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentKeyName(e.target.value);
  };

  const handleKeyNameSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentKeyName.trim()) {
      const trimmedKey = currentKeyName.trim().toLowerCase(); // make it lowercase for comparison

    // Check if the lowercase version of key name already exists
    const isDuplicate = boxCoordsList.some(
      (box) => box.keyName.trim().toLowerCase() === trimmedKey
    );

    if (isDuplicate) {
      alert("Warning: Key name already exists (case-insensitive). Please enter a unique key.");
      return; // Stop without adding
    }

      setBoxCoordsList((prev) => {
        const updatedList = [...prev];
        updatedList[updatedList.length - 1].keyName = currentKeyName;
        return updatedList;
      });
      setCurrentKeyName("");
      setIsPrompting(false);
    }
  };

  const handleDeleteBox = (indexToDelete: number) => {
    setBoxCoordsList((prev) => prev.filter((_, i) => i !== indexToDelete));
  };

  const generateJsonOutput = () => {
    const output: Record<string, string> = {};
    boxCoordsList.forEach((box) => {
      if (box.keyName.trim()) {
        output[box.keyName] = `(${box.topLeft.x.toFixed(
          2
        )}, ${box.topLeft.y.toFixed(2)}), (${box.bottomRight.x.toFixed(
          2
        )}, ${box.bottomRight.y.toFixed(2)})`;
      }
    });
    return JSON.stringify(output, null, 2);
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
        <img
          src={imageUrl}
          alt="Uploaded"
          className="max-w-full h-auto"
          draggable={false}
        />

        {/* Live drawing box */}
        {startPoint && endPoint && (
          <div
            className="absolute border-2 border-red-500"
            style={{
              left: `${
                (Math.min(startPoint.x, endPoint.x) / naturalWidth) * 100
              }%`,
              top: `${
                (Math.min(startPoint.y, endPoint.y) / naturalHeight) * 100
              }%`,
              width: `${
                (Math.abs(startPoint.x - endPoint.x) / naturalWidth) * 100
              }%`,
              height: `${
                (Math.abs(startPoint.y - endPoint.y) / naturalHeight) * 100
              }%`,
            }}
          />
        )}

        {/* Render all saved boxes */}
        {boxCoordsList.map((box, index) => (
          <div
          key={box.id}
            className="absolute border-2 border-green-500"
            style={{
              left: `${(box.topLeft.x / naturalWidth) * 100}%`,
              top: `${(box.topLeft.y / naturalHeight) * 100}%`,
              width: `${
                ((box.bottomRight.x - box.topLeft.x) / naturalWidth) * 100
              }%`,
              height: `${
                ((box.bottomRight.y - box.topLeft.y) / naturalHeight) * 100
              }%`,
            }}
          >
            <button
              onClick={() => handleDeleteBox(index)}
              className="absolute top-[-6px] right-[-6px] bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none"
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Input for key name */}
      {isPrompting && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <input
            type="text"
            value={currentKeyName}
            onChange={handleKeyNameChange}
            onKeyDown={handleKeyNameSubmit}
            className="border p-2 rounded-md"
            placeholder="Enter key name"
          />
          <p className="text-sm text-gray-500">Press Enter to save key name</p>
        </div>
      )}

      {/* Output */}
      {boxCoordsList.length > 0 && (
        <div className="mt-4 w-full max-w-lg bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium text-lg">Bounding Box JSON Output:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm">
            {generateJsonOutput()}
          </pre>
        </div>
      )}
    </div>
  );
}
