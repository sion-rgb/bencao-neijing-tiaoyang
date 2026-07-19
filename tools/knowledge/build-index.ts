import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeCatalog, KnowledgeEntry, KnowledgeSearchDocument } from "../../src/data/knowledge/types";
import { canPublishKnowledgeEntry } from "../../src/data/knowledge/types";

const rootDir = process.cwd();
const publishedDir = path.join(rootDir, "src", "data", "knowledge", "published");
const publicRoot = path.join(rootDir, "public", "knowledge");
const booksRoot = path.join(publicRoot, "books");
const indexRoot = path.join(publicRoot, "indexes");
const CHUNK_SIZE = 80;
const EXPECTED_DOCUMENTS = [
  "huangdi-neijing", "bencao-gangmu", "shennong-bencao-jing", "yaoxing-fu", "wenre-lun",
  "xuezheng-lun", "yixue-yuanliu-lun", "yixue-sanzijing", "qijing-bamai-kao", "zhongyi-neike-fangji-suoyin"
];

for (const target of [booksRoot, indexRoot]) {
  if (!path.resolve(target).startsWith(path.resolve(publicRoot))) throw new Error("拒絕清除 knowledge 以外的路徑。");
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}

const files = (await readdir(publishedDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();
const allEntries: KnowledgeEntry[] = [];
for (const file of files) {
  const entries = JSON.parse(await readFile(path.join(publishedDir, file), "utf8")) as KnowledgeEntry[];
  allEntries.push(...entries.filter(canPublishKnowledgeEntry));
}

const contentVersion = createHash("sha256")
  .update(allEntries.map((entry) => `${entry.id}:${entry.sourceFileHash}:${entry.textTraditional}`).join("\n"))
  .digest("hex").slice(0, 16);
const generatedAt = allEntries.map((entry) => entry.importedAt).sort().at(-1) ?? "1970-01-01T00:00:00.000Z";
const byDocument = Map.groupBy(allEntries, (entry) => entry.sourceDocumentId);
const missing = EXPECTED_DOCUMENTS.filter((documentId) => !byDocument.has(documentId));
if (missing.length) throw new Error(`Production 知識庫缺少：${missing.join("、")}`);

const searchDocuments: KnowledgeSearchDocument[] = [];
const documents: KnowledgeCatalog["documents"] = [];
for (const documentId of EXPECTED_DOCUMENTS) {
  const entries = byDocument.get(documentId) ?? [];
  if (entries.length < 50) throw new Error(`${documentId} 只有 ${entries.length} 條，未達 50 條 Build Gate。`);
  const sorted = [...entries].sort((a, b) => a.pageStart - b.pageStart || a.paragraphOrder - b.paragraphOrder || a.id.localeCompare(b.id));
  const documentDir = path.join(booksRoot, documentId);
  await mkdir(documentDir, { recursive: true });
  const chunkPaths: string[] = [];
  for (let offset = 0; offset < sorted.length; offset += CHUNK_SIZE) {
    const chunk = sorted.slice(offset, offset + CHUNK_SIZE);
    const chunkHash = createHash("sha256").update(JSON.stringify(chunk)).digest("hex").slice(0, 12);
    const chunkName = `chunk-${String(offset / CHUNK_SIZE + 1).padStart(4, "0")}.${chunkHash}.json`;
    const relativePath = `knowledge/books/${documentId}/${chunkName}`;
    await writeFile(path.join(documentDir, chunkName), `${JSON.stringify(chunk)}\n`, "utf8");
    chunkPaths.push(relativePath);
    for (const entry of chunk) {
      searchDocuments.push({
        id: entry.id,
        bookTitle: entry.bookTitle,
        volume: entry.volume,
        chapter: entry.chapter,
        section: entry.section,
        pageStart: entry.pageStart,
        pageEnd: entry.pageEnd,
        preview: entry.textTraditional.slice(0, 220),
        topics: entry.topics,
        herbs: entry.herbs,
        formulas: entry.formulas,
        patterns: entry.patterns,
        organs: entry.organs,
        qiBloodFluids: entry.qiBloodFluids,
        coldHeat: entry.coldHeat,
        deficiencyExcess: entry.deficiencyExcess,
        extractionMethod: entry.extractionMethod,
        reviewStatus: entry.reviewStatus,
        sourceStatus: entry.sourceStatus,
        chunkPath: relativePath,
        sourceFileHash: entry.sourceFileHash
      });
    }
  }
  documents.push({
    documentId,
    bookTitle: sorted[0].bookTitle,
    chapters: [...new Set(sorted.map((entry) => entry.chapter).filter((value): value is string => Boolean(value)))],
    herbs: [...new Set(sorted.flatMap((entry) => entry.herbs))],
    formulas: [...new Set(sorted.flatMap((entry) => entry.formulas))],
    patterns: [...new Set(sorted.flatMap((entry) => entry.patterns))],
    entryCount: sorted.length,
    chunkPaths,
    sourceFileHash: sorted[0].sourceFileHash
  });
}

const searchIndexPath = `knowledge/indexes/search-index.${contentVersion}.json`;
const searchPayload = { schemaVersion: 2, contentVersion, generatedAt, documents: searchDocuments };
const catalog: KnowledgeCatalog = { schemaVersion: 2, contentVersion, generatedAt, searchIndexPath, documents };
await writeFile(path.join(publicRoot, "catalog.json"), `${JSON.stringify(catalog)}\n`, "utf8");
await writeFile(path.join(indexRoot, `search-index.${contentVersion}.json`), `${JSON.stringify(searchPayload)}\n`, "utf8");
await writeFile(path.join(indexRoot, "search-index.json"), `${JSON.stringify(searchPayload)}\n`, "utf8");
console.log(`Production 知識索引：${documents.length} 本書、${searchDocuments.length} 條、內容版本 ${contentVersion}；全文按每 ${CHUNK_SIZE} 條延遲載入。`);
