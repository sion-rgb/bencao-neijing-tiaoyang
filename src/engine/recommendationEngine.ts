import { ingredients } from "../data/ingredients/ingredients";
import { lifestyleRecommendations } from "../data/recommendations/recommendations";
import { prohibitedIngredients } from "../data/safety/prohibited";
import type { Ingredient, PatternId, SafetyAssessment } from "../types";

export const INGREDIENT_DISCLAIMER = "這不是中醫處方，亦不代表適合你的實際病情。若正在服藥、有慢性病、懷孕、餵哺母乳、屬G6PD缺乏症或身體不適持續，請先向合資格專業人士查詢。";

export function getLifestyleRecommendation(pattern: PatternId) {
  return lifestyleRecommendations.find((item) => item.reviewStatus === "approved" && item.patterns.includes(pattern)) ?? lifestyleRecommendations[0];
}

export function getAllowedIngredients(pattern: PatternId, safety: SafetyAssessment): Ingredient[] {
  if (!safety.allowIngredients || safety.level !== 3) return [];
  return ingredients
    .filter((item) => item.reviewStatus === "approved" && item.safetyComplete)
    .filter((item) => item.suitablePatterns.includes(pattern) && !item.unsuitablePatterns.includes(pattern))
    .filter((item) => item.contraindicationFlags.every((flag) => !safety.flags.includes(flag)))
    .filter((item) => !prohibitedIngredients.some((name) => item.name.includes(name) || item.traditionalUse.includes(name)))
    .slice(0, 3);
}
