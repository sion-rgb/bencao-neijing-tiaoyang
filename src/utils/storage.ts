import { APP_CONFIG } from "../config/app";
import type { StoredState } from "../types";

export const EMPTY_STATE: StoredState = {
  schemaVersion: APP_CONFIG.storageVersion,
  consent: false,
  safetyAnswers: {},
  questionnaireAnswers: {},
  currentStep: 0,
  updatedAt: new Date(0).toISOString()
};

export const MIGRATION_NOTICE_KEY = "bencao-neijing-migration-v2";
export const MIGRATION_NOTICE = "問卷及分析規則已更新，舊有分析資料已清除，請重新完成問卷。";

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return { ...EMPTY_STATE };
    const value = JSON.parse(raw) as StoredState;
    if (value.schemaVersion !== APP_CONFIG.storageVersion) {
      localStorage.removeItem(APP_CONFIG.storageKey);
      localStorage.setItem(MIGRATION_NOTICE_KEY, "1");
      return { ...EMPTY_STATE, consent: Boolean(value.consent) };
    }
    return { ...EMPTY_STATE, ...value };
  } catch {
    localStorage.removeItem(APP_CONFIG.storageKey);
    return { ...EMPTY_STATE };
  }
}

export function saveState(state: StoredState) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify({ ...state, schemaVersion: APP_CONFIG.storageVersion, updatedAt: new Date().toISOString() }));
}

export function clearAllLocalData() {
  localStorage.removeItem(APP_CONFIG.storageKey);
  localStorage.removeItem(MIGRATION_NOTICE_KEY);
  localStorage.removeItem("bencao-neijing-result");
}

export const hasMigrationNotice = () => localStorage.getItem(MIGRATION_NOTICE_KEY) === "1";
export const dismissMigrationNotice = () => localStorage.removeItem(MIGRATION_NOTICE_KEY);

export function exportResult(value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `體質調養結果-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
