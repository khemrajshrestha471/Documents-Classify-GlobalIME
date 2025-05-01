"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  id: number;
  text: string;
  confidence: number;
  topLeft: Point;
  bottomRight: Point;
}

interface LineData {
  text: string;
  mean_confidence: number;
  coordinates: string;
}

interface BoundingBoxDrawerProps {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  lineData?: {
    lines: LineData[];
  };
  classificationResult?: {
    predicted_class: string;
    confidence: number;
  } | null;
}

export default function BoundingBoxDrawer({
  imageUrl,
  naturalWidth,
  naturalHeight,
  lineData,
  classificationResult,
}: BoundingBoxDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [editableData, setEditableData] = useState<any[]>([]);

  useEffect(() => {
    if (lineData?.lines) {
      const parsedBoxes = lineData.lines
        .map((line, index) => {
          const coords = line.coordinates.match(/[\d.]+/g)?.map(Number) || [];
          if (coords.length !== 4) {
            console.error(`Invalid coordinate format: ${line.coordinates}`);
            return null;
          }
          return {
            id: index + 1,
            text: line.text,
            confidence: line.mean_confidence,
            topLeft: { x: coords[0], y: coords[1] },
            bottomRight: { x: coords[2], y: coords[3] },
          };
        })
        .filter(Boolean) as BoundingBox[];

      setBoxes(parsedBoxes);
      setEditableData(
        parsedBoxes.map((box, index) => ({
          index,
          text: box.text,
          confidence: box.confidence,
          coordinates: `(${box.topLeft.x.toFixed(2)}, ${box.topLeft.y.toFixed(2)}), (${box.bottomRight.x.toFixed(2)}, ${box.bottomRight.y.toFixed(2)})`,
        }))
      );
    } else {
      setBoxes([]);
      setEditableData([]);
    }
  }, [lineData]);

  const handleDeleteBox = (id: number) => {
    setBoxes((prev) => prev.filter((box) => box.id !== id));
    setEditableData((prev) =>
      prev.filter((_, index) => boxes.findIndex((b) => b.id === id) !== index)
    );
  };

  const handleTextChange = (index: number, newText: string) => {
    setEditableData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: newText } : item))
    );
    setBoxes((prev) =>
      prev.map((box, i) => (i === index ? { ...box, text: newText } : box))
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-500";
    if (confidence > 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-row items-center gap-4">
      <div>
        <div ref={containerRef} className="relative inline-block border">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-full h-auto"
            draggable={false}
          />

          {boxes.map((box, index) => {
            const width = box.bottomRight.x - box.topLeft.x;
            const height = box.bottomRight.y - box.topLeft.y;
            const confidenceColor = getConfidenceColor(box.confidence);

            return (
              <Rnd
  key={box.id}
  size={{
    width: (width / naturalWidth) * (containerRef.current?.offsetWidth || 0),
    height: (height / naturalHeight) * (containerRef.current?.offsetHeight || 0),
  }}
  position={{
    x:
      (box.topLeft.x / naturalWidth) *
      (containerRef.current?.offsetWidth || 0),
    y:
      (box.topLeft.y / naturalHeight) *
      (containerRef.current?.offsetHeight || 0),
  }}
                onDragStop={(e, d) => {
                  const containerW = containerRef.current?.offsetWidth || 1;
                  const containerH = containerRef.current?.offsetHeight || 1;
                  const newTopLeft = {
                    x: (d.x / containerW) * naturalWidth,
                    y: (d.y / containerH) * naturalHeight,
                  };
                  const newBottomRight = {
                    x: newTopLeft.x + width,
                    y: newTopLeft.y + height,
                  };
                  setBoxes((prev) =>
                    prev.map((b) =>
                      b.id === box.id
                        ? {
                            ...b,
                            topLeft: newTopLeft,
                            bottomRight: newBottomRight,
                          }
                        : b
                    )
                  );
                  setEditableData((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            coordinates: `(${newTopLeft.x.toFixed(2)}, ${newTopLeft.y.toFixed(2)}), (${newBottomRight.x.toFixed(2)}, ${newBottomRight.y.toFixed(2)})`,
                          }
                        : item
                    )
                  );
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  const containerW = containerRef.current?.offsetWidth || 1;
                  const containerH = containerRef.current?.offsetHeight || 1;

                  const newWidth =
                    (ref.offsetWidth / containerW) * naturalWidth;
                  const newHeight =
                    (ref.offsetHeight / containerH) * naturalHeight;

                  const newTopLeft = {
                    x: (position.x / containerW) * naturalWidth,
                    y: (position.y / containerH) * naturalHeight,
                  };
                  const newBottomRight = {
                    x: newTopLeft.x + newWidth,
                    y: newTopLeft.y + newHeight,
                  };

                  setBoxes((prev) =>
                    prev.map((b) =>
                      b.id === box.id
                        ? {
                            ...b,
                            topLeft: newTopLeft,
                            bottomRight: newBottomRight,
                          }
                        : b
                    )
                  );
                  setEditableData((prev) =>
                    prev.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            coordinates: `(${newTopLeft.x.toFixed(2)}, ${newTopLeft.y.toFixed(2)}), (${newBottomRight.x.toFixed(2)}, ${newBottomRight.y.toFixed(2)})`,
                          }
                        : item
                    )
                  );
                }}
                bounds="parent"
                style={{
                  border: "2px solid #3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  position: "absolute",
                  overflow: "visible", // Ensure children can extend outside
                }}
                onClick={() => setSelectedBox(box)}
              >
                <div
                  className={`absolute -top-5 left-0 ${confidenceColor} text-white text-xs px-1 rounded-t`}
                >
                  {index} ({(box.confidence * 100).toFixed(1)}%)
                </div>
                <button
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteBox(box.id);
  }}
  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none z-50 pointer-events-auto"
  style={{ zIndex: 10 }}
  title="Delete"
>
  ×
</button>
              </Rnd>
            );
          })}
        </div>

        {selectedBox && (
          <div className="mt-2 p-4 bg-blue-50 rounded-lg w-full max-w-2xl">
            <h3 className="font-bold text-blue-800">Selected Text:</h3>
            <p className="text-lg">{selectedBox.text}</p>
            <p className="text-sm">
              Confidence: {(selectedBox.confidence * 100).toFixed(1)}%
            </p>
            <p className="text-sm">
              Index: {boxes.findIndex((box) => box.id === selectedBox.id)}
            </p>
          </div>
        )}
      </div>

      <div>
        {classificationResult && (
          <div className="mt-2 text-lg">
            <p>
              <strong>Predicted Class:</strong>{" "}
              {classificationResult.predicted_class}
            </p>
            <p>
              <strong>Confidence:</strong>{" "}
              {(classificationResult.confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {boxes.length > 0 && (
          <div className="mt-4 w-full max-w-4xl bg-gray-100 rounded-md p-4">
            <h3 className="font-medium text-lg mb-2">Extracted Text Data:</h3>
            <div className="bg-gray-200 p-4 rounded-md text-sm max-h-96 overflow-y-auto">
              {editableData.map((item, index) => (
                <div key={index} className="mb-4 p-2 bg-white rounded">
                  <div className="font-semibold">Index: {item.index}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Text:
                    </label>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div className="mt-1">
                    Confidence: {item.confidence.toFixed(4)}
                  </div>
                  <div className="mt-1">Coordinates: {item.coordinates}</div>
                </div>
              ))}
              <pre className="mt-4 p-2 bg-gray-100 rounded text-xs">
                {JSON.stringify(editableData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}