"use client";

import { useState, useRef, useEffect } from "react";
import { getPdfjs } from "@/lib/pdfjsWrapper";
import BoundingBoxDrawer from "@/app/components/BoundingBoxDrawer";

interface UploadedFile {
  name: string;
  type: string;
  preview: string;
  error?: boolean;
}

export default function DocumentUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0
  });

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
          setError("No supported files selected. Please upload a valid document.");
          return;
        }

        const convertedFiles = await Promise.all(
          supportedFiles.map(async (file): Promise<UploadedFile> => {
            try {
              if (file.type === "application/pdf") {
                const pdfImage = await convertPdfToImage(file);
                return {
                  name: file.name,
                  type: file.type,
                  preview: pdfImage,
                };
              } else {
                return await processImageFile(file);
              }
            } catch (err) {
              console.error(`Error processing ${file.name}:`, err);
              return {
                name: file.name,
                type: file.type,
                preview: "",
                error: true,
              };
            }
          })
        );

        const successfulFiles = convertedFiles.filter((f) => !f.error);
        const failedFiles = convertedFiles.filter((f) => f.error);

        setUploadedFiles(successfulFiles);
        setCurrentFileIndex(0);

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

  const convertPdfToImage = async (file: File): Promise<string> => {
    const pdfjs = await getPdfjs();
    if (!pdfjs) throw new Error("PDF.js not available");

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
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

    return canvas.toDataURL("image/png");
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
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (currentFileIndex >= index && currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const goToNextFile = () => {
    if (currentFileIndex < uploadedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const goToPrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  useEffect(() => {
    if (uploadedFiles[currentFileIndex]?.preview) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = uploadedFiles[currentFileIndex].preview;
    }
  }, [currentFileIndex, uploadedFiles]);

  return (
    <div className="min-h-screen bg-[#FDF1F1] py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#C5161D]">
          <h1 className="text-3xl font-bold text-[#004189] mb-6 text-center">
            Document Annotation Tool
          </h1>
          <p className="text-gray-700 text-center mb-8">
            Upload documents and add bounding box annotations.
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
              {isConverting ? "Processing..." : "Upload Documents"}
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

          {uploadedFiles.length > 0 && (
            <div className="relative">
              <div className="bg-[#FFF5F5] border border-[#C5161D]/40 rounded-lg p-4 shadow relative min-h-[500px] flex flex-col items-center justify-center">
                <button
                  onClick={() => removeFile(currentFileIndex)}
                  className="absolute top-2 right-2 bg-[#C5161D] hover:bg-[#a91318] text-white rounded-full w-7 h-7 flex items-center justify-center z-10"
                >
                  ×
                </button>

                <h3 className="font-semibold text-[#004189] text-sm truncate mb-3">
                  {uploadedFiles[currentFileIndex].name}
                </h3>

                <div className="relative w-full h-full flex justify-center items-center">
                  <BoundingBoxDrawer
                    key={`bounding-box-${currentFileIndex}`}
                    imageUrl={uploadedFiles[currentFileIndex].preview}
                    naturalWidth={imageDimensions.width}
                    naturalHeight={imageDimensions.height}
                  />
                </div>

                <div className="mt-3 text-xs text-gray-800 bg-[#004189]/10 p-2 rounded border border-[#004189]/20">
                  <p>
                    <strong>Dimensions:</strong> {imageDimensions.width} × {imageDimensions.height} px
                  </p>
                </div>

                <div className="flex justify-between w-full mt-4">
                  <button
                    onClick={goToPrevFile}
                    disabled={currentFileIndex === 0}
                    className="bg-[#004189] hover:bg-[#00306e] text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="text-gray-700">
                    {currentFileIndex + 1} / {uploadedFiles.length}
                  </div>
                  <button
                    onClick={goToNextFile}
                    disabled={currentFileIndex === uploadedFiles.length - 1}
                    className="bg-[#004189] hover:bg-[#00306e] text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}