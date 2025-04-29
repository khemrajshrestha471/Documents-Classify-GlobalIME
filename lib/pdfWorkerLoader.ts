// This is a workaround for Next.js to properly load the PDF.js worker
export const getPdfWorkerSrc = () => {
    if (typeof window === 'undefined') {
      // Server-side - return empty string
      return '';
    }
    
    // Client-side - use CDN or public folder
    return 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    // OR if you prefer to host it yourself:
    // return '/pdf.worker.js';
  };