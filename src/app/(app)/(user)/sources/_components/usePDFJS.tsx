import { useState, useEffect } from 'react';
import * as PDFJS from 'pdfjs-dist';

export const usePDFJS = () => {
  const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null);

  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        // Set the worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        setPDFJS(pdfjsLib);
      } catch (error) {
        console.error('Failed to load PDF.js', error);
      }
    };

    loadPDFJS();
  }, []);

  return pdfjs;
};