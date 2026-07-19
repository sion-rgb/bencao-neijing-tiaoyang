import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formulas } from "../src/data/formulas/formulas";
import { constitutionQuestions } from "../src/data/questions/constitutionQuestions";
import { constitutionProfiles } from "../src/data/scoring/constitutionProfiles";
import type { KnowledgeCatalog, KnowledgeEntry, KnowledgeSearchDocument } from "../src/data/knowledge/types";
import { analyseConstitution } from "../src/engine/scoringEngine";
import { retrieveKnowledge } from "../src/engine/knowledgeRetrievalEngine";
import type { AnswerMap, PatternId } from "../src/types";

const root = process.cwd();
const catalog = JSON.parse(readFileSync(path.join(root, "public", "knowledge", "catalog.json"), "utf8")) as KnowledgeCatalog;
const indexPayload = JSON.parse(readFileSync(path.join(root, "public", catalog.searchIndexPath), "utf8")) as { documents: KnowledgeSearchDocument[] };

describe("v2 Production 知識庫", () => {
  it("恰有10本指定書且每本至少50條", () => {
    expect(catalog.schemaVersion).toBe(2);
    expect(catalog.documents).toHaveLength(10);
    expect(catalog.documents.every((document) => document.entryCount >= 50)).toBe(true);
    expect(new Set(catalog.documents.map((document) => document.bookTitle))).toEqual(new Set(["黃帝內經", "本草綱目", "神農本草經", "藥性賦", "溫熱論", "血證論", "醫學源流論", "醫學三字經", "奇經八脈考", "中醫內科方劑索引"]));
  });

  it("搜尋索引非空、10書均有版本化分塊", () => {
    expect(indexPayload.documents.length).toBeGreaterThan(500);
    for (const document of catalog.documents) {
      expect(document.chunkPaths.length).toBeGreaterThan(0);
      for (const chunkPath of document.chunkPaths) expect(existsSync(path.join(root, "public", chunkPath))).toBe(true);
      expect(document.chunkPaths.every((chunkPath) => /chunk-\d{4}\.[a-f0-9]{12}\.json$/u.test(chunkPath))).toBe(true);
    }
  });

  it("發布條目有頁碼、SHA-256、繁體及來源，沒有現代白話段落", () => {
    const firstChunk = catalog.documents.map((document) => JSON.parse(readFileSync(path.join(root, "public", document.chunkPaths[0]), "utf8")) as KnowledgeEntry[]).flat();
    for (const entry of firstChunk) {
      expect(entry.pageStart).toBeGreaterThan(0);
      expect(entry.sourceFileHash).toMatch(/^[a-f0-9]{64}$/u);
      expect(entry.textTraditional.length).toBeGreaterThan(10);
      expect(entry.reviewStatus).toBe("approved");
      expect(entry.textTraditional).not.toMatch(/白話譯文|現代啟示|不構成醫療建議|luckclub/u);
    }
  });
});

describe("正規化計分及知識檢索", () => {
  it("36個體質profile全部命中預期", () => {
    expect(constitutionProfiles).toHaveLength(36);
    for (const profile of constitutionProfiles) expect(analyseConstitution(profile.answers).primary, profile.id).toBe(profile.expected);
  });

  it("500份固定種子問卷不由氣虛壟斷", () => {
    let seed = 20260720; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const counts: Partial<Record<PatternId, number>> = {}; let resultCount = 0;
    for (let index = 0; index < 500; index += 1) {
      const answers: AnswerMap = Object.fromEntries(constitutionQuestions.map((question) => [question.id, [question.options[Math.floor(random() * question.options.length)].optionId]]));
      const result = analyseConstitution(answers); if (result.primary) { counts[result.primary] = (counts[result.primary] ?? 0) + 1; resultCount += 1; }
    }
    expect((counts.qiDeficiency ?? 0) / resultCount).toBeLessThan(0.35);
  });

  it("結果檢索至少3條及2本書，並解釋關係", () => {
    const retrieved = retrieveKnowledge(indexPayload.documents, { primaryPattern: "spleenQiDeficiency", selectedOptionIds: ["digestion_appetite_low", "digestion_bloating_often", "digestion_stool_loose", "energy_fatigue_often"] });
    expect(retrieved.length).toBeGreaterThanOrEqual(3);
    expect(new Set(retrieved.map((entry) => entry.bookTitle)).size).toBeGreaterThanOrEqual(2);
    expect(retrieved.every((entry) => entry.relation.length > 10)).toBe(true);
  });
});

describe("固定 Formula Library", () => {
  it("有24組、每證型至少2組、每組3至6味並有角色原因", () => {
    expect(formulas).toHaveLength(24);
    const patterns = ["balanced", "qiDeficiency", "spleenQiDeficiency", "spleenYangDeficiency", "phlegmDampness", "dampHeat", "yinDeficiency", "yangDeficiency", "qiStagnation", "bloodStasis", "bloodDeficiency", "fluidDeficiency"] as PatternId[];
    for (const pattern of patterns) expect(formulas.filter((formula) => formula.suitablePatterns.includes(pattern)).length).toBeGreaterThanOrEqual(2);
    for (const formula of formulas) {
      expect(formula.ingredients.length).toBeGreaterThanOrEqual(3); expect(formula.ingredients.length).toBeLessThanOrEqual(6);
      expect(formula.ingredients.every((item) => Boolean(item.role && item.reason))).toBe(true);
      expect(formula.sourceReferences.some((source) => source.knowledgeEntryId && source.pageStart)).toBe(true);
    }
  });

  it("高風險古方只讀且未完成用藥審核的配伍不宣稱可供服藥者使用", () => {
    expect(formulas.filter((formula) => formula.category === "traditional-formula-knowledge").every((formula) => formula.displayMode === "knowledge-only")).toBe(true);
    expect(formulas.every((formula) => !formula.medicationSafety.diabetesMedicationReviewed && !formula.medicationSafety.insulinUseReviewed)).toBe(true);
  });
});

describe("PWA v2 快取", () => {
  it("使用v2 app shell、索引、分塊快取及提示更新模式", () => {
    const vite = readFileSync(path.join(root, "vite.config.ts"), "utf8");
    expect(vite).toContain('registerType: "prompt"');
    expect(vite).toContain('cacheName: "app-shell-v2"');
    expect(vite).toContain('cacheName: "knowledge-indexes-v2"');
    expect(vite).toContain('cacheName: "knowledge-chunks-v2"');
  });
});
