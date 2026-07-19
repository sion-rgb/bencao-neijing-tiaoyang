import { level1Flags, level2Flags } from "../data/safety/prohibited";
import { safetyQuestions } from "../data/safety/safetyQuestions";
import type { AnswerMap, SafetyAssessment } from "../types";

const reasonLabels: Record<string, string> = {
  emergency: "你選擇了目前出現緊急警號",
  minor: "使用者未滿18歲",
  pregnant: "目前懷孕",
  breastfeeding: "目前餵哺母乳",
  g6pd: "有G6PD缺乏症／蠶豆症",
  type1Diabetes: "一型糖尿病",
  type2Diabetes: "二型糖尿病",
  gestationalDiabetes: "妊娠糖尿病",
  glucoseMedicine: "正在使用胰島素或降血糖藥",
  liverDisease: "有肝臟疾病",
  kidneyDisease: "有腎臟疾病",
  heartDisease: "有心臟疾病",
  bleedingDisorder: "有出血性疾病",
  ulcerBleedingHistory: "有胃潰瘍或消化道出血史",
  epilepsy: "有癲癇",
  cancerTreatment: "正接受癌症治療",
  severeAllergy: "有嚴重敏感反應史",
  anticoagulant: "正在使用抗凝血藥或抗血小板藥",
  immunosuppressant: "正在使用免疫抑制劑",
  polypharmacy: "正在使用多種西藥",
  multipleTcm: "正在使用多種中藥",
  multipleSupplements: "正在使用多種保健品",
  upcomingSurgery: "兩星期內準備接受手術",
  olderAdult: "65歲或以上",
  safetyUncertain: "安全資料有不確定項目"
};

export function collectSafetyFlags(answers: AnswerMap): string[] {
  const flags = new Set<string>();
  for (const question of safetyQuestions) {
    const selected = answers[question.id] ?? [];
    if (selected.length === 0) flags.add("safetyUncertain");
    for (const optionId of selected) {
      const option = question.options.find((item) => item.id === optionId);
      option?.flags.forEach((flag) => flags.add(flag));
    }
  }
  return [...flags];
}

export function assessSafety(answers: AnswerMap): SafetyAssessment {
  const flags = collectSafetyFlags(answers);
  if (flags.includes("emergency")) {
    return { level: 0, reasons: [reasonLabels.emergency], flags, allowIngredients: false, conservativeOnly: true };
  }

  const hasLevel1 = flags.some((flag) => level1Flags.has(flag));
  if (hasLevel1) {
    return {
      level: 1,
      reasons: flags.filter((flag) => level1Flags.has(flag)).map((flag) => reasonLabels[flag]).filter(Boolean),
      flags,
      allowIngredients: false,
      conservativeOnly: true
    };
  }

  const hasLevel2 = flags.some((flag) => level2Flags.has(flag));
  if (hasLevel2) {
    return {
      level: 2,
      reasons: flags.filter((flag) => level2Flags.has(flag)).map((flag) => reasonLabels[flag]).filter(Boolean),
      flags,
      allowIngredients: false,
      conservativeOnly: true
    };
  }

  return { level: 3, reasons: ["安全篩查資料完整，未選擇已知限制條件"], flags, allowIngredients: true, conservativeOnly: false };
}
