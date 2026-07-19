import type { PatternId } from "../../types";

const qiSpleenFoods = ["米類等日常主食，按個人原有飲食安排取適量", "蓮子或芡實可作普通熟食輪替", "山藥可在有脾胃表現時作熟食，不稱為配方"];

export function getDailyFoodDirections(pattern: PatternId): string[] {
  if (pattern === "qiDeficiency" || pattern === "spleenQiDeficiency") return qiSpleenFoods;
  return ["以少加工、種類多樣的普通食物為主", "按飢飽規律進食，避免一次過量", "如有既定醫療飲食安排，應以原有安排為先"];
}
