export const APP_CONFIG = {
  name: "本草內經・體質調養",
  subtitle: "根據傳統中醫經典整理的體質與養生參考工具",
  version: "1.0.0",
  lastUpdated: "2026-07-19",
  storageKey: "bencao-neijing-state",
  storageVersion: 1,
  productionMode: import.meta.env.PROD
} as const;

export const SHORT_DISCLAIMER = "只供傳統中醫文化及養生教育參考，不構成醫療診斷、治療或處方。";
