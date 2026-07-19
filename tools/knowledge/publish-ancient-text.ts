import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeEntry, KnowledgePublicationManifest } from "../../src/data/knowledge/types";
import { convertToHongKongTraditional, loadTcmGlossary } from "../traditional_conversion/converter";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "src", "data", "knowledge", "generated");
const PUBLISHED_DIR = path.join(ROOT, "src", "data", "knowledge", "published");
const METADATA_DIR = path.join(ROOT, "src", "data", "knowledge", "metadata");
const REPORT_DIR = path.join(ROOT, "reports");
const TOOL_VERSION = "2.0.0";
const PUBLICATION_DATE = "2026-07-20T00:00:00.000Z";

type RawEntry = KnowledgeEntry;
type SourceLine = { text: string; page: number; pageEnd?: number; order: number; chapter: string; volume?: string; section?: string };

const bookMeta: Record<string, { title: string; author?: string; rule: string }> = {
  "huangdi-neijing": { title: "黃帝內經", rule: "排除導言及白話；按《素問》《靈樞》篇名分段。" },
  "bencao-gangmu": { title: "本草綱目", author: "李時珍", rule: "排除簡介、白話及現代啟示；按部類、藥名及釋名／氣味／主治等欄目分段。" },
  "shennong-bencao-jing": { title: "神農本草經", rule: "排除版本簡介及白話；按上、中、下品及藥名分段。" },
  "yaoxing-fu": { title: "藥性賦", rule: "排除導言、白話及現代啟示；保留賦文完整句段。" },
  "wenre-lun": { title: "溫熱論", author: "葉桂", rule: "排除重編者導言、白話及現代啟示；按原文章節分段。" },
  "xuezheng-lun": { title: "血證論", author: "唐宗海", rule: "排除導言、白話及現代啟示；按卷、論及原文段落分段。" },
  "yixue-yuanliu-lun": { title: "醫學源流論", author: "徐大椿", rule: "排除導言、白話及現代啟示；按論題及原文段落分段。" },
  "yixue-sanzijing": { title: "醫學三字經", author: "陳修園", rule: "排除導言、白話及現代啟示；按篇章及歌訣完整句段分段。" },
  "qijing-bamai-kao": { title: "奇經八脈考", author: "李時珍", rule: "排除導言、白話及現代啟示；按八脈篇章及原文段落分段。" },
  "zhongyi-neike-fangji-suoyin": { title: "中醫內科方劑索引", rule: "只發布可追溯至古籍的方名、古籍書名及固定組成；排除現代方、編者說明、白話及索引編排文字。" }
};

const herbVocabulary = [
  "人參", "黨參", "黃芪", "白朮", "茯苓", "甘草", "炙甘草", "陳皮", "半夏", "山藥", "蓮子", "芡實", "薏苡仁", "生薑", "乾薑", "大棗", "粳米", "小米", "百合", "麥冬", "天冬", "沙參", "玉竹", "枸杞子", "生地黃", "熟地黃", "當歸", "白芍", "川芎", "丹參", "桃仁", "紅花", "牡丹皮", "桂枝", "肉桂", "附子", "麻黃", "杏仁", "薄荷", "牛蒡子", "桑葉", "菊花", "金銀花", "連翹", "黃芩", "黃連", "黃柏", "梔子", "知母", "石膏", "大黃", "芒硝", "澤瀉", "豬苓", "車前子", "木通", "滑石", "藿香", "佩蘭", "蒼朮", "厚朴", "砂仁", "木香", "香附", "枳實", "枳殼", "桔梗", "川貝母", "浙貝母", "瓜蔞", "竹茹", "酸棗仁", "柏子仁", "遠志", "龍眼肉", "阿膠", "杜仲", "牛膝", "續斷", "桑寄生", "地骨皮", "玄參", "牡蠣", "龍骨", "五味子", "烏梅", "葛根", "柴胡", "升麻", "防風", "羌活", "獨活", "細辛", "艾葉", "蒲公英", "赤小豆", "冬瓜", "白扁豆", "黑豆", "芝麻", "蜂蜜"
];

const formulaModernSource = /藥典|药典|現代|现代|臨床|临床|衛生部|卫生部|標準|标准|規範|规范|中醫|中医|中藥|中药|成方選|成方选|成藥|成药|藥物大全|药物大全|製藥|制药|醫院|医院|學院|学院|學報|学报|雜誌|杂志|經驗|经验|醫案|医案|診斷|诊断|治療|治疗|大辭典|大辞典|方劑學|方剂学|中華人民共和國|中华人民共和国|199\d|20\d{2}/u;
const boilerplate = /luckclub|古籍典藏|內容僅供|内容仅供|第\s*\d+\s*頁\s*\/|^《》$|^---$|^關鍵詞$|^关键词$|^現代啟示$|^现代启示$|^思考/u;
const modernLeak = /循證醫學|循证医学|現代醫學|现代医学|現代藥理|现代药理|營養學|营养学|本章收錄|本章收录|僅供文化|仅供文化|不構成醫療|不构成医疗|Evidence-Based|互聯網|互联网/u;

const normalize = (value: string) => value.normalize("NFKC").replace(/\*\*/gu, "").replace(/[\t ]+/gu, " ").trim();
const compact = (value: string) => normalize(value).replace(/\s+/gu, "");
const chapterMarker = (value: string) => /^第[0-9一二三四五六七八九十百〇零]+章$/u.test(compact(value));
const isOriginalMarker = (value: string) => compact(value) === "原文";
const isModernMarker = (value: string) => compact(value) === "白話譯文" || compact(value) === "白话译文";
const isUseful = (value: string) => value.length >= 4 && !boilerplate.test(compact(value)) && !modernLeak.test(value) && !/\?{2,}|�/u.test(value);

function detectTags(text: string) {
  const herbs = herbVocabulary.filter((term) => text.includes(term));
  const topics = ["陰陽", "五行", "氣血", "津液", "臟腑", "經絡", "養生", "方劑", "本草", "寒熱", "虛實", "消渴"].filter((term) => text.includes(term));
  const patterns = ["氣虛", "脾氣虛", "脾陽", "痰濕", "濕熱", "陰虛", "陽虛", "氣滯", "血瘀", "血虛", "津液不足"].filter((term) => text.includes(term));
  const organs = ["心", "肝", "脾", "肺", "腎", "胃", "膽", "小腸", "大腸", "膀胱", "三焦"].filter((term) => text.includes(term));
  const qiBloodFluids = ["氣", "血", "津", "液", "精"].filter((term) => text.includes(term));
  const coldHeat = ["寒", "熱", "溫", "涼"].filter((term) => text.includes(term));
  const deficiencyExcess = ["虛", "實"].filter((term) => text.includes(term));
  return { herbs, topics, patterns, organs, qiBloodFluids, coldHeat, deficiencyExcess };
}

function chapterNumber(value: string): number {
  const digits = compact(value).match(/\d+/u)?.[0];
  if (digits) return Number(digits);
  const chars = compact(value).replace(/^第|章$/gu, "");
  const units: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (chars === "十") return 10;
  if (chars.startsWith("十")) return 10 + (units[chars[1]] ?? 0);
  if (chars.includes("十")) return (units[chars[0]] ?? 0) * 10 + (units[chars[2]] ?? 0);
  return units[chars] ?? 0;
}

function extractOriginalLines(entries: RawEntry[], documentId: string): SourceLine[] {
  const lines: SourceLine[] = [];
  let mode: "excluded" | "original" | "modern" = "excluded";
  let currentChapterNumber = 0;
  let pendingChapterTitle = "";
  let currentChapter = "";
  let currentVolume: string | undefined;
  for (const entry of [...entries].sort((a, b) => a.pageStart - b.pageStart || a.paragraphOrder - b.paragraphOrder)) {
    const text = normalize(entry.originalTextSimplified);
    if (!text) continue;
    if (chapterMarker(text)) {
      currentChapterNumber = chapterNumber(text);
      pendingChapterTitle = "";
      currentChapter = compact(text);
      mode = "excluded";
      continue;
    }
    if (isOriginalMarker(text)) {
      mode = currentChapterNumber > 1 ? "original" : "excluded";
      if (pendingChapterTitle) currentChapter = pendingChapterTitle;
      continue;
    }
    if (isModernMarker(text)) { mode = "modern"; continue; }
    if (mode === "excluded" && currentChapterNumber > 0 && !pendingChapterTitle && isUseful(text)) {
      pendingChapterTitle = compact(text).slice(0, 80);
      continue;
    }
    if (mode !== "original" || !isUseful(text)) continue;
    if (compact(text) === compact(currentChapter)) continue;
    if (/素問|素问/u.test(text) && text.length < 30) currentVolume = "素問";
    if (/靈樞|灵枢/u.test(text) && text.length < 30) currentVolume = "靈樞";
    lines.push({ text, page: entry.pageStart, order: entry.paragraphOrder, chapter: currentChapter || `第${currentChapterNumber}章`, volume: currentVolume });
  }

  // The index is a modern compilation. Retain only factual ancient formula records
  // that explicitly name a classical source, excluding modern books and standards.
  if (documentId === "zhongyi-neike-fangji-suoyin") {
    return lines.filter((line) => /[（(]《[^》]+》[）)]/u.test(line.text) && !formulaModernSource.test(line.text));
  }
  return lines;
}

function semanticLines(lines: SourceLine[], documentId: string): SourceLine[] {
  let section: string | undefined;
  let chapter = "";
  return lines.flatMap((line, index) => {
    const text = line.text;
    if (documentId === "huangdi-neijing") {
      const heading = text.match(/^(.{2,28}(?:篇第[一二三四五六七八九十百〇零\d]+|第[一二三四五六七八九十百〇零\d]+篇))$/u)?.[1];
      if (heading) { chapter = heading; return []; }
    }
    if (["bencao-gangmu", "shennong-bencao-jing"].includes(documentId)) {
      const next = lines[index + 1]?.text ?? "";
      if (/^[\p{Script=Han}·]{1,12}$/u.test(compact(text)) && /[「『](?:釋名|释名|氣味|气味|主治|集解|發明|发明)|味[甘苦辛酸鹹咸]/u.test(next)) {
        section = compact(text);
        return [];
      }
    }
    if (documentId === "bencao-gangmu") {
      // This PDF's numbered 主治 prose is a modern abridgement rather than a
      // facsimile transcription. Publish only short nomenclature/property facts.
      if (!/[「『](?:釋名|释名|氣味|气味)[」』]/u.test(text)) return [];
      const ancientFact = text.split(/[「『]主治[」』]/u)[0].trim();
      return ancientFact.length >= 8 ? [{ ...line, text: ancientFact, section }] : [];
    }
    const labelled = text.match(/^[「『](釋名|释名|集解|氣味|气味|主治|發明|发明|附方)[」』]/u)?.[1];
    if (labelled) section = `${section ? `${section}・` : ""}${labelled}`;
    return [{ ...line, chapter: chapter || line.chapter, section }];
  });
}

function buildChunks(lines: SourceLine[], documentId: string): SourceLine[] {
  if (documentId === "zhongyi-neike-fangji-suoyin") return lines;
  const isShortTreatise = ["yaoxing-fu", "wenre-lun", "qijing-bamai-kao"].includes(documentId);
  const minimum = isShortTreatise ? 18 : 70;
  const maximum = documentId === "wenre-lun" ? 90 : isShortTreatise ? 130 : 320;
  const chunks: SourceLine[] = [];
  let current: SourceLine | undefined;
  const flush = () => { if (current && compact(current.text).length >= 18) chunks.push(current); current = undefined; };
  for (const line of lines) {
    const boundary = current && (current.chapter !== line.chapter || current.section !== line.section || (current.pageEnd ?? current.page) + 1 < line.page);
    if (boundary) flush();
    if (!current) current = { ...line };
    else if (current.text.length + line.text.length + 1 <= maximum) {
      current.text += current.text.endsWith("。") ? line.text : ` ${line.text}`;
      current.pageEnd = line.page;
      current.order = line.order;
    } else { flush(); current = { ...line }; }
    if (current && current.text.length >= minimum && /[。！？；：]$/u.test(current.text)) flush();
  }
  flush();
  return chunks;
}

function makeEntry(documentId: string, source: RawEntry, line: SourceLine, index: number, traditional: string): KnowledgeEntry {
  const meta = bookMeta[documentId];
  const tags = detectTags(traditional);
  const formulaMatch = documentId === "zhongyi-neike-fangji-suoyin" ? traditional.match(/^([^（(]{1,30})[（(]《([^》]+)》[）)]/u) : undefined;
  const formula = formulaMatch?.[1].trim();
  const chapter = formulaMatch ? `古方索引・《${formulaMatch[2]}》` : convertToHongKongTraditional(line.chapter, glossary);
  const section = line.section ? convertToHongKongTraditional(line.section, glossary) : formula;
  return {
    id: `${documentId}-published-${String(index + 1).padStart(5, "0")}`,
    sourceDocumentId: documentId,
    bookTitle: meta.title,
    author: meta.author,
    volume: line.volume,
    chapter,
    section,
    pageStart: line.page,
    pageEnd: line.pageEnd ?? line.page,
    paragraphOrder: line.order,
    originalTextSimplified: line.text,
    textTraditional: traditional,
    extractionMethod: "text-layer",
    extractionConfidence: 1,
    conversionProfile: "opencc-s2hk",
    conversionReviewed: true,
    topics: tags.topics,
    herbs: tags.herbs,
    formulas: formula ? [formula] : [],
    patterns: tags.patterns,
    organs: tags.organs,
    qiBloodFluids: tags.qiBloodFluids,
    coldHeat: tags.coldHeat,
    deficiencyExcess: tags.deficiencyExcess,
    sourceFileName: source.sourceFileName,
    sourceFileHash: source.sourceFileHash,
    rightsStatus: "public-domain",
    publishable: true,
    sourceStatus: "verified",
    reviewStatus: "approved",
    importedAt: PUBLICATION_DATE,
    toolVersion: TOOL_VERSION,
    publicationRule: meta.rule
  };
}

await mkdir(PUBLISHED_DIR, { recursive: true });
await mkdir(METADATA_DIR, { recursive: true });
await mkdir(REPORT_DIR, { recursive: true });
for (const target of [PUBLISHED_DIR, METADATA_DIR]) {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(ROOT))) throw new Error("拒絕清除工作區外的知識資料夾。");
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
}

const glossary = await loadTcmGlossary(ROOT);
const ingestReport = JSON.parse(await readFile(path.join(ROOT, "knowledge_sources", "manifests", "ingest-report.json"), "utf8")) as Array<{ documentId: string; pageCount: number; textLayerPages: number; sourceFileHash: string; sourceFileName: string }>;
const rawFiles = (await readdir(RAW_DIR)).filter((file) => file.endsWith(".json"));
const manifests: KnowledgePublicationManifest[] = [];

for (const [documentId, meta] of Object.entries(bookMeta)) {
  const file = `${documentId}.json`;
  if (!rawFiles.includes(file)) throw new Error(`缺少本機抽取資料：${file}`);
  const raw = JSON.parse(await readFile(path.join(RAW_DIR, file), "utf8")) as RawEntry[];
  const source = raw[0];
  if (!source) throw new Error(`${file} 沒有內容`);
  const lines = buildChunks(semanticLines(extractOriginalLines(raw, documentId), documentId), documentId);
  // Assign IDs before rejecting damaged glyphs so stable source references do not
  // shift when a source PDF contains an unreadable character on another entry.
  const entries = lines
    .map((line, index) => makeEntry(documentId, source, line, index, convertToHongKongTraditional(line.text, glossary)))
    .filter((entry) => !/[?●�]/u.test(`${entry.textTraditional}${entry.chapter ?? ""}${entry.section ?? ""}`));
  if (entries.length < 50) throw new Error(`${meta.title} 只有 ${entries.length} 條有意義的古籍條目，未達 50 條發布閘門。`);
  const ingest = ingestReport.find((item) => item.documentId === documentId);
  if (!ingest) throw new Error(`${meta.title} 缺少 ingest report`);
  const publishablePages = new Set(entries.flatMap((entry) => Array.from({ length: entry.pageEnd - entry.pageStart + 1 }, (_, offset) => entry.pageStart + offset)));
  const allPages = Array.from({ length: ingest.pageCount }, (_, index) => index + 1);
  const manifest: KnowledgePublicationManifest = {
    documentId,
    sourceFileName: ingest.sourceFileName,
    bookTitle: meta.title,
    author: meta.author,
    rightsStatus: "public-domain",
    publishable: true,
    sourceFileHash: ingest.sourceFileHash,
    pageCount: ingest.pageCount,
    textLayerPages: ingest.textLayerPages,
    processedPages: ingest.pageCount,
    publishableAncientTextPages: publishablePages.size,
    excludedPages: allPages.filter((page) => !publishablePages.has(page)).map((page) => ({ page, reasons: [page <= 2 ? "封面／目錄／出版版面" : "沒有可明確分離的古籍原文，或屬白話／現代編輯內容"] })),
    productionEntryCount: entries.length,
    sectionCount: new Set(entries.map((entry) => `${entry.volume ?? ""}|${entry.chapter ?? ""}|${entry.section ?? ""}`)).size,
    herbCount: new Set(entries.flatMap((entry) => entry.herbs)).size,
    formulaCount: new Set(entries.flatMap((entry) => entry.formulas)).size,
    publicationRule: meta.rule,
    importedAt: PUBLICATION_DATE,
    toolVersion: TOOL_VERSION,
    reviewStatus: "approved",
    rightsAssessment: {
      scanRedistributionAllowed: false,
      ancientTextPublicationAllowed: true,
      containsModernCommentary: true,
      modernCommentaryPublicationAllowed: false,
      decisionReason: "PDF 掃描／排版不公開；只發布已明確分離、可追溯頁碼的公有領域古籍文字或古方事實資料，白話、註釋、導言及現代啟示全部排除。"
    }
  };
  await writeFile(path.join(PUBLISHED_DIR, file), `${JSON.stringify(entries)}\n`, "utf8");
  await writeFile(path.join(METADATA_DIR, file), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  manifests.push(manifest);
  console.log(`${meta.title}: ${entries.length} 條，古籍原文涵蓋 ${publishablePages.size}/${ingest.pageCount} PDF 頁。`);
}

const report = {
  schemaVersion: 2,
  generatedAt: PUBLICATION_DATE,
  policy: "Ancient text only. PDF scans, modern introductions, vernacular translations, annotations, modern explanations and marketing copy are excluded.",
  totals: {
    sourceDocuments: manifests.length,
    sourcePages: manifests.reduce((sum, item) => sum + item.pageCount, 0),
    processedPages: manifests.reduce((sum, item) => sum + item.processedPages, 0),
    productionEntries: manifests.reduce((sum, item) => sum + item.productionEntryCount, 0),
    publishableAncientTextPages: manifests.reduce((sum, item) => sum + item.publishableAncientTextPages, 0)
  },
  books: manifests
};
await writeFile(path.join(REPORT_DIR, "knowledge-import-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
const rows = manifests.map((item) => `| ${item.bookTitle} | ${item.pageCount} | ${item.processedPages} | ${item.publishableAncientTextPages} | ${item.productionEntryCount} | ${item.sectionCount} | ${item.herbCount} | ${item.formulaCount} |`).join("\n");
await writeFile(path.join(REPORT_DIR, "knowledge-import-report.md"), `# 古籍公開層匯入報告\n\n只公開可明確分離的公有領域古籍文字；PDF 掃描、現代導言、白話譯文、註釋、現代啟示與行銷內容均不公開。\n\n| 書名 | PDF頁 | 已處理頁 | 有古籍原文頁 | Production條目 | 篇章／欄目 | 藥材標籤 | 方劑 |\n|---|---:|---:|---:|---:|---:|---:|---:|\n${rows}\n\n- 來源總頁數：${report.totals.sourcePages}\n- 已處理頁數：${report.totals.processedPages}\n- Production 條目：${report.totals.productionEntries}\n- 逐頁排除理由及 SHA-256 見 JSON 報告及各書 metadata manifest。\n`, "utf8");
console.log(`古籍公開層完成：${report.totals.productionEntries} 條，${report.totals.processedPages}/${report.totals.sourcePages} 頁已判定。`);
