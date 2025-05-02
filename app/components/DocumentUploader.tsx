"use client";

import { useState, useRef, useEffect } from "react";
import { getPdfjs } from "@/lib/pdfjsWrapper";
import BoundingBoxDrawer from "@/app/components/BoundingBoxDrawer";
import { Button } from "@/components/ui/button";

interface LineData {
  text: string;
  mean_confidence: number;
  coordinates: string;
}

interface UploadedFile {
  name: string;
  type: string;
  file: File;
  imageUrl?: string;
  classificationResult?: {
    predicted_class: string;
    confidence: number;
  };
  lineData?: LineData[];
}

export default function DocumentUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [kvData, setKvData] = useState<any>(null);

  const supportedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

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

  const classifyAndGetCoordinates = async (file: File) => {
    try {
      setIsConverting(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const classifyResponse = await fetch(
        "http://localhost:8080/api/classify-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!classifyResponse.ok) throw new Error("Classification failed");
      const classificationResult = await classifyResponse.json();

      const coordinatesResponse = await fetch(
        "http://localhost:8000/api/coordinates",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!coordinatesResponse.ok)
        throw new Error("Failed to fetch coordinates");

      const responseData = await coordinatesResponse.json();
      console.log("Coordinates response:", responseData.key_value_pairs);
      setKvData(responseData.key_value_pairs); // Store the key-value pairs
      const lineData = responseData.lines || []; // Ensure we get the lines array

      return { classificationResult, lineData };
    } catch (err) {
      console.error("Processing error:", err);
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (uploadedFiles.length === 0) return;

    const loadCurrentFile = async () => {
      try {
        const currentFile = uploadedFiles[currentFileIndex];

        if (currentFile.imageUrl && currentFile.lineData) {
          setCurrentImageUrl(currentFile.imageUrl);
          return;
        }

        let imageUrl: string;

        if (currentFile.type === "application/pdf") {
          imageUrl = await convertPdfToImage(currentFile.file);
        } else {
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(currentFile.file);
          });
        }

        const { classificationResult, lineData } =
          await classifyAndGetCoordinates(currentFile.file);

        setUploadedFiles((prev) =>
          prev.map((file, index) =>
            index === currentFileIndex
              ? {
                  ...file,
                  imageUrl,
                  classificationResult,
                  lineData,
                }
              : file
          )
        );
        setCurrentImageUrl(imageUrl);

        const img = new Image();
        img.onload = () => {
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.src = imageUrl;
      } catch (err) {
        console.error("Error loading file:", err);
        setError(`Failed to process ${uploadedFiles[currentFileIndex].name}`);
      }
    };

    loadCurrentFile();
  }, [currentFileIndex, uploadedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const supportedFiles = filesArray.filter((file) =>
        supportedTypes.includes(file.type)
      );

      if (supportedFiles.length === 0) {
        setError("No supported files selected");
        return;
      }

      setUploadedFiles(
        supportedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          file: file,
        }))
      );
      setCurrentFileIndex(0);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);

    if (currentFileIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentFileIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentImageUrl("");
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

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

  return (
    <div className="min-h-screen bg-[#FDF1F1] py-12">
      <div className="max-w-9xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#C5161D]">
          <h1 className="text-3xl font-bold text-[#004189] mb-6 text-center">
            Document Classification Tool
          </h1>

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
              Upload Documents
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="relative">
              <div className="bg-[#FFF5F5] border border-[#C5161D]/40 rounded-lg p-4 shadow relative min-h-[500px] flex flex-col items-center justify-center">
                <div className="w-full flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-[#004189] text-sm truncate">
                    {uploadedFiles[currentFileIndex].name}
                  </h3>
                  <button
                    onClick={() => removeFile(currentFileIndex)}
                    className="bg-[#C5161D] hover:bg-[#a91318] text-white rounded-full w-7 h-7 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                {isConverting ? (
                  <div className="text-center py-10">
                    <p>Processing file...</p>
                  </div>
                ) : (
                  currentImageUrl && (
                    <div className="relative w-full h-full flex justify-center items-center">
                      <BoundingBoxDrawer
                        imageUrl={currentImageUrl}
                        naturalWidth={imageDimensions.width}
                        naturalHeight={imageDimensions.height}
                        lineData={{
                          lines:
                            uploadedFiles[currentFileIndex]?.lineData || [],
                        }}
                        classificationResult={
                          uploadedFiles[currentFileIndex]?.classificationResult
                        }
                      />
                    </div>
                  )
                )}

                <div className="flex justify-between w-full mt-4">
                  <button
                    onClick={goToPrevFile}
                    disabled={currentFileIndex === 0}
                    className="bg-[#004189] hover:bg-[#00306e] text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <div className="text-gray-700">
                    {currentFileIndex + 1} / {uploadedFiles.length}
                  </div>
                  <button
                    onClick={goToNextFile}
                    disabled={currentFileIndex === uploadedFiles.length - 1}
                    className="bg-[#004189] hover:bg-[#00306e] text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* <pre>
          {kvData && (
            <p>{JSON.stringify(kvData)}</p>
          )}
          </pre> */}
          {kvData && (
  <pre className="bg-gray-100 p-4 rounded text-sm text-left overflow-auto">
    {JSON.stringify(kvData, null, 2)}
  </pre>
)}

        </div>
      </div>
      {uploadedFiles.length > 0 && (
        <Button onClick={() => alert("Submitted to database")} className="bg-[#C5161D] hover:bg-[#a91318] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer my-3 float-right">
          Submit
        </Button>
      )}
    </div>
  );
}
