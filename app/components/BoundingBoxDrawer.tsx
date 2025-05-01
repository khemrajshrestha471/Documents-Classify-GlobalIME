"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";

interface Point {
  x: number;
  y: number;
}

interface BoundingBox {
  id: number;
  topLeft: Point;
  bottomRight: Point;
  keyName: string;
}

interface BoundingBoxDrawerProps {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  coordinates?: Record<string, string>;
  classificationResult?: {
    predicted_class: string;
    confidence: number;
  } | null;
}

export default function BoundingBoxDrawer({
  imageUrl,
  naturalWidth,
  naturalHeight,
  coordinates,
  classificationResult
}: BoundingBoxDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxCoordsList, setBoxCoordsList] = useState<BoundingBox[]>([]);

  useEffect(() => {
    if (coordinates) {
      const boxes: BoundingBox[] = Object.entries(coordinates)
        .map(([keyName, coordString], index) => {
          const coords = coordString.match(/[\d.]+/g)?.map(Number) || [];
          if (coords.length !== 4) {
            console.error(`Invalid coordinate format: ${coordString}`);
            return null;
          }
          return {
            id: index + 1,
            keyName,
            topLeft: { x: coords[0], y: coords[1] },
            bottomRight: { x: coords[2], y: coords[3] }
          };
        })
        .filter(Boolean) as BoundingBox[];
      
      setBoxCoordsList(boxes);
    } else {
      setBoxCoordsList([]);
    }
  }, [coordinates]);

  const handleDeleteBox = (id: number) => {
    setBoxCoordsList(prev => prev.filter(box => box.id !== id));
  };

  const generateJsonOutput = () => {
    const output: Record<string, string> = {};
    boxCoordsList.forEach((box) => {
      output[box.keyName] = `(${box.topLeft.x.toFixed(2)}, ${box.topLeft.y.toFixed(2)}), (${box.bottomRight.x.toFixed(2)}, ${box.bottomRight.y.toFixed(2)})`;
    });
    return output;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} className="relative inline-block border">
        <img 
          src={imageUrl} 
          alt="Uploaded" 
          className="max-w-full h-auto" 
          draggable={false} 
        />

        {boxCoordsList.map((box) => {
          const width = box.bottomRight.x - box.topLeft.x;
          const height = box.bottomRight.y - box.topLeft.y;

          return (
            <Rnd
              key={box.id}
              size={{
                width: (width / naturalWidth) * 100 + '%',
                height: (height / naturalHeight) * 100 + '%'
              }}
              position={{
                x: (box.topLeft.x / naturalWidth) * (containerRef.current?.offsetWidth || 0),
                y: (box.topLeft.y / naturalHeight) * (containerRef.current?.offsetHeight || 0)
              }}
              onDragStop={(e, d) => {
                const containerW = containerRef.current?.offsetWidth || 1;
                const containerH = containerRef.current?.offsetHeight || 1;
                const newTopLeft = {
                  x: (d.x / containerW) * naturalWidth,
                  y: (d.y / containerH) * naturalHeight
                };
                const newBottomRight = {
                  x: newTopLeft.x + width,
                  y: newTopLeft.y + height
                };
                setBoxCoordsList(prev =>
                  prev.map(b =>
                    b.id === box.id ? { ...b, topLeft: newTopLeft, bottomRight: newBottomRight } : b
                  )
                );
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const containerW = containerRef.current?.offsetWidth || 1;
                const containerH = containerRef.current?.offsetHeight || 1;

                const newWidth = (ref.offsetWidth / containerW) * naturalWidth;
                const newHeight = (ref.offsetHeight / containerH) * naturalHeight;

                const newTopLeft = {
                  x: (position.x / containerW) * naturalWidth,
                  y: (position.y / containerH) * naturalHeight
                };
                const newBottomRight = {
                  x: newTopLeft.x + newWidth,
                  y: newTopLeft.y + newHeight
                };

                setBoxCoordsList(prev =>
                  prev.map(b =>
                    b.id === box.id ? { ...b, topLeft: newTopLeft, bottomRight: newBottomRight } : b
                  )
                );
              }}
              bounds="parent"
              style={{
                border: '2px solid #3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                position: 'absolute',
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
            </Rnd>
          );
        })}
      </div>

      {classificationResult && (
        <div className="mt-2 text-lg">
          <p><strong>Predicted Class:</strong> {classificationResult.predicted_class}</p>
          <p><strong>Confidence:</strong> {classificationResult.confidence.toFixed(2)}</p>
        </div>
      )}

      {boxCoordsList.length > 0 && (
        <div className="mt-4 w-full max-w-4xl bg-gray-100 rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">Bounding Box Coordinates:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm whitespace-pre-wrap">
            {JSON.stringify(generateJsonOutput(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}