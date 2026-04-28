import * as mammoth from 'mammoth';

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Processing timeout: 15 seconds
const PROCESSING_TIMEOUT = 15000;

/**
 * Extract text from a Word document (.docx) with timeout protection
 * @param file The Word document file to extract from
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise<string> The extracted text
 */
export async function extractTextFromWord(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log('Starting Word extraction:', file.name);
    onProgress?.(10);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    onProgress?.(30);
    
    // Add timeout promise - resolve with whatever mammoth returns or reject after timeout
    const extractPromise = new Promise<string>((resolve, reject) => {
      // Set overall extraction timeout
      const timeoutId = setTimeout(() => {
        console.warn('Mammoth extraction timeout, returning empty string');
        resolve(''); // Return empty instead of rejecting to allow fallback
      }, PROCESSING_TIMEOUT);

      // Extract with mammoth
      mammoth
        .extractRawText({ arrayBuffer })
        .then((result) => {
          clearTimeout(timeoutId);
          console.log('Mammoth extraction complete:', result.value.length, 'chars');
          resolve(result.value);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.error('Mammoth extraction error:', err);
          reject(err);
        });
    });

    const result = await extractPromise;
    onProgress?.(100);
    
    return result.trim();
  } catch (error) {
    console.error('Error extracting Word document:', error);
    throw new Error(`Failed to extract Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a file based on its type
 * Supports Word documents (.docx) and text files (.txt)
 * @param file The file to extract from
 * @param onProgress Optional callback for progress updates (0-100)
 * @returns Promise<string> The extracted text
 */
export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  console.log('Extract file:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  onProgress?.(5);

  try {
    // Check if it's a Word document
    if (
      fileName.endsWith('.docx') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      console.log('Detected Word document');
      return extractTextFromWord(file, onProgress);
    }

    // Check if it's plain text
    if (fileName.endsWith('.txt') || mimeType === 'text/plain') {
      console.log('Detected text file');
      onProgress?.(50);
      const text = await file.text();
      onProgress?.(100);
      console.log('Text extracted:', text.length, 'chars');
      return text;
    }

    throw new Error(`Unsupported file type. Supported types: Word (.docx), Text (.txt)`);
  } catch (error) {
    console.error('File extraction failed:', error);
    throw error;
  }
}

/**
 * Get file type label
 * @param file The file to check
 * @returns string The file type label
 */
export function getFileTypeLabel(file: File): string {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.pdf')) return 'PDF';
  if (fileName.endsWith('.docx')) return 'Word Document';
  if (fileName.endsWith('.txt')) return 'Text File';
  return 'Document';
}
