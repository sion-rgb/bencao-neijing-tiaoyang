import type { PatternId } from "../../types";

export type LifestyleRecommendation = {
  id: string;
  patterns: PatternId[];
  title: string;
  principle: string;
  method: string;
  timing: string;
  maxDuration: string;
  unsuitableFor: string;
  stopWhen: string;
  professionalReview: string;
  reviewStatus: "approved";
};

export const lifestyleRecommendations: LifestyleRecommendation[] = [
  {
    id: "steady-routine",
    patterns: ["balanced", "qiDeficiency", "spleenQiDeficiency", "spleenYangDeficiency", "phlegmDampness", "yangDeficiency", "bloodDeficiency"],
    title: "先固定睡眠與用餐節奏",
    principle: "傳統中醫養生重視起居有常、食飲有節。",
    method: "先選一個最容易維持的睡眠或用餐時間，每日盡量相差不超過一小時。",
    timing: "先實行一星期，再觀察精神、食慾與睡眠變化。",
    maxDuration: "可作一般生活習慣持續維持。",
    unsuitableFor: "輪班、照顧者或有特殊治療安排者應按實際需要調整。",
    stopWhen: "若因強行調整而明顯失眠、暈眩或不適加重，停止並尋求評估。",
    professionalReview: "持續疲倦、體重明顯變化或症狀加重時需由合資格醫護人員評估。",
    reviewStatus: "approved"
  },
  {
    id: "gentle-movement",
    patterns: ["phlegmDampness", "dampHeat", "qiStagnation", "bloodStasis"],
    title: "把輕度活動分散到每天",
    principle: "以溫和、持續的活動配合氣機與日常節奏，不追求一次過過度消耗。",
    method: "可考慮每次步行或伸展約十數分鐘，量力而為，先觀察反應。",
    timing: "飯後稍休息或日間精神較穩定時。",
    maxDuration: "可逐步成為日常習慣，但強度應按身體情況調整。",
    unsuitableFor: "胸痛、呼吸困難、暈厥、急性受傷或醫護人員已限制活動者。",
    stopWhen: "胸痛、呼吸困難、暈眩、心悸明顯或不適持續時立即停止。",
    professionalReview: "有心臟病、近期手術或活動後症狀者先向醫護人員查詢。",
    reviewStatus: "approved"
  },
  {
    id: "quiet-wind-down",
    patterns: ["yinDeficiency", "fluidDeficiency", "qiStagnation", "bloodDeficiency"],
    title: "建立安靜的睡前緩衝時間",
    principle: "傳統養生重視精神內守與勞逸調節。",
    method: "睡前減少強光與刺激資訊，可考慮安靜呼吸、伸展或閱讀。",
    timing: "睡前約半小時開始。",
    maxDuration: "可作一般生活習慣持續維持。",
    unsuitableFor: "沒有特定禁忌；需照顧他人者按實際情況調整。",
    stopWhen: "若安靜練習引起焦慮、呼吸不適或頭暈，停止並改用其他放鬆方式。",
    professionalReview: "失眠持續、情緒困擾影響生活或出現自傷念頭時，應盡快求助。",
    reviewStatus: "approved"
  }
];
