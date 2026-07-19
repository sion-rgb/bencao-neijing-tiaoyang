import { readFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export type ExtractedParagraph = {
  page: number;
  paragraphOrder: number;
  text: string;
  detectedHeading?: string;
};

export type PdfExtractionResult = {
  pageCount: number;
  paragraphs: ExtractedParagraph[];
  textLayerPages: number;
  needsOcrPages: number[];
};

const HEADING_PATTERN = /^(第[一二三四五六七八九十百千〇零\d]+[卷篇章節門]|卷[一二三四五六七八九十百千〇零\d]+|[\p{Script=Han}]{2,24}[篇論章門歌])$/u;

function normalizeLines(items: unknown[]): string[] {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!item || typeof item !== "object" || !("str" in item)) continue;
    const textItem = item as { str: string; hasEOL?: boolean };
    current += textItem.str;
    if (textItem.hasEOL) {
      if (current.trim()) lines.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

export async function extractPdfText(filePath: string, minimumUsefulCharacters = 20): Promise<PdfExtractionResult> {
  const data = new Uint8Array(await readFile(filePath));
  const loadingTask = getDocument({ data, useSystemFonts: true });
  const document = await loadingTask.promise;
  const pageCount = document.numPages;
  const paragraphs: ExtractedParagraph[] = [];
  const needsOcrPages: number[] = [];
  let textLayerPages = 0;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = normalizeLines(content.items);
    const usefulLength = lines.join("").replace(/\s/gu, "").length;
    if (usefulLength < minimumUsefulCharacters) {
      needsOcrPages.push(pageNumber);
      continue;
    }
    textLayerPages += 1;
    lines.forEach((line, index) => {
      paragraphs.push({
        page: pageNumber,
        paragraphOrder: index + 1,
        text: line,
        detectedHeading: line.length <= 30 && HEADING_PATTERN.test(line) ? line : undefined
      });
    });
  }

  await loadingTask.destroy();
  return { pageCount, paragraphs, textLayerPages, needsOcrPages };
}
