import { describe, expect, it } from "vitest";
import { APP_CONFIG } from "../src/config/app";
import type { StoredState } from "../src/types";
import { clearAllLocalData, loadState, saveState } from "../src/utils/storage";

describe("本機資料", () => {
  it("清除資料功能會刪除全部localStorage資料", () => {
    localStorage.setItem("one", "1"); localStorage.setItem("two", "2");
    clearAllLocalData();
    expect(localStorage.length).toBe(0);
  });

  it("重新整理頁面後可恢復未完成問卷", () => {
    const state: StoredState = { schemaVersion: APP_CONFIG.storageVersion, consent: true, safetyAnswers: { age: ["age_18_39"] }, questionnaireAnswers: { energy_fatigue: ["energy_fatigue_often"] }, currentStep: 8, updatedAt: new Date().toISOString() };
    saveState(state);
    expect(loadState()).toMatchObject({ consent: true, currentStep: 8, questionnaireAnswers: state.questionnaireAnswers });
  });
});
