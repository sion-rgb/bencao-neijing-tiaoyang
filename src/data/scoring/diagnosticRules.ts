import type { PatternDiagnosticRule } from "../../types";

export const patternDiagnosticRules: PatternDiagnosticRule[] = [
  { patternId: "balanced", minimumCoreGroups: 3, minimumSupportCount: 8, minimumCategoryCount: 4, minimumNormalizedScore: 28, contradictionOptionIds: ["energy_fatigue_often", "energy_mood_often", "body_heavy_often", "body_temperature_cold", "body_temperature_hot", "digestion_appetite_low", "digestion_bloating_often", "digestion_stool_dry", "digestion_stool_loose", "digestion_stool_sticky", "head_heavy_often", "skin_bruise_lips_bruise", "skin_bruise_lips_dark", "skin_bruise_lips_pale", "body_dry_mouth_often", "body_dry_mouth_night"], coreEvidenceGroups: [
    { id: "stable", label: "體感穩定", minimumMatches: 2, optionIds: ["body_temperature_normal", "body_climate_neither", "body_heavy_rare", "body_dry_mouth_rare"] },
    { id: "energy", label: "精神與活動恢復良好", minimumMatches: 2, optionIds: ["energy_fatigue_rare", "energy_morning_good", "energy_after_exertion_rare", "sleep_restored_good"] },
    { id: "digestion", label: "食慾與排便大致協調", minimumMatches: 2, optionIds: ["digestion_appetite_good", "digestion_bloating_rare", "digestion_stool_normal", "digestion_cold_food_none"] },
    { id: "sleep", label: "睡眠相對穩定", minimumMatches: 2, optionIds: ["sleep_onset_good", "sleep_wake_rare", "sleep_dream_rare", "sleep_urination_none"] }
  ] },
  { patternId: "qiDeficiency", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 22, contradictionOptionIds: ["energy_fatigue_rare", "energy_after_exertion_rare", "energy_voice_rare"], coreEvidenceGroups: [
    { id: "fatigue", label: "疲倦及活動後加重", minimumMatches: 2, optionIds: ["energy_fatigue_often", "energy_after_exertion_often", "energy_activity_often"] },
    { id: "voice-sweat", label: "聲弱或動則汗出", minimumMatches: 2, optionIds: ["energy_voice_often", "sweat_easy_yes", "sweat_after_often"] },
    { id: "recovery", label: "休息後恢復不足", minimumMatches: 2, optionIds: ["energy_morning_low", "sleep_restored_low", "energy_afternoon_often"] }
  ] },
  { patternId: "spleenQiDeficiency", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["digestion_appetite_good", "digestion_stool_normal"], coreEvidenceGroups: [
    { id: "appetite-bloat", label: "食慾弱及飯後脹", minimumMatches: 2, optionIds: ["digestion_appetite_low", "digestion_bloating_often", "digestion_greasy_bloat"] },
    { id: "stool", label: "便稀黏或生冷後不適", minimumMatches: 1, optionIds: ["digestion_stool_loose", "digestion_stool_sticky", "digestion_cold_food_bloat"] },
    { id: "qi-damp", label: "氣虛兼沉重", minimumMatches: 2, optionIds: ["energy_fatigue_often", "sweat_easy_yes", "body_heavy_often"] }
  ] },
  { patternId: "spleenYangDeficiency", minimumCoreGroups: 2, minimumSupportCount: 4, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["body_temperature_hot", "body_climate_hot"], coreEvidenceGroups: [
    { id: "cold-digestion", label: "生冷後腹瀉腹痛", minimumMatches: 1, optionIds: ["digestion_cold_food_loose"] },
    { id: "cold", label: "怕冷或手足冷", minimumMatches: 2, optionIds: ["body_temperature_cold", "body_climate_cold", "body_drink_warm"] },
    { id: "loose-swelling", label: "便稀或浮腫", minimumMatches: 1, optionIds: ["digestion_stool_loose", "body_swelling_often"] }
  ] },
  { patternId: "phlegmDampness", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 21, contradictionOptionIds: ["body_heavy_rare", "head_heavy_rare", "digestion_toilet_rare"], coreEvidenceGroups: [
    { id: "heavy", label: "身體或頭部沉重", minimumMatches: 2, optionIds: ["body_heavy_often", "head_heavy_often", "energy_morning_slow"] },
    { id: "sticky", label: "黏滯表現", minimumMatches: 2, optionIds: ["digestion_stool_sticky", "digestion_toilet_often", "sweat_sticky_often"] },
    { id: "greasy", label: "油膩後加重", minimumMatches: 1, optionIds: ["digestion_greasy_heavy"] }
  ] },
  { patternId: "dampHeat", minimumCoreGroups: 2, minimumSupportCount: 4, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["body_climate_cold", "sweat_sticky_rare"], coreEvidenceGroups: [
    { id: "heat", label: "偏熱或心煩", minimumMatches: 1, optionIds: ["body_climate_hot", "energy_irritable_often"] },
    { id: "sticky", label: "汗便黏滯", minimumMatches: 2, optionIds: ["sweat_sticky_often", "digestion_stool_sticky", "digestion_toilet_often"] },
    { id: "greasy-heat", label: "油膩後口黏燥熱", minimumMatches: 1, optionIds: ["digestion_greasy_hot"] }
  ] },
  { patternId: "yinDeficiency", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 21, contradictionOptionIds: ["body_temperature_cold", "body_climate_cold"], coreEvidenceGroups: [
    { id: "night-heat", label: "夜間或手足心熱", minimumMatches: 2, optionIds: ["body_temperature_hot", "energy_irritable_often", "sweat_night_often"] },
    { id: "dry", label: "夜間口乾或津少", minimumMatches: 1, optionIds: ["body_dry_mouth_night", "tongue_coating_little"] },
    { id: "red", label: "偏紅偏熱", minimumMatches: 1, optionIds: ["tongue_color_red", "body_climate_hot"] }
  ] },
  { patternId: "yangDeficiency", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 21, contradictionOptionIds: ["body_temperature_hot", "body_climate_hot"], coreEvidenceGroups: [
    { id: "cold", label: "怕冷及手足冷", minimumMatches: 2, optionIds: ["body_temperature_cold", "body_climate_cold", "body_drink_warm"] },
    { id: "fluid", label: "夜尿或浮腫", minimumMatches: 1, optionIds: ["sleep_urination_two", "body_swelling_often"] },
    { id: "fatigue", label: "偏冷兼活動不足", minimumMatches: 2, optionIds: ["energy_after_exertion_often", "energy_activity_often", "sleep_restored_low"] }
  ] },
  { patternId: "qiStagnation", minimumCoreGroups: 2, minimumSupportCount: 4, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["energy_mood_rare", "energy_sigh_rare"], coreEvidenceGroups: [
    { id: "mood-sigh", label: "鬱悶及嘆氣", minimumMatches: 2, optionIds: ["energy_mood_often", "energy_sigh_often"] },
    { id: "distension", label: "脹滿並在排氣後稍舒", minimumMatches: 1, optionIds: ["digestion_belch_gas_often", "digestion_bloating_often"] },
    { id: "variable", label: "食慾或睡眠隨狀態變化", minimumMatches: 1, optionIds: ["digestion_appetite_variable", "sleep_onset_variable"] }
  ] },
  { patternId: "bloodStasis", minimumCoreGroups: 2, minimumSupportCount: 4, minimumCategoryCount: 2, minimumNormalizedScore: 19, contradictionOptionIds: ["skin_bruise_lips_none", "skin_face_normal"], coreEvidenceGroups: [
    { id: "dark", label: "面唇或舌色偏暗", minimumMatches: 1, optionIds: ["skin_bruise_lips_dark", "skin_face_dull", "tongue_color_dark"] },
    { id: "bruise", label: "容易瘀青", minimumMatches: 1, optionIds: ["skin_bruise_lips_bruise"] },
    { id: "numb", label: "麻木兼暗滯表現", minimumMatches: 1, optionIds: ["limbs_numb_cramp_numb", "limbs_numb_cramp_both"] }
  ] },
  { patternId: "bloodDeficiency", minimumCoreGroups: 2, minimumSupportCount: 5, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["skin_face_normal", "skin_bruise_lips_none"], coreEvidenceGroups: [
    { id: "pale", label: "面唇或舌色偏淡", minimumMatches: 1, optionIds: ["skin_face_pale", "skin_bruise_lips_pale", "tongue_color_pale"] },
    { id: "sleep", label: "多夢易醒", minimumMatches: 2, optionIds: ["sleep_wake_often", "sleep_dream_often"] },
    { id: "limbs-skin", label: "抽筋或皮膚乾", minimumMatches: 1, optionIds: ["limbs_numb_cramp_cramp", "limbs_numb_cramp_both", "skin_texture_dry"] }
  ] },
  { patternId: "fluidDeficiency", minimumCoreGroups: 2, minimumSupportCount: 4, minimumCategoryCount: 3, minimumNormalizedScore: 20, contradictionOptionIds: ["body_dry_mouth_rare", "skin_texture_normal", "digestion_stool_normal"], coreEvidenceGroups: [
    { id: "mouth", label: "經常口乾", minimumMatches: 1, optionIds: ["body_dry_mouth_often", "body_dry_mouth_night"] },
    { id: "dry-stool", label: "大便乾硬", minimumMatches: 1, optionIds: ["digestion_stool_dry", "digestion_difficult_dry"] },
    { id: "dry-surface", label: "皮膚乾或舌苔少", minimumMatches: 1, optionIds: ["skin_texture_dry", "tongue_coating_little"] }
  ] }
];

export const diagnosticRuleMap = Object.fromEntries(patternDiagnosticRules.map((rule) => [rule.patternId, rule]));
