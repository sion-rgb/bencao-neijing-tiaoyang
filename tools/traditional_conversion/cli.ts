import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeEntry } from "../../src/data/knowledge/types";
import { convertToHongKongTraditional, loadTcmGlossary } from "./converter";

const generatedDir = path.join(process.cwd(), "src", "data", "knowledge", "generated");
const glossary = await loadTcmGlossary();
const files = (await readdir(generatedDir, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

for (const file of files) {
  const filePath = path.join(generatedDir, file.name);
  const entries = JSON.parse(await readFile(filePath, "utf8")) as KnowledgeEntry[];
  const converted = entries.map((entry) => ({
    ...entry,
    textTraditional: convertToHongKongTraditional(entry.originalTextSimplified, glossary),
    conversionProfile: "opencc-s2hk" as const,
    conversionReviewed: false,
    sourceStatus: entry.extractionMethod === "ocr" ? "needs-review" as const : "converted" as const
  }));
  await writeFile(filePath, `${JSON.stringify(converted, null, 2)}\n`, "utf8");
  console.log(`已轉換 ${file.name}（${converted.length} 條）`);
}
