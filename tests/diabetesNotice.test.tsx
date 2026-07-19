import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { APP_CONFIG } from "../src/config/app";
import { ResultPage } from "../src/pages/ResultPage";
import { AppStateProvider } from "../src/state/AppState";
import { phlegmAnswers, safeAnswers } from "./helpers";

function renderResult(glucoseMedicine = "glucose_medicine_no") {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify({
    schemaVersion: APP_CONFIG.storageVersion,
    consent: true,
    safetyAnswers: { ...safeAnswers, diabetes: ["diabetes_type2"], glucose_medicine: [glucoseMedicine] },
    questionnaireAnswers: phlegmAnswers(),
    currentStep: 0,
    updatedAt: new Date().toISOString()
  }));
  render(<MemoryRouter><AppStateProvider><ResultPage /></AppStateProvider></MemoryRouter>);
}

describe("結果頁糖尿病注意事項", () => {
  beforeEach(() => localStorage.clear());

  it("二型糖尿病顯示固定但不阻斷結果的注意事項卡", () => {
    renderResult();
    expect(screen.getByRole("heading", { name: "二型糖尿病使用者注意事項" })).toBeInTheDocument();
    expect(screen.getAllByText(/不代表血糖控制情況/u).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /較接近/u })).toBeInTheDocument();
  });

  it("使用降血糖藥時顯示加強注意事項", () => {
    renderResult("glucose_medicine_oral");
    expect(screen.getByRole("heading", { name: "胰島素／降血糖藥加強注意事項" })).toBeInTheDocument();
    expect(screen.getByText(/未完成交互作用資料的配伍不會顯示/u)).toBeInTheDocument();
  });
});
