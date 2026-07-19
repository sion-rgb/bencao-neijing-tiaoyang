export const prohibitedIngredients = [
  "附子", "川烏", "草烏", "馬錢子", "巴豆", "甘遂", "大戟", "芫花", "牽牛子", "朱砂", "雄黃", "砒霜", "雷公藤", "關木通", "廣防己", "青木香", "馬兜鈴酸", "生半夏", "生南星", "生川烏", "大黃", "番瀉葉", "細辛", "劇烈瀉下藥", "強烈攻下藥", "有毒礦物藥", "來歷不明的中成藥", "藥酒", "快速減肥產品", "降糖產品", "壯陽產品", "排毒產品"
] as const;

export const bloodMovingIngredients = ["丹參", "三七", "紅花", "桃仁", "當歸", "川芎", "銀杏"] as const;

export const level1Flags = new Set([
  "minor", "pregnant", "breastfeeding", "g6pd", "type1Diabetes", "gestationalDiabetes", "liverDisease", "kidneyDisease", "heartDisease", "bleedingDisorder", "cancerTreatment", "severeAllergy", "immunosuppressant", "safetyUncertain"
]);

export const level2Flags = new Set([
  "type2Diabetes", "glucoseMedicine", "anticoagulant", "polypharmacy", "upcomingSurgery", "olderAdult", "ulcerBleedingHistory", "epilepsy", "multipleTcm", "multipleSupplements"
]);
