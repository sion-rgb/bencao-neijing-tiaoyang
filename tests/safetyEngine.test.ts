import { describe, expect, it } from "vitest";
import { getAllowedIngredients } from "../src/engine/recommendationEngine";
import { assessSafety } from "../src/engine/safetyEngine";
import { safeAnswers } from "./helpers";

describe("安全分級與選材封鎖", () => {
  it.each([
    ["G6PD", { g6pd: ["g6pd_yes"] }, 1],
    ["一型糖尿病", { diabetes: ["diabetes_type1"] }, 1],
    ["懷孕", { sex: ["sex_female"], pregnancy: ["pregnancy_yes"], breastfeeding: ["breastfeeding_no"] }, 1],
    ["未滿18歲", { age: ["age_under18"] }, 1]
  ])("%s 不得輸出任何中藥、草藥或代茶飲", (_label, override, expectedLevel) => {
    const safety = assessSafety({ ...safeAnswers, ...override });
    expect(safety.level).toBe(expectedLevel);
    expect(getAllowedIngredients("spleenQiDeficiency", safety)).toEqual([]);
  });

  it("胸痛會立即進入 Level 0 並停止問卷", () => {
    const safety = assessSafety({ ...safeAnswers, emergency: ["emergency_chest_pain"] });
    expect(safety.level).toBe(0);
    expect(safety.allowIngredients).toBe(false);
  });

  it.each([
    ["抗凝血藥", { medicines: ["medicine_anticoagulant"] }],
    ["準備手術", { surgery: ["surgery_yes"] }]
  ])("%s 使用者不得看到活血選材或中藥複方", (_label, override) => {
    const safety = assessSafety({ ...safeAnswers, ...override });
    expect(safety.level).toBe(2);
    expect(getAllowedIngredients("bloodStasis", safety)).toHaveLength(0);
  });

  it("安全資料不完整的使用者不會顯示選材", () => {
    const safety = assessSafety({ age: ["age_18_39"] });
    expect(safety.level).toBe(1);
    expect(getAllowedIngredients("qiDeficiency", safety)).toEqual([]);
  });
});
