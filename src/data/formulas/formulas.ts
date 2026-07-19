import type { FormulaDefinition } from "../../types";

export const formulas: FormulaDefinition[] = [
  {
    formulaId: "qi-spleen-gentle-001",
    name: "氣虛／脾氣虛溫和配伍參考",
    formulaType: "rule-based-gentle-combination",
    sourceType: "product-owner-rule",
    suitablePatterns: ["qiDeficiency", "spleenQiDeficiency"],
    requiredAnswerGroups: [
      {
        minimumMatches: 3,
        optionIds: [
          "energy_fatigue_often",
          "energy_after_exertion_often",
          "energy_voice_often",
          "sweat_easy_yes",
          "energy_morning_low",
          "energy_activity_often",
          "sweat_after_often"
        ],
        description: "至少三項不同的氣虛表現"
      },
      {
        minimumMatches: 1,
        optionIds: [
          "digestion_appetite_low",
          "digestion_bloating_often",
          "digestion_stool_loose",
          "digestion_stool_sticky",
          "digestion_cold_food_loose",
          "digestion_cold_food_bloat",
          "body_heavy_often"
        ],
        description: "至少一項脾胃或身體沉重表現"
      }
    ],
    exclusionFlags: [
      "minor", "pregnant", "breastfeeding", "g6pd", "type1Diabetes", "gestationalDiabetes",
      "liverDisease", "kidneyDisease", "heartDisease", "bleedingDisorder", "cancerTreatment",
      "severeAllergy", "immunosuppressant", "anticoagulant", "polypharmacy", "upcomingSurgery",
      "ulcerBleedingHistory", "epilepsy", "multipleTcm", "multipleSupplements", "safetyUncertain"
    ],
    ingredients: [
      { ingredientId: "prepared_licorice", role: "調和", reason: "作為固定配伍中的調和選材。" },
      { ingredientId: "dried_tangerine_peel", role: "理氣配合", reason: "避免配伍思路過於壅滯，配合脾胃氣機方向。" },
      { ingredientId: "poria", role: "協同", reason: "配合脾虛兼身體沉重或水濕傾向。" }
    ],
    optionalIngredients: [
      {
        ingredientId: "chinese_yam",
        role: "食療補充",
        reason: "同時有食慾較差、大便偏稀或生冷後不適時，按規則作普通食材補充。",
        includeWhen: ["digestion_appetite_low", "digestion_stool_loose", "digestion_cold_food_loose"]
      }
    ],
    minimumIngredientCount: 3,
    maximumIngredientCount: 4,
    traditionalRationale: "以調和、理氣配合及脾虛水濕方向組成固定的溫和參考；這是產品規則，不是從搜尋結果即時拼湊。",
    suitableAnswerDescription: "氣虛表現由至少三項不同回答支持，並同時出現至少一項脾胃或身體沉重表現。",
    unsuitableWhen: ["只有單一疲倦回答", "急性或持續加重的不適", "安全篩查屬 Level 0、1 或 2", "正在使用胰島素或降血糖藥而配伍尚未完成相關用藥安全審核"],
    usageForm: "只供查看固定配伍組成與傳統思路；不提供煎煮法、療程或未經審核份量。",
    stopConditions: ["冒冷汗、發抖、心悸、頭暈或神志不清", "皮疹、氣促、明顯水腫或心悸", "噁心、嘔吐、腹痛或其他持續不適"],
    sourceReferences: [
      { title: "產品擁有人固定配伍規則", note: "不是古方、倪海廈原方或由 PDF 關鍵字自動生成的方劑。" }
    ],
    medicationSafety: {
      diabetesMedicationReviewed: false,
      insulinUseReviewed: false,
      hypoglycaemiaWarningRequired: true,
      knownInteractionNotes: ["尚未完成胰島素及降血糖藥的配伍交互作用資料審核，因此相關使用者不顯示此配伍。"],
      safetySources: []
    },
    safetyComplete: true,
    sourceVerified: true,
    doseReviewed: false,
    reviewStatus: "approved",
    version: "1.0.0",
    lastUpdated: "2026-07-20"
  }
];
