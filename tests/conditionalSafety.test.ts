import { describe, expect, it } from "vitest";
import { getVisibleSafetyQuestions, pruneHiddenSafetyAnswers } from "../src/data/safety/safetyQuestions";
import { assessSafety } from "../src/engine/safetyEngine";
import { safeAnswers } from "./helpers";

const visibleIds = (answers: Record<string, string[]>) => getVisibleSafetyQuestions(answers).map((question) => question.id);

describe("生理性別條件式安全問卷", () => {
  it("男性完全不顯示懷孕及餵哺母乳問題，兩題亦不計進度", () => {
    const ids = visibleIds({ sex: ["sex_male"] });
    expect(ids).not.toContain("pregnancy");
    expect(ids).not.toContain("breastfeeding");
    expect(ids).not.toContain("pregnancy_applicability");
    expect(ids).toHaveLength(10);
  });

  it("男性的隱藏問題不會阻止完成安全篩查", () => {
    const assessment = assessSafety(safeAnswers);
    expect(assessment.flags).not.toContain("safetyUncertain");
    expect(assessment.level).toBe(3);
  });

  it("男性改為女性後重新顯示懷孕及餵哺母乳問題", () => {
    const ids = visibleIds({ sex: ["sex_female"] });
    expect(ids).toContain("pregnancy");
    expect(ids).toContain("breastfeeding");
  });

  it("女性改為男性時清除舊有懷孕、哺乳及適用性答案", () => {
    const pruned = pruneHiddenSafetyAnswers({
      sex: ["sex_male"],
      pregnancy_applicability: ["pregnancy_applicable"],
      pregnancy: ["pregnancy_yes"],
      breastfeeding: ["breastfeeding_yes"]
    });
    expect(pruned).toEqual({ sex: ["sex_male"] });
  });

  it("其他／雙性特徵及不願回答先顯示中性適用性問題", () => {
    expect(visibleIds({ sex: ["sex_intersex_other"] })).toContain("pregnancy_applicability");
    const preferNot = visibleIds({ sex: ["sex_prefer_not"] });
    expect(preferNot).toContain("pregnancy_applicability");
    expect(preferNot).not.toContain("pregnancy");
  });

  it("只有適用或不確定才顯示詳細問題", () => {
    expect(visibleIds({ sex: ["sex_prefer_not"], pregnancy_applicability: ["pregnancy_applicable"] })).toEqual(expect.arrayContaining(["pregnancy", "breastfeeding"]));
    expect(visibleIds({ sex: ["sex_prefer_not"], pregnancy_applicability: ["pregnancy_applicability_unsure"] })).toEqual(expect.arrayContaining(["pregnancy", "breastfeeding"]));
    expect(visibleIds({ sex: ["sex_prefer_not"], pregnancy_applicability: ["pregnancy_not_applicable"] })).not.toContain("pregnancy");
  });
});
