import { level1Flags, level2Flags } from "../data/safety/prohibited";
import { getVisibleSafetyQuestions } from "../data/safety/safetyQuestions";
import { medicalConditionPolicies } from "../data/safety/medicalPolicies";
import type { AnswerMap, MedicalNoticeFlag, SafetyAssessment } from "../types";

const reasonLabels: Record<string, string> = {
  emergency: "你選擇了目前出現緊急警號",
  minor: "使用者未滿18歲",
  pregnant: "目前懷孕",
  breastfeeding: "目前餵哺母乳",
  g6pd: "有G6PD缺乏症／蠶豆症",
  type1Diabetes: "一型糖尿病",
  type2Diabetes: "二型糖尿病",
  gestationalDiabetes: "妊娠糖尿病",
  glucoseMedicine: "正在使用降血糖藥",
  insulinUse: "正在使用胰島素",
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
  for (const question of getVisibleSafetyQuestions(answers)) {
    const selected = answers[question.id] ?? [];
    if (selected.length === 0) flags.add("safetyUncertain");
    for (const optionId of selected) {
      const option = question.options.find((item) => item.id === optionId);
      option?.flags.forEach((flag) => flags.add(flag));
    }
  }
  return [...flags];
}

function collectMedicalNotices(flags: string[]): MedicalNoticeFlag[] {
  const notices = new Set<MedicalNoticeFlag>();
  if (flags.includes("type2Diabetes") && medicalConditionPolicies.type2Diabetes.showMedicalNotice) notices.add(medicalConditionPolicies.type2Diabetes.noticeFlag);
  if (flags.includes("glucoseMedicine")) notices.add("glucose-lowering-medication");
  if (flags.includes("insulinUse")) notices.add("insulin-use");
  if (flags.includes("hypoglycaemiaRisk") || flags.includes("glucoseMedicine") || flags.includes("insulinUse")) notices.add("hypoglycaemia-risk");
  return [...notices];
}

export function assessSafety(answers: AnswerMap): SafetyAssessment {
  const flags = collectSafetyFlags(answers);
  const medicalNotices = collectMedicalNotices(flags);
  if (flags.includes("emergency")) {
    return { level: 0, reasons: [reasonLabels.emergency], flags, medicalNotices, allowIngredients: false, allowApprovedFormulas: false, conservativeOnly: true };
  }

  const hasLevel1 = flags.some((flag) => level1Flags.has(flag));
  if (hasLevel1) {
    return {
      level: 1,
      reasons: flags.filter((flag) => level1Flags.has(flag)).map((flag) => reasonLabels[flag]).filter(Boolean),
      flags,
      medicalNotices,
      allowIngredients: false,
      allowApprovedFormulas: false,
      conservativeOnly: true
    };
  }

  const hasLevel2 = flags.some((flag) => level2Flags.has(flag));
  if (hasLevel2) {
    return {
      level: 2,
      reasons: flags.filter((flag) => level2Flags.has(flag)).map((flag) => reasonLabels[flag]).filter(Boolean),
      flags,
      medicalNotices,
      allowIngredients: false,
      allowApprovedFormulas: false,
      conservativeOnly: true
    };
  }

  const noticeReasons = flags
    .filter((flag) => flag === "type2Diabetes" || flag === "glucoseMedicine" || flag === "insulinUse")
    .map((flag) => reasonLabels[flag])
    .filter(Boolean);
  return {
    level: 3,
    reasons: noticeReasons.length ? noticeReasons : ["安全篩查資料完整，未選擇已知限制條件"],
    flags,
    medicalNotices,
    allowIngredients: !flags.includes("glucoseMedicine"),
    allowApprovedFormulas: true,
    conservativeOnly: false
  };
}
