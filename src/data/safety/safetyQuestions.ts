import type { SafetyQuestion } from "../../types";

const q = (id: string, prompt: string, options: SafetyQuestion["options"], multiple = false): SafetyQuestion => ({
  id,
  prompt,
  options,
  multiple,
  required: true,
  reviewStatus: "approved"
});

export const safetyQuestions: SafetyQuestion[] = [
  q("age", "你的年齡範圍是？", [
    { id: "age_under18", label: "17歲或以下", flags: ["minor"] },
    { id: "age_18_39", label: "18至39歲", flags: [] },
    { id: "age_40_64", label: "40至64歲", flags: [] },
    { id: "age_65_plus", label: "65歲或以上", flags: ["olderAdult"] }
  ]),
  q("sex", "你的生理性別是？", [
    { id: "sex_male", label: "男", flags: [] },
    { id: "sex_female", label: "女", flags: [] },
    { id: "sex_prefer_not", label: "不願回答", flags: [] }
  ]),
  q("pregnancy", "你目前是否懷孕？", [
    { id: "pregnancy_yes", label: "是", flags: ["pregnant"] },
    { id: "pregnancy_no", label: "否", flags: [] },
    { id: "pregnancy_na", label: "不適用", flags: [] },
    { id: "pregnancy_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("breastfeeding", "你目前是否餵哺母乳？", [
    { id: "breastfeeding_yes", label: "是", flags: ["breastfeeding"] },
    { id: "breastfeeding_no", label: "否", flags: [] },
    { id: "breastfeeding_na", label: "不適用", flags: [] }
  ]),
  q("g6pd", "你是否有G6PD缺乏症／蠶豆症？", [
    { id: "g6pd_yes", label: "是", flags: ["g6pd"] },
    { id: "g6pd_no", label: "否", flags: [] },
    { id: "g6pd_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("diabetes", "你的糖尿病情況是？", [
    { id: "diabetes_none", label: "沒有", flags: [] },
    { id: "diabetes_type1", label: "一型糖尿病", flags: ["type1Diabetes"] },
    { id: "diabetes_type2", label: "二型糖尿病", flags: ["type2Diabetes"] },
    { id: "diabetes_gestational", label: "妊娠糖尿病", flags: ["gestationalDiabetes"] },
    { id: "diabetes_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("glucose_medicine", "你是否使用胰島素或降血糖藥？", [
    { id: "glucose_medicine_yes", label: "是", flags: ["glucoseMedicine"] },
    { id: "glucose_medicine_no", label: "否", flags: [] },
    { id: "glucose_medicine_na", label: "不適用", flags: [] },
    { id: "glucose_medicine_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("conditions", "你是否有以下情況？可多選。", [
    { id: "condition_liver", label: "肝臟疾病", flags: ["liverDisease"] },
    { id: "condition_kidney", label: "腎臟疾病", flags: ["kidneyDisease"] },
    { id: "condition_heart", label: "心臟疾病", flags: ["heartDisease"] },
    { id: "condition_bleeding", label: "出血性疾病", flags: ["bleedingDisorder"] },
    { id: "condition_ulcer", label: "胃潰瘍或消化道出血史", flags: ["ulcerBleedingHistory"] },
    { id: "condition_epilepsy", label: "癲癇", flags: ["epilepsy"] },
    { id: "condition_cancer", label: "正接受癌症治療", flags: ["cancerTreatment"] },
    { id: "condition_allergy", label: "嚴重敏感反應史", flags: ["severeAllergy"] },
    { id: "condition_none", label: "以上皆無", flags: [] },
    { id: "condition_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ], true),
  q("medicines", "現時是否服用以下產品？可多選。", [
    { id: "medicine_anticoagulant", label: "抗凝血藥或抗血小板藥", flags: ["anticoagulant"] },
    { id: "medicine_glucose", label: "胰島素或降血糖藥", flags: ["glucoseMedicine"] },
    { id: "medicine_immunosuppressant", label: "免疫抑制劑", flags: ["immunosuppressant"] },
    { id: "medicine_many_western", label: "多種西藥", flags: ["polypharmacy"] },
    { id: "medicine_many_tcm", label: "多種中藥", flags: ["multipleTcm"] },
    { id: "medicine_many_supplements", label: "多種保健品", flags: ["multipleSupplements"] },
    { id: "medicine_none", label: "以上皆無", flags: [] },
    { id: "medicine_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ], true),
  q("surgery", "未來兩星期是否準備接受手術？", [
    { id: "surgery_yes", label: "是", flags: ["upcomingSurgery"] },
    { id: "surgery_no", label: "否", flags: [] },
    { id: "surgery_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("allergy", "是否曾對中藥、食物或保健品有嚴重敏感？", [
    { id: "allergy_yes", label: "是", flags: ["severeAllergy"] },
    { id: "allergy_no", label: "否", flags: [] },
    { id: "allergy_unsure", label: "不確定", flags: ["safetyUncertain"] }
  ]),
  q("emergency", "你現在是否有以下緊急警號？可多選。", [
    { id: "emergency_chest_pain", label: "胸口劇痛或明顯壓迫感", flags: ["emergency"] },
    { id: "emergency_breathing", label: "呼吸困難", flags: ["emergency"] },
    { id: "emergency_faint", label: "突然昏厥", flags: ["emergency"] },
    { id: "emergency_confusion", label: "意識混亂", flags: ["emergency"] },
    { id: "emergency_weakness", label: "突然單側手腳無力", flags: ["emergency"] },
    { id: "emergency_bleeding", label: "大量出血", flags: ["emergency"] },
    { id: "emergency_vomit_blood", label: "嘔血", flags: ["emergency"] },
    { id: "emergency_black_stool", label: "黑色柏油狀大便", flags: ["emergency"] },
    { id: "emergency_abdominal", label: "持續嚴重腹痛", flags: ["emergency"] },
    { id: "emergency_vomiting", label: "不斷嘔吐，無法飲水", flags: ["emergency"] },
    { id: "emergency_diabetic", label: "糖尿病同時出現嚴重口渴、頻尿、嘔吐、腹痛、異常疲倦或呼吸異常", flags: ["emergency"] },
    { id: "emergency_none", label: "以上皆無", flags: [] }
  ], true)
];

export const emergencyOptionIds = new Set(safetyQuestions.find((item) => item.id === "emergency")?.options.filter((item) => item.flags.includes("emergency")).map((item) => item.id));
