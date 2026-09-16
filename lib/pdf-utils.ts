// @ts-ignore - Importing from lib avoids pdf-parse root module test file evaluation bug
import pdf from 'pdf-parse/lib/pdf-parse.js';

export interface ExtractedChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export interface PdfParseResult {
  fileName: string;
  totalPages: number;
  chunks: ExtractedChunk[];
}

/**
 * Parses PDF buffer and extracts text chunks with exact page numbering.
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  fileName: string,
  chunkSize: number = 800,
  chunkOverlap: number = 150
): Promise<PdfParseResult> {
  const pageTexts: { page: number; text: string }[] = [];
  let pageIndex = 1;

  const customPagerender = async (pageData: any) => {
    const textContent = await pageData.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    });

    let lastY: any, text = '';
    for (const item of textContent.items) {
      if (lastY === item.transform[5] || !lastY) {
        text += item.str;
      } else {
        text += '\n' + item.str;
      }
      lastY = item.transform[5];
    }

    pageTexts.push({ page: pageIndex++, text: text.trim() });
    return text;
  };

  try {
    const data = await pdf(buffer, {
      pagerender: customPagerender,
    });

    const totalPages = data.numpages || pageTexts.length || 1;
    const chunks: ExtractedChunk[] = [];
    let globalChunkIndex = 0;

    // Process page by page so page metadata is strictly preserved
    for (const pageObj of pageTexts) {
      const pageText = pageObj.text.replace(/\s+/g, ' ').trim();
      if (!pageText || pageText.length < 20) continue;

      let start = 0;
      while (start < pageText.length) {
        const end = Math.min(start + chunkSize, pageText.length);
        let chunkContent = pageText.slice(start, end).trim();

        if (chunkContent.length > 30) {
          chunks.push({
            content: chunkContent,
            pageNumber: pageObj.page,
            chunkIndex: globalChunkIndex++,
          });
        }

        if (end === pageText.length) break;
        start += chunkSize - chunkOverlap;
      }
    }

    // Fallback if custom pagerender did not capture individual pages
    if (chunks.length === 0 && data.text) {
      const fullText = data.text.replace(/\s+/g, ' ').trim();
      let start = 0;
      let idx = 0;
      while (start < fullText.length) {
        const end = Math.min(start + chunkSize, fullText.length);
        const chunkContent = fullText.slice(start, end).trim();
        if (chunkContent.length > 30) {
          chunks.push({
            content: chunkContent,
            pageNumber: 1,
            chunkIndex: idx++,
          });
        }
        if (end === fullText.length) break;
        start += chunkSize - chunkOverlap;
      }
    }

    return {
      fileName,
      totalPages,
      chunks,
    };
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}
