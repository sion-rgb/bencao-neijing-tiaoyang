import { describe, expect, it } from "vitest";
import { formulas } from "../src/data/formulas/formulas";
import { patterns } from "../src/data/patterns/patterns";
import { medicalConditionPolicies } from "../src/data/safety/medicalPolicies";
import { getApprovedFormulas, isFormulaApprovedForProduction } from "../src/engine/recommendationEngine";
import { assessSafety } from "../src/engine/safetyEngine";
import { analyseConstitution } from "../src/engine/scoringEngine";
import type { AnswerMap } from "../src/types";
import { fullAnswers, safeAnswers } from "./helpers";

const formulaAnswers: AnswerMap = {
  energy_fatigue: ["energy_fatigue_often"],
  energy_after_exertion: ["energy_after_exertion_often"],
  energy_voice: ["energy_voice_often"],
  sweat_easy: ["sweat_easy_yes"],
  digestion_bloating: ["digestion_bloating_often"]
};

describe("二型糖尿病獨立注意狀態", () => {
  it("單純二型糖尿病不阻止體質結果或已批准配伍", () => {
    expect(medicalConditionPolicies.type2Diabetes).toMatchObject({ affectsPatternScore: false, blocksPatternResult: false, blocksFoodAdvice: false, blocksApprovedFormula: false, showMedicalNotice: true });
    const safety = assessSafety({ ...safeAnswers, diabetes: ["diabetes_type2"] });
    expect(safety.level).toBe(3);
    expect(safety.allowApprovedFormulas).toBe(true);
    expect(safety.medicalNotices).toContain("type2-diabetes");
    expect(getApprovedFormulas("spleenQiDeficiency", formulaAnswers, safety)).toHaveLength(1);
  });

  it("二型糖尿病答案不增加任何中醫體質分數，也不自動等於消渴", () => {
    const base = fullAnswers();
    expect(analyseConstitution({ ...base, diabetes: ["diabetes_type2"] }).scores).toEqual(analyseConstitution(base).scores);
    expect(patterns.some((pattern) => pattern.id === ("xiaoke" as never))).toBe(false);
  });

  it("降血糖藥及胰島素產生加強注意，但不阻止體質結果", () => {
    const medicine = assessSafety({ ...safeAnswers, glucose_medicine: ["glucose_medicine_oral"] });
    const insulin = assessSafety({ ...safeAnswers, glucose_medicine: ["glucose_medicine_insulin"] });
    expect(medicine.level).toBe(3);
    expect(medicine.medicalNotices).toEqual(expect.arrayContaining(["glucose-lowering-medication", "hypoglycaemia-risk"]));
    expect(insulin.medicalNotices).toEqual(expect.arrayContaining(["insulin-use", "hypoglycaemia-risk"]));
    expect(getApprovedFormulas("spleenQiDeficiency", formulaAnswers, medicine)).toEqual([]);
    expect(getApprovedFormulas("spleenQiDeficiency", formulaAnswers, insulin)).toEqual([]);
  });

  it("一型糖尿病保守限制及嚴重高低血糖警號仍有效", () => {
    expect(assessSafety({ ...safeAnswers, diabetes: ["diabetes_type1"] }).level).toBe(1);
    expect(assessSafety({ ...safeAnswers, emergency: ["emergency_hypoglycaemia"] }).level).toBe(0);
    expect(assessSafety({ ...safeAnswers, emergency: ["emergency_diabetic"] }).level).toBe(0);
  });
});

describe("固定 Formula Library", () => {
  const safety = assessSafety(safeAnswers);

  it("不以單一疲倦或單味山藥形成完整配伍", () => {
    expect(getApprovedFormulas("qiDeficiency", { energy_fatigue: ["energy_fatigue_often"] }, safety)).toEqual([]);
    const selected = getApprovedFormulas("spleenQiDeficiency", formulaAnswers, safety)[0];
    expect(selected.ingredients).toHaveLength(3);
    expect(selected.ingredients.map((item) => item.ingredientId)).toEqual(["prepared_licorice", "dried_tangerine_peel", "poria"]);
  });

  it("只有相應脾胃表現才按固定規則加入山藥", () => {
    const withoutYam = getApprovedFormulas("spleenQiDeficiency", formulaAnswers, safety)[0];
    const withYam = getApprovedFormulas("spleenQiDeficiency", { ...formulaAnswers, digestion_appetite: ["digestion_appetite_low"] }, safety)[0];
    expect(withoutYam.ingredients.some((item) => item.ingredientId === "chinese_yam")).toBe(false);
    expect(withYam.ingredients.some((item) => item.ingredientId === "chinese_yam")).toBe(true);
  });

  it("每味均有角色及原因，未批准或安全欄位不完整者不可在 Production 顯示", () => {
    const formula = formulas[0];
    expect([...formula.ingredients, ...formula.optionalIngredients].every((item) => item.role && item.reason)).toBe(true);
    expect(isFormulaApprovedForProduction({ ...formula, reviewStatus: "draft" })).toBe(false);
    expect(isFormulaApprovedForProduction({ ...formula, safetyComplete: false })).toBe(false);
  });

  it("產品設定配伍不冒充古方或倪海廈原方，未審核份量不顯示", () => {
    const formula = formulas[0];
    expect(formula.sourceType).toBe("product-owner-rule");
    expect(formula.sourceReferences.map((source) => source.title).join(" ")).not.toMatch(/倪海廈原方|古方/u);
    expect(formula.sourceReferences[0].note).toMatch(/不是古方/u);
    expect(formula.doseReviewed).toBe(false);
    expect(formula.doseText).toBeUndefined();
  });
});
