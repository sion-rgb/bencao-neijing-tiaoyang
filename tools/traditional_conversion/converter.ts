import OpenCC from "opencc-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

type GlossaryEntry = { from: string; to: string; note?: string };

const opencc = OpenCC.Converter({ from: "cn", to: "hk" });

export async function loadTcmGlossary(rootDir = process.cwd()): Promise<GlossaryEntry[]> {
  const glossaryPath = path.join(rootDir, "knowledge_sources", "conversion-glossary", "tcm-s2hk.json");
  const parsed = JSON.parse(await readFile(glossaryPath, "utf8")) as { entries: GlossaryEntry[] };
  return parsed.entries;
}

export function convertToHongKongTraditional(text: string, glossary: GlossaryEntry[] = []): string {
  let converted = opencc(text.normalize("NFKC"));
  for (const entry of glossary) converted = converted.split(entry.from).join(entry.to);
  return converted;
}
