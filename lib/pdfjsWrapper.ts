let pdfjsLib: any;

export const getPdfjs = async () => {
  if (!pdfjsLib) {
    if (typeof window === 'undefined') {
      return null;
    }
    // Use legacy build
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }
  return pdfjsLib;
};
