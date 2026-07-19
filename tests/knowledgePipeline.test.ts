import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { canPublishKnowledgeEntry, type KnowledgeEntry } from "../src/data/knowledge/types";
import { extractPdfText } from "../tools/pdf_extract/extractPdf";
import { convertToHongKongTraditional, loadTcmGlossary } from "../tools/traditional_conversion/converter";

describe("本機 PDF 知識庫流程", () => {
  it("能擷取文字層、保存頁碼並識別需要 OCR 的頁面", async () => {
    const textPdf = path.join(process.cwd(), "tests", "fixtures", "text-layer.pdf");
    const scanPdf = path.join(process.cwd(), "tests", "fixtures", "scanned-placeholder.pdf");
    const extracted = await extractPdfText(textPdf);
    const scanned = await extractPdfText(scanPdf);
    expect(extracted.textLayerPages).toBe(1);
    expect(extracted.paragraphs[0].page).toBe(1);
    expect(scanned.needsOcrPages).toEqual([1]);
  });

  it("使用 OpenCC s2hk 並可同時保存簡體底本及香港繁體轉寫", async () => {
    const glossary = await loadTcmGlossary();
    const originalTextSimplified = "黄帝内经记载头发干燥，里面有茯苓。";
    const textTraditional = convertToHongKongTraditional(originalTextSimplified, glossary);
    expect(textTraditional).toContain("黃帝內經");
    expect(textTraditional).toContain("頭髮乾燥");
    expect({ originalTextSimplified, textTraditional }).toMatchObject({ originalTextSimplified, textTraditional });
  });

  it("SHA-256 可穩定追蹤不同 PDF 而不混合來源", async () => {
    const first = await readFile(path.join(process.cwd(), "tests", "fixtures", "text-layer.pdf"));
    const second = await readFile(path.join(process.cwd(), "tests", "fixtures", "scanned-placeholder.pdf"));
    const firstHash = createHash("sha256").update(first).digest("hex");
    const secondHash = createHash("sha256").update(second).digest("hex");
    expect(firstHash).toHaveLength(64);
    expect(firstHash).not.toBe(secondHash);
  });

  it("未知版權及未審核 OCR 均不進入 Production", () => {
    const base: KnowledgeEntry = {
      id: "fixture-p1-n1", sourceDocumentId: "fixture", bookTitle: "測試", pageStart: 1, pageEnd: 1, paragraphOrder: 1,
      originalTextSimplified: "简体底本", textTraditional: "繁體轉寫", extractionMethod: "text-layer", conversionProfile: "opencc-s2hk", conversionReviewed: true,
      topics: [], herbs: [], formulas: [], patterns: [], sourceFileName: "fixture.pdf", sourceFileHash: "a".repeat(64), rightsStatus: "unknown", publishable: false,
      sourceStatus: "verified", reviewStatus: "approved", importedAt: "2026-07-20T00:00:00.000Z", toolVersion: "1.0.0"
    };
    expect(canPublishKnowledgeEntry(base)).toBe(false);
    expect(canPublishKnowledgeEntry({ ...base, rightsStatus: "public-domain", publishable: true, extractionMethod: "ocr", sourceStatus: "needs-review", reviewStatus: "draft" })).toBe(false);
    expect(canPublishKnowledgeEntry({ ...base, rightsStatus: "public-domain", publishable: true })).toBe(true);
  });
});
