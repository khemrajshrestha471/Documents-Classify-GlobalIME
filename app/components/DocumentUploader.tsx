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
        
        const supportedFiles = filesArray.filter(file => 
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
                error: true
              };
            }
          })
        );

        const successfulFiles = convertedFiles.filter(f => !f.error);
        const failedFiles = convertedFiles.filter(f => f.error);

        setUploadedFiles(prev => [...prev, ...successfulFiles]);
        
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
      
      // Convert first page only for demo
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context");
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      pageImages.push(canvas.toDataURL('image/png'));
      
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
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
        file.pages.forEach(page => {
          if (page.startsWith('blob:')) {
            URL.revokeObjectURL(page);
          }
        });
      });
    };
  }, [uploadedFiles]);

  return (
    <div className="container mx-auto p-4">
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
        {uploadedFiles.map((file, index) => (
          <div key={index} className="border rounded-md p-4 relative">
            <button
              onClick={() => removeFile(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
            
            <h3 className="font-medium truncate mb-2">{file.name}</h3>
            
            <div className="overflow-auto max-h-80">
              {file.pages.map((page, pageIndex) => (
                <img
                  key={pageIndex}
                  src={page}
                  alt={`Page ${pageIndex + 1} of ${file.name}`}
                  className="w-full border rounded-md mb-2"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}