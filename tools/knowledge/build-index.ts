import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeCatalog, KnowledgeEntry, KnowledgeSearchDocument } from "../../src/data/knowledge/types";
import { canPublishKnowledgeEntry } from "../../src/data/knowledge/types";

const rootDir = process.cwd();
const generatedDir = path.join(rootDir, "src", "data", "knowledge", "generated");
const publicRoot = path.join(rootDir, "public", "knowledge");
const booksRoot = path.join(publicRoot, "books");
const indexRoot = path.join(publicRoot, "indexes");
const CHUNK_SIZE = 80;

if (!booksRoot.startsWith(path.join(rootDir, "public", "knowledge"))) throw new Error("拒絕清除工作區以外的路徑。 ");
await rm(booksRoot, { recursive: true, force: true });
await mkdir(booksRoot, { recursive: true });
await mkdir(indexRoot, { recursive: true });

let files: string[] = [];
try {
  files = (await readdir(generatedDir, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
} catch {
  await mkdir(generatedDir, { recursive: true });
}

const allEntries: KnowledgeEntry[] = [];
for (const file of files) {
  const entries = JSON.parse(await readFile(path.join(generatedDir, file), "utf8")) as KnowledgeEntry[];
  allEntries.push(...entries.filter(canPublishKnowledgeEntry));
}

const byDocument = Map.groupBy(allEntries, (entry) => entry.sourceDocumentId);
const searchDocuments: KnowledgeSearchDocument[] = [];
const documents: KnowledgeCatalog["documents"] = [];

for (const [documentId, entries] of byDocument) {
  const sorted = [...entries].sort((a, b) => a.pageStart - b.pageStart || a.paragraphOrder - b.paragraphOrder);
  const documentDir = path.join(booksRoot, documentId);
  await mkdir(documentDir, { recursive: true });
  const chunkPaths: string[] = [];
  for (let offset = 0; offset < sorted.length; offset += CHUNK_SIZE) {
    const chunk = sorted.slice(offset, offset + CHUNK_SIZE);
    const chunkName = `chunk-${String(offset / CHUNK_SIZE + 1).padStart(4, "0")}.json`;
    const relativePath = `knowledge/books/${documentId}/${chunkName}`;
    await writeFile(path.join(documentDir, chunkName), `${JSON.stringify(chunk)}\n`, "utf8");
    chunkPaths.push(relativePath);
    for (const entry of chunk) {
      searchDocuments.push({
        id: entry.id,
        bookTitle: entry.bookTitle,
        chapter: entry.chapter,
        section: entry.section,
        pageStart: entry.pageStart,
        preview: entry.textTraditional.slice(0, 180),
        topics: entry.topics,
        herbs: entry.herbs,
        formulas: entry.formulas,
        patterns: entry.patterns,
        extractionMethod: entry.extractionMethod,
        reviewStatus: entry.reviewStatus,
        sourceStatus: entry.sourceStatus,
        chunkPath: relativePath
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
    chunkPaths
  });
}

const generatedAt = new Date().toISOString();
const catalog: KnowledgeCatalog = { schemaVersion: 1, generatedAt, documents };
await writeFile(path.join(publicRoot, "catalog.json"), `${JSON.stringify(catalog)}\n`, "utf8");
await writeFile(path.join(indexRoot, "search-index.json"), `${JSON.stringify({ schemaVersion: 1, generatedAt, documents: searchDocuments })}\n`, "utf8");
console.log(`Production 知識索引：${documents.length} 本書、${searchDocuments.length} 條；全文按每 ${CHUNK_SIZE} 條拆分並延遲載入。`);
