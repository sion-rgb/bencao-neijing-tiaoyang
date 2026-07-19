import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ingredients } from "../src/data/ingredients/ingredients";
import { prohibitedIngredients } from "../src/data/safety/prohibited";
import { getAllowedIngredients } from "../src/engine/recommendationEngine";
import { assessSafety } from "../src/engine/safetyEngine";
import { safeAnswers } from "./helpers";

describe("內容安全閘門", () => {
  it("禁止清單內選材永遠不會出現在建議資料", () => {
    const output = JSON.stringify(ingredients);
    for (const name of prohibitedIngredients) expect(output).not.toContain(`\"name\":\"${name}`);
    expect(getAllowedIngredients("spleenQiDeficiency", assessSafety(safeAnswers)).every((item) => !prohibitedIngredients.includes(item.name as never))).toBe(true);
  });

  it("未完成安全資料的選材不可顯示", () => {
    expect(ingredients.filter((item) => item.reviewStatus === "approved").every((item) => item.safetyComplete)).toBe(true);
  });

  it("開發 Prompt 文字不在使用者畫面來源中", () => {
    const files = ["src/App.tsx", "src/pages/HomePage.tsx", "src/pages/ResultPage.tsx", "index.html"];
    const visibleSource = files.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");
    expect(visibleSource).not.toContain("你是一名資深全端開發工程師");
    expect(visibleSource).not.toContain("查看系統Prompt");
  });

  it("README 包含線上 WebApp 連結", () => {
    expect(readFileSync(join(process.cwd(), "README.md"), "utf8")).toContain("https://sion-rgb.github.io/bencao-neijing-tiaoyang/");
  });
});
