import * as pdfjsLib from 'pdfjs-dist';

// Configure worker path
if (typeof window !== 'undefined') {
  // Use official CDN matching exact package version or fall back to reliable cdnjs
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch {
    // Fallback if needed
  }
}

export interface PdfExtractionResult {
  text: string;
  numPages: number;
  charCount: number;
  wordCount: number;
  fileName: string;
  fileSizeBytes: number;
}

/**
 * Extracts all readable text from an uploaded PDF file in the browser.
 * Validates that the document actually contains readable character data.
 * Supports unlimited pages and file sizes with memory cleanup and live progress.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    throw new Error(
      `Could not open or parse PDF: ${err?.message || 'The file may be corrupted or password protected.'}`
    );
  }

  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];
  let totalRawChars = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStr = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((str) => str.trim().length > 0)
        .join(' ');

      if (pageStr.trim().length > 0) {
        totalRawChars += pageStr.trim().length;
        pageTexts.push(`[Page ${pageNum}]\n${pageStr}`);
      }

      // Clean up memory for parsed page
      page.cleanup();
    } catch (pageErr) {
      console.warn(`Error extracting text from page ${pageNum}:`, pageErr);
    }

    if (onProgress) {
      onProgress(pageNum, numPages);
    }

    // Yield to browser event loop every 10 pages for smooth 60fps rendering during large documents
    if (pageNum % 10 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const combinedText = pageTexts.join('\n\n').trim();

  // Check for empty or scanned image-only PDF
  if (totalRawChars < 40 || combinedText.length < 40) {
    throw new Error('NO_READABLE_TEXT');
  }

  const words = combinedText.split(/\s+/).filter(Boolean);

  return {
    text: combinedText,
    numPages,
    charCount: totalRawChars,
    wordCount: words.length,
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}

/**
 * Generates a minimal, valid standard PDF ArrayBuffer from plain text
 * for demo/sample testing so users can test immediately.
 */
export function createSamplePdfFile(title: string, text: string): File {
  const cleanTitle = title.replace(/[()\\]/g, '');
  // Format lines
  const words = text.replace(/[()\\]/g, '').split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > 70) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  // Build stream operators
  let streamLines = [
    'BT',
    '/F1 16 Tf',
    '50 730 Td',
    `(${cleanTitle}) Tj`,
    '/F1 10 Tf',
    '0 -25 Td',
  ];

  for (let i = 0; i < Math.min(lines.length, 38); i++) {
    streamLines.push(`(${lines[i]}) Tj`);
    streamLines.push('0 -16 Td');
  }
  streamLines.push('ET');

  const streamContent = streamLines.join('\n');
  const streamLength = streamContent.length;

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return new File([blob], `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}
