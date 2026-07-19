import { describe, expect, it } from "vitest";
import { APP_CONFIG } from "../src/config/app";
import type { StoredState } from "../src/types";
import { clearAllLocalData, hasMigrationNotice, loadState, MIGRATION_NOTICE, saveState } from "../src/utils/storage";

describe("本機資料", () => {
  it("完整重設會清除健康資料但保留收藏", () => {
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify({ schemaVersion: 2 }));
    localStorage.setItem("bencao-neijing-classic-favorites", "[\"entry-1\"]");
    clearAllLocalData();
    expect(localStorage.getItem(APP_CONFIG.storageKey)).toBeNull();
    expect(localStorage.getItem("bencao-neijing-classic-favorites")).toBe("[\"entry-1\"]");
  });

  it("storage v1 會清除問卷、安全答案、步驟及舊結果並保留同意與收藏", () => {
    localStorage.setItem("bencao-neijing-classic-favorites", "[\"entry-1\"]");
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify({ schemaVersion: 1, consent: true, safetyAnswers: { diabetes: ["diabetes_type2"] }, questionnaireAnswers: { energy_fatigue: ["energy_fatigue_often"] }, currentStep: 30, lastResult: { primary: "qiDeficiency" } }));
    const migrated = loadState();
    expect(migrated).toMatchObject({ schemaVersion: 2, consent: true, safetyAnswers: {}, questionnaireAnswers: {}, currentStep: 0 });
    expect(migrated.lastResult).toBeUndefined();
    expect(hasMigrationNotice()).toBe(true);
    expect(MIGRATION_NOTICE).toBe("問卷及分析規則已更新，舊有分析資料已清除，請重新完成問卷。");
    expect(localStorage.getItem("bencao-neijing-classic-favorites")).toBe("[\"entry-1\"]");
  });

  it("重新整理頁面後可恢復未完成問卷", () => {
    const state: StoredState = { schemaVersion: APP_CONFIG.storageVersion, consent: true, safetyAnswers: { age: ["age_18_39"] }, questionnaireAnswers: { energy_fatigue: ["energy_fatigue_often"] }, currentStep: 8, updatedAt: new Date().toISOString() };
    saveState(state);
    expect(loadState()).toMatchObject({ consent: true, currentStep: 8, questionnaireAnswers: state.questionnaireAnswers });
  });
});
