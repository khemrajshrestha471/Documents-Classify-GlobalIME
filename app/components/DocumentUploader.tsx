"use client";

import { useState, useRef, useEffect } from "react";
import { getPdfjs } from "@/lib/pdfjsWrapper";

interface UploadedFile {
  name: string;
  type: string;
  preview: string;
  pages: string[];
  error?: boolean;
}

export default function DocumentUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Array of refs for each page/image
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Coordinates for each image
  const [coordinatesList, setCoordinatesList] = useState<
    { top: number; left: number; bottom: number; right: number }[]
  >([]);

  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      setIsConverting(true);
      try {
        const filesArray = Array.from(e.target.files);

        const supportedFiles = filesArray.filter((file) =>
          supportedTypes.includes(file.type)
        );

        if (supportedFiles.length === 0) {
          setError("No supported files selected");
          return;
        }

        const convertedFiles = await Promise.all(
          supportedFiles.map(async (file): Promise<UploadedFile> => {
            try {
              return await processFile(file);
            } catch (err) {
              console.error(`Error processing ${file.name}:`, err);
              return {
                name: file.name,
                type: file.type,
                preview: "",
                pages: [],
                error: true,
              };
            }
          })
        );

        const successfulFiles = convertedFiles.filter((f) => !f.error);
        const failedFiles = convertedFiles.filter((f) => f.error);

        setUploadedFiles((prev) => [...prev, ...successfulFiles]);

        if (failedFiles.length > 0) {
          setError(`Failed to process ${failedFiles.length} file(s)`);
        }
      } catch (err) {
        console.error("Error processing files:", err);
        setError("Error processing files. Please try again.");
      } finally {
        setIsConverting(false);
      }
    }
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    if (file.type === "application/pdf") {
      return await convertPdfToImages(file);
    } else {
      return await processImageFile(file);
    }
  };

  const convertPdfToImages = async (file: File): Promise<UploadedFile> => {
    try {
      const pdfjs = await getPdfjs();
      if (!pdfjs) throw new Error("PDF.js not available");

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;

      const pageImages: string[] = [];

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not get canvas context");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      pageImages.push(canvas.toDataURL("image/png"));

      return {
        name: file.name,
        type: file.type,
        preview: pageImages[0],
        pages: pageImages,
      };
    } catch (error) {
      console.error("Error converting PDF:", error);
      throw error;
    }
  };

  const processImageFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        resolve({
          name: file.name,
          type: file.type,
          preview: imageUrl,
          pages: [imageUrl],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setCoordinatesList((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    // Calculate coordinates once images are rendered
    const newCoordinates: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    }[] = [];

    imageRefs.current.forEach((img) => {
      if (img) {
        newCoordinates.push({
          top: 0, // Always 0
          left: 0, // Always 0
          bottom: img.naturalHeight, // Real height of the image
          right: img.naturalWidth, // Real width of the image
        });
      }
    });

    setCoordinatesList(newCoordinates);
  }, [uploadedFiles]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Document Upload</h1>

      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          disabled={isConverting}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isConverting ? "Processing..." : "Upload Documents"}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: PDF, JPG, JPEG, PNG
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isConverting && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <p className="text-blue-700">Converting files... Please wait.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploadedFiles.map((file, fileIndex) => (
          <div key={fileIndex} className="border rounded-md p-4 relative">
            <button
              onClick={() => removeFile(fileIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>

            <h3 className="font-medium truncate mb-2">{file.name}</h3>

            <div>
              {file.pages.map((page, pageIndex) => (
                <img
                  key={pageIndex}
                  src={page}
                  alt={`Page ${pageIndex + 1} of ${file.name}`}
                  ref={(el) => {
                    imageRefs.current[fileIndex] = el;
                  }}
                  className="w-full border rounded-md mb-2"
                //   className="w-auto h-auto max-w-none max-h-none"
                />
              ))}
            </div>

            {coordinatesList[fileIndex] && (
              <div className="mt-2 text-xs text-gray-700 bg-green-100 p-2 rounded">
                <p>
                  <strong>Top-Left:</strong> (0, 0)
                </p>
                <p>
                  <strong>Bottom-Right:</strong> (
                  {coordinatesList[fileIndex].right.toFixed(2)},{" "}
                  {coordinatesList[fileIndex].bottom.toFixed(2)})
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Top-Left: (0, 0)

// Bottom-Right: (3058.00, 2183.00)

// Bottom-Right: (918.00, 1188.00)
