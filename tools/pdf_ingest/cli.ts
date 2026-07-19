import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { KnowledgeDocumentManifest, KnowledgeEntry } from "../../src/data/knowledge/types";
import { extractPdfText, type ExtractedParagraph } from "../pdf_extract/extractPdf";
import { convertToHongKongTraditional, loadTcmGlossary } from "../traditional_conversion/converter";

const TOOL_VERSION = "1.0.0";
const rootDir = process.cwd();
const pdfDir = path.join(rootDir, "knowledge_sources", "pdfs");
const generatedDir = path.join(rootDir, "src", "data", "knowledge", "generated");
const sourceManifestPath = path.join(rootDir, "knowledge_sources", "manifests", "sources.json");
const ingestReportPath = path.join(rootDir, "knowledge_sources", "manifests", "ingest-report.json");

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const useOcr = args.includes("--ocr");

const bufferHash = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
const slug = (value: string) => value.normalize("NFKD").replace(/[^a-zA-Z0-9\p{Script=Han}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
const selectedOption = getArg("--file");

type OcrResult = { page: number; text: string; confidence: number; extractionMethod: "ocr"; requiresHumanReview: true };

async function runLocalOcr(filePath: string, page: number): Promise<OcrResult> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "bencao-ocr-"));
  const outputPath = path.join(tempDir, `page-${page}.json`);
  const python = getArg("--python") ?? process.env.PYTHON ?? "python";
  const scriptPath = path.join(rootDir, "tools", "pdf_extract", "local_ocr.py");
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(python, [scriptPath, "--file", filePath, "--page", String(page), "--output", outputPath], { stdio: "inherit" });
      child.on("error", reject);
      child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`本機 OCR 在第 ${page} 頁失敗（exit ${code}）`)));
    });
    return JSON.parse(await readFile(outputPath, "utf8")) as OcrResult;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function detectTags(text: string) {
  const topics = ["陰陽", "五行", "氣血", "津液", "臟腑", "寒熱", "虛實", "消渴"].filter((term) => text.includes(term));
  const herbs = ["炙甘草", "甘草", "陳皮", "茯苓", "山藥", "蓮子", "芡實"].filter((term) => text.includes(term));
  const patterns = ["氣虛", "脾氣虛", "陰虛", "陽虛", "痰濕", "濕熱", "血瘀", "血虛", "氣滯"].filter((term) => text.includes(term));
  return { topics, herbs, patterns };
}

async function ingestOne(filePath: string, configured: KnowledgeDocumentManifest, glossary: Awaited<ReturnType<typeof loadTcmGlossary>>) {
  if (configured.publishable && configured.rightsStatus === "unknown") throw new Error(`${configured.sourceFileName} 版權狀態不明，不可標記為 publishable。`);
  const fileData = await readFile(filePath);
  const sourceFileHash = bufferHash(fileData);
  const extracted = await extractPdfText(filePath);
  const paragraphs: Array<ExtractedParagraph & { extractionMethod: "text-layer" | "ocr"; confidence?: number }> = extracted.paragraphs.map((item) => ({ ...item, extractionMethod: "text-layer" }));

  if (useOcr) {
    for (const page of extracted.needsOcrPages) {
      const ocr = await runLocalOcr(filePath, page);
      if (ocr.text.trim()) paragraphs.push({ page, paragraphOrder: 1, text: ocr.text, extractionMethod: "ocr", confidence: ocr.confidence });
    }
  }

  paragraphs.sort((a, b) => a.page - b.page || a.paragraphOrder - b.paragraphOrder);
  let currentChapter: string | undefined;
  const importedAt = new Date().toISOString();
  const entries: KnowledgeEntry[] = paragraphs.map((paragraph) => {
    if (paragraph.detectedHeading) currentChapter = paragraph.detectedHeading;
    const textTraditional = convertToHongKongTraditional(paragraph.text, glossary);
    const tags = detectTags(textTraditional);
    return {
      id: `${configured.documentId}-p${paragraph.page}-n${paragraph.paragraphOrder}`,
      sourceDocumentId: configured.documentId,
      bookTitle: configured.bookTitle,
      author: configured.author,
      edition: configured.edition,
      chapter: currentChapter,
      pageStart: paragraph.page,
      pageEnd: paragraph.page,
      paragraphOrder: paragraph.paragraphOrder,
      originalTextSimplified: paragraph.text,
      textTraditional,
      extractionMethod: paragraph.extractionMethod,
      extractionConfidence: paragraph.confidence,
      conversionProfile: "opencc-s2hk",
      conversionReviewed: false,
      topics: tags.topics,
      herbs: tags.herbs,
      formulas: [],
      patterns: tags.patterns,
      sourceFileName: path.basename(filePath),
      sourceFileHash,
      rightsStatus: configured.rightsStatus,
      publishable: configured.publishable,
      sourceStatus: paragraph.extractionMethod === "ocr" ? "needs-review" : "converted",
      reviewStatus: "draft",
      importedAt,
      toolVersion: TOOL_VERSION
    };
  });

  await mkdir(generatedDir, { recursive: true });
  await writeFile(path.join(generatedDir, `${configured.documentId}.json`), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  const report: KnowledgeDocumentManifest = {
    ...configured,
    sourceFileHash,
    pageCount: extracted.pageCount,
    textLayerPages: extracted.textLayerPages,
    needsOcrPages: extracted.needsOcrPages,
    importedAt,
    toolVersion: TOOL_VERSION,
    reviewStatus: "draft"
  };
  console.log(`${configured.bookTitle}: ${entries.length} 條，文字層 ${extracted.textLayerPages}/${extracted.pageCount} 頁，待 OCR ${extracted.needsOcrPages.length} 頁`);
  return report;
}

await mkdir(pdfDir, { recursive: true });
const configuredSources = JSON.parse(await readFile(sourceManifestPath, "utf8")) as KnowledgeDocumentManifest[];
const sourceByFileName = new Map(configuredSources.map((source) => [source.sourceFileName, source]));
const files = selectedOption
  ? [path.isAbsolute(selectedOption) ? selectedOption : path.join(rootDir, selectedOption)]
  : (await readdir(pdfDir, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")).map((entry) => path.join(pdfDir, entry.name));

if (!files.length) throw new Error("knowledge_sources/pdfs/ 內沒有 PDF。請先閱讀該資料夾的 README。 ");
const glossary = await loadTcmGlossary(rootDir);
const reports: KnowledgeDocumentManifest[] = [];
for (const filePath of files) {
  const fileName = path.basename(filePath);
  const configured = sourceByFileName.get(fileName) ?? {
    documentId: slug(path.basename(fileName, path.extname(fileName))),
    sourceFileName: fileName,
    bookTitle: path.basename(fileName, path.extname(fileName)),
    rightsStatus: "unknown" as const,
    publishable: false,
    toolVersion: TOOL_VERSION,
    reviewStatus: "draft" as const
  };
  reports.push(await ingestOne(filePath, configured, glossary));
}
await writeFile(ingestReportPath, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
console.log(`匯入完成。全文只寫入本機 generated 目錄；發布仍受版權及審核閘門控制。`);
