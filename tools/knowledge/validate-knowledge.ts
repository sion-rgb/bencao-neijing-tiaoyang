import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeDocumentManifest, KnowledgeEntry } from "../../src/data/knowledge/types";
import { canPublishKnowledgeEntry } from "../../src/data/knowledge/types";

const rootDir = process.cwd();
const sourceManifestPath = path.join(rootDir, "knowledge_sources", "manifests", "sources.json");
const generatedDir = path.join(rootDir, "src", "data", "knowledge", "generated");
const sources = JSON.parse(await readFile(sourceManifestPath, "utf8")) as KnowledgeDocumentManifest[];
const errors: string[] = [];
const ids = new Set<string>();
for (const source of sources) {
  if (ids.has(source.documentId)) errors.push(`重複 documentId: ${source.documentId}`);
  ids.add(source.documentId);
  if (source.publishable && source.rightsStatus === "unknown") errors.push(`${source.documentId}: 未知版權不可發布`);
}

let generatedFiles: string[] = [];
try {
  generatedFiles = (await readdir(generatedDir, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
} catch {
  // A fresh clone may intentionally contain no local PDF output.
}

const entryIds = new Set<string>();
for (const file of generatedFiles) {
  const entries = JSON.parse(await readFile(path.join(generatedDir, file), "utf8")) as KnowledgeEntry[];
  for (const entry of entries) {
    if (entryIds.has(entry.id)) errors.push(`重複 KnowledgeEntry id: ${entry.id}`);
    entryIds.add(entry.id);
    if (!entry.sourceFileName || !/^[a-f0-9]{64}$/u.test(entry.sourceFileHash)) errors.push(`${entry.id}: 缺少 PDF 檔名或 SHA-256`);
    if (entry.pageStart < 1 || entry.pageEnd < entry.pageStart) errors.push(`${entry.id}: PDF 頁碼無效`);
    if (!entry.originalTextSimplified || !entry.textTraditional) errors.push(`${entry.id}: 必須同時保存簡體底本及繁體轉寫`);
    if (entry.conversionProfile !== "opencc-s2hk") errors.push(`${entry.id}: 轉換設定不是 opencc-s2hk`);
    if (entry.extractionMethod === "ocr" && entry.reviewStatus === "approved" && !entry.conversionReviewed) errors.push(`${entry.id}: 未人工覆核 OCR／轉換內容不可 approved`);
    if (entry.publishable && !canPublishKnowledgeEntry(entry)) errors.push(`${entry.id}: publishable 條目未通過版權、來源或審核閘門`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`知識庫驗證通過：${sources.length} 份來源設定、${entryIds.size} 條本機條目。`);
}
