import type { ClassicEntry } from "../../types";
import importedEntries from "./imported.json";

const curatedClassics: ClassicEntry[] = [
  {
    id: "neijing-routine",
    book: "黃帝內經",
    section: "素問第一卷",
    chapter: "上古天真論篇第一",
    originalText: "食飲有節，起居有常，不妄作勞。",
    modernSummary: "傳統養生重視飲食有節、作息有常，以及勞逸適度。這是一般文化教育方向，不是個人治療建議。",
    tags: ["作息", "飲食", "勞逸"],
    sourceStatus: "verified",
    sourceUrl: "https://zh.wikisource.org/zh/%E9%BB%83%E5%B8%9D%E5%85%A7%E7%B6%93/%E7%B4%A0%E5%95%8F%E7%AC%AC%E4%B8%80%E5%8D%B7",
    reviewStatus: "approved"
  },
  {
    id: "neijing-spirit",
    book: "黃帝內經",
    section: "素問第一卷",
    chapter: "上古天真論篇第一",
    originalText: "恬淡虛無，真氣從之；精神內守。",
    modernSummary: "原文反映古代養生對情志安定與內在調攝的重視；不應解讀為只靠心境便可處理疾病。",
    tags: ["情志", "精神", "養生"],
    sourceStatus: "verified",
    sourceUrl: "https://zh.wikisource.org/zh/%E9%BB%83%E5%B8%9D%E5%85%A7%E7%B6%93/%E7%B4%A0%E5%95%8F%E7%AC%AC%E4%B8%80%E5%8D%B7",
    reviewStatus: "approved"
  },
  {
    id: "gangmu-coix",
    book: "本草綱目",
    section: "穀之二",
    chapter: "薏苡仁",
    originalText: "氣味甘，微寒，無毒。",
    modernSummary: "《本草綱目》記載薏苡仁的傳統氣味屬性。古籍記載不等於人人適合，也不取代現代安全評估。",
    tags: ["薏苡仁", "食材", "氣味"],
    sourceStatus: "verified",
    sourceUrl: "https://zh.wikisource.org/zh-hant/%E6%9C%AC%E8%8D%89%E7%B6%B1%E7%9B%AE/%E7%A9%80%E4%B9%8B%E4%BA%8C",
    reviewStatus: "approved"
  }
];

export const classics: ClassicEntry[] = [...curatedClassics, ...(importedEntries as ClassicEntry[])];
