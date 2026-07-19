import { describe, expect, it } from "vitest";
import { analyseConstitution, calculateTongueShare } from "../src/engine/scoringEngine";
import { fullAnswers, phlegmAnswers } from "./helpers";

describe("確定性體質計分", () => {
  it("回答不足時顯示資料不足", () => {
    expect(analyseConstitution({ energy_fatigue: ["energy_fatigue_often"] }).status).toBe("insufficient");
  });

  it("矛盾回答會降低可信程度", () => {
    const result = analyseConstitution({ ...phlegmAnswers(), body_temperature: ["body_temperature_cold"], body_climate: ["body_climate_hot"] });
    expect(result.contradictory).toBe(true);
    expect(result.confidence).toBe("偏低");
  });

  it("痰濕不可由單一容易增加體重答案決定", () => {
    const result = analyseConstitution({ body_weight: ["body_weight_easy_gain"] });
    expect(result.status).toBe("insufficient");
    expect(result.primary).toBeUndefined();
  });

  it("舌象權重永遠不超過總分15%", () => {
    const answers = fullAnswers({
      energy_fatigue: ["energy_fatigue_often"],
      tongue_color: ["tongue_color_red"],
      tongue_coating: ["tongue_coating_little"]
    });
    expect(calculateTongueShare(answers)).toBeLessThanOrEqual(0.1500001);
  });

  it("每個主要結果至少需要三個不同範疇支持", () => {
    const result = analyseConstitution(phlegmAnswers());
    expect(result.status).toBe("result");
    expect(result.primary).toBeDefined();
    expect(result.categorySupport[result.primary!].length).toBeGreaterThanOrEqual(3);
  });
});
