import type { KnowledgeSearchDocument } from "../data/knowledge/types";
import type { PatternId } from "../types";

export type KnowledgeRetrievalInput = {
  primaryPattern: PatternId;
  secondaryPattern?: PatternId;
  selectedOptionIds: string[];
};

export type RetrievedKnowledge = KnowledgeSearchDocument & { relation: string; relevanceScore: number };

const termsByPattern: Record<PatternId, string[]> = {
  balanced: ["養生", "飲食", "起居", "陰陽"], qiDeficiency: ["氣虛", "少氣", "疲倦", "汗"], spleenQiDeficiency: ["脾氣", "食少", "腹脹", "便溏"],
  spleenYangDeficiency: ["脾陽", "寒", "泄", "溫中"], phlegmDampness: ["痰", "濕", "身重", "茯苓"], dampHeat: ["濕熱", "熱", "黏", "薏苡仁"],
  yinDeficiency: ["陰虛", "口乾", "盜汗", "燥"], yangDeficiency: ["陽虛", "寒", "厥", "夜尿"], qiStagnation: ["氣滯", "氣鬱", "脹", "嘆息"],
  bloodStasis: ["血瘀", "瘀血", "桃紅四物湯", "脈澀"], bloodDeficiency: ["血虛", "面白", "當歸", "大棗"], fluidDeficiency: ["津液", "口乾", "燥", "百合"]
};

const optionTermMap: Array<[RegExp, string[]]> = [
  [/fatigue|activity|voice/u, ["少氣", "疲倦"]], [/sweat/u, ["汗"]], [/appetite|bloating|stool|toilet/u, ["脾", "胃", "食", "便"]],
  [/cold|temperature/u, ["寒", "熱"]], [/dry|skin/u, ["燥", "津液"]], [/sleep/u, ["寐", "神"]], [/mood|sigh/u, ["氣", "鬱"]]
];

export function retrieveKnowledge(documents: KnowledgeSearchDocument[], input: KnowledgeRetrievalInput, limit = 6): RetrievedKnowledge[] {
  const terms = [...termsByPattern[input.primaryPattern], ...(input.secondaryPattern ? termsByPattern[input.secondaryPattern] : [])];
  for (const optionId of input.selectedOptionIds) for (const [pattern, mapped] of optionTermMap) if (pattern.test(optionId)) terms.push(...mapped);
  const uniqueTerms = [...new Set(terms)];
  const ranked = documents.map((document) => {
    const haystack = `${document.bookTitle}${document.volume ?? ""}${document.chapter ?? ""}${document.section ?? ""}${document.preview}${document.topics.join("")}${document.herbs.join("")}${document.formulas.join("")}${document.patterns.join("")}`;
    const matched = uniqueTerms.filter((term) => haystack.includes(term));
    const exactPattern = document.patterns.includes(input.primaryPattern) ? 10 : 0;
    const formulaBoost = document.formulas.length ? 2 : 0;
    const relevanceScore = matched.length * 3 + exactPattern + formulaBoost;
    const relation = matched.length
      ? `與你的「${input.primaryPattern}」結果相關：命中 ${matched.slice(0, 4).join("、")}；只作經典脈絡及辨別參考。`
      : `補充不同書籍的傳統醫學脈絡，協助避免只用單一篇章解釋結果。`;
    return { ...document, relevanceScore, relation };
  }).filter((item) => item.relevanceScore > 0).sort((a, b) => b.relevanceScore - a.relevanceScore || a.pageStart - b.pageStart);

  const selected: RetrievedKnowledge[] = [];
  for (const item of ranked) {
    if (!selected.some((chosen) => chosen.bookTitle === item.bookTitle)) selected.push(item);
    if (selected.length >= 2) break;
  }
  for (const item of ranked) {
    if (!selected.some((chosen) => chosen.id === item.id)) selected.push(item);
    if (selected.length >= limit) break;
  }
  return selected.slice(0, limit);
}
