import { ingredients } from "../data/ingredients/ingredients";
import { lifestyleRecommendations } from "../data/recommendations/recommendations";
import { formulas } from "../data/formulas/formulas";
import { prohibitedIngredients } from "../data/safety/prohibited";
import type { AnswerMap, FormulaDefinition, Ingredient, PatternId, SafetyAssessment, SelectedFormula } from "../types";

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

const hasSelectedOption = (answers: AnswerMap, optionId: string) => Object.values(answers).some((selected) => selected.includes(optionId));

export const isFormulaApprovedForProduction = (formula: FormulaDefinition) => formula.reviewStatus === "approved" && formula.safetyComplete && formula.sourceVerified;

export function getApprovedFormulas(pattern: PatternId, answers: AnswerMap, safety: SafetyAssessment): SelectedFormula[] {
  if (!safety.allowApprovedFormulas || safety.level !== 3) return [];
  return formulas
    .filter(isFormulaApprovedForProduction)
    .filter((formula) => formula.displayMode === "automated")
    .filter((formula) => formula.suitablePatterns.includes(pattern))
    .filter((formula) => formula.exclusionFlags.every((flag) => !safety.flags.includes(flag)))
    .filter((formula) => !safety.flags.includes("glucoseMedicine") || formula.medicationSafety.diabetesMedicationReviewed)
    .filter((formula) => !safety.flags.includes("insulinUse") || formula.medicationSafety.insulinUseReviewed)
    .filter((formula) => formula.requiredAnswerGroups.every((group) => group.optionIds.filter((id) => hasSelectedOption(answers, id)).length >= group.minimumMatches))
    .map((formula) => {
      const optionalIngredients = formula.optionalIngredients.filter((ingredient) => ingredient.includeWhen?.some((id) => hasSelectedOption(answers, id)));
      const selectedIngredients = [...formula.ingredients, ...optionalIngredients].slice(0, formula.maximumIngredientCount);
      return {
        formula,
        ingredients: selectedIngredients,
        selectionReasons: formula.requiredAnswerGroups.map((group) => group.description)
      };
    })
    .filter(({ formula, ingredients: selectedIngredients }) => selectedIngredients.length >= formula.minimumIngredientCount);
}
