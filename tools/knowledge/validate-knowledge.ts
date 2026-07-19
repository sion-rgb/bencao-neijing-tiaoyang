import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeEntry, KnowledgePublicationManifest } from "../../src/data/knowledge/types";
import { canPublishKnowledgeEntry } from "../../src/data/knowledge/types";

const rootDir = process.cwd();
const publishedDir = path.join(rootDir, "src", "data", "knowledge", "published");
const metadataDir = path.join(rootDir, "src", "data", "knowledge", "metadata");
const expected = new Set([
  "huangdi-neijing", "bencao-gangmu", "shennong-bencao-jing", "yaoxing-fu", "wenre-lun",
  "xuezheng-lun", "yixue-yuanliu-lun", "yixue-sanzijing", "qijing-bamai-kao", "zhongyi-neike-fangji-suoyin"
]);
const errors: string[] = [];
const entryIds = new Set<string>();
const modernLeak = /白話譯文|白话译文|現代啟示|现代启示|循證醫學|循证医学|現代藥理|现代药理|不構成醫療建議|不构成医疗建议|luckclub/u;
const files = (await readdir(publishedDir)).filter((file) => file.endsWith(".json"));

for (const documentId of expected) if (!files.includes(`${documentId}.json`)) errors.push(`缺少 Production 書籍：${documentId}`);
if (files.length !== expected.size) errors.push(`Production 應恰有 ${expected.size} 本書，實際 ${files.length} 本`);

for (const file of files) {
  const documentId = file.replace(/\.json$/u, "");
  if (!expected.has(documentId)) errors.push(`未列入 Build Gate 的 Production 文件：${documentId}`);
  const entries = JSON.parse(await readFile(path.join(publishedDir, file), "utf8")) as KnowledgeEntry[];
  if (entries.length < 50) errors.push(`${documentId}: 只有 ${entries.length} 條，至少須 50 條`);
  for (const entry of entries) {
    if (entryIds.has(entry.id)) errors.push(`重複 KnowledgeEntry id: ${entry.id}`);
    entryIds.add(entry.id);
    if (!canPublishKnowledgeEntry(entry)) errors.push(`${entry.id}: 未通過 Production 發布閘門`);
    if (!entry.sourceFileName || !/^[a-f0-9]{64}$/u.test(entry.sourceFileHash)) errors.push(`${entry.id}: 缺少 PDF 檔名或 SHA-256`);
    if (entry.pageStart < 1 || entry.pageEnd < entry.pageStart) errors.push(`${entry.id}: PDF 頁碼無效`);
    if (!entry.originalTextSimplified || !entry.textTraditional) errors.push(`${entry.id}: 必須保存簡體底本及繁體轉寫`);
    if (entry.conversionProfile !== "opencc-s2hk" || !entry.conversionReviewed) errors.push(`${entry.id}: 繁體轉寫未完成覆核`);
    if (entry.extractionMethod !== "text-layer" || entry.sourceStatus !== "verified") errors.push(`${entry.id}: 未審核 OCR／來源不可發布`);
    if (modernLeak.test(entry.originalTextSimplified) || modernLeak.test(entry.textTraditional)) errors.push(`${entry.id}: 疑似混入現代編輯或白話內容`);
  }
  const manifest = JSON.parse(await readFile(path.join(metadataDir, file), "utf8")) as KnowledgePublicationManifest;
  if (manifest.documentId !== documentId || manifest.productionEntryCount !== entries.length) errors.push(`${documentId}: publication manifest 與條目數不符`);
  if (manifest.processedPages / manifest.pageCount < 0.8) errors.push(`${documentId}: 頁面處理率低於 80%`);
  if (!manifest.rightsAssessment) errors.push(`${documentId}: 缺少 RightsAssessment`);
  else {
    if (manifest.rightsAssessment.scanRedistributionAllowed) errors.push(`${documentId}: 不可發布 PDF 掃描`);
    if (!manifest.rightsAssessment.ancientTextPublicationAllowed || manifest.rightsAssessment.modernCommentaryPublicationAllowed) errors.push(`${documentId}: 權利判定不符合古籍文字限定發布政策`);
  }
}

if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  if (errors.length > 100) console.error(`另有 ${errors.length - 100} 項錯誤`);
  process.exitCode = 1;
} else {
  console.log(`知識庫驗證通過：${expected.size} 本書、${entryIds.size} 條 Production 古籍條目；PDF 掃描及現代編輯內容均未發布。`);
}
