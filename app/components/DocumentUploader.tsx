"use client";

import { useState, useRef, useEffect } from "react";
import { getPdfjs } from "@/lib/pdfjsWrapper";
import BoundingBoxDrawer from "@/app/components/BoundingBoxDrawer";

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

  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
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
          setError(
            "No supported files selected. Please upload a valid document."
          );
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
          setError(`Failed to process ${failedFiles.length} file(s).`);
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
    const newCoordinates: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    }[] = [];

    imageRefs.current.forEach((img) => {
      if (img) {
        newCoordinates.push({
          top: 0,
          left: 0,
          bottom: img.naturalHeight,
          right: img.naturalWidth,
        });
      }
    });

    setCoordinatesList(newCoordinates);
  }, [uploadedFiles]);

  return (
    <div className="min-h-screen bg-[#FDF1F1] py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#C5161D]">
          <h1 className="text-3xl font-bold text-[#004189] mb-6 text-center">
            Upload and View Your Documents
          </h1>
          <p className="text-gray-700 text-center mb-8">
            Easily upload PDFs or images and view them with bounding boxes.
            <br />
            Supported formats: <b>PDF, JPG, JPEG, PNG</b>.
          </p>

          <div className="flex justify-center mb-6">
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
              className="bg-[#C5161D] hover:bg-[#a91318] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isConverting ? "Processing..." : "Choose Documents"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center font-semibold border border-red-400">
              {error}
            </div>
          )}

          {isConverting && (
            <div className="mb-6 p-4 bg-[#004189]/10 text-[#004189] rounded-lg text-center font-semibold">
              Processing your documents, please wait...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {uploadedFiles.map((file, fileIndex) => (
              <div
                key={`${file.name}-${fileIndex}`}
                className="bg-[#FFF5F5] border border-[#C5161D]/40 rounded-lg p-4 shadow relative"
              >
                <button
                  onClick={() => removeFile(fileIndex)}
                  className="absolute top-2 right-2 bg-[#C5161D] hover:bg-[#a91318] text-white rounded-full w-7 h-7 flex items-center justify-center"
                >
                  ×
                </button>

                <h3 className="font-semibold text-[#004189] text-sm truncate mb-3">
                  {file.name}
                </h3>

                {file.pages.map((page, pageIndex) => (
                  <div
                    key={`${file.name}-page-${pageIndex}`}
                    className="relative"
                  >
                    <img
                      src={page}
                      alt={`Page ${pageIndex + 1} of ${file.name}`}
                      ref={(el) => {
                        imageRefs.current[fileIndex] = el;
                      }}
                      className="w-full h-auto rounded-lg mb-2 border border-[#004189]/30"
                    />
                    <BoundingBoxDrawer
                      key={`bounding-box-${file.name}-page-${pageIndex}`}
                      imageUrl={page}
                      naturalWidth={coordinatesList[fileIndex]?.right || 0}
                      naturalHeight={coordinatesList[fileIndex]?.bottom || 0}
                    />
                  </div>
                ))}

                {coordinatesList[fileIndex] && (
                  <div className="mt-3 text-xs text-gray-800 bg-[#004189]/10 p-2 rounded border border-[#004189]/20">
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
      </div>
    </div>
  );
}
