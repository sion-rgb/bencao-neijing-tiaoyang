import type { ConstitutionQuestion, PatternWeights, QuestionCategory, QuestionOption } from "../../types";

const option = (optionId: string, label: string, patternWeights: PatternWeights = {}, explanationTags: string[] = []): QuestionOption => ({
  optionId,
  label,
  patternWeights,
  safetyFlags: [],
  explanationTags
});

const question = (
  id: string,
  category: QuestionCategory,
  prompt: string,
  options: QuestionOption[],
  required = true,
  helpText?: string,
  multiple = false
): ConstitutionQuestion => ({ id, category, prompt, options, required, helpText, multiple, reviewStatus: "approved" });

export const constitutionQuestions: ConstitutionQuestion[] = [
  question("body_weight", "body", "你的體型在近年較接近哪一種？", [
    option("body_weight_stable", "大致穩定或中等", { balanced: 1 }, ["體型大致穩定"]),
    option("body_weight_easy_gain", "較容易增加體重", { phlegmDampness: 0.5 }, ["較容易增加體重"]),
    option("body_weight_thin", "較瘦或不易增加體重", { qiDeficiency: 0.5, yinDeficiency: 0.5 }, ["較瘦或不易增重"]),
    option("body_weight_unsure", "不確定")
  ], false, "體型不會單獨決定任何體質傾向。"),
  question("body_distribution", "body", "如較易增加體重，通常較明顯在哪裡？", [
    option("body_distribution_middle", "腰腹較明顯", { phlegmDampness: 0.5 }, ["腰腹較易增加體重"]),
    option("body_distribution_general", "全身較平均", { phlegmDampness: 0.25 }),
    option("body_distribution_na", "不適用或不確定")
  ], false),
  question("body_heavy", "body", "你是否常感到身體沉重、動起來不俐落？", [
    option("body_heavy_often", "經常", { phlegmDampness: 2, dampHeat: 1 }, ["身體容易沉重"]),
    option("body_heavy_sometimes", "有時", { phlegmDampness: 1 }, ["有時身體沉重"]),
    option("body_heavy_rare", "很少", { balanced: 0.5 })
  ]),
  question("body_swelling", "body", "你是否容易出現眼瞼、手腳或小腿浮腫？", [
    option("body_swelling_often", "經常", { yangDeficiency: 1.5, spleenYangDeficiency: 1.5, phlegmDampness: 1 }, ["容易浮腫"]),
    option("body_swelling_sometimes", "偶爾", { phlegmDampness: 0.75 }, ["偶爾浮腫"]),
    option("body_swelling_rare", "很少")
  ]),
  question("body_temperature", "body", "平日手腳的冷暖感覺如何？", [
    option("body_temperature_cold", "手腳常偏冷", { yangDeficiency: 2, spleenYangDeficiency: 1, bloodDeficiency: 0.5 }, ["手腳偏冷"]),
    option("body_temperature_hot", "手心腳心常偏熱", { yinDeficiency: 2 }, ["手足心偏熱"]),
    option("body_temperature_normal", "大致正常", { balanced: 1 })
  ]),
  question("body_climate", "body", "你通常較怕冷還是怕熱？", [
    option("body_climate_cold", "較怕冷", { yangDeficiency: 2, spleenYangDeficiency: 1 }, ["較怕冷"]),
    option("body_climate_hot", "較怕熱", { yinDeficiency: 1.5, dampHeat: 1 }, ["較怕熱"]),
    option("body_climate_both", "兩者都明顯", { qiDeficiency: 0.5 }, ["冷熱適應較不穩定"]),
    option("body_climate_neither", "都不明顯", { balanced: 1 })
  ]),
  question("body_dry_mouth", "body", "你是否容易口乾？", [
    option("body_dry_mouth_often", "經常", { fluidDeficiency: 2, yinDeficiency: 1 }, ["容易口乾"]),
    option("body_dry_mouth_night", "主要在夜間", { yinDeficiency: 2, fluidDeficiency: 1 }, ["夜間口乾"]),
    option("body_dry_mouth_rare", "很少", { balanced: 0.5 })
  ]),
  question("body_drink", "body", "你通常較喜歡哪種飲品溫度？", [
    option("body_drink_warm", "偏暖或熱", { yangDeficiency: 0.75, spleenYangDeficiency: 0.75 }, ["偏好暖飲"]),
    option("body_drink_cold", "偏冷", { dampHeat: 0.5, yinDeficiency: 0.5 }, ["偏好冷飲"]),
    option("body_drink_room", "室溫或沒有明顯偏好", { balanced: 0.5 })
  ]),

  question("energy_fatigue", "energy", "你是否容易疲倦？", [
    option("energy_fatigue_often", "經常", { qiDeficiency: 2, spleenQiDeficiency: 1, bloodDeficiency: 0.5 }, ["容易疲倦"]),
    option("energy_fatigue_sometimes", "有時", { qiDeficiency: 1 }, ["有時疲倦"]),
    option("energy_fatigue_rare", "很少", { balanced: 1 })
  ]),
  question("energy_morning", "energy", "早上起床後的精神通常如何？", [
    option("energy_morning_low", "仍很疲倦", { qiDeficiency: 1.5, phlegmDampness: 1 }, ["早上精神不足"]),
    option("energy_morning_slow", "需要一段時間才清醒", { phlegmDampness: 1 }),
    option("energy_morning_good", "大致精神", { balanced: 1 })
  ]),
  question("energy_afternoon", "energy", "下午是否特別容易精神下降？", [
    option("energy_afternoon_often", "經常", { qiDeficiency: 1.5, spleenQiDeficiency: 1 }, ["下午容易疲倦"]),
    option("energy_afternoon_sometimes", "有時", { qiDeficiency: 0.75 }),
    option("energy_afternoon_rare", "很少", { balanced: 0.5 })
  ]),
  question("energy_voice", "energy", "說話時是否常覺得聲音無力或不想多說？", [
    option("energy_voice_often", "經常", { qiDeficiency: 2 }, ["說話較無力"]),
    option("energy_voice_sometimes", "有時", { qiDeficiency: 1 }),
    option("energy_voice_rare", "很少")
  ]),
  question("energy_activity", "energy", "你是否常懶於活動，即使沒有明顯睡眠不足？", [
    option("energy_activity_often", "經常", { qiDeficiency: 1.5, phlegmDampness: 1 }, ["懶於活動"]),
    option("energy_activity_sometimes", "有時", { qiDeficiency: 0.75 }),
    option("energy_activity_rare", "很少", { balanced: 0.5 })
  ]),
  question("energy_after_exertion", "energy", "活動後是否比預期更疲倦，而且恢復較慢？", [
    option("energy_after_exertion_often", "經常", { qiDeficiency: 2, yangDeficiency: 0.5 }, ["活動後特別疲倦"]),
    option("energy_after_exertion_sometimes", "有時", { qiDeficiency: 1 }),
    option("energy_after_exertion_rare", "很少", { balanced: 0.5 })
  ]),
  question("energy_irritable", "energy", "你是否容易心煩或感到內在燥熱？", [
    option("energy_irritable_often", "經常", { yinDeficiency: 1.5, dampHeat: 0.5 }, ["容易心煩"]),
    option("energy_irritable_sometimes", "有時", { yinDeficiency: 0.75 }),
    option("energy_irritable_rare", "很少")
  ]),
  question("energy_mood", "energy", "你是否容易情緒鬱悶、胸口像悶住一樣？", [
    option("energy_mood_often", "經常", { qiStagnation: 2 }, ["容易情緒鬱悶"]),
    option("energy_mood_sometimes", "有時", { qiStagnation: 1 }),
    option("energy_mood_rare", "很少")
  ]),
  question("energy_sigh", "energy", "你是否常不自覺嘆氣，嘆氣後稍感舒緩？", [
    option("energy_sigh_often", "經常", { qiStagnation: 2 }, ["容易嘆氣"]),
    option("energy_sigh_sometimes", "有時", { qiStagnation: 1 }),
    option("energy_sigh_rare", "很少")
  ]),

  question("sweat_amount", "sweat", "在相同環境下，你的出汗量通常如何？", [
    option("sweat_amount_more", "比身邊的人多", { qiDeficiency: 1.5, dampHeat: 0.5 }, ["出汗較多"]),
    option("sweat_amount_less", "很少出汗", { fluidDeficiency: 0.5, yangDeficiency: 0.5 }),
    option("sweat_amount_normal", "大致相若", { balanced: 0.5 })
  ]),
  question("sweat_easy", "sweat", "是否稍微活動便明顯出汗？", [
    option("sweat_easy_yes", "經常", { qiDeficiency: 2, spleenQiDeficiency: 1 }, ["稍微活動便出汗"]),
    option("sweat_easy_sometimes", "有時", { qiDeficiency: 1 }),
    option("sweat_easy_no", "很少")
  ]),
  question("sweat_night", "sweat", "睡眠期間是否常出汗，醒來後才發現？", [
    option("sweat_night_often", "經常", { yinDeficiency: 2 }, ["夜間出汗"]),
    option("sweat_night_sometimes", "有時", { yinDeficiency: 1 }),
    option("sweat_night_rare", "很少")
  ]),
  question("sweat_after", "sweat", "出汗後是否反而更疲倦？", [
    option("sweat_after_often", "經常", { qiDeficiency: 2 }, ["出汗後更疲倦"]),
    option("sweat_after_sometimes", "有時", { qiDeficiency: 1 }),
    option("sweat_after_rare", "很少")
  ]),
  question("sweat_palms", "sweat", "手心或腳心是否容易出汗或發熱？", [
    option("sweat_palms_hot", "常出汗並偏熱", { yinDeficiency: 1.5 }, ["手足心汗而偏熱"]),
    option("sweat_palms_cold", "常出汗並偏冷", { qiDeficiency: 1, yangDeficiency: 1 }, ["手足心汗而偏冷"]),
    option("sweat_palms_rare", "很少")
  ]),
  question("sweat_sticky", "sweat", "汗液或出汗後的皮膚是否常感黏膩？", [
    option("sweat_sticky_often", "經常", { dampHeat: 2, phlegmDampness: 1 }, ["汗後黏膩"]),
    option("sweat_sticky_sometimes", "有時", { dampHeat: 1 }),
    option("sweat_sticky_rare", "很少")
  ]),

  question("digestion_appetite", "digestion", "平日食慾如何？", [
    option("digestion_appetite_low", "常沒有胃口", { spleenQiDeficiency: 2, qiDeficiency: 0.5 }, ["食慾較弱"]),
    option("digestion_appetite_variable", "時好時差", { qiStagnation: 1, spleenQiDeficiency: 0.5 }, ["食慾不穩定"]),
    option("digestion_appetite_good", "大致正常", { balanced: 0.5 })
  ]),
  question("digestion_bloating", "digestion", "飯後是否容易腹脹？", [
    option("digestion_bloating_often", "經常", { spleenQiDeficiency: 2, qiStagnation: 1, phlegmDampness: 0.5 }, ["飯後容易腹脹"]),
    option("digestion_bloating_sometimes", "有時", { spleenQiDeficiency: 1 }),
    option("digestion_bloating_rare", "很少")
  ]),
  question("digestion_belch_gas", "digestion", "你是否容易打嗝或放屁，之後脹感稍減？", [
    option("digestion_belch_gas_often", "經常", { qiStagnation: 1.5, spleenQiDeficiency: 0.5 }, ["嗝氣或排氣後稍舒"]),
    option("digestion_belch_gas_sometimes", "有時", { qiStagnation: 0.75 }),
    option("digestion_belch_gas_rare", "很少")
  ]),
  question("digestion_stool", "digestion", "大便通常較接近哪一種？", [
    option("digestion_stool_dry", "偏乾硬", { fluidDeficiency: 2, yinDeficiency: 1 }, ["大便偏乾"]),
    option("digestion_stool_loose", "偏稀軟", { spleenQiDeficiency: 2, spleenYangDeficiency: 1 }, ["大便偏稀軟"]),
    option("digestion_stool_sticky", "黏滯或不爽", { phlegmDampness: 1.5, dampHeat: 1.5 }, ["大便黏滯"]),
    option("digestion_stool_normal", "大致成形順暢", { balanced: 1 })
  ]),
  question("digestion_toilet", "digestion", "大便是否常黏在廁盆，較難沖淨？", [
    option("digestion_toilet_often", "經常", { phlegmDampness: 2, dampHeat: 1 }, ["大便容易黏廁"]),
    option("digestion_toilet_sometimes", "有時", { phlegmDampness: 1 }),
    option("digestion_toilet_rare", "很少")
  ]),
  question("digestion_difficult", "digestion", "排便是否常費力或有排不清的感覺？", [
    option("digestion_difficult_dry", "常因乾硬而費力", { fluidDeficiency: 1.5, bloodDeficiency: 0.5 }, ["排便乾硬費力"]),
    option("digestion_difficult_incomplete", "常有排不清的感覺", { qiDeficiency: 1, phlegmDampness: 0.5 }, ["排便不盡感"]),
    option("digestion_difficult_rare", "很少")
  ]),
  question("digestion_cold_food", "digestion", "吃較多生冷食物後，通常有甚麼反應？", [
    option("digestion_cold_food_loose", "較易腹瀉或腹痛", { spleenYangDeficiency: 2, yangDeficiency: 1 }, ["生冷後容易腹瀉或腹痛"]),
    option("digestion_cold_food_bloat", "較易腹脹", { spleenQiDeficiency: 1 }),
    option("digestion_cold_food_none", "沒有明顯反應", { balanced: 0.5 })
  ]),
  question("digestion_greasy", "digestion", "吃較油膩食物後，通常有甚麼反應？", [
    option("digestion_greasy_heavy", "身體或頭部更沉重", { phlegmDampness: 2 }, ["油膩後更沉重"]),
    option("digestion_greasy_hot", "口苦、口黏或感到燥熱", { dampHeat: 2 }, ["油膩後口黏或燥熱"]),
    option("digestion_greasy_bloat", "較易腹脹", { spleenQiDeficiency: 1 }),
    option("digestion_greasy_none", "沒有明顯反應")
  ]),

  question("sleep_onset", "sleep", "入睡通常如何？", [
    option("sleep_onset_hard", "常超過半小時仍未入睡", { qiStagnation: 1, yinDeficiency: 1, bloodDeficiency: 0.5 }, ["較難入睡"]),
    option("sleep_onset_variable", "時好時差", { qiStagnation: 0.75 }),
    option("sleep_onset_good", "大致順利", { balanced: 0.5 })
  ]),
  question("sleep_wake", "sleep", "睡眠中是否容易醒來？", [
    option("sleep_wake_often", "每晚多次", { yinDeficiency: 1, bloodDeficiency: 1 }, ["夜間容易醒"]),
    option("sleep_wake_sometimes", "偶爾", { bloodDeficiency: 0.5 }),
    option("sleep_wake_rare", "很少")
  ]),
  question("sleep_dream", "sleep", "是否常覺得多夢，醒後仍很累？", [
    option("sleep_dream_often", "經常", { bloodDeficiency: 1.5, qiStagnation: 0.5 }, ["多夢且醒後疲倦"]),
    option("sleep_dream_sometimes", "有時", { bloodDeficiency: 0.75 }),
    option("sleep_dream_rare", "很少")
  ]),
  question("sleep_restored", "sleep", "睡醒後通常精神如何？", [
    option("sleep_restored_low", "仍明顯疲倦", { qiDeficiency: 1.5, phlegmDampness: 1 }, ["睡醒後仍疲倦"]),
    option("sleep_restored_some", "稍有恢復", { qiDeficiency: 0.5 }),
    option("sleep_restored_good", "大致精神", { balanced: 1 })
  ]),
  question("sleep_urination", "sleep", "夜間通常需要起床小便多少次？", [
    option("sleep_urination_two", "兩次或以上", { yangDeficiency: 1.5, spleenYangDeficiency: 0.5 }, ["夜尿較多"]),
    option("sleep_urination_one", "一次", { yangDeficiency: 0.5 }),
    option("sleep_urination_none", "通常不用")
  ]),

  question("skin_face", "headSkinLimbs", "面色通常較接近哪一種？", [
    option("skin_face_pale", "偏淡白或少光澤", { bloodDeficiency: 1.5, qiDeficiency: 0.5 }, ["面色偏淡"]),
    option("skin_face_red", "較易泛紅", { yinDeficiency: 0.75, dampHeat: 0.75 }, ["面色較易泛紅"]),
    option("skin_face_dull", "偏暗或欠明亮", { bloodStasis: 1.5 }, ["面色偏暗"]),
    option("skin_face_normal", "大致正常", { balanced: 0.5 })
  ]),
  question("skin_texture", "headSkinLimbs", "皮膚狀態通常如何？", [
    option("skin_texture_dry", "容易乾燥", { fluidDeficiency: 1.5, bloodDeficiency: 1 }, ["皮膚容易乾燥"]),
    option("skin_texture_oily", "容易油膩", { dampHeat: 1, phlegmDampness: 0.5 }, ["皮膚容易油膩"]),
    option("skin_texture_normal", "大致平衡", { balanced: 0.5 })
  ]),
  question("head_heavy", "headSkinLimbs", "頭部是否常昏沉，像被東西包住？", [
    option("head_heavy_often", "經常", { phlegmDampness: 2, dampHeat: 0.5 }, ["頭部容易昏沉"]),
    option("head_heavy_sometimes", "有時", { phlegmDampness: 1 }),
    option("head_heavy_rare", "很少")
  ]),
  question("limbs_numb_cramp", "headSkinLimbs", "四肢是否容易麻木或抽筋？", [
    option("limbs_numb_cramp_cramp", "較常抽筋", { bloodDeficiency: 1.5, fluidDeficiency: 0.5 }, ["容易抽筋"]),
    option("limbs_numb_cramp_numb", "較常麻木", { bloodStasis: 1, bloodDeficiency: 0.5 }, ["四肢容易麻木"]),
    option("limbs_numb_cramp_both", "兩者都常見", { bloodDeficiency: 1, bloodStasis: 1 }),
    option("limbs_numb_cramp_rare", "很少")
  ]),
  question("skin_bruise_lips", "headSkinLimbs", "你是否容易有不明原因瘀青，或唇色常偏暗？", [
    option("skin_bruise_lips_bruise", "較容易瘀青", { bloodStasis: 1.5 }, ["容易出現瘀青"]),
    option("skin_bruise_lips_dark", "唇色常偏暗", { bloodStasis: 2 }, ["唇色偏暗"]),
    option("skin_bruise_lips_pale", "唇色常偏淡", { bloodDeficiency: 1.5 }, ["唇色偏淡"]),
    option("skin_bruise_lips_none", "都不明顯")
  ]),

  question("tongue_color", "tongue", "選填：舌色較接近哪一種？", [
    option("tongue_color_pale", "舌色偏淡", { bloodDeficiency: 0.5, yangDeficiency: 0.25 }, ["舌色自評偏淡"]),
    option("tongue_color_red", "舌色偏紅", { yinDeficiency: 0.5, dampHeat: 0.25 }, ["舌色自評偏紅"]),
    option("tongue_color_dark", "舌色偏暗或帶瘀點", { bloodStasis: 0.5 }, ["舌色自評偏暗"]),
    option("tongue_color_unsure", "不確定")
  ], false, "自行觀察舌象容易受燈光、飲食及個人判斷影響，只作低權重參考。"),
  question("tongue_coating", "tongue", "選填：舌苔較接近哪一種？", [
    option("tongue_coating_thin", "舌苔薄白", { balanced: 0.25 }),
    option("tongue_coating_greasy", "舌苔厚膩", { phlegmDampness: 0.5 }, ["舌苔自評厚膩"]),
    option("tongue_coating_yellow", "舌苔偏黃", { dampHeat: 0.5 }, ["舌苔自評偏黃"]),
    option("tongue_coating_little", "舌苔少或無苔", { yinDeficiency: 0.5, fluidDeficiency: 0.25 }, ["舌苔自評較少"]),
    option("tongue_coating_unsure", "不確定")
  ], false, "自行觀察舌象容易受燈光、飲食及個人判斷影響，只作低權重參考。")
];

export const questionMap = Object.fromEntries(constitutionQuestions.map((item) => [item.id, item]));
